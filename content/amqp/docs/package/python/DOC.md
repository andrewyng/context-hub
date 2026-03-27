---
name: package
description: "amqp Python client for AMQP 0-9-1 brokers with direct connection, channel, publish, and consume APIs"
metadata:
  languages: "python"
  versions: "5.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "amqp,rabbitmq,messaging,broker,python"
---

# amqp Python Package Guide

## Golden Rule

Use the maintainer package `amqp` for direct AMQP 0-9-1 protocol access from Python. The upstream project is `py-amqp`, published on PyPI as `amqp`.

This library is low level compared with Celery or Kombu: you open a `Connection`, create a `Channel`, declare broker objects, publish `Message` instances, and acknowledge deliveries yourself.

## Install

Pin the package version your app expects:

```bash
python -m pip install "amqp==5.3.1"
```

Typical broker settings:

```bash
export AMQP_HOST=localhost
export AMQP_PORT=5672
export AMQP_USER=guest
export AMQP_PASSWORD=guest
export AMQP_VHOST=/
export AMQP_HEARTBEAT=30
```

For TLS connections, brokers commonly listen on port `5671`.

## Connect And Open A Channel

`Connection(...)` does not open the socket by itself. Call `connect()` before creating or using channels.

```python
import os

import amqp

with amqp.Connection(
    host=os.getenv("AMQP_HOST", "localhost"),
    port=int(os.getenv("AMQP_PORT", "5672")),
    userid=os.environ["AMQP_USER"],
    password=os.environ["AMQP_PASSWORD"],
    virtual_host=os.getenv("AMQP_VHOST", "/"),
    heartbeat=int(os.getenv("AMQP_HEARTBEAT", "30")),
) as connection:
    connection.connect()
    channel = connection.channel()

    print("Connected:", connection.connected)
    print("Channel id:", channel.channel_id)

    channel.close()
```

## Declare An Exchange And Queue

The channel API exposes AMQP primitives directly. For long-lived broker objects, set `durable=True` and `auto_delete=False` explicitly.

```python
import amqp

with amqp.Connection(
    host="localhost",
    userid="guest",
    password="guest",
) as connection:
    connection.connect()
    channel = connection.channel()

    channel.exchange_declare(
        exchange="events",
        type="direct",
        durable=True,
        auto_delete=False,
    )
    channel.queue_declare(
        queue="events.orders",
        durable=True,
        auto_delete=False,
    )
    channel.queue_bind(
        queue="events.orders",
        exchange="events",
        routing_key="orders.created",
    )
```

## Publish A Message

Create an `amqp.Message` and publish it through the channel. `basic_publish()` defaults `exchange` to the empty string, which is the AMQP default exchange, so use an explicit exchange name when routing through your own topology.

```python
import json

import amqp

payload = {"order_id": "ord_123", "status": "created"}

with amqp.Connection(
    host="localhost",
    userid="guest",
    password="guest",
) as connection:
    connection.connect()
    channel = connection.channel()

    message = amqp.Message(
        body=json.dumps(payload).encode("utf-8"),
        content_type="application/json",
        content_encoding="utf-8",
        delivery_mode=2,
    )

    channel.basic_publish(
        msg=message,
        exchange="events",
        routing_key="orders.created",
    )
```

If you want to send directly to a queue through the default exchange, publish with `exchange=""` and set `routing_key` to the queue name.

## Read A Message With `basic_get`

`basic_get()` is a polling call. It returns one message if available, or `None` if the queue is empty.

```python
import json

import amqp

with amqp.Connection(
    host="localhost",
    userid="guest",
    password="guest",
) as connection:
    connection.connect()
    channel = connection.channel()

    message = channel.basic_get(queue="events.orders", no_ack=False)
    if message is not None:
        payload = json.loads(message.body)
        print(payload)

        channel.basic_ack(message.delivery_info["delivery_tag"])
```

Use `no_ack=False` when you need broker-managed redelivery on failure. If you set `no_ack=True`, the broker considers the delivery handled as soon as it sends it.

## Consume In A Loop

For push-style consumption, register a callback with `basic_consume()` and keep the connection alive by calling `drain_events()`. If heartbeats are enabled, call `heartbeat_tick()` regularly in the loop.

```python
import json
import socket

import amqp

with amqp.Connection(
    host="localhost",
    userid="guest",
    password="guest",
    heartbeat=30,
) as connection:
    connection.connect()
    channel = connection.channel()

    def handle_message(message):
        payload = json.loads(message.body)
        print("received", payload)
        channel.basic_ack(message.delivery_info["delivery_tag"])

    consumer_tag = channel.basic_consume(
        queue="events.orders",
        no_ack=False,
        callback=handle_message,
    )

    try:
        while True:
            try:
                connection.drain_events(timeout=1)
            except socket.timeout:
                pass
            connection.heartbeat_tick()
    finally:
        channel.basic_cancel(consumer_tag)
```

## Connect With TLS

Since the 5.2.x line, `Connection(..., ssl=...)` accepts a standard `ssl.SSLContext`, which is the simplest way to enforce CA validation and load client certificates when your broker requires them.

```python
import os
import ssl

import amqp

context = ssl.create_default_context(cafile=os.environ["AMQP_CA_CERT"])
context.load_cert_chain(
    certfile=os.environ["AMQP_CLIENT_CERT"],
    keyfile=os.environ["AMQP_CLIENT_KEY"],
)

with amqp.Connection(
    host=os.environ["AMQP_HOST"],
    port=5671,
    userid=os.environ["AMQP_USER"],
    password=os.environ["AMQP_PASSWORD"],
    virtual_host=os.getenv("AMQP_VHOST", "/"),
    ssl=context,
) as connection:
    connection.connect()
    channel = connection.channel()
```

## Common Pitfalls

- Call `connection.connect()` explicitly. Constructing `Connection(...)` or entering its context manager is not enough.
- `exchange_declare()` and `queue_declare()` default to `durable=False` and `auto_delete=True`. That is usually wrong for shared production queues and exchanges.
- `basic_get()` is non-blocking polling. For continuous workers, use `basic_consume()` with `drain_events()`.
- If you enable heartbeats, your consumer loop must call `connection.heartbeat_tick()` often enough to send and check heartbeat frames.
- Deliveries are not acknowledged automatically when `no_ack=False`; call `basic_ack()` with the delivery tag after successful processing.
- `Message.body` is binary-safe. When you publish JSON, encode before sending and decode or deserialize after receiving.

## Version-Sensitive Notes

- `amqp 5.3.1` includes a heartbeat retry fix that resets connection byte counters after a heartbeat exception. If you saw heartbeat-related reconnect issues on older 5.3 builds, upgrade to `5.3.1`.
- The `5.2.0` release added support for passing an `ssl.SSLContext` directly through the `ssl` argument on `Connection`.

## Official Sources

- py-amqp repository: https://github.com/celery/py-amqp
- PyPI package page: https://pypi.org/project/amqp/
- README and quick start: https://raw.githubusercontent.com/celery/py-amqp/main/README.rst
- API reference index: https://docs.celeryq.dev/projects/amqp/en/stable/reference/index.html
- `amqp.connection.Connection`: https://docs.celeryq.dev/projects/amqp/en/stable/reference/amqp.connection.html
- `amqp.channel.Channel`: https://docs.celeryq.dev/projects/amqp/en/stable/reference/amqp.channel.html
- `amqp.basic_message.Message`: https://docs.celeryq.dev/projects/amqp/en/stable/reference/amqp.basic_message.html
- Changelog: https://raw.githubusercontent.com/celery/py-amqp/main/Changelog
