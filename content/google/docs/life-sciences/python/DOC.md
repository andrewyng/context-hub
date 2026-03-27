---
name: life-sciences
description: "Google Cloud Life Sciences Python client for legacy pipeline submission and operation inspection"
metadata:
  languages: "python"
  versions: "0.11.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,life-sciences,genomics,pipelines,batch,migration"
---

# Google Cloud Life Sciences Python Client

## Golden Rule

Use `google-cloud-life-sciences` with `from google.cloud import lifesciences_v2beta` only for existing codebases that still reference Cloud Life Sciences. Google deprecated Cloud Life Sciences on July 17, 2023 and shut the service down on July 8, 2025. For new workflow execution, Google directs users to Cloud Batch instead.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-life-sciences==0.11.0"
```

Common alternatives:

```bash
uv add "google-cloud-life-sciences==0.11.0"
poetry add "google-cloud-life-sciences==0.11.0"
```

The package name and import path differ:

```python
from google.cloud import lifesciences_v2beta
```

## Authentication And Setup

Use Application Default Credentials (ADC) unless you already have an explicit `google.auth.credentials.Credentials` object.

Local development:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

Service account key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Minimal client setup:

```python
from google.cloud import lifesciences_v2beta

client = lifesciences_v2beta.WorkflowsServiceV2BetaClient()
```

Important setup details from the official docs:

- Cloud Life Sciences required billing on the target Google Cloud project.
- Running a pipeline required permission to call the workflow API and permission to act as the VM service account used by the pipeline.
- The Python client follows normal Google client behavior for endpoint overrides through `client_options.api_endpoint` and for credential injection through the `credentials=` argument.

## Core Workflow

### List available metadata locations

The `parent` on Life Sciences requests is a metadata location such as `projects/PROJECT_ID/locations/us-central1`. It is separate from the Compute Engine region or zone where VMs run.

```python
from google.cloud import lifesciences_v2beta

project_id = "YOUR_PROJECT_ID"
client = lifesciences_v2beta.WorkflowsServiceV2BetaClient()

for location in client.list_locations(
    request={"name": f"projects/{project_id}"}
):
    print(location.location_id, location.name)
```

Use this when you are reading legacy configs and need to confirm which Life Sciences locations a project used.

### Build and submit a legacy pipeline request

This is the core API surface of the package: `run_pipeline()` on `WorkflowsServiceV2BetaClient`.

```python
from google.cloud import lifesciences_v2beta

project_id = "YOUR_PROJECT_ID"
metadata_location = "us-central1"
vm_region = "us-central1"
service_account_email = "pipeline-runner@YOUR_PROJECT_ID.iam.gserviceaccount.com"

client = lifesciences_v2beta.WorkflowsServiceV2BetaClient()

request = lifesciences_v2beta.RunPipelineRequest(
    parent=f"projects/{project_id}/locations/{metadata_location}",
    pipeline=lifesciences_v2beta.Pipeline(
        actions=[
            lifesciences_v2beta.Action(
                image_uri="bash",
                commands=["-c", "echo hello from Cloud Life Sciences"],
            )
        ],
        resources=lifesciences_v2beta.Resources(
            regions=[vm_region],
            virtual_machine=lifesciences_v2beta.VirtualMachine(
                machine_type="e2-standard-4",
                boot_disk_size_gb=30,
                service_account=lifesciences_v2beta.ServiceAccount(
                    email=service_account_email,
                ),
            ),
        ),
    ),
    labels={"env": "legacy"},
)

operation = client.run_pipeline(request=request)

# Cloud Life Sciences returned a long-running operation.
operation.result(timeout=3600)
```

Practical notes:

- `parent` identifies the Life Sciences metadata location, not the VM placement.
- VM placement lives under `pipeline.resources.regions` or `pipeline.resources.zones`.
- `run_pipeline()` returns a long-running operation, not a completed pipeline result payload.

### Inspect or list operations

If you already have an operation resource name from logs or an existing system, use the operations helpers on the same client.

```python
from google.cloud import lifesciences_v2beta

