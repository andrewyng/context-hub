---
name: pagerduty
description: "dagster-pagerduty package guide for sending PagerDuty Events API v2 alerts from Dagster assets and ops"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,dagster-pagerduty,pagerduty,python,alerts,incident-response,data-orchestration"
---

# dagster-pagerduty Python Package Guide

## Golden Rule

Use `dagster-pagerduty` as a thin Dagster wrapper around PagerDuty's Events API v2: create an Events API v2 integration on the PagerDuty service or orchestration you want to alert, keep that integration key in an environment variable, register `PagerDutyService` in Dagster, and send alert events through `EventV2_create(...)`.

`dagster-pagerduty` does not replace PagerDuty account setup. You still need a valid PagerDuty integration key, which PagerDuty's docs also call a routing key for Events API v2 requests.

## Install

Install the package into the same Python environment as your Dagster code:

```bash
python -m pip install "dagster-pagerduty==0.28.18"
```

Useful checks after install:

```bash
python -m pip show dagster-pagerduty
dagster --version
```

## Prerequisites

Before using `dagster-pagerduty`, make sure you already have:

- a Dagster project with a loadable `defs = dg.Definitions(...)`
- a PagerDuty service or Event Orchestration integration that accepts Events API v2 events
- the integration key copied from PagerDuty and stored securely
- the package installed anywhere your Dagster code location, webserver, or daemon imports the code

For local development, keep the routing key in an environment variable:

```bash
export PAGERDUTY_ROUTING_KEY="0123456789abcdef0123456789abcdef"
```

PagerDuty's integration keys are case-sensitive. Use the exact value copied from the PagerDuty UI.

## Register `PagerDutyService`

The main integration point is `PagerDutyService`.

```python
import os

import dagster as dg
from dagster_pagerduty import PagerDutyService


defs = dg.Definitions(
    resources={
        "pagerduty": PagerDutyService(
            routing_key=os.environ["PAGERDUTY_ROUTING_KEY"],
        ),
    },
)
```

The resource key must match the function parameter name you use for injection.

## Trigger A PagerDuty Alert From An Asset

This is the core pattern from the official Dagster integration page:

```python
import os

import dagster as dg
from dagster_pagerduty import PagerDutyService


@dg.asset
def pagerduty_alert(pagerduty: PagerDutyService) -> None:
    pagerduty.EventV2_create(
        summary="alert from dagster",
        source=os.environ.get("HOSTNAME", "dagster"),
        severity="error",
        event_action="trigger",
    )


defs = dg.Definitions(
    assets=[pagerduty_alert],
    resources={
        "pagerduty": PagerDutyService(
            routing_key=os.environ["PAGERDUTY_ROUTING_KEY"],
        ),
    },
)
```

Important details:

- `PagerDutyService` sends events through PagerDuty Events API v2
- `event_action="trigger"` creates an alert event
- `source` should identify the affected system or emitter
- `severity` must be one of `critical`, `error`, `warning`, or `info`
- the injected parameter name `pagerduty` must match the `resources={"pagerduty": ...}` key

## Use It From Ops Too

The same service works in ops if your project still uses the op or job model:

```python
import os

import dagster as dg
from dagster_pagerduty import PagerDutyService


@dg.op
def notify_ops_team(pagerduty: PagerDutyService) -> None:
    pagerduty.EventV2_create(
        summary="nightly ingestion failed",
        source="dagster/nightly-ingestion",
        severity="critical",
        event_action="trigger",
    )


@dg.job
def alerting_job() -> None:
    notify_ops_team()


defs = dg.Definitions(
    jobs=[alerting_job],
    resources={
        "pagerduty": PagerDutyService(
            routing_key=os.environ["PAGERDUTY_ROUTING_KEY"],
        ),
    },
)
```

## Event Fields That Matter In Practice

PagerDuty's Events API v2 behavior matters more than Dagster-specific configuration here:

- `routing_key`: the integration key for your PagerDuty service or orchestration
- `event_action`: use `trigger` to create an alert
- `severity`: PagerDuty accepts only `critical`, `error`, `warning`, or `info`
- `dedup_key`: PagerDuty uses this to merge repeated events into the same alert and to match a later `resolve` event to an existing alert

If you need one long-lived incident instead of a new PagerDuty alert for every Dagster failure, design a stable `dedup_key` strategy around the job, asset, or external system you are paging on.

## Local Development Workflow

Point Dagster at the module that exposes your top-level `Definitions` object:

```bash
dagster dev -m my_project.definitions
```

Trigger the asset or job, then verify the resulting alert in PagerDuty. If nothing appears, check the Dagster process logs first, then confirm that the routing key belongs to the service you expected.

## Common Pitfalls

- Using the wrong PagerDuty credential. `dagster-pagerduty` needs an Events API v2 integration key as the `routing_key`, not a REST API access token.
- Mistyping the key. PagerDuty integration keys are case-sensitive.
- Invalid severity strings. PagerDuty rejects values outside `critical`, `error`, `warning`, or `info`.
- Resource name mismatch. The Dagster resource key and injected parameter name must match.
- Alert spam from repeated failures. Without a stable `dedup_key`, repeated failures are more likely to create separate alerts instead of updating one ongoing incident.
- Partial installation. Install the package anywhere your Dagster code is imported, including local code locations and deployment environments.

## Version Notes For `0.28.18`

- This guide targets `dagster-pagerduty==0.28.18`.
- Dagster publishes this integration from the main `dagster-io/dagster` monorepo under `python_modules/libraries/dagster-pagerduty`.

## Official Sources

- https://dagster.io/integrations/dagster-pagerduty
- https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-pagerduty
- https://pypi.org/project/dagster-pagerduty/
- https://support.pagerduty.com/main/docs/services-and-integrations
- https://support.pagerduty.com/main/docs/dynamic-notifications
- https://support.pagerduty.com/main/docs/event-orchestration
- https://support.pagerduty.com/main/docs/alerts
- https://support.pagerduty.com/main/docs/pd-cef
