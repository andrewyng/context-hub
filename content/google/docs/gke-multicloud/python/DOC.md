---
name: gke-multicloud
description: "Google Cloud GKE Multi-Cloud Python client for attached clusters and legacy AWS or Azure control-plane workflows with ADC, regional endpoints, token generation, and deprecation notes"
metadata:
  languages: "python"
  versions: "0.8.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gke,multicloud,anthos,kubernetes,attached-clusters,aws,azure,adc"
---

# google-cloud-gke-multicloud Python Package Guide

## What This Package Is

`google-cloud-gke-multicloud` is the official Google Cloud Python client for the GKE Multi-Cloud control-plane API.

Use it when Python code needs to:

- manage GKE attached clusters from Google Cloud
- read cluster metadata from the Multi-Cloud API
- generate short-lived access tokens for managed clusters
- import an existing Fleet membership as an attached-cluster resource

Do not use this package to manage Kubernetes objects like Deployments, Services, or Pods. Use `kubectl` or the Kubernetes Python client against the cluster API after you obtain cluster access.

## Version Note

This guide covers package version `0.8.0`, which PyPI lists as the current release as of `2026-03-13`.

The upstream docs are slightly inconsistent right now:

- PyPI lists `0.8.0`, uploaded on `2026-01-15`
- the reference overview page under `latest` exposes `0.8.0`
- many generated service and type pages under `latest` still render as `0.7.0`
- the published changelog page currently stops at `0.7.0`

Practical implication:

- the import path and client surface below are current for the `google.cloud.gke_multicloud_v1` package
- if you depend on a field added very recently, verify it against the installed wheel, not only the rolling docs pages

## Install

Install the package:

```bash
python -m pip install "google-cloud-gke-multicloud==0.8.0"
```

PyPI currently declares `Requires: Python >=3.7`.

## Required Setup

The package quickstart and product docs require the usual Google Cloud setup:

1. Create or select a Google Cloud project.
2. Enable billing.
3. Enable the GKE Multi-Cloud API and related services.
4. Configure Application Default Credentials.

Common environment variables:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-west1"

# Optional when you are not using local ADC or an attached service account.
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Enable the APIs that the AWS, Azure, and attached-cluster setup docs all call out:

```bash
gcloud services enable gkemulticloud.googleapis.com
gcloud services enable gkeconnect.googleapis.com
gcloud services enable gkehub.googleapis.com
gcloud services enable connectgateway.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable anthos.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable opsconfigmonitoring.googleapis.com
gcloud services enable kubernetesmetadata.googleapis.com
```

For local development, set up ADC with your user account:

```bash
gcloud auth application-default login
```

If you must use a service account key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Google’s ADC docs explicitly recommend user ADC or service account impersonation before long-lived key files.

## Regional Endpoints And Client Creation

This API is regional. The generated Python samples say the clients may require regional endpoints, and in practice you should set `client_options.api_endpoint` explicitly to the Google Cloud administrative region you are using.

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
LOCATION = os.environ["GOOGLE_CLOUD_LOCATION"]  # example: us-west1

client_options = ClientOptions(
    api_endpoint=f"{LOCATION}-gkemulticloud.googleapis.com"
)

attached_client = gke_multicloud_v1.AttachedClustersClient(
    client_options=client_options
)
aws_client = gke_multicloud_v1.AwsClustersClient(
    client_options=client_options
)
azure_client = gke_multicloud_v1.AzureClustersClient(
    client_options=client_options
)
```

Explicit credential file instead of ambient ADC:

```python
from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

