---
name: config-connector
description: "Google Config Connector guide for Python teams using GKE, Workload Identity, Config Connector CRDs, and GKE add-on automation"
metadata:
  languages: "python"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,config-connector,gke,kubernetes,python,infrastructure"
---

# Config Connector Guide For Python Teams

## What This Is

Config Connector is a Kubernetes add-on for managing Google Cloud resources through Kubernetes custom resources.

Important inference from Google's current public docs: treat `google-cloud-config-connector` as product packaging metadata, not as a normal Python application SDK with resource clients. The documented interfaces are:

- the Config Connector operator and CRDs
- `kubectl` and Kubernetes manifests
- the GKE Cluster Manager API surface for enabling the Config Connector add-on

If you are writing Python automation, the practical split is:

- use `google-cloud-container` to inspect or enable the GKE add-on from Python
- use Config Connector YAML manifests for the actual Google Cloud resources you want to manage

## Version Note

The current Google documentation for Config Connector is a rolling "latest" product doc set, not a version-pinned Python API reference. The upstream source repository currently shows much newer releases than `1.0.0`, so do not assume the live docs describe the exact behavior of an old package pin. If your environment needs reproducibility, pin the Config Connector release bundle you install on the cluster.

## Authentication And Environment

Config Connector on GKE should use Workload Identity Federation for GKE. For Python code that talks to the GKE API, use Application Default Credentials (ADC).

Local development with user ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GKE_LOCATION="us-central1"
export GKE_CLUSTER="my-cluster"
```

Service account credential file fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GKE_LOCATION="us-central1"
export GKE_CLUSTER="my-cluster"
```

ADC looks for credentials in this order:

1. `GOOGLE_APPLICATION_CREDENTIALS`
2. credentials created by `gcloud auth application-default login`
3. the attached service account from the metadata server

## Enable The GKE Add-On From Python

If you want Python code to inspect or enable the Config Connector add-on on an existing GKE Standard cluster, use `google-cloud-container`.

Install the client library:

```bash
python -m pip install google-cloud-container
```

Inspect the cluster and current add-on state:

```python
import os

from google.cloud import container_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GKE_LOCATION"]
cluster_id = os.environ["GKE_CLUSTER"]

client = container_v1.ClusterManagerClient()
name = f"projects/{project_id}/locations/{location}/clusters/{cluster_id}"

cluster = client.get_cluster(name=name)
print(cluster.name)
print(cluster.addons_config.config_connector_config.enabled)
```

Enable the add-on:

```python
import os

from google.cloud import container_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GKE_LOCATION"]
cluster_id = os.environ["GKE_CLUSTER"]

client = container_v1.ClusterManagerClient()
name = f"projects/{project_id}/locations/{location}/clusters/{cluster_id}"

operation = client.set_addons_config(
    name=name,
    addons_config=container_v1.AddonsConfig(
        config_connector_config=container_v1.ConfigConnectorConfig(
            enabled=True,
        ),
    ),
)

print(operation.name)
```

Use this only for the GKE add-on. Google's product docs still describe actual Config Connector resource management through YAML and `kubectl`, not through a Python resource client.

## Recommended Installation Path

For most use cases, Google recommends manual installation in namespaced mode. It is more scalable than cluster mode and provides better permission isolation. The GKE add-on is only available on GKE Standard clusters and is often behind the latest Config Connector version by up to 12 months or more.

Minimum cluster prerequisites from the installation docs:

- a GKE cluster where Config Connector is not already installed
- Workload Identity enabled
- Kubernetes Engine Monitoring enabled
- `kubectl` configured for the cluster

Example setup:

```bash
export PROJECT_ID="your-project-id"
export CLUSTER_NAME="your-cluster"
export LOCATION="us-central1"
export NAMESPACE="config-connector"
export NAMESPACE_GSA="config-connector"

gcloud container clusters get-credentials "$CLUSTER_NAME" \
  --location "$LOCATION" \
  --project "$PROJECT_ID"

gcloud storage cp gs://configconnector-operator/latest/release-bundle.tar.gz release-bundle.tar.gz
tar zxvf release-bundle.tar.gz
kubectl apply -f operator-system/configconnector-operator.yaml
```

Create the operator configuration in namespaced mode:

```yaml
# configconnector.yaml
apiVersion: core.cnrm.cloud.google.com/v1beta1
kind: ConfigConnector
metadata:
  name: configconnector.core.cnrm.cloud.google.com
spec:
  mode: namespaced
  stateIntoSpec: Absent
```

```bash
kubectl apply -f configconnector.yaml
```

Create a namespace-specific IAM identity and bind it to Config Connector:

```bash
kubectl create namespace "$NAMESPACE"

gcloud iam service-accounts create "$NAMESPACE_GSA" --project "$PROJECT_ID"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${NAMESPACE_GSA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/editor"

gcloud iam service-accounts add-iam-policy-binding \
  "${NAMESPACE_GSA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --member="serviceAccount:${PROJECT_ID}.svc.id.goog[cnrm-system/cnrm-controller-manager-${NAMESPACE}]" \
  --role="roles/iam.workloadIdentityUser"
```

For real deployments, replace the broad `roles/editor` example with the narrow roles your managed resources actually require.

Create the namespace context that tells Config Connector which Google service account to use:

```yaml
# configconnectorcontext.yaml
apiVersion: core.cnrm.cloud.google.com/v1beta1
kind: ConfigConnectorContext
metadata:
  name: configconnectorcontext.core.cnrm.cloud.google.com
  namespace: config-connector
spec:
  googleServiceAccount: "config-connector@your-project-id.iam.gserviceaccount.com"
  stateIntoSpec: Absent
```

