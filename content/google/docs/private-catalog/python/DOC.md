---
name: private-catalog
description: "Google Cloud Private Catalog Python client for listing Service Catalog catalogs, products, and versions shared to a project, folder, or organization"
metadata:
  languages: "python"
  versions: "0.11.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,gcp,service-catalog,private-catalog,python,marketplace"
---

# Google Cloud Private Catalog Python Client

## Golden Rule

Use `google-cloud-private-catalog` to browse the Service Catalog content that is visible to a resource context such as a project, folder, or organization.

Install `google-cloud-private-catalog`, import `privatecatalog_v1beta1`, authenticate with Application Default Credentials (ADC), and scope every search to the correct `resource`. This library is the consumer-side browse API. Admin tasks such as creating or sharing catalogs are covered by the Service Catalog product docs, not by this client.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-private-catalog==0.11.0"
```

Common alternatives:

```bash
uv add "google-cloud-private-catalog==0.11.0"
poetry add "google-cloud-private-catalog==0.11.0"
```

PyPI lists Python `>=3.7` for this release line.

## Authentication And Setup

Before you call the API:

1. Enable and configure Service Catalog or Private Catalog for the organization that owns the shared catalogs.
2. Make sure the catalog is shared to the target project, folder, or organization you plan to search against.
3. Use an identity that can view that shared target. The current product docs describe the Catalog Consumer role as the common choice for end users.
4. Prefer ADC over embedding service account keys in application code.

Local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

The `resource` argument is what scopes visibility. The generated request types document these formats:

- `projects/PROJECT_ID`
- `folders/FOLDER_NUMBER`
- `organizations/ORG_NUMBER`

If the catalog is not shared to that exact resource, the search calls usually return an empty result set.

## Initialize A Client

Basic client setup with ADC:

```python
from google.cloud import privatecatalog_v1beta1

client = privatecatalog_v1beta1.PrivateCatalogClient()
resource = "projects/my-project"
```

Explicit credentials:

```python
from google.cloud import privatecatalog_v1beta1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/absolute/path/service-account.json"
)

client = privatecatalog_v1beta1.PrivateCatalogClient(credentials=credentials)
resource = "projects/my-project"
```

## Core Usage

### List Catalogs Shared To A Resource

Use `search_catalogs` to discover which catalogs are visible to a project, folder, or organization:

```python
from google.cloud import privatecatalog_v1beta1

client = privatecatalog_v1beta1.PrivateCatalogClient()
request = privatecatalog_v1beta1.SearchCatalogsRequest(
    resource="projects/my-project",
)

for catalog in client.search_catalogs(request=request):
    print(catalog.name)
    print(catalog.display_name)
```

To narrow the result to one known catalog name, use the documented `name=` query form:

```python
from google.cloud import privatecatalog_v1beta1

client = privatecatalog_v1beta1.PrivateCatalogClient()
catalog_name = client.catalog_path(catalog="my-catalog")

request = privatecatalog_v1beta1.SearchCatalogsRequest(
    resource="projects/my-project",
    query=f"name={catalog_name}",
)

catalog = next(iter(client.search_catalogs(request=request)), None)
if catalog is not None:
    print(catalog.name, catalog.display_name)
```

### List Products In A Catalog

`search_products` is scoped by both the shared `resource` and a catalog-relative query:

```python
from google.cloud import privatecatalog_v1beta1

client = privatecatalog_v1beta1.PrivateCatalogClient()
catalog_name = "catalogs/my-catalog"

request = privatecatalog_v1beta1.SearchProductsRequest(
    resource="projects/my-project",
    query=f"parent={catalog_name}",
)

for product in client.search_products(request=request):
    print(product.name)
    print(product.display_name)
    print(product.asset_type)
    print(product.icon_uri)
```

To fetch one specific product, use the documented `name=` query form:

```python
from google.cloud import privatecatalog_v1beta1

client = privatecatalog_v1beta1.PrivateCatalogClient()
product_name = "catalogs/my-catalog/products/my-product"

request = privatecatalog_v1beta1.SearchProductsRequest(
    resource="projects/my-project",
    query=f"name={product_name}",
)

