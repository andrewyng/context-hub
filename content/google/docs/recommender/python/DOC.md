---
name: recommender
description: "Google Cloud Recommender Python client for listing recommendations and insights and updating their state"
metadata:
  languages: "python"
  versions: "2.20.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,recommender,active-assist,gcp,optimization,python"
---

# Google Cloud Recommender Python Client

## Golden Rule

Use the official `google-cloud-recommender` package with Application Default Credentials (ADC), and treat Recommender as a metadata and workflow API:

- Recommender lists recommendations and insights.
- Recommender state changes require the current `etag`.
- Applying a recommendation is usually a separate product-specific API call against the resource named in the recommendation content.

## Install

Pin the version your project expects:

```bash
python -m pip install "google-cloud-recommender==2.20.0"
```

Common alternatives:

```bash
uv add "google-cloud-recommender==2.20.0"
poetry add "google-cloud-recommender==2.20.0"
```

PyPI currently lists support for Python 3.7 and newer.

## Authentication And Setup

Before calling the API:

1. Enable the Recommender API for the target Google Cloud project.
2. Authenticate with ADC.
3. Choose the exact recommender ID, insight type ID, and location for the product you are targeting.

Local ADC setup:

```bash
gcloud services enable recommender.googleapis.com
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT_NUMBER="123456789012"
export GOOGLE_CLOUD_LOCATION="us-central1-a"
export GOOGLE_CLOUD_RECOMMENDER_ID="google.compute.instance.MachineTypeRecommender"
export GOOGLE_CLOUD_INSIGHT_TYPE_ID="google.compute.instance.IdleResourceInsight"
```

Service account fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT_NUMBER="123456789012"
export GOOGLE_CLOUD_LOCATION="us-central1-a"
```

Notes:

- For API requests, Google documents that you can use a project ID or project number, and recommends the project number.
- Location and recommender or insight type are required for the GA API flow.
- Recommender IDs and supported locations vary by product. Verify them against the Recommenders and Insight types tables before copying an example.
- Required IAM permissions also vary by recommender and insight type. Check the product tables before assuming a broad viewer or editor role is enough.

## Initialize A Client

Default client with ADC:

```python
from google.cloud import recommender_v1

client = recommender_v1.RecommenderClient()
```

Explicit service account credentials:

```python
from google.cloud import recommender_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/absolute/path/service-account.json"
)

client = recommender_v1.RecommenderClient(credentials=credentials)
```

Build a project-scoped recommender resource name:

```python
import os

from google.cloud import recommender_v1

client = recommender_v1.RecommenderClient()

parent = client.recommender_path(
    project=os.environ["GOOGLE_CLOUD_PROJECT_NUMBER"],
    location=os.environ["GOOGLE_CLOUD_LOCATION"],
    recommender=os.environ["GOOGLE_CLOUD_RECOMMENDER_ID"],
)
```

For non-project scopes such as folders, organizations, or billing accounts, pass the fully qualified `parent` or `name` string in one of the formats accepted by the request type docs.

## Core Workflow

### List active recommendations

`list_recommendations()` returns a pager. The common filter is `stateInfo.state = ACTIVE`.

```python
import os

from google.cloud import recommender_v1

client = recommender_v1.RecommenderClient()
parent = client.recommender_path(
    project=os.environ["GOOGLE_CLOUD_PROJECT_NUMBER"],
    location=os.environ["GOOGLE_CLOUD_LOCATION"],
    recommender=os.environ["GOOGLE_CLOUD_RECOMMENDER_ID"],
)

for recommendation in client.list_recommendations(
    parent=parent,
    filter="stateInfo.state = ACTIVE",
):
    print(recommendation.name)
    print(recommendation.description)
    print(recommendation.recommender_subtype)
    print(recommendation.etag)
    print("---")
```

Supported filter fields for recommendations are documented as:

- `stateInfo.state`
- `recommenderSubtype`
- `priority`
- `targetResources`

### Fetch one recommendation and inspect the suggested operations

The recommendation tells you what to change. The actual change is usually not performed through the Recommender client itself.

```python
import os

from google.cloud import recommender_v1

client = recommender_v1.RecommenderClient()
recommendation_name = client.recommendation_path(
    project=os.environ["GOOGLE_CLOUD_PROJECT_NUMBER"],
    location=os.environ["GOOGLE_CLOUD_LOCATION"],
    recommender=os.environ["GOOGLE_CLOUD_RECOMMENDER_ID"],
    recommendation="RECOMMENDATION_ID",
)
recommendation = client.get_recommendation(name=recommendation_name)

print(recommendation.description)

for group in recommendation.content.operation_groups:
    for operation in group.operations:
        print("action:", operation.action)
        print("resource:", operation.resource)
        print("path:", operation.path)
        print("value:", operation.value)
        print("---")