client = gke_multicloud_v1.AttachedClustersClient.from_service_account_file(
    "/absolute/path/service-account.json",
    client_options=ClientOptions(api_endpoint="us-west1-gkemulticloud.googleapis.com"),
)
```

## Resource Names

The client expects fully qualified resource names.

Use these patterns:

- location: `projects/{project_id}/locations/{location}`
- attached cluster: `projects/{project_id}/locations/{location}/attachedClusters/{cluster_id}`
- attached server config: `projects/{project_id}/locations/{location}/attachedServerConfig`
- AWS cluster: `projects/{project_id}/locations/{location}/awsClusters/{cluster_id}`
- AWS server config: `projects/{project_id}/locations/{location}/awsServerConfig`
- Azure cluster: `projects/{project_id}/locations/{location}/azureClusters/{cluster_id}`
- Azure client: `projects/{project_id}/locations/{location}/azureClients/{client_id}`
- Azure server config: `projects/{project_id}/locations/{location}/azureServerConfig`
- Fleet membership to import: `projects/{project_id}/locations/{location}/memberships/{membership_id}`

The `location` here is the Google Cloud administrative region for the API, not the Kubernetes cluster’s own zone.

## Attached Clusters: Current Path

For new automation, use the attached-cluster surface. The product docs for GKE on AWS and GKE on Azure are already in maintenance mode and both products will no longer be supported on `March 17, 2027`.

### Get supported attached-cluster platform versions

Use `get_attached_server_config` before hard-coding a `platform_version`:

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]

client = gke_multicloud_v1.AttachedClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

name = f"projects/{project_id}/locations/{location}/attachedServerConfig"
config = client.get_attached_server_config(name=name)

for version in config.valid_versions:
    if getattr(version, "enabled", False):
        print(version.version)
```

### List attached clusters in one location

`list_attached_clusters` returns a pager:

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]

client = gke_multicloud_v1.AttachedClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

parent = f"projects/{project_id}/locations/{location}"

for cluster in client.list_attached_clusters(parent=parent):
    print(cluster.name)
    print(cluster.platform_version)
    print(cluster.distribution)
    print(cluster.state)
```

### Get one attached cluster

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
cluster_id = "example-attached-cluster"

client = gke_multicloud_v1.AttachedClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

name = f"projects/{project_id}/locations/{location}/attachedClusters/{cluster_id}"
cluster = client.get_attached_cluster(name=name)

print(cluster.name)
print(cluster.kubernetes_version)
print(cluster.fleet.membership)
```

### Generate the install manifest for a cluster you want to attach

This returns the YAML manifest you apply to the target cluster.

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
attached_cluster_id = "my-existing-cluster"
platform_version = "1.32.0-gke.1000"

client = gke_multicloud_v1.AttachedClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

request = gke_multicloud_v1.GenerateAttachedClusterInstallManifestRequest(
    parent=f"projects/{project_id}/locations/{location}",
    attached_cluster_id=attached_cluster_id,
    platform_version=platform_version,
)

response = client.generate_attached_cluster_install_manifest(request=request)
print(response.manifest)
```

Important detail from the REST docs:

- when you are generating a manifest for importing an existing membership, `attached_cluster_id` must be the membership id

### Import an existing Fleet membership as an attached cluster

`import_attached_cluster` is a long-running operation. Wait for `operation.result()`.

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
membership_id = "my-existing-cluster"
platform_version = "1.32.0-gke.1000"

client = gke_multicloud_v1.AttachedClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

request = gke_multicloud_v1.ImportAttachedClusterRequest(
    parent=f"projects/{project_id}/locations/{location}",
    fleet_membership=(
        f"projects/{project_id}/locations/{location}/memberships/{membership_id}"
    ),
    platform_version=platform_version,
    distribution="generic",  # one of: generic, eks, aks
)

operation = client.import_attached_cluster(request=request)
cluster = operation.result()

print(cluster.name)
```

If you want the API to check the request without importing the cluster yet, set `validate_only=True` on the same request first.

### Generate an attached-cluster agent token

This is the advanced flow for cluster agents, not normal human access to the Kubernetes API.

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
cluster_id = "example-attached-cluster"

client = gke_multicloud_v1.AttachedClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

