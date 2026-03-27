---
name: recommendations-ai
description: "Google Cloud Recommendations AI Python client for catalog ingestion, recommendation prediction, and user event logging"
metadata:
  languages: "python"
  versions: "0.12.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,recommendations-ai,recommendationengine,ecommerce,personalization"
---

# Google Cloud Recommendations AI Python Client

## Golden Rule

Use the official `google-cloud-recommendations-ai` package, authenticate with Application Default Credentials (ADC), and build requests against the `recommendationengine_v1beta1` namespace.

The package is still generated around the Recommendations AI `v1beta1` API surface, so the safest path is to stick to the documented service clients:

- `CatalogServiceClient` for catalog items
- `PredictionServiceClient` for recommendation calls
- `UserEventServiceClient` for event ingestion

## Install

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "google-cloud-recommendations-ai==0.12.0"
```

Common alternatives:

```bash
uv add "google-cloud-recommendations-ai==0.12.0"
poetry add "google-cloud-recommendations-ai==0.12.0"
```

## Authentication And Setup

Before client code works, Google says you need to:

1. Select or create a Google Cloud project.
2. Enable billing.
3. Enable Recommendations AI.
4. Set up authentication.

For local development, use ADC with `gcloud`:

```bash
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT="my-project"
export GOOGLE_CLOUD_LOCATION="global"
export GOOGLE_CLOUD_CATALOG="default_catalog"
export GOOGLE_CLOUD_EVENT_STORE="default_event_store"
export RECOMMENDATIONS_PLACEMENT="home_page"
```

If you must use a service account key:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

For production on Google Cloud, prefer attaching a service account to the workload instead of shipping JSON keys.

## Initialize Clients And Resource Names

Most request failures come from malformed resource names. Use the helper methods on the generated clients instead of hand-assembling long strings.

```python
import os

from google.cloud import recommendationengine_v1beta1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
CATALOG_ID = os.getenv("GOOGLE_CLOUD_CATALOG", "default_catalog")
EVENT_STORE_ID = os.getenv("GOOGLE_CLOUD_EVENT_STORE", "default_event_store")
PLACEMENT_ID = os.getenv("RECOMMENDATIONS_PLACEMENT", "home_page")

catalog_client = recommendationengine_v1beta1.CatalogServiceClient()
prediction_client = recommendationengine_v1beta1.PredictionServiceClient()
user_event_client = recommendationengine_v1beta1.UserEventServiceClient()

