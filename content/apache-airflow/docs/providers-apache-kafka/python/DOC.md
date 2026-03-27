---
name: providers-apache-kafka
description: "Apache Airflow Kafka provider for producing to topics, consuming messages, and deferring on Kafka events from DAGs"
metadata:
  languages: "python"
  versions: "1.12.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,kafka,apache-kafka,python,dag,streaming"
---

# apache-airflow-providers-apache-kafka

Use `apache-airflow-providers-apache-kafka` when an Airflow DAG needs to publish messages to Kafka, consume messages from one or more topics, or pause until a matching Kafka message arrives.

This guide targets provider version `1.12.0`.

## Install

Install the provider into the same Python environment or container image used by your Airflow deployment:

```bash
python -m pip install "apache-airflow==${AIRFLOW_VERSION}" "apache-airflow-providers-apache-kafka==1.12.0"
```

Upstream lists `apache-airflow>=2.11.0` as the minimum supported Airflow version for this provider.

If you plan to use the common message-queue integration for asset-driven scheduling, install the `common.messaging` extra:

```bash
python -m pip install "apache-airflow==${AIRFLOW_VERSION}" "apache-airflow-providers-apache-kafka[common.messaging]==1.12.0"
```

This package extends Airflow. You do not create a standalone Python client object for it. Instead, you define an Airflow connection of type `kafka` and instantiate provider operators, hooks, or sensors inside DAG code.

Install the provider anywhere Airflow imports or runs DAG code:

- scheduler
- workers or task execution image
- any other runtime that imports DAG modules

## Prerequisites

Before using the provider, make sure your runtime already has:

- a working Airflow deployment
- network access from the Airflow runtime to your Kafka brokers
- Kafka topics that already exist, or an explicit task that creates them
- a Kafka connection config that at minimum sets `bootstrap.servers`

For consumer and sensor tasks, the official system tests use separate Kafka connection ids with consumer-specific settings such as `group.id`, `enable.auto.commit`, and `auto.offset.reset`. Follow the same pattern when producer and consumer settings differ.

## Configure The Airflow Kafka Connection

The provider uses Airflow connection type `kafka`. By default, hooks and operators use `kafka_default`, but the official docs describe that default connection as minimal and only suitable for trivial testing.

Kafka connection settings live in the connection's `extra` field as a JSON-serializable config dict. In the Airflow UI, that field is labeled `Config Dict`.

Environment variables are the cleanest way to set this up in local development and containerized deployments. Airflow reads connections from `AIRFLOW_CONN_{CONN_ID}` and accepts JSON values.

Example producer connection:

```bash
export AIRFLOW_CONN_KAFKA_DEFAULT='{
  "conn_type": "kafka",
  "extra": {
    "bootstrap.servers": "broker-1:9092,broker-2:9092",
    "security.protocol": "SASL_SSL",
    "sasl.mechanisms": "PLAIN",
    "sasl.username": "airflow",
    "sasl.password": "secret"
  }
}'
```

Example consumer connection with explicit offset handling:

```bash
export AIRFLOW_CONN_ORDERS_CONSUMER='{
  "conn_type": "kafka",
  "extra": {
    "bootstrap.servers": "broker-1:9092,broker-2:9092",
    "group.id": "orders-consumer",
    "auto.offset.reset": "earliest",
    "enable.auto.commit": false
  }
}'
```

You can also create the same connection from the CLI:

```bash
airflow connections add 'orders_consumer' \
  --conn-json '{
    "conn_type": "kafka",
    "extra": {
      "bootstrap.servers": "broker-1:9092,broker-2:9092",
      "group.id": "orders-consumer",
      "auto.offset.reset": "earliest",
      "enable.auto.commit": false
    }
  }'
```

The provider forwards those config values to `confluent-kafka`, so broker auth and client tuning options also belong in `extra`.

## Produce Messages To A Topic

`ProduceToTopicOperator` sends records to a topic. Its `producer_function` can be a callable or an importable string, and it must yield key/value pairs.

```python
from __future__ import annotations

import json

from airflow import DAG
from airflow.providers.apache.kafka.operators.produce import ProduceToTopicOperator
from pendulum import datetime


def build_messages():
    for order_id in range(3):
        key = json.dumps({"order_id": order_id})
        value = json.dumps({"order_id": order_id, "status": "paid"})
        yield key, value


with DAG(
    dag_id="kafka_produce_orders",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["kafka"],
) as dag:
    produce_orders = ProduceToTopicOperator(
        task_id="produce_orders",
        kafka_config_id="kafka_default",
        topic="orders",
        producer_function=build_messages,
    )
```

Important operator arguments:

- `topic`: destination Kafka topic
- `kafka_config_id`: Airflow Kafka connection id, default `kafka_default`
- `producer_function`: callable that yields `(key, value)` pairs
- `delivery_callback`: optional import path for a delivery callback
- `synchronous`: defaults to `True`

## Consume Messages From One Or More Topics

`ConsumeFromTopicOperator` subscribes to one or more topics, polls in batches, and calls either `apply_function` for each message or `apply_function_batch` for each batch.