request = gke_multicloud_v1.GenerateAttachedClusterAgentTokenRequest(
    attached_cluster=(
        f"projects/{project_id}/locations/{location}/attachedClusters/{cluster_id}"
    ),
    subject_token="external-subject-token",
    subject_token_type="urn:ietf:params:oauth:token-type:jwt",
    version="1",
)

response = client.generate_attached_cluster_agent_token(request=request)

print(response.access_token)
print(response.expires_in)
print(response.token_type)
```

## Legacy AWS And Azure Surfaces

The library still exposes AWS and Azure clients, but Google’s product docs say both GKE on AWS and GKE on Azure are already in maintenance mode and will no longer be supported on `March 17, 2027`.

Use these surfaces for existing environments you still operate today, not for new long-term platform work.

The REST reference also marks `getAwsServerConfig` and `getAzureServerConfig` as deprecated.

### Inspect supported AWS versions and regions

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]

client = gke_multicloud_v1.AwsClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

name = f"projects/{project_id}/locations/{location}/awsServerConfig"
config = client.get_aws_server_config(name=name)

print(config.supported_aws_regions)
for version in config.valid_versions:
    if getattr(version, "enabled", False):
        print(version.version)
```

### List and read AWS clusters

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
cluster_id = "legacy-aws-cluster"

client = gke_multicloud_v1.AwsClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

parent = f"projects/{project_id}/locations/{location}"
for cluster in client.list_aws_clusters(parent=parent):
    print(cluster.name)

name = f"projects/{project_id}/locations/{location}/awsClusters/{cluster_id}"
cluster = client.get_aws_cluster(name=name)
print(cluster.aws_region)
print(cluster.endpoint)
```

### Generate a Kubernetes API token for an AWS cluster

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
cluster_id = "legacy-aws-cluster"

client = gke_multicloud_v1.AwsClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

request = gke_multicloud_v1.GenerateAwsAccessTokenRequest(
    aws_cluster=f"projects/{project_id}/locations/{location}/awsClusters/{cluster_id}"
)

response = client.generate_aws_access_token(request=request)
print(response.access_token)
print(response.expiration_time)
```

### Inspect supported Azure versions and regions

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]

client = gke_multicloud_v1.AzureClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

name = f"projects/{project_id}/locations/{location}/azureServerConfig"
config = client.get_azure_server_config(name=name)

print(config.supported_azure_regions)
for version in config.valid_versions:
    if getattr(version, "enabled", False):
        print(version.version)
```

### List Azure clients and clusters

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]

client = gke_multicloud_v1.AzureClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

parent = f"projects/{project_id}/locations/{location}"

for azure_client in client.list_azure_clients(parent=parent):
    print(azure_client.name)

for cluster in client.list_azure_clusters(parent=parent):
    print(cluster.name)
```

### Generate a Kubernetes API token for an Azure cluster

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import gke_multicloud_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
cluster_id = "legacy-azure-cluster"

client = gke_multicloud_v1.AzureClustersClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-gkemulticloud.googleapis.com"
    )
)

request = gke_multicloud_v1.GenerateAzureAccessTokenRequest(
    azure_cluster=(
        f"projects/{project_id}/locations/{location}/azureClusters/{cluster_id}"
    )
)

