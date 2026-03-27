---
name: providers-facebook
description: "Apache Airflow provider for configuring Facebook Ads connections and using FacebookAdsReportingHook in DAG tasks"
metadata:
  languages: "python"
  versions: "3.9.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,facebook,facebook-ads,marketing-api,hooks,dag"
---

# Apache Airflow Facebook Provider Guide

Use `apache-airflow-providers-facebook` when an Airflow DAG needs an Airflow-managed Facebook Ads connection and Python task code that pulls Ads Insights reports without hard-coding app credentials in the DAG file.

This guide covers provider version `3.9.2`.

## Golden Rule

- Install this provider into the same environment as a pinned `apache-airflow` installation.
- Configure a `facebook_social` Airflow connection and put `app_id`, `app_secret`, `access_token`, and `account_id` in connection extras.
- Use `FacebookAdsReportingHook` inside task code, then call `bulk_facebook_report(...)`.
- If `account_id` is a list, handle the method result as a dict keyed by account id instead of a single flat list.

## What This Package Adds

This provider is narrow. In the official provider metadata it exposes:

- Airflow connection type `facebook_social`
- `FacebookAdsReportingHook`

The official provider metadata for `3.9.2` lists hooks and connection types, but not operators. The normal pattern is to call the hook from a Python task.

## Install

Install the provider in the same Python environment as Airflow and keep Airflow pinned while you add or upgrade the provider.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="3.9.2"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-facebook==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful checks after installation:

```bash
airflow providers list | grep -i facebook
python -c "from airflow.providers.facebook.ads.hooks.ads import FacebookAdsReportingHook; print(FacebookAdsReportingHook.__name__)"
```

Version-sensitive notes for `3.9.2`:

- The provider changelog says `3.9.0` raised the minimum Airflow version to `2.11.0`.
- PyPI classifiers for `3.9.2` list Python `3.10`, `3.11`, `3.12`, and `3.13`.
- PyPI lists `facebook-business>=22.0.0` as a dependency, so you do not need to install the Facebook Business SDK separately for normal provider usage.

## Configure A Facebook Ads Connection

`FacebookAdsReportingHook` reads its required values from Airflow connection extras, not from the connection login or password fields.

Set the values you want Airflow to store:

```bash
export FACEBOOK_APP_ID="<facebook-app-id>"
export FACEBOOK_APP_SECRET="<facebook-app-secret>"
export FACEBOOK_ACCESS_TOKEN="<facebook-access-token>"
export FACEBOOK_ACCOUNT_ID="act_<ad_account_id>"
```

Then create the Airflow connection:

```bash
airflow connections add 'facebook_default' \
  --conn-type 'facebook_social' \
  --conn-extra "{\"app_id\":\"${FACEBOOK_APP_ID}\",\"app_secret\":\"${FACEBOOK_APP_SECRET}\",\"access_token\":\"${FACEBOOK_ACCESS_TOKEN}\",\"account_id\":\"${FACEBOOK_ACCOUNT_ID}\"}"
```

You can also provide the same connection through an environment variable:

```bash
export AIRFLOW_CONN_FACEBOOK_DEFAULT='{
  "conn_type": "facebook_social",
  "extra": {
    "app_id": "<facebook-app-id>",
    "app_secret": "<facebook-app-secret>",
    "access_token": "<facebook-access-token>",
    "account_id": "act_<ad_account_id>"
  }
}'
```

Confirm the connection before you wire it into a DAG:

```bash
airflow connections get facebook_default
```

Required extra fields:

- `app_id`
- `app_secret`
- `access_token`
- `account_id`

If any of those are missing, the hook raises an Airflow exception before making the API call.

## Run A Bulk Insights Report In A Task

The hook method to use is `bulk_facebook_report(fields, params)`.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.facebook.ads.hooks.ads import FacebookAdsReportingHook


