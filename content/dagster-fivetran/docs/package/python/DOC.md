---
name: package
description: "dagster-fivetran package guide for triggering Fivetran connector syncs and modeling connector tables as Dagster assets"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,fivetran,dagster-fivetran,python,data-orchestration,etl,assets"
---

# dagster-fivetran Python Package Guide

## Golden Rule

Use `dagster-fivetran` as Dagster's orchestration layer for connectors that are already configured in Fivetran. Create and verify the connector in Fivetran first, then represent the connector's destination tables in Dagster and authenticate with a `FivetranResource` using Fivetran API credentials.

## Install

Install `dagster-fivetran` on the matching Dagster release line:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-fivetran==0.28.18"
```

Useful checks after install:

```bash
dagster --version
python -m pip show dagster-fivetran
```

## Prerequisites

Before wiring `dagster-fivetran` into a project, make sure you already have:

- a Dagster project with a loadable top-level `defs = dg.Definitions(...)`
- a working Fivetran account and a connector that already syncs successfully in Fivetran
- a Fivetran API key and API secret with permission to read connector state and trigger syncs
- the connector's stable connector ID
- the destination tables you want Dagster to represent as assets

## Configure Credentials

Keep Fivetran credentials in environment variables instead of hard-coding them into Dagster definitions:

```bash
export FIVETRAN_API_KEY="your_fivetran_api_key"
export FIVETRAN_API_SECRET="your_fivetran_api_secret"
export FIVETRAN_CONNECTOR_ID="your_connector_id"
```

If you manage multiple connectors, give each connector its own environment variable instead of reusing one generic ID.

## Model A Connector As Dagster Assets

The main package pattern is a configured `FivetranResource` plus `build_fivetran_assets(...)` for each connector you want to orchestrate.

```python
import os

import dagster as dg
from dagster_fivetran import FivetranResource, build_fivetran_assets

CONNECTOR_ID = os.environ["FIVETRAN_CONNECTOR_ID"]

marketing_connector_assets = build_fivetran_assets(
    connector_id=CONNECTOR_ID,
    destination_tables=[
        "public.accounts",
        "public.contacts",
        "public.opportunities",
    ],
)

defs = dg.Definitions(
    assets=[marketing_connector_assets],
    resources={
        "fivetran": FivetranResource(
            api_key=dg.EnvVar("FIVETRAN_API_KEY"),
            api_secret=dg.EnvVar("FIVETRAN_API_SECRET"),
        ),
    },
)
```

Why this shape matters:

- `build_fivetran_assets(...)` tells Dagster which connector and destination tables belong together.
- `FivetranResource(...)` is the authenticated handle Dagster uses for Fivetran API calls.
- the resource key `fivetran` must match what the generated asset definition expects
- the `destination_tables` list should match the tables that Fivetran writes in the destination warehouse

## Add More Than One Connector

Create one asset definition per connector, then register them together in `Definitions`.

```python
import os

import dagster as dg
from dagster_fivetran import FivetranResource, build_fivetran_assets

salesforce_assets = build_fivetran_assets(
    connector_id=os.environ["FIVETRAN_SALESFORCE_CONNECTOR_ID"],
    destination_tables=["public.accounts", "public.contacts"],
)

stripe_assets = build_fivetran_assets(
    connector_id=os.environ["FIVETRAN_STRIPE_CONNECTOR_ID"],
    destination_tables=["public.balance_transactions", "public.charges"],
)

defs = dg.Definitions(
    assets=[salesforce_assets, stripe_assets],
    resources={
        "fivetran": FivetranResource(
            api_key=dg.EnvVar("FIVETRAN_API_KEY"),
            api_secret=dg.EnvVar("FIVETRAN_API_SECRET"),
        )
    },
)
```

This keeps each connector explicit and avoids coupling unrelated connectors into one large definition.

## Local Development Workflow

With credentials exported and definitions in place, validate the Dagster definitions and start the local UI:

```bash
dg check defs
dg dev -m my_project.definitions
```

Use the Dagster UI to materialize the Fivetran-backed assets. That will trigger the connector sync through the configured resource.

## Common Pitfalls

- Keep Dagster package versions aligned. `dagster-fivetran 0.28.18` belongs on the Dagster `1.12.18` release line.
- Use the Fivetran connector ID, not the connector display name, when setting `connector_id=`.
- Keep the `destination_tables` list in sync with the actual tables Fivetran writes. If the connector schema changes, update the Dagster definition too.
- Treat Fivetran credentials as secrets. Do not hard-code them into `Definitions`, schedules, or checked-in config files.
- Make sure the runtime environment that starts Dagster can import `dagster_fivetran` and can see the same Fivetran credentials you used during local setup.
- `dagster-fivetran` orchestrates Fivetran syncs and asset metadata in Dagster; it does not replace the normal connector configuration you manage in Fivetran itself.

## Version Notes For `0.28.18`

- `dagster-fivetran==0.28.18` matches the Dagster `1.12.18` release line, so pin related Dagster packages together.
- If you upgrade Dagster core or the webserver package, upgrade `dagster-fivetran` on the same release line instead of changing it in isolation.

## Official Sources

- `https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-fivetran`
- `https://docs.dagster.io/api/python-api/libraries/dagster-fivetran`
- `https://docs.dagster.io/integrations/libraries/fivetran`
- `https://pypi.org/project/dagster-fivetran/`