project_id = "YOUR_PROJECT_ID"
metadata_location = "us-central1"
operation_name = (
    "projects/YOUR_PROJECT_ID/locations/us-central1/operations/OPERATION_ID"
)

client = lifesciences_v2beta.WorkflowsServiceV2BetaClient()

operation = client.get_operation(request={"name": operation_name})
print("done:", operation.done)

for item in client.list_operations(
    request={
        "name": f"projects/{project_id}/locations/{metadata_location}",
        "filter": "done = false",
    }
):
    print(item.name, item.done)
```

### Cancel an in-flight operation

```python
from google.cloud import lifesciences_v2beta

operation_name = (
    "projects/YOUR_PROJECT_ID/locations/us-central1/operations/OPERATION_ID"
)

client = lifesciences_v2beta.WorkflowsServiceV2BetaClient()
client.cancel_operation(request={"name": operation_name})
```

Cancellation is best-effort. Check the operation state afterward instead of assuming the pipeline stopped immediately.

## Logging

The generated library supports structured SDK logging through the standard Google client logging scope environment variable:

```bash
export GOOGLE_SDK_PYTHON_LOGGING_SCOPE=google
```

Use this for client-level request and retry diagnostics while you are untangling legacy integrations.

## Common Pitfalls

- Install `google-cloud-life-sciences`, but import `lifesciences_v2beta`.
- Do not plan new production workflows on this package. Google says Cloud Life Sciences became unavailable on July 8, 2025.
- `parent` and `pipeline.resources.regions` or `zones` are different concepts. The first is a Life Sciences control-plane location; the second controls where compute runs.
- The troubleshooting guide calls out both workflow-runner access and `iam.serviceAccounts.actAs` style permission on the VM service account.
- `run_pipeline()` is asynchronous. If you only create the operation and never inspect it, you do not know whether the pipeline actually succeeded.
- Older examples may still pass `credentials_file=` to the client constructor. The `0.10.0` changelog deprecates that argument; use ADC or pass a `Credentials` object with `credentials=...` instead.
- The generated client warns against using the client as a context manager when the transport is shared elsewhere, because exiting the context closes the transport.

## Version-Sensitive Notes For 0.11.0

- PyPI shows `0.11.0` as the current package release covered here.
- The `0.11.0` changelog adds Python 3.14 support and drops Python 3.8 support.
- The `0.11.0` changelog also notes auto-enabled mTLS support. If endpoint selection changes unexpectedly, check `GOOGLE_API_USE_MTLS_ENDPOINT`, `GOOGLE_API_USE_CLIENT_CERTIFICATE`, and any explicit `client_options.api_endpoint` override.
- The package is still marked beta on PyPI, so treat old blog posts and pre-shutdown examples as historical references, not current platform guidance.

## Migration Direction

Google's migration guide says to move Cloud Life Sciences workloads to Cloud Batch. The main conceptual mapping is:

- Life Sciences pipeline submission maps to Batch job creation.
- Life Sciences actions map to Batch runnables.
- Life Sciences VM resource settings map to Batch allocation policy and task compute resources.
- Existing workflow engines such as Cromwell, dsub, Nextflow, and Snakemake have product-specific migration guidance in the official Batch migration docs.

If you are writing new code, start with `google-cloud-batch` instead of this package.

## Official Sources

- PyPI package page: https://pypi.org/project/google-cloud-life-sciences/
- Python reference root: https://docs.cloud.google.com/python/docs/reference/lifesciences/latest
- `WorkflowsServiceV2BetaClient` reference: https://docs.cloud.google.com/python/docs/reference/lifesciences/latest/google.cloud.lifesciences_v2beta.services.workflows_service_v2_beta.WorkflowsServiceV2BetaClient
- Python client changelog: https://docs.cloud.google.com/python/docs/reference/lifesciences/latest/changelog
- Cloud Life Sciences release notes: https://cloud.google.com/life-sciences/docs/release-notes
- Cloud Life Sciences locations: https://cloud.google.com/life-sciences/docs/locations
- Troubleshooting guide: https://cloud.google.com/life-sciences/docs/troubleshooting
- Migration guide to Cloud Batch: https://cloud.google.com/batch/docs/migrate-to-batch-from-cloud-life-sciences