with DAG(
    dag_id="facebook_ads_insights_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["facebook"],
):
    @task()
    def fetch_campaign_metrics() -> dict[str, int]:
        hook = FacebookAdsReportingHook(facebook_conn_id="facebook_default")

        rows = hook.bulk_facebook_report(
            fields=[
                "account_id",
                "campaign_name",
                "impressions",
                "clicks",
                "spend",
            ],
            params={
                "date_preset": "yesterday",
                "level": "campaign",
            },
        )

        print(f"Fetched {len(rows)} insight rows")
        return {"row_count": len(rows)}

    fetch_campaign_metrics()
```

Practical points:

- `facebook_conn_id` defaults to `facebook_default`.
- `fields` is the list of insights fields to request.
- `params` is passed through to the Facebook Ads Insights API request.
- If you need a specific Marketing API version, pass `api_version="..."` when creating the hook. If you omit it, the hook uses the Facebook Business SDK default version.

## Use Multiple Ad Accounts

This provider supports multiple account ids on the same connection. Put a list in the `account_id` extra:

```bash
export AIRFLOW_CONN_FACEBOOK_DEFAULT='{
  "conn_type": "facebook_social",
  "extra": {
    "app_id": "<facebook-app-id>",
    "app_secret": "<facebook-app-secret>",
    "access_token": "<facebook-access-token>",
    "account_id": ["act_1111111111", "act_2222222222"]
  }
}'
```

When `account_id` is a list, `bulk_facebook_report(...)` returns a dict keyed by account id:

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.facebook.ads.hooks.ads import FacebookAdsReportingHook


with DAG(
    dag_id="facebook_ads_multi_account_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["facebook"],
):
    @task()
    def fetch_by_account() -> dict[str, int]:
        hook = FacebookAdsReportingHook(facebook_conn_id="facebook_default")

        report = hook.bulk_facebook_report(
            fields=["account_id", "campaign_name", "spend"],
            params={"date_preset": "last_7d"},
        )

        return {account_id: len(rows) for account_id, rows in report.items()}

    fetch_by_account()
```

Use this pattern when one Airflow environment manages several ad accounts with the same app credentials and access token.

## Operational Checks

Check that Airflow can import the provider and parse your DAG:

```bash
airflow providers list | grep -i facebook
airflow dags list | grep facebook_ads
```

Run an isolated task test while you are wiring up credentials and report parameters:

```bash
airflow tasks test facebook_ads_insights_demo fetch_campaign_metrics 2026-03-13
```

## Common Pitfalls

- Installing the provider without upgrading Airflow first. Provider `3.9.x` requires Airflow `2.11.0` or newer.
- Putting Facebook credentials in Airflow connection login and password fields instead of `extra`.
- Forgetting `account_id`; it is a required connection extra.
- Assuming multi-account configuration returns one list. It returns a dict keyed by account id.
- Forgetting that `params` and `fields` must match the Facebook Ads Insights API surface, not generic Graph API endpoints.

## Version Notes

- This guide covers `apache-airflow-providers-facebook` version `3.9.2`.
- The provider's changelog shows `3.9.0` as the release that dropped support for older Airflow versions by requiring Airflow `2.11.0+`.
- Earlier changelog entries show multi-account support was added before `3.9.x`, so the list-valued `account_id` workflow is available in this version.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-facebook/stable/`
- Hook API docs: `https://airflow.apache.org/docs/apache-airflow-providers-facebook/stable/_api/airflow/providers/facebook/ads/hooks/ads/index.html`
- Hook source docs: `https://airflow.apache.org/docs/apache-airflow-providers-facebook/stable/_modules/airflow/providers/facebook/ads/hooks/ads.html`
- Airflow connections reference: `https://airflow.apache.org/docs/apache-airflow-providers/core-extensions/connections.html`
- Provider changelog: `https://airflow.apache.org/docs/apache-airflow-providers-facebook/stable/changelog.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-facebook/`
- Facebook Marketing API insights parameters: `https://developers.facebook.com/docs/marketing-api/insights/parameters/`
