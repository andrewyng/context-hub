---
name: package
description: "dagster-slack package guide for posting Slack notifications from Dagster assets, ops, and run-failure sensors"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dagster,dagster-slack,python,slack,notifications,sensors,data-orchestration"
---

# dagster-slack Python Package Guide

## Golden Rule

Use `dagster-slack` as a thin Dagster integration around Slack's Web API: keep the Slack token in an environment variable, register `SlackResource` in `dg.Definitions(...)`, and call Slack methods through `slack.get_client()` from assets, ops, or sensors.

Keep `dagster-slack` on the same Dagster release line as the rest of your Dagster packages. For this guide, `dagster-slack==0.28.18` pairs with Dagster `1.12.18`.

## Install

Install the Slack integration alongside the matching Dagster packages:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-slack==0.28.18"
```

Useful checks after install:

```bash
dagster --version
python -m pip show dagster-slack
```

## Prerequisites

Before using `dagster-slack`, make sure you already have:

- a Slack app with a bot token that can call `chat.postMessage`
- the bot added to the channel you want Dagster to post into
- a Dagster project with a loadable `defs = dg.Definitions(...)`
- the same package set installed anywhere your Dagster code location, webserver, or daemon imports the code

For local development, keep the token in an environment variable:

```bash
export SLACK_TOKEN="xoxb-your-slack-bot-token"
export SLACK_CHANNEL="#data-alerts"
```

In production, prefer your deployment platform's secret manager over hard-coded values.

## Register `SlackResource`

The main modern integration point is `SlackResource`.

```python
import dagster as dg
from dagster_slack import SlackResource


defs = dg.Definitions(
    resources={
        "slack": SlackResource(token=dg.EnvVar("SLACK_TOKEN")),
    },
)
```

The resource key must match the function parameter name you use for injection.

## Post A Slack Message From An Asset

This is the simplest pattern to copy into a Dagster project:

```python
import os

import dagster as dg
from dagster_slack import SlackResource


@dg.asset
def notify_slack(slack: SlackResource) -> None:
    slack.get_client().chat_postMessage(
        channel=os.environ.get("SLACK_CHANNEL", "#data-alerts"),
        text="Dagster asset materialized successfully.",
    )


defs = dg.Definitions(
    assets=[notify_slack],
    resources={
        "slack": SlackResource(token=dg.EnvVar("SLACK_TOKEN")),
    },
)
```

Important details:

- `SlackResource` gives you a Slack Web API client through `get_client()`
- `chat_postMessage(...)` is the exact Slack API call used to send a message
- the `slack` parameter name must match the `resources={"slack": ...}` key
- channel IDs are usually more stable than channel names when you move between workspaces or rename channels

## Send Richer Messages

Because `SlackResource` exposes the underlying Slack client, you can pass normal Slack API arguments such as `blocks`:

```python
import os

import dagster as dg
from dagster_slack import SlackResource


@dg.asset
def post_run_summary(slack: SlackResource) -> None:
    slack.get_client().chat_postMessage(
        channel=os.environ["SLACK_CHANNEL"],
        text="Daily Dagster run finished.",
        blocks=[
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Daily Dagster run finished*\nAll selected assets completed.",
                },
            }
        ],
    )
```

Keep the top-level `text` field even when you send `blocks`; Slack uses it as the fallback message body.

## Notify On Run Failures

`dagster-slack` also includes a helper for run-failure notifications.

```python
import os

import dagster as dg
from dagster_slack import SlackResource, make_slack_on_run_failure_sensor


@dg.asset
def important_asset() -> str:
    return "ok"


slack_on_run_failure = make_slack_on_run_failure_sensor(
    channel=os.environ.get("SLACK_CHANNEL", "#data-alerts"),
    slack_token=os.environ["SLACK_TOKEN"],
)


defs = dg.Definitions(
    assets=[important_asset],
    resources={
        "slack": SlackResource(token=dg.EnvVar("SLACK_TOKEN")),
    },
    sensors=[slack_on_run_failure],
)
```

Use this when you want one Slack notification path for Dagster run failures without writing a custom sensor body.

## Local Development Workflow

Point Dagster at the module that exposes your top-level `Definitions` object:

```bash
dagster dev -m my_project.definitions
```

If your deployment uses schedules or sensors, run the daemon against the same Dagster instance configuration:

```bash
dagster-daemon run
```

## Common Pitfalls

- Version mismatch. Keep `dagster-slack` on the matching Dagster release line in the same environment.
- Missing channel membership. Slack will reject posts if the bot token cannot post into the target channel.
- Resource name mismatch. The injected function parameter must match the resource dictionary key.
- Importing the package in only one process. Install `dagster-slack` anywhere the code location, webserver, or daemon needs to import your definitions.
- Hard-coding secrets. Keep `SLACK_TOKEN` in environment variables or a secrets manager, not in constant Dagster config.
- Treating `dagster-slack` as a full Slack abstraction. The package intentionally stays close to the underlying Slack Web API, so message formatting and method arguments still follow Slack's API.

## Version Notes For `0.28.18`

- `dagster-slack==0.28.18` is part of the Dagster `1.12.18` release line.
- For new Dagster code, prefer `SlackResource` and `dg.Definitions(...)` rather than building around older resource configuration patterns.

## Official Sources

- https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-slack
- https://docs.dagster.io/api/python-api/libraries/dagster-slack
- https://docs.dagster.io/api/dagster/resources
- https://docs.dagster.io/api/dagster/schedules-sensors
- https://pypi.org/project/dagster-slack/
- https://api.slack.com/methods/chat.postMessage
