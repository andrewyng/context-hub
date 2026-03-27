---
name: automl
description: "Google Cloud AutoML Python client for legacy dataset, training, prediction, and AutoML Tables workflows"
metadata:
  languages: "python"
  versions: "2.18.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,automl,vertex-ai,ml,prediction,python"
---

# Google Cloud AutoML Python Package Guide

## Golden Rule

Use `google-cloud-automl` only for maintaining existing Cloud AutoML integrations. Google now points new AutoML work at Vertex AI and the `google-cloud-aiplatform` package. For code that still depends on this package, use Application Default Credentials (ADC), enable `automl.googleapis.com`, and set a regional AutoML endpoint on every client.

The package exposes two namespaces you will actually use:

- `google.cloud.automl_v1` for datasets, models, operations, and prediction
- `google.cloud.automl_v1beta1` for legacy AutoML Tables helpers such as `TablesClient`

## Install

Pin the package version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "google-cloud-automl==2.18.1"
```

Common alternatives:

```bash
uv add "google-cloud-automl==2.18.1"
poetry add "google-cloud-automl==2.18.1"
```

## Project And Authentication Setup

Enable the AutoML API in the Google Cloud project you will call:

```bash
gcloud services enable automl.googleapis.com
```

For local development, create ADC with the Google Cloud CLI:

```bash
gcloud auth application-default login
```

If you must use a service account key outside Google Cloud, point ADC at the file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Useful environment variables:

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
export AUTOML_DATASET_ID="1234567890123456789"
export AUTOML_MODEL_ID="9876543210987654321"
```

`google-cloud-automl` is regional. The client reference explicitly warns that you may need to specify regional endpoints when creating the service client. Keep the `location`, resource names, and `api_endpoint` aligned.

## Initialize The Clients

Create one shared set of clients near process startup and reuse them:

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import automl_v1
from google.cloud import automl_v1beta1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

client_options = ClientOptions(api_endpoint=f"{LOCATION}-automl.googleapis.com")

automl_client = automl_v1.AutoMlClient(client_options=client_options)
prediction_client = automl_v1.PredictionServiceClient(
    client_options=client_options
)

# Only needed for legacy AutoML Tables workflows.
tables_client = automl_v1beta1.TablesClient(client_options=client_options)

location_path = f"projects/{PROJECT_ID}/locations/{LOCATION}"
dataset_name = (
    f"projects/{PROJECT_ID}/locations/{LOCATION}/datasets/"
    f"{os.environ['AUTOML_DATASET_ID']}"
)
model_name = (
    f"projects/{PROJECT_ID}/locations/{LOCATION}/models/"
    f"{os.environ['AUTOML_MODEL_ID']}"
)
```

## Common Workflows

### List Existing Datasets

Use `filter` only when you want a specific dataset family. Remove it to list everything in the location.

```python
from google.cloud import automl_v1

request = automl_v1.ListDatasetsRequest(
    parent=location_path,
    filter="translation_dataset_metadata:*",
)

for dataset in automl_client.list_datasets(request=request):
    print(dataset.name, dataset.display_name)
```

### Import Training Data From Cloud Storage

The input file format is modality-specific. For example, text classification CSVs and image import CSVs follow different schemas in the product docs.

```python
from google.cloud import automl_v1

gcs_uri = "gs://your-bucket/training.csv"

input_config = automl_v1.InputConfig(
    gcs_source=automl_v1.GcsSource(input_uris=[gcs_uri])
)

operation = automl_client.import_data(
    request=automl_v1.ImportDataRequest(
        name=dataset_name,
        input_config=input_config,
    )
)

operation.result(timeout=1800)
print("Import finished")
```

### Train A Text Classification Model

Model creation is a long-running operation. Keep the returned model name and reuse it for prediction.

```python
from google.cloud import automl_v1

dataset_id = os.environ["AUTOML_DATASET_ID"]

model = automl_v1.Model(
    display_name="support-ticket-router",
    dataset_id=dataset_id,
    text_classification_model_metadata=automl_v1.TextClassificationModelMetadata(),
)

operation = automl_client.create_model(
    request=automl_v1.CreateModelRequest(
        parent=location_path,
        model=model,
    )
)

model = operation.result(timeout=7200)
print(model.name)
```

The metadata field changes by problem type. Do not copy `TextClassificationModelMetadata` into image, video, or translation code paths.

### Run Online Text Prediction

This is the exact request shape for inline text prediction:

```python
from google.cloud import automl_v1

