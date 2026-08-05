---
name: package
description: "huggingface-hub for Python: authenticate, download files and snapshots, query Hub repos, and upload models, datasets, or Spaces"
metadata:
  languages: "python"
  versions: "1.17.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "huggingface-hub,huggingface,hub,models,datasets,spaces,ml"
---

# huggingface-hub Python Package Guide

## What It Is

`huggingface-hub` is the official Python client for the Hugging Face Hub. Use it to:

- authenticate with a user access token
- download individual files or full repository snapshots
- inspect models, datasets, Spaces, and repo metadata through `HfApi`
- upload files, folders, or commits to Hub repositories
- access Hub content through an `fsspec` filesystem interface

For Python code, the main imports come from `huggingface_hub`, while the install name on PyPI is `huggingface-hub`.

## Install

Pin the package version your project expects:

```bash
python -m pip install "huggingface-hub==1.17.0"
```

Common alternatives:

```bash
uv add "huggingface-hub==1.17.0"
poetry add "huggingface-hub==1.17.0"
```

Useful extras documented by Hugging Face and PyPI metadata:

```bash
python -m pip install "huggingface-hub[mcp]==1.17.0"
python -m pip install "huggingface-hub[torch]==1.17.0"
python -m pip install "huggingface-hub[hf-xet]==1.17.0"
```

## Imports At A Glance

```python
from huggingface_hub import (
    HfApi,
    HfFileSystem,
    hf_hub_download,
    login,
    model_info,
    repo_exists,
    snapshot_download,
    upload_file,
    upload_folder,
)
```

## Authentication And Setup

### Preferred auth paths

Use a Hugging Face user access token. The package supports:

1. `hf auth login` from the CLI
2. `login()` in Python
3. `HF_TOKEN` in the environment for headless or CI usage

CLI login:

```bash
hf auth login
```

Headless environment setup:

```bash
export HF_TOKEN="hf_your_token"
```

Programmatic login:

```python
from huggingface_hub import login

login(token="hf_your_token")
```

Notebook-specific helpers are available:

```python
from huggingface_hub import interpreter_login, notebook_login

# Use in a notebook environment
notebook_login()

# Use when automatic notebook detection is unreliable
interpreter_login()
```

Important auth notes:

- `login()` rejects organization tokens. Use a personal user token.
- `HF_TOKEN` overrides the token stored on disk.
- Public downloads often work without a token, but private or gated repos require one.
- When code must work for models, datasets, or Spaces, pass `repo_type="dataset"` or `repo_type="space"` explicitly instead of assuming the default model repo type.

## Core Usage

### Download one file into the local cache

`hf_hub_download()` is the normal path when you need one file and want a stable local cache path back:

```python
from huggingface_hub import hf_hub_download

weights_path = hf_hub_download(
    repo_id="google/flan-t5-small",
    filename="config.json",
    revision="main",
)

print(weights_path)
```

For reproducible builds, pin `revision` to a full commit hash instead of a moving branch name.

Use `repo_type` for non-model repos:

```python
from huggingface_hub import hf_hub_download

dataset_file = hf_hub_download(
    repo_id="datasets-org/my-dataset",
    filename="README.md",
    repo_type="dataset",
    revision="main",
)
```

### Download a full snapshot

Use `snapshot_download()` when a task needs multiple files from the same repo:

```python
from huggingface_hub import snapshot_download

repo_dir = snapshot_download(
    repo_id="google/flan-t5-small",
    allow_patterns=["*.json", "*.safetensors", "tokenizer.*"],
    revision="main",
)

print(repo_dir)
```

Pattern filters are the main way to avoid pulling an entire repository when only a few assets are needed.

If you want a working copy in a project directory instead of the central cache:

```python
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="google/flan-t5-small",
    local_dir="artifacts/flan-t5-small",
    revision="main",
)
```

Use `local_dir` only when you really want a mirrored folder in your workspace. The docs note that this mode manages its own lightweight cache under that folder and is less optimized than the main cache system.

### Search and inspect the Hub with `HfApi`

`HfApi` is the main Python interface for Hub operations beyond simple download helpers:

```python
from huggingface_hub import HfApi

api = HfApi()

models = api.list_models(search="sentence-transformers", limit=5)
for model in models:
    print(model.id)
```

Inspect one repository:

```python
from huggingface_hub import HfApi

api = HfApi()
info = api.model_info("google/flan-t5-small")

print(info.id)
print(info.sha)
print(info.private)
```

Check existence before generating code that assumes a repo is present:

```python
from huggingface_hub import repo_exists

print(repo_exists("google/flan-t5-small"))
print(repo_exists("my-org/private-dataset", repo_type="dataset", token="hf_..."))
```

### Create a repo and upload content

Create the target repo first:

```python
from huggingface_hub import HfApi

api = HfApi(token="hf_your_token")

api.create_repo(
    repo_id="your-username/demo-model",
    exist_ok=True,
)
```

Upload one file:

```python
from huggingface_hub import upload_file

upload_file(
    path_or_fileobj="README.md",
    path_in_repo="README.md",
    repo_id="your-username/demo-model",
    commit_message="Add README",
    token="hf_your_token",
)
```

Upload a whole folder:

```python
from huggingface_hub import upload_folder

upload_folder(
    folder_path="dist/model-artifacts",
    repo_id="your-username/demo-model",
    allow_patterns=["*.json", "*.safetensors", "*.md"],
    commit_message="Upload model artifacts",
    token="hf_your_token",
)
```