```bash
kubectl apply -f configconnectorcontext.yaml
kubectl wait -n cnrm-system \
  --for=condition=Ready pod \
  -l cnrm.cloud.google.com/component=cnrm-controller-manager \
  -l cnrm.cloud.google.com/scoped-namespace="$NAMESPACE"
```

## Choose Where Resources Are Created

Config Connector can determine the target project from annotations on the Kubernetes namespace. The namespace annotation is used only when the resource itself does not already specify where it should be created.

Project-scoped namespace:

```bash
kubectl annotate namespace "$NAMESPACE" \
  cnrm.cloud.google.com/project-id="$PROJECT_ID"

kubectl config set-context --current --namespace "$NAMESPACE"
```

If you need deterministic behavior in shared clusters, prefer setting the project both on the namespace and explicitly in the resource when the resource kind supports it.

## Core Workflow

### Enable a Google API

```yaml
# enable-pubsub.yaml
apiVersion: serviceusage.cnrm.cloud.google.com/v1beta1
kind: Service
metadata:
  name: pubsub.googleapis.com
spec:
  projectRef:
    external: projects/your-project-id
```

```bash
kubectl apply -f enable-pubsub.yaml
```

### Create a resource

```yaml
# pubsub-topic.yaml
apiVersion: pubsub.cnrm.cloud.google.com/v1beta1
kind: PubSubTopic
metadata:
  annotations:
    cnrm.cloud.google.com/project-id: your-project-id
  labels:
    environment: dev
  name: example-topic
```

```bash
kubectl apply -f pubsub-topic.yaml
kubectl wait --for=condition=READY pubsubtopics example-topic
kubectl describe pubsubtopics example-topic
```

### Update a resource

Edit the manifest and run `kubectl apply -f pubsub-topic.yaml` again. Config Connector reconciles the live Google Cloud resource toward the new desired state.

### Acquire an existing resource with `resourceID`

Use `resourceID` when the Kubernetes object name should differ from the Google Cloud resource ID, or when you need to acquire an existing resource. The field is optional but immutable after apply.

```yaml
apiVersion: pubsub.cnrm.cloud.google.com/v1beta1
kind: PubSubTopic
metadata:
  name: pubsub-topic-sample
spec:
  resourceID: pubsub-topic-id
```

### Keep a cloud resource when deleting the Kubernetes object

By default, deleting a Config Connector resource deletes the corresponding Google Cloud resource too. Use `cnrm.cloud.google.com/deletion-policy: "abandon"` when you want Kubernetes to stop managing the resource but keep the cloud object.

```yaml
metadata:
  annotations:
    cnrm.cloud.google.com/deletion-policy: "abandon"
```

## Secrets

Config Connector can read Kubernetes Secrets for sensitive fields such as passwords and access keys. Keep the Secret in the same namespace as the resource that references it.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: secret-1
stringData:
  password: change-me
```

Apply the Secret before applying the resource that references it:

```bash
kubectl apply -f example-secret.yaml
```

If the referenced Secret does not exist, Config Connector emits `DependencyNotFound` or `DependencyInvalid` events.

## Common Pitfalls

- Do not look for a normal Python resource client in this package. The supported day-to-day interface is CRDs plus `kubectl`.
- Prefer manual namespaced installation for new deployments unless you explicitly want the GKE add-on trade-offs.
- Do not use the GKE add-on on Autopilot; Google documents it as GKE Standard only.
- The GKE add-on can lag the latest Config Connector release significantly. If you need newer CRDs or tighter version control, install manually.
- `resourceID` is immutable after apply. Choose it deliberately.
- Namespace annotations affect default project selection. Be explicit when project targeting must never drift.
- By default, deleting the Kubernetes object deletes the Google Cloud resource. Use `deletion-policy: "abandon"` when that is not what you want.
- Some resources have extra annotations beyond the generic ones. Check the reference page for the specific resource kind before relying on deletion or cleanup behavior.
- If a resource references a Secret, keep that Secret in the same namespace.

## Official Sources

- Config Connector overview: `https://docs.cloud.google.com/config-connector/docs/overview`
- Choosing an installation type: `https://docs.cloud.google.com/config-connector/docs/concepts/installation-types`
- Manual installation: `https://docs.cloud.google.com/config-connector/docs/how-to/install-manually`
- Getting started: `https://docs.cloud.google.com/config-connector/docs/how-to/getting-started`
- Namespaces and Google Cloud projects: `https://docs.cloud.google.com/config-connector/docs/concepts/namespaces-and-projects`
- `resourceID` behavior: `https://docs.cloud.google.com/config-connector/docs/how-to/managing-resources-with-resource-ids`
- Secrets: `https://docs.cloud.google.com/config-connector/docs/how-to/secrets`
- Annotations: `https://docs.cloud.google.com/config-connector/docs/reference/annotations`
- GKE Python client docs: `https://docs.cloud.google.com/python/docs/reference/container/latest`
- `ClusterManagerClient.get_cluster`: `https://docs.cloud.google.com/python/docs/reference/container/latest/google.cloud.container_v1.services.cluster_manager.ClusterManagerClient`
- `ClusterManagerClient.set_addons_config`: `https://docs.cloud.google.com/python/docs/reference/container/latest/google.cloud.container_v1.services.cluster_manager.ClusterManagerClient`
- `ConfigConnectorConfig`: `https://docs.cloud.google.com/python/docs/reference/container/latest/google.cloud.container_v1.types.ConfigConnectorConfig`
- ADC overview: `https://docs.cloud.google.com/docs/authentication/application-default-credentials`
- Source repository: `https://github.com/GoogleCloudPlatform/k8s-config-connector`