```python
from __future__ import annotations

import json

from airflow import DAG
from airflow.providers.apache.kafka.operators.consume import ConsumeFromTopicOperator
from pendulum import datetime


def process_message(message):
    payload = json.loads(message.value())
    print(
        f"topic={message.topic()} offset={message.offset()} key={message.key()} payload={payload}"
    )


with DAG(
    dag_id="kafka_consume_orders",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["kafka"],
) as dag:
    consume_orders = ConsumeFromTopicOperator(
        task_id="consume_orders",
        kafka_config_id="orders_consumer",
        topics=["orders"],
        apply_function="kafka_consume_orders.process_message",
        commit_cadence="end_of_operator",
        max_messages=100,
        max_batch_size=10,
        poll_timeout=30,
    )
```

The supported commit cadences are:

- `never`
- `end_of_batch`
- `end_of_operator`

Use `apply_function_batch` instead of `apply_function` when your processing logic needs to see a whole batch at once. Do not set both on the same operator.

## Wait Until A Matching Kafka Message Arrives

`AwaitMessageSensor` is deferrable. It consumes messages until your `apply_function` returns a truthy value, then resumes the task and optionally pushes the returned data to XCom.

```python
from __future__ import annotations

import json

from airflow import DAG
from airflow.providers.apache.kafka.sensors.kafka import AwaitMessageSensor
from pendulum import datetime


def is_paid_event(message):
    payload = json.loads(message.value())
    if payload.get("status") == "paid":
        return payload
    return None


with DAG(
    dag_id="kafka_wait_for_paid_order",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["kafka"],
) as dag:
    wait_for_paid_order = AwaitMessageSensor(
        task_id="wait_for_paid_order",
        kafka_config_id="orders_consumer",
        topics=["orders"],
        apply_function="kafka_wait_for_paid_order.is_paid_event",
        poll_timeout=1,
        poll_interval=5,
        xcom_push_key="matched_event",
    )
```

For a long-running listener that handles each positive event and then keeps waiting, use `AwaitMessageTriggerFunctionSensor`:

```python
from airflow.providers.apache.kafka.sensors.kafka import AwaitMessageTriggerFunctionSensor


def on_event(event, **context):
    print(f"matched event: {event}")


listen_for_orders = AwaitMessageTriggerFunctionSensor(
    task_id="listen_for_orders",
    kafka_config_id="orders_consumer",
    topics=["orders"],
    apply_function="kafka_wait_for_paid_order.is_paid_event",
    event_triggered_function=on_event,
)
```

The Kafka sensors are deferrable implementations. The inherited `poke_interval` and `mode` arguments are documented as unused here; use `poll_timeout` and `poll_interval` instead.

## Optional: Create Topics From Airflow Code

If you need an admin task to create a topic before producing messages, use `KafkaAdminClientHook`:

```python
from airflow.providers.apache.kafka.hooks.client import KafkaAdminClientHook


def create_orders_topic():
    hook = KafkaAdminClientHook(kafka_config_id="kafka_default")
    hook.create_topic([("orders", 3, 1)])
```

The hook expects a list of `(topic_name, num_partitions, replication_factor)` tuples.

## Common Pitfalls

- `kafka_default` is not a real production configuration. Set your own connection id or replace its config before using it.
- `bootstrap.servers` must be present in the Kafka connection config or most hooks and operators will reject it.
- Keep Kafka broker settings in the Airflow connection `extra` or `Config Dict`, not in DAG code.
- Install the provider in every Airflow image that imports DAGs or executes tasks. A missing package on workers causes import failures even if the scheduler has it.
- `ConsumeFromTopicOperator` accepts either `apply_function` or `apply_function_batch`, not both.
- For sensors, `apply_function` must be an importable dot-notation string.
- When you want Airflow to control offset commits with `commit_cadence`, use a consumer connection that disables Kafka auto-commit, following the official system-test pattern.
- The provider does not start Kafka brokers or create a general-purpose standalone client SDK for your app; it only adds Airflow hooks, operators, sensors, and triggers around Kafka.

## Version Notes

- This guide covers `apache-airflow-providers-apache-kafka` version `1.12.0`.
- The provider installs classes under the `airflow.providers.apache.kafka` package.
- Version `1.12.0` requires Apache Airflow `>=2.11.0`.
- The provider depends on `confluent-kafka>=2.6.0`.
- The `common.messaging` extra is only needed when you use the common message-queue integration such as `KafkaMessageQueueTrigger` and `MessageQueueTrigger`.

## Official Docs

- Provider index: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/`
- Package index and requirements: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/index.html`
- Kafka connection guide: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/connections/kafka.html`
- Operators guide: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/operators/index.html`
- `ProduceToTopicOperator` API: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/_api/airflow/providers/apache/kafka/operators/produce/index.html`
- `ConsumeFromTopicOperator` API: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/_api/airflow/providers/apache/kafka/operators/consume/index.html`
- Sensors API: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/_api/airflow/providers/apache/kafka/sensors/kafka/index.html`
- Hooks guide: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/hooks.html`
- Message queues guide: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/message-queues/index.html`
- Airflow connection management: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- Example DAG source: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/_modules/tests/system/apache/kafka/example_dag_hello_kafka.html`
- Event-listener example source: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/_modules/tests/system/apache/kafka/example_dag_event_listener.html`
- PyPI package: `https://pypi.org/project/apache-airflow-providers-apache-kafka/`