For datasets or Spaces, add `repo_type="dataset"` or `repo_type="space"`.

### Access Hub content through `HfFileSystem`

`HfFileSystem` gives you an `fsspec` filesystem for Hub repos:

```python
from huggingface_hub import HfFileSystem

fs = HfFileSystem(token="hf_your_token")

print(fs.ls("datasets/openai/gsm8k"))

with fs.open("datasets/openai/gsm8k/README.md", "r") as f:
    print(f.read(200))
```

Use it when a library already expects an `fsspec` filesystem. The docs explicitly note that `HfFileSystem` adds extra overhead, so use `HfApi` methods directly when you do not need filesystem semantics.

## Configuration And Environment

The most useful environment variables for generated code and CI are:

- `HF_TOKEN`: access token used by the client; overrides the stored token
- `HF_HOME`: root directory for token and cache state
- `HF_HUB_CACHE`: override the repo cache directory
- `HF_HUB_OFFLINE=1`: disable HTTP calls and rely on cached files only
- `HF_HUB_DISABLE_IMPLICIT_TOKEN=1`: do not automatically send the stored token on read operations
- `HF_DEBUG=1`: emit debug logs and cURL-equivalent request traces

Example CI setup:

```bash
export HF_TOKEN="hf_your_token"
export HF_HOME="$PWD/.hf"
export HF_HUB_CACHE="$PWD/.hf/hub"
```

Python usage with an explicit cache directory:

```python
from huggingface_hub import hf_hub_download

path = hf_hub_download(
    repo_id="google/flan-t5-small",
    filename="config.json",
    cache_dir=".hf-cache",
)
```

## Common Pitfalls

- Install name and import name differ: install `huggingface-hub`, import `huggingface_hub`.
- Default repo type is a model repo. Set `repo_type` for datasets and Spaces.
- Do not rely on moving branches like `main` when reproducibility matters. Pin `revision` to a commit hash.
- `hf_hub_download()` returns a cached file path; it does not copy the file into your project unless you do that yourself.
- `snapshot_download(local_dir=...)` creates a local mirror, not just a cache entry. Use it intentionally.
- Public reads can work anonymously, but gated or private repos will fail without a valid token.
- `login()` only accepts personal account tokens, not organization tokens.
- `HfFileSystem` is convenient but slower than direct `HfApi` calls for simple metadata or file operations.
- In offline mode, code that expects fresh metadata or remote existence checks will fail unless the artifacts are already cached locally.

## Version-Sensitive Notes For 1.17.0

- PyPI lists `huggingface-hub 1.17.0` as the current release for this session.
- The current docs root publishes `main v1.17.0`, so the primary Hugging Face docs are aligned with the package version for this session.
- The v1.x line requires Python 3.9+.
- The v1.0 migration notes still apply in `1.17.0`: the library switched to `httpx`, the `Repository` class was removed, `use_auth_token` was removed in favor of `token`, and several cache-constant internals moved or were removed.
- If you need code that spans both `0.x` and `1.x`, prefer `huggingface_hub.HfHubHttpError` for shared exception handling because it maps cleanly across the backend switch.
- Notable additions since `1.6.0` in the `1.x` line worth knowing about:
  - `CommitOperationCopy` and `copy_files()` support cross-repository copies without re-uploading.
  - `parse_hf_uri()` and the `HfUri` dataclass centralize `hf://` URI parsing.
  - `search_spaces()` enables embedding-based semantic search for Spaces.
  - `fetch_space_logs()` and `get_space_secrets()` give programmatic access to Space build/runtime logs and secret metadata; `hf spaces ssh` opens an SSH session to a Space Dev Mode container.
  - Jobs gained an independent `JobHardware` enum, plus `update_job_labels()` and `update_scheduled_job_labels()` helpers.
- Behavior changes worth noting:
  - URI parsing now requires `namespace/name` format; single-segment IDs are no longer accepted.
  - `model_name` is deprecated on `list_models()`; use `search=` instead.
  - The CLI standardized on a `--format [auto|human|agent|json|quiet]` flag and renamed `hf skills upgrade` to `hf skills update`. New CLI subcommands include `hf repos ls`, `hf skills list`, and `hf update`.
  - Token file permissions are hardened to `0o600` (parent dirs to `0o700`).

## Official Sources

- Docs home: `https://huggingface.co/docs/huggingface_hub/`
- Installation: `https://huggingface.co/docs/huggingface_hub/en/installation`
- Quickstart: `https://huggingface.co/docs/huggingface_hub/en/quick-start`
- Authentication: `https://huggingface.co/docs/huggingface_hub/en/package_reference/authentication`
- File download: `https://huggingface.co/docs/huggingface_hub/en/package_reference/file_download`
- Environment variables: `https://huggingface.co/docs/huggingface_hub/en/package_reference/environment_variables`
- `HfApi` reference: `https://huggingface.co/docs/huggingface_hub/en/package_reference/hf_api`
- `HfFileSystem` reference: `https://huggingface.co/docs/huggingface_hub/en/package_reference/hf_file_system`
- Migration notes: `https://huggingface.co/docs/huggingface_hub/en/concepts/migration`
- PyPI: `https://pypi.org/project/huggingface-hub/`
- GitHub releases (latest `v1.17.0`): `https://github.com/huggingface/huggingface_hub/releases`