response = client.generate_azure_access_token(request=request)
print(response.access_token)
print(response.expiration_time)
```

## Common Pitfalls

- Do not omit `client_options.api_endpoint`. This API is regional and the generated samples explicitly warn that regional endpoints may be required.
- Do not confuse the Google Cloud administrative `location` with the cluster’s cloud-provider region or zone.
- Do not manage Kubernetes workloads through this package. Its job is the Google control plane, not the Kubernetes resource API.
- Do not hard-code `platform_version` or Kubernetes versions without reading the matching server-config resource first.
- Do not assume AWS or Azure methods are a safe foundation for new platform work. Google has already put both products in maintenance mode and scheduled shutdown for `March 17, 2027`.
- Prefer ADC or service account impersonation over long-lived key files.
- Avoid older examples that pass `credentials_file=` into generated clients. The upstream changelog notes that argument was deprecated.

## Version-Sensitive Notes

- The `0.7.0` changelog marks the GKE-on-AWS and GKE-on-Azure protos as deprecated to discourage new usage as those services turn down.
- The product docs state that both GKE on AWS and GKE on Azure will no longer be supported on `March 17, 2027`, and recommend migrating to GKE or another Kubernetes distribution. For continued Google Cloud integration, the deprecation pages explicitly point users to GKE attached clusters.
- The Multi-Cloud reference docs are generated from the API surface and may lag the latest wheel on PyPI. Keep your installed package version authoritative when you debug field-level differences.

## Official Sources

- Docs overview: `https://docs.cloud.google.com/python/docs/reference/gkemulticloud/latest`
- AttachedClustersClient reference: `https://docs.cloud.google.com/python/docs/reference/gkemulticloud/latest/google.cloud.gke_multicloud_v1.services.attached_clusters.AttachedClustersClient`
- Package classes summary: `https://docs.cloud.google.com/python/docs/reference/gkemulticloud/latest/summary_class`
- Changelog: `https://docs.cloud.google.com/python/docs/reference/gkemulticloud/latest/changelog`
- PyPI: `https://pypi.org/project/google-cloud-gke-multicloud/`
- ADC overview: `https://docs.cloud.google.com/docs/authentication/provide-credentials-adc`
- ADC local development: `https://docs.cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- GKE on AWS setup: `https://docs.cloud.google.com/kubernetes-engine/multi-cloud/docs/aws/how-to/configure-cloud-sdk`
- GKE on Azure setup: `https://docs.cloud.google.com/kubernetes-engine/multi-cloud/docs/azure/how-to/configure-cloud-sdk`
- Attached cluster prerequisites: `https://cloud.google.com/kubernetes-engine/multi-cloud/docs/attached/generic/reference/cluster-prerequisites`
- Attached server config REST reference: `https://cloud.google.com/kubernetes-engine/multi-cloud/docs/reference/rest/v1/projects.locations/getAttachedServerConfig`
- Generate attached install manifest REST reference: `https://cloud.google.com/kubernetes-engine/multi-cloud/docs/reference/rest/v1/projects.locations/generateAttachedClusterInstallManifest`
- Import attached cluster REST reference: `https://cloud.google.com/kubernetes-engine/multi-cloud/docs/reference/rest/v1/projects.locations.attachedClusters/import`
- Generate attached cluster agent token REST reference: `https://cloud.google.com/kubernetes-engine/multi-cloud/docs/reference/rest/v1/projects.locations.attachedClusters/generateAttachedClusterAgentToken`
- AWS clusters REST reference: `https://cloud.google.com/kubernetes-engine/multi-cloud/docs/reference/rest/v1/projects.locations.awsClusters`
- Generate AWS access token REST reference: `https://docs.cloud.google.com/kubernetes-engine/multi-cloud/docs/reference/rest/v1/projects.locations.awsClusters/generateAwsAccessToken`
- Get AWS server config REST reference: `https://cloud.google.com/kubernetes-engine/multi-cloud/docs/reference/rest/v1/projects.locations/getAwsServerConfig`
- Generate Azure access token REST reference: `https://cloud.google.com/kubernetes-engine/multi-cloud/docs/reference/rest/v1/projects.locations.azureClusters/generateAzureAccessToken`
- Get Azure server config REST reference: `https://docs.cloud.google.com/kubernetes-engine/multi-cloud/docs/reference/rest/v1/projects.locations/getAzureServerConfig`
- GKE on AWS deprecation announcement: `https://docs.cloud.google.com/kubernetes-engine/multi-cloud/docs/aws/deprecations/deprecation-announcement`
- GKE on Azure deprecation announcement: `https://docs.cloud.google.com/kubernetes-engine/multi-cloud/docs/azure/deprecations/deprecation-announcement`