product = next(iter(client.search_products(request=request)), None)
if product is not None:
    print(product.name, product.asset_type)
```

The current product reference documents these `asset_type` values:

- `google.deploymentmanager.Template`
- `google.cloudprivatecatalog.ListingOnly`
- `google.cloudprivatecatalog.Terraform`

### List Versions For A Product

Use the product resource name as the `parent=` filter when browsing versions:

```python
from google.cloud import privatecatalog_v1beta1

client = privatecatalog_v1beta1.PrivateCatalogClient()
product_name = "catalogs/my-catalog/products/my-product"

request = privatecatalog_v1beta1.SearchVersionsRequest(
    resource="projects/my-project",
    query=f"parent={product_name}",
)

for version in client.search_versions(request=request):
    print(version.name)
    print(version.description)
    print(version.asset)
```

To fetch a single version directly:

```python
from google.cloud import privatecatalog_v1beta1

client = privatecatalog_v1beta1.PrivateCatalogClient()
version_name = client.version_path(
    catalog="my-catalog",
    product="my-product",
    version="v1",
)

request = privatecatalog_v1beta1.SearchVersionsRequest(
    resource="projects/my-project",
    query=f"name={version_name}",
)

version = next(iter(client.search_versions(request=request)), None)
if version is not None:
    print(version.name)
    print(version.asset)
```

The `Version` type exposes the validated deployment payload in `asset`. For Terraform-based products, `asset_references` identifies any referenced modules or files that belong to that version.

## Common Pitfalls

- Product naming is inconsistent across surfaces. The product docs live under Service Catalog, but the Python package, import path, and API names still use Private Catalog and `privatecatalog_v1beta1`.
- The browse API is visibility-scoped. A wrong `resource` string is a common reason for empty results.
- Use only the documented query forms:
  - `search_catalogs`: `name=catalogs/{catalog}`
  - `search_products`: `parent=catalogs/{catalog}` or `name=catalogs/{catalog}/products/{product}`
  - `search_versions`: `parent=catalogs/{catalog}/products/{product}` or `name=catalogs/{catalog}/products/{product}/versions/{version}`
- This client browses catalogs, products, and versions. It is not the admin SDK for creating catalogs or sharing them with target resources.
- The import path is `from google.cloud import privatecatalog_v1beta1`, not `private_catalog` or `service_catalog`.
- The library is still on a beta API surface. Pin the package version if you need stable behavior across environments.

## Version-Sensitive Notes

- PyPI publishes `google-cloud-private-catalog 0.11.0`, which is the package version covered here.
- The current Python reference pages under the `latest` docs track still render `0.10.0` on the generated client and type pages. Use PyPI to decide what version to pin, and use the reference pages for request shapes, helper methods, and response fields.
- The package remains on the `privatecatalog_v1beta1` import path and the PyPI classifiers still mark it as beta. Treat upgrade notes carefully if you are moving between minor releases.

## Official Sources

- PyPI package page: `https://pypi.org/project/google-cloud-private-catalog/`
- Maintainer package directory: `https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-private-catalog`
- Python client reference root: `https://cloud.google.com/python/docs/reference/cloudprivatecatalog/latest`
- `PrivateCatalogClient` reference: `https://cloud.google.com/python/docs/reference/cloudprivatecatalog/latest/google.cloud.privatecatalog_v1beta1.services.private_catalog.PrivateCatalogClient`
- `SearchCatalogsRequest` reference: `https://cloud.google.com/python/docs/reference/cloudprivatecatalog/latest/google.cloud.privatecatalog_v1beta1.types.SearchCatalogsRequest`
- `SearchProductsRequest` reference: `https://cloud.google.com/python/docs/reference/cloudprivatecatalog/latest/google.cloud.privatecatalog_v1beta1.types.SearchProductsRequest`
- `SearchVersionsRequest` reference: `https://cloud.google.com/python/docs/reference/cloudprivatecatalog/latest/google.cloud.privatecatalog_v1beta1.types.SearchVersionsRequest`
- Service Catalog access control: `https://cloud.google.com/service-catalog/docs/access-control`
- Service Catalog configuration overview: `https://cloud.google.com/service-catalog/docs/set-service-catalog`