payload = automl_v1.ExamplePayload(
    text_snippet=automl_v1.TextSnippet(
        content="Please cancel my subscription and refund the latest invoice.",
        mime_type="text/plain",
    )
)

response = prediction_client.predict(
    request=automl_v1.PredictRequest(
        name=model_name,
        payload=payload,
    )
)

for annotation in response.payload:
    print(annotation.display_name)
    print(annotation.classification.score)
```

### Run Online Image Prediction

For image classification or object detection, send image bytes inside `ExamplePayload.Image`:

```python
from google.cloud import automl_v1

with open("image.jpg", "rb") as fh:
    image_bytes = fh.read()

payload = automl_v1.ExamplePayload(
    image=automl_v1.Image(image_bytes=image_bytes)
)

response = prediction_client.predict(
    request=automl_v1.PredictRequest(
        name=model_name,
        payload=payload,
    )
)

for annotation in response.payload:
    print(annotation)
```

The structure of each returned annotation depends on the model type. Classification models return scores; detection models also return bounding boxes.

### Use The Legacy AutoML Tables Helper

`TablesClient` is still under `automl_v1beta1`, and the latest reference says `us-central1` is the only supported location for tables helpers.

```python
from google.cloud import automl_v1beta1

table_dataset_name = (
    f"projects/{PROJECT_ID}/locations/us-central1/datasets/"
    f"{os.environ['AUTOML_DATASET_ID']}"
)

request = automl_v1beta1.ListTableSpecsRequest(parent=table_dataset_name)

for table_spec in tables_client.list_table_specs(request=request):
    print(table_spec.name, table_spec.time_column_spec_id)
```

If you are maintaining AutoML Tables code, keep the namespace consistent. Do not mix `automl_v1beta1.TablesClient` requests with `automl_v1` request types in the same call.

## Common Pitfalls

- `gcloud auth login` is not enough for local Python code. Use `gcloud auth application-default login` so ADC resolves correctly.
- The resource location and the client endpoint must match. A `us-central1` dataset with an `eu-automl.googleapis.com` endpoint is a common failure mode.
- Long-running operations are normal for import and training. Always call `.result(...)` or poll the operation instead of assuming the work finished after the initial RPC returns.
- `dataset_name` is a full resource name, while some request bodies use a plain `dataset_id`. Do not swap them.
- The input format for `import_data` is product-specific. Check the product guide for the exact CSV or JSONL shape before uploading files.
- AutoML Tables helpers are still beta-namespace APIs. Keep them in `automl_v1beta1` and default to `us-central1`.
- This package is a legacy surface. Before starting new code, verify that the specific AutoML product you need has not already moved to Vertex AI or reached end-of-support.

## Version-Sensitive Notes For `2.18.1`

- PyPI currently lists `google-cloud-automl 2.18.1` and `Requires: Python >=3.7`.
- The PyPI project description says the AutoML API client library is now available from Vertex AI and recommends the Vertex AI SDK (`google-cloud-aiplatform`) for the new AutoML features.
- On March 13, 2026, the latest generated Python reference root was live, but some individual client pages such as `PredictionServiceClient` and `TablesClient` were still rendered under `2.17.0` URLs. Use PyPI for package-version metadata and the generated client pages for method signatures.
- Google has already shut down several legacy AutoML product families outside Vertex AI, including AutoML Vision, AutoML Video Intelligence, AutoML Tables, and AutoML Natural Language. Check the deprecations page before reviving an older integration.

## Official Sources

- PyPI package page: `https://pypi.org/project/google-cloud-automl/`
- Python reference root: `https://cloud.google.com/python/docs/reference/automl/latest`
- `AutoMlClient` reference: `https://cloud.google.com/python/docs/reference/automl/latest/google.cloud.automl_v1.services.auto_ml.AutoMlClient`
- `PredictionServiceClient` reference: `https://cloud.google.com/python/docs/reference/automl/latest/google.cloud.automl_v1.services.prediction_service.PredictionServiceClient`
- `TablesClient` reference: `https://cloud.google.com/python/docs/reference/automl/latest/google.cloud.automl_v1beta1.services.tables.TablesClient`
- AutoML quickstart setup: `https://cloud.google.com/automl/docs/quickstarts`
- ADC local setup: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- Vertex AI deprecations and shut down page: `https://cloud.google.com/vertex-ai/docs/deprecations`
