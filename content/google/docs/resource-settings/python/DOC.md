---
name: resource-settings
description: "Deprecated Google Cloud Resource Settings Python client library for inspecting legacy setting metadata and request shapes"
metadata:
  languages: "python"
  versions: "1.12.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,resource-settings,python,deprecated,settings,resource-manager"
---

# Google Cloud Resource Settings Python Client Library

## Golden Rule

Do not start new integrations with `google-cloud-resource-settings`. Google still publishes the Python package on PyPI, but Google Cloud lists Resource Settings as deprecated on November 7, 2023 and shut down on October 1, 2024. Use this package only when you need to read or replace older code that already depended on Resource Settings.

The generated Python import path is:

```python
from google.cloud import resourcesettings_v1
```

## Install

Pin the package version your codebase expects:

```bash
python -m pip install "google-cloud-resource-settings==1.12.0"
```

Common alternatives:

```bash
uv add "google-cloud-resource-settings==1.12.0"
poetry add "google-cloud-resource-settings==1.12.0"
```

PyPI lists `Requires: Python >=3.7` for this package.

## Authentication And Initialization

The generated client uses Application Default Credentials (ADC). Historically, Resource Settings calls required the `https://www.googleapis.com/auth/cloud-platform` scope.

Local ADC setup:

```bash
gcloud auth application-default login
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Basic client initialization:

```python
from google.cloud import resourcesettings_v1

client = resourcesettings_v1.ResourceSettingsServiceClient()
```

Explicit credentials:

```python
from google.cloud import resourcesettings_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/absolute/path/service-account.json"
)

client = resourcesettings_v1.ResourceSettingsServiceClient(credentials=credentials)
```

Because the service is shut down, successful client initialization does not mean live API calls will succeed.

## Resource Names And Value Types

The v1 Python types expect full resource names:

- parent resource: `projects/{project_number}`, `projects/{project_id}`, `folders/{folder_id}`, or `organizations/{organization_id}`
- setting name: `projects/{project_number}/settings/{setting_name}` or the equivalent folder or organization form

The documented value shapes are:

- `boolean_value`
- `string_value`
- `string_set_value`
- `enum_value`

`Value` is a protobuf `oneof`, so only one of those fields can be set at a time.

The library also exposes `SettingView` values:

- `SETTING_VIEW_BASIC`
- `SETTING_VIEW_EFFECTIVE_VALUE`
- `SETTING_VIEW_LOCAL_VALUE`

If you do not set a view, the docs say the API defaults to `SETTING_VIEW_BASIC`.

## Historical Client Surface

These examples are useful when auditing or replacing older integrations. They show the generated request shapes that the package documents, but live calls should be treated as legacy-only because the service shut down on October 1, 2024.

### List settings available on a resource

```python
from google.cloud import resourcesettings_v1

client = resourcesettings_v1.ResourceSettingsServiceClient()

pager = client.list_settings(
    request={
        "parent": "projects/my-project-id",
        "view": resourcesettings_v1.SettingView.SETTING_VIEW_BASIC,
    }
)

for setting in pager:
    print(setting.name)
    print(setting.metadata.display_name)
    print(setting.metadata.data_type.name)
    print(setting.metadata.read_only)
```

### Get one setting and read its effective value

```python
from google.cloud import resourcesettings_v1

client = resourcesettings_v1.ResourceSettingsServiceClient()

setting = client.get_setting(
    request={
        "name": "projects/my-project-id/settings/example.setting",
        "view": resourcesettings_v1.SettingView.SETTING_VIEW_EFFECTIVE_VALUE,
    }
)

print(setting.name)
print(setting.effective_value)
```

### Get one setting and inspect its local value

```python
from google.cloud import resourcesettings_v1

client = resourcesettings_v1.ResourceSettingsServiceClient()

setting = client.get_setting(
    request={
        "name": "projects/my-project-id/settings/example.setting",
        "view": resourcesettings_v1.SettingView.SETTING_VIEW_LOCAL_VALUE,
    }
)

print(setting.local_value)
print(setting.etag)
```

### Update a setting value with the documented v1 request types

The v1 docs say `update_setting` takes a full `Setting` object and uses `etag` for optimistic concurrency.

```python
from google.cloud import resourcesettings_v1

client = resourcesettings_v1.ResourceSettingsServiceClient()
setting_name = "projects/my-project-id/settings/example.setting"

current = client.get_setting(
    request={
        "name": setting_name,
        "view": resourcesettings_v1.SettingView.SETTING_VIEW_LOCAL_VALUE,
    }
)

updated = client.update_setting(
    request={
        "setting": resourcesettings_v1.Setting(
            name=current.name,
            local_value=resourcesettings_v1.Value(boolean_value=True),
            etag=current.etag,
        )
    }
)

print(updated.name)
print(updated.local_value)
print(updated.etag)
```

### Build other value shapes

```python
from google.cloud import resourcesettings_v1

string_value = resourcesettings_v1.Value(string_value="example")

string_set_value = resourcesettings_v1.Value(
    string_set_value=resourcesettings_v1.Value.StringSet(
        values=["alpha", "beta"]
    )
)

enum_value = resourcesettings_v1.Value(
    enum_value=resourcesettings_v1.Value.EnumValue(value="ENUM_MEMBER")
)
```

## Common Pitfalls

- Package name and import path differ: install `google-cloud-resource-settings`, import `resourcesettings_v1`.
- The package is newer than the service. `1.12.0` was released in February 2025, after the service shutdown on October 1, 2024, so package freshness does not mean the backend is still available.
- Use full resource names, not bare IDs. `projects/my-project-id/settings/example.setting` is valid; `example.setting` is not.
- `get_setting()` and `list_settings()` default to basic metadata unless you request `SETTING_VIEW_EFFECTIVE_VALUE` or `SETTING_VIEW_LOCAL_VALUE`.
- `update_setting()` is documented as a full overwrite and checks `etag`. Reusing a stale `etag` can cause an optimistic-concurrency failure.
- `Value` is a oneof. Setting both `boolean_value` and `string_value` on the same object will not do what you expect.
- The docs mark `page_size` and `page_token` as unused on `ListSettingsRequest`.
- The type docs say a string set supports at most 50 entries and each string can be at most 200 characters.

## Version-Sensitive Notes

- `1.12.0` adds REST interceptors and selective GAPIC generation support. It does not restore service availability.
- `1.11.0` adds opt-in debug logging support.
- `1.10.0` adds Python 3.13 support.
- `1.9.4` is where Google added the deprecation and shutdown notice to the package changelog.

## Official Sources

- PyPI project page: `https://pypi.org/project/google-cloud-resource-settings/`
- Python client docs root: `https://googleapis.dev/python/resourcesettings/latest/`
- Python v1 types reference: `https://googleapis.dev/python/resourcesettings/latest/resourcesettings_v1/types_.html`
- Package changelog: `https://googleapis.dev/python/resourcesettings/latest/CHANGELOG.html`
- Resource Manager deprecations: `https://cloud.google.com/resource-manager/docs/deprecations`
- Resource Settings RPC reference: `https://developers.google.com/resource-settings/docs/reference/rpc/google.cloud.resourcesettings.v1alpha1`