catalog_name = catalog_client.catalog_path(PROJECT_ID, LOCATION, CATALOG_ID)
event_store_name = user_event_client.event_store_path(
    PROJECT_ID,
    LOCATION,
    CATALOG_ID,
    EVENT_STORE_ID,
)
placement_name = prediction_client.placement_path(
    PROJECT_ID,
    LOCATION,
    CATALOG_ID,
    EVENT_STORE_ID,
    PLACEMENT_ID,
)
```

Important formats from the reference:

- Catalog: `projects/*/locations/global/catalogs/default_catalog`
- Event store: `projects/*/locations/global/catalogs/default_catalog/eventStores/default_event_store`
- Placement: `projects/*/locations/global/catalogs/default_catalog/eventStores/default_event_store/placements/*`

## Create Or Import Catalog Items

### Create one catalog item

`CatalogItem.id`, `CatalogItem.category_hierarchies`, and `CatalogItem.title` are required.

```python
from google.cloud import recommendationengine_v1beta1

catalog_item = recommendationengine_v1beta1.CatalogItem(
    id="sku-123",
    title="Trail Runner 2",
    category_hierarchies=[
        recommendationengine_v1beta1.CatalogItem.CategoryHierarchy(
            categories=["Shoes", "Running"]
        )
    ],
    description="Neutral daily running shoe",
)

created = catalog_client.create_catalog_item(
    parent=catalog_name,
    catalog_item=catalog_item,
)

print(created.id)
```

### Bulk import catalog items

`import_catalog_items()` is the normal bulk-ingestion path. The official docs say it may run synchronously, does not support partial updates, and creates missing items.

For small batches, use the inline source:

```python
from google.cloud import recommendationengine_v1beta1

items = [
    recommendationengine_v1beta1.CatalogItem(
        id="sku-123",
        title="Trail Runner 2",
        category_hierarchies=[
            recommendationengine_v1beta1.CatalogItem.CategoryHierarchy(
                categories=["Shoes", "Running"]
            )
        ],
    ),
    recommendationengine_v1beta1.CatalogItem(
        id="sku-456",
        title="Daily Trainer",
        category_hierarchies=[
            recommendationengine_v1beta1.CatalogItem.CategoryHierarchy(
                categories=["Shoes", "Training"]
            )
        ],
    ),
]

operation = catalog_client.import_catalog_items(
    request=recommendationengine_v1beta1.ImportCatalogItemsRequest(
        parent=catalog_name,
        input_config=recommendationengine_v1beta1.InputConfig(
            catalog_inline_source=recommendationengine_v1beta1.CatalogInlineSource(
                catalog_items=items
            )
        ),
    )
)

response = operation.result()
print(response)
```

The generated references document the inline source as a list of catalog items and recommend keeping it to about 10,000 items max. For larger feeds, move the input source to GCS instead of sending everything inline.

### List catalog items

`list_catalog_items()` returns a pager:

```python
pager = catalog_client.list_catalog_items(parent=catalog_name)

for item in pager:
    print(item.id, item.title)
```

## Request Recommendations

`PredictionServiceClient.predict()` takes a placement and a contextual `UserEvent`. The response is pageable, so iterating the result automatically handles additional pages.

```python
from google.cloud import recommendationengine_v1beta1

response = prediction_client.predict(
    request=recommendationengine_v1beta1.PredictRequest(
        name=placement_name,
        user_event=recommendationengine_v1beta1.UserEvent(
            event_type="home-page-view",
            user_info=recommendationengine_v1beta1.UserInfo(
                visitor_id="visitor-123"
            ),
        ),
    )
)

for result in response:
    print(result.id)
```

Default placement IDs documented in the Python reference include:

- `home_page`
- `product_detail`
- `shopping_cart`
- `recently_viewed_default`

Use `home_page` when you want generic "recommended for you" output. Use the other placements only when your event context actually matches that page or flow.

## Write And Inspect User Events

Predictions are better when you keep writing real user behavior back to the event store. The reference docs also note that the inline `user_event` you send to `predict()` is not written to the event logs, so you still need a separate `write_user_event()` call for logging and training data.

```python
from google.cloud import recommendationengine_v1beta1

logged_event = recommendationengine_v1beta1.UserEvent(
    event_type="home-page-view",
    user_info=recommendationengine_v1beta1.UserInfo(
        visitor_id="visitor-123"
    ),
)

written = user_event_client.write_user_event(
    parent=event_store_name,
    user_event=logged_event,
)

print(written.event_type)
```

To inspect what was recorded:

```python
pager = user_event_client.list_user_events(parent=event_store_name)

for event in pager:
    print(event.event_type)
```

For historical backfills, use `import_user_events()`. The official docs say existing events are skipped and the method is intended for backfilling old data, not normal real-time logging.

## Endpoint And Client Options

The generated client docs repeatedly warn that you may need to specify a regional endpoint when creating the client. When Google tells you to do that for your deployment, pass it through `ClientOptions`.

```python
from google.api_core.client_options import ClientOptions
from google.cloud import recommendationengine_v1beta1

client = recommendationengine_v1beta1.PredictionServiceClient(
    client_options=ClientOptions(api_endpoint="YOUR_ENDPOINT")
)
```

The same client docs also note:

- `api_endpoint` overrides the default endpoint
- `universe_domain` can override the default `googleapis.com` universe
- `universe_domain` is not supported for mTLS

## Common Pitfalls

- Do not call `collect_user_event()` from normal server code. The reference docs say it exists only for the Recommendations AI JavaScript pixel.
- Do not assume `predict()` logs behavior. It does not; log a separate user event if you want the interaction stored.
- Keep using resource helper methods for catalog, event store, and placement names. Most `NOT_FOUND` and `INVALID_ARGUMENT` failures are path mistakes.
- `CatalogItem.category_hierarchies` is required. A title and ID alone are not enough.
- `import_catalog_items()` is not a patch API. The docs explicitly say partial updates are not supported there; use `update_catalog_item()` when you need patch-style changes.
- Treat the pager return types as lazy iterators. Extra RPCs happen as you iterate.
- If you share transports across clients, do not casually wrap one client in `with ...:` and then reuse the others. The generated docs warn that exiting the context manager closes the transport.

## Version-Sensitive Notes

- PyPI currently lists `google-cloud-recommendations-ai 0.12.0`, released on January 15, 2026.
- The hosted Python docs are in a mixed rollout state:
  - `PredictionServiceClient` renders as `0.12.0`
  - `CatalogServiceClient` renders as `0.11.0`
  - `UserEventServiceClient` renders as `0.11.0`
  - the hosted changelog still stops at `0.11.0`
- When the installed package and hosted reference disagree, use PyPI for the package version you pin and the class reference pages for the request and response shapes you are actually calling.

## Official Sources

- Python client library overview: `https://cloud.google.com/python/docs/reference/recommendationengine/latest`
- Package README in `google-cloud-python`: `https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-recommendations-ai`
- PyPI package page: `https://pypi.org/project/google-cloud-recommendations-ai/`
- Google Cloud auth for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- `CatalogServiceClient` reference: `https://cloud.google.com/python/docs/reference/recommendationengine/latest/google.cloud.recommendationengine_v1beta1.services.catalog_service.CatalogServiceClient`
- `CatalogItem` reference: `https://cloud.google.com/python/docs/reference/recommendationengine/latest/google.cloud.recommendationengine_v1beta1.types.CatalogItem`
- `PredictionServiceClient` reference: `https://cloud.google.com/python/docs/reference/recommendationengine/latest/google.cloud.recommendationengine_v1beta1.services.prediction_service.PredictionServiceClient`
- `UserEventServiceClient` reference: `https://cloud.google.com/python/docs/reference/recommendationengine/latest/google.cloud.recommendationengine_v1beta1.services.user_event_service.UserEventServiceClient`
- `UserEvent` reference: `https://cloud.google.com/python/docs/reference/recommendationengine/latest/google.cloud.recommendationengine_v1beta1.types.UserEvent`
- Hosted changelog: `https://cloud.google.com/python/docs/reference/recommendationengine/latest/changelog`
