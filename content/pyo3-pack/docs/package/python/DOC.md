---
name: package
description: "Legacy pyo3-pack guide for building and publishing PyO3-based Python packages"
metadata:
  languages: "python"
  versions: "0.6.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "pyo3-pack,pyo3,rust,python,packaging,wheels"
---

# pyo3-pack Python Package Guide

## Golden Rule

Use `pyo3-pack` when you are maintaining an older PyO3 packaging flow already pinned to `pyo3-pack==0.6.1`. Keep the Python interpreter explicit, build inside a virtual environment, and treat `develop`, `build`, and `publish` as the core workflow.

Current PyO3 documentation focuses on `maturin`, the successor in the same tool lineage. For a project that is already pinned to `pyo3-pack`, keep the legacy CLI and project layout consistent instead of mixing in newer packaging conventions ad hoc.

## Install And Prerequisites

`pyo3-pack` shells out to Cargo and builds a native Python extension, so you need:

- a working Rust toolchain
- a Python interpreter you want to build against
- an activated virtual environment for local development installs

Install the tool and set up an isolated environment:

```bash
rustup default stable

python3 -m venv .venv
source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install "pyo3-pack==0.6.1"
```

If you have more than one Python installed, point PyO3 at the exact interpreter you want to target:

```bash
export PYO3_PYTHON="$(which python)"
```

That environment variable is the safest way to avoid building against the wrong interpreter or ABI.

## Prepare An Existing PyO3 Crate

`pyo3-pack` expects a Rust crate that is configured as a Python extension module.

At minimum, your crate must build a shared library:

```toml
[lib]
name = "my_package"
crate-type = ["cdylib"]
```

Your `pyo3` dependency also needs the `extension-module` feature enabled. The import name Python sees must match the module name your Rust crate exports.

For projects that use a package directory alongside the compiled extension, keep the Python package name and native module name aligned so `import my_package` resolves the expected extension module.

## Local Development

Use `develop` for the edit-build-import loop. It compiles the extension and installs it into the currently active virtual environment.

```bash
source .venv/bin/activate
export PYO3_PYTHON="$(which python)"

pyo3-pack develop
```

Then import the built module with the same interpreter:

```bash
python -c "import my_package; print(my_package.__doc__)"
```

Re-run `pyo3-pack develop` after changing Rust code.

## Build Distribution Artifacts

Use `build` when you want wheels for installation or release automation:

```bash
source .venv/bin/activate
export PYO3_PYTHON="$(which python)"

pyo3-pack build --release
```

This is the command to use in CI when you want a reproducible release build instead of a development install.

On Linux, wheel compatibility depends on the manylinux policy you build against. If you are publishing to PyPI, choose the CLI's `--manylinux` setting deliberately for your target environment instead of relying on whatever your host system happens to produce.

## Publish To PyPI

When the wheel is ready, upload with `publish`:

```bash
pyo3-pack publish --release
```

Keep PyPI credentials or tokens in your shell environment or CI secret store, not in source control. Prefer token-based publishing over a password-based workflow when your release process supports it.

## Interpreter Selection And Build Behavior

Two details matter most when `pyo3-pack` appears to build the wrong thing:

- `PYO3_PYTHON` controls which interpreter PyO3 uses to discover headers, ABI details, and linker settings
- the active virtual environment controls where `pyo3-pack develop` installs the compiled module

If your machine has multiple Python versions, make both explicit before every build:

```bash
source .venv/bin/activate
export PYO3_PYTHON="$(which python)"
pyo3-pack develop
```

That avoids the common mismatch where Cargo succeeds but the module cannot be imported from the interpreter you actually run.

## Common Pitfalls

- Missing `crate-type = ["cdylib"]` prevents a usable extension module from being produced.
- Missing PyO3 `extension-module` support causes linker or import-time failures for extension builds.
- Running `pyo3-pack develop` outside the intended virtual environment installs the module for the wrong interpreter.
- On Linux, wheel portability is a packaging decision, not just a build command. Check your manylinux target before uploading.
- Newer PyO3 guides often describe the same workflow with `maturin`. For a project pinned to `pyo3-pack 0.6.1`, verify configuration changes before copying modern examples into the repo.