```

Use the `resource` and operation details to decide which product-specific API call you need to make next. For example, a Compute Engine sizing recommendation is applied with Compute Engine tooling, not by mutating the resource through `google-cloud-recommender`.

### Claim a recommendation before applying it

Claiming marks the recommendation as in progress and prevents Recommender from refreshing its content while you work on it.

```python
claimed = client.mark_recommendation_claimed(
    name=recommendation.name,
    etag=recommendation.etag,
    state_metadata={"actor": "ops-bot", "ticket": "chg-12345"},
)
```

### Mark it succeeded, failed, or dismissed

After you apply the real resource change, update the recommendation state with the latest returned `etag`:

```python
succeeded = client.mark_recommendation_succeeded(
    name=claimed.name,
    etag=claimed.etag,
    state_metadata={"actor": "ops-bot", "ticket": "chg-12345"},
)
```

If your rollout fails:

```python
failed = client.mark_recommendation_failed(
    name=claimed.name,
    etag=claimed.etag,
    state_metadata={"actor": "ops-bot", "ticket": "chg-12345"},
)
```

If you want to stop seeing a recommendation without applying it:

```python
dismissed = client.mark_recommendation_dismissed(
    request=recommender_v1.MarkRecommendationDismissedRequest(
        name=recommendation.name,
        etag=recommendation.etag,
    )
)
```

For recommendation state metadata, the generated client docs note that keys and values are validated. Keep keys simple, lowercase, and short.

## Insights Workflow

### List active insights

Insights are separate resources. Some insights are linked to recommendations, and some are useful on their own.

```python
import os

from google.cloud import recommender_v1

client = recommender_v1.RecommenderClient()
parent = client.insight_type_path(
    project=os.environ["GOOGLE_CLOUD_PROJECT_NUMBER"],
    location=os.environ["GOOGLE_CLOUD_LOCATION"],
    insight_type=os.environ["GOOGLE_CLOUD_INSIGHT_TYPE_ID"],
)

for insight in client.list_insights(
    parent=parent,
    filter="stateInfo.state = ACTIVE",
):
    print(insight.name)
    print(insight.description)
    print(insight.category)
    print(insight.severity)
    for reference in insight.associated_recommendations:
        print("recommendation:", reference.recommendation)
    print("---")
```

Supported filter fields for insights are documented as:

- `stateInfo.state`
- `insightSubtype`
- `severity`
- `targetResources`

### Mark an insight accepted

Use this when you acted on the insight directly, or when you want to record that the finding has been handled.

```python
accepted = client.mark_insight_accepted(
    name=insight.name,
    etag=insight.etag,
    state_metadata={"actor": "ops-bot", "ticket": "chg-12345"},
)
```

Accepted insights become immutable. Product docs also note that insights associated with a recommendation become accepted when the recommendation is marked `CLAIMED`, `SUCCEEDED`, or `FAILED`.

## Configuration And Debugging Notes

- Prefer ADC or an explicit `credentials=` object. The Recommender changelog notes that `credentials_file` is deprecated.
- If you need SDK debug logs, set `GOOGLE_SDK_PYTHON_LOGGING_SCOPE=google` or a narrower Google module scope before instantiating the client.
- The Python package exposes both `recommender_v1` and `recommender_v1beta1`. Prefer `recommender_v1` unless you specifically need a beta-only surface.

## Common Pitfalls

- Do not assume one global recommender. Every call needs the right recommender ID or insight type ID and the right location for that product.
- Do not drop the `etag`. State-change methods require the current fingerprint for optimistic locking.
- Do not assume marking a recommendation `SUCCEEDED` applies the infrastructure change for you. You still have to call the relevant Google Cloud service API or use the console or `gcloud`.
- Do not invent your own filter fields. Recommender and insight list filters only support the documented fields.
- Do not assume the helper methods cover every resource hierarchy. Project helpers are convenient, but request docs also allow folder, organization, and billing-account resource names.

## Version-Sensitive Notes

- PyPI currently publishes `google-cloud-recommender 2.20.0`.
- The hosted reference pages under the latest docs tree are slightly inconsistent: some generated subpages still display older version labels, so check PyPI and the official changelog when you need the exact released package version.
- The Recommender changelog shows that `2.19.0` deprecated `credentials_file`, so prefer ADC or explicit credential objects in new code.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-recommender/
- Python client reference root: https://cloud.google.com/python/docs/reference/recommender/latest
- `RecommenderClient` reference: https://docs.cloud.google.com/python/docs/reference/recommender/latest/google.cloud.recommender_v1.services.recommender.RecommenderClient
- `Recommendation` type reference: https://docs.cloud.google.com/python/docs/reference/recommender/latest/google.cloud.recommender_v1.types.Recommendation
- `Insight` type reference: https://docs.cloud.google.com/python/docs/reference/recommender/latest/google.cloud.recommender_v1.types.Insight
- `ListRecommendationsRequest` reference: https://docs.cloud.google.com/python/docs/reference/recommender/latest/google.cloud.recommender_v1.types.ListRecommendationsRequest
- `ListInsightsRequest` reference: https://docs.cloud.google.com/python/docs/reference/recommender/latest/google.cloud.recommender_v1.types.ListInsightsRequest
- Recommender API usage guide: https://docs.cloud.google.com/recommender/docs/use-api
- Insights API usage guide: https://docs.cloud.google.com/recommender/docs/insights/use-api
- Recommender concepts: https://docs.cloud.google.com/recommender/docs/key-concepts
- Insight concepts: https://docs.cloud.google.com/recommender/docs/insights/using-insights
- Insight types table: https://docs.cloud.google.com/recommender/docs/insights/insight-types
- Recommenders table: https://docs.cloud.google.com/recommender/docs/recommenders
- Changelog: https://docs.cloud.google.com/python/docs/reference/recommender/latest/changelog
