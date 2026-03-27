---
name: package
description: "mccabe Python package guide for cyclomatic complexity checks directly or through Flake8"
metadata:
  languages: "python"
  versions: "0.7.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "mccabe,python,flake8,linting,complexity,cyclomatic-complexity"
---

# mccabe Python Package Guide

## Golden Rule

Use `mccabe` for one job: measuring cyclomatic complexity in Python code. In most projects, the practical entry point is Flake8's `--max-complexity` option, because `mccabe` ships as a Flake8 plugin and reports `C901` when a function is over the configured threshold.

As of March 13, 2026, PyPI still lists `0.7.0` as the current release. That release requires Python 3.6 or newer.

## Install

Create or activate a virtual environment, then install the package version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "mccabe==0.7.0"
```

If you want the normal linting workflow, install Flake8 alongside it:

```bash
python -m pip install "flake8" "mccabe==0.7.0"
```

## Runtime Setup

`mccabe` runs entirely on local source code. There are no API keys, service credentials, or environment variables to configure, and there is no client object to initialize.

The direct Python imports are:

```python
from mccabe import McCabeChecker, get_code_complexity, get_module_complexity
```

## Use The Standalone CLI

The built-in command-line entry point is module-based:

```bash
python -m mccabe --min 10 path/to/module.py
```

`--min` controls the minimum complexity value that should be printed. The source sets its default to `1`.

To emit Graphviz DOT output instead of the text listing:

```bash
python -m mccabe --dot --min 10 path/to/module.py > complexity.dot
```

This mode is file-oriented. The standalone command reads one source file path and analyzes that file.

## Use It Through Flake8

When both `flake8` and `mccabe` are installed, Flake8 exposes the plugin's threshold setting:

```bash
flake8 --max-complexity 10 src/
```

You can confirm the plugin is loaded with:

```bash
flake8 --version
```

For a project-level threshold, set it in your Flake8 configuration:

```ini
[flake8]
max-complexity = 10
```

`mccabe` only emits `C901`. Flake8's docs describe `--max-complexity` as the `mccabe` plugin option, and the package README documents `# noqa: C901` for silencing a specific function on the reported line.

```python
def legacy_branching_code(value):  # noqa: C901
    ...
```

## Call The Python API

### Quick check from source text

`get_code_complexity()` compiles the code to an AST, prints any matching violations, and returns the number of functions or blocks over the threshold:

```python
from pathlib import Path

from mccabe import get_code_complexity

filename = "src/example.py"
source = Path(filename).read_text(encoding="utf-8")

violations = get_code_complexity(source, threshold=10, filename=filename)
print(f"{violations} blocks exceeded the threshold")
```

### Quick check from a file path

`get_module_complexity()` reads the file for you and then delegates to `get_code_complexity()`:

```python
from mccabe import get_module_complexity

violations = get_module_complexity("src/example.py", threshold=10)
print(f"{violations} blocks exceeded the threshold")
```

### Structured results with `McCabeChecker`

If you want to handle the violations yourself instead of using the helper that prints to stdout, use `McCabeChecker` directly. Its `run()` method yields `(line, column, message, checker_type)` tuples.

```python
import ast
from pathlib import Path

from mccabe import McCabeChecker

filename = "src/example.py"
source = Path(filename).read_text(encoding="utf-8")
tree = compile(source, filename, "exec", ast.PyCF_ONLY_AST)

McCabeChecker.max_complexity = 10

for line, column, message, _ in McCabeChecker(tree, filename).run():
    print((line, column, message))
```

## Important Pitfalls

- `mccabe` does not recursively walk directories on its own. Use Flake8 if you want normal project-wide linting.
- `McCabeChecker.run()` does nothing unless `McCabeChecker.max_complexity` is set to a non-negative threshold first.
- `get_code_complexity()` prints findings as a side effect and returns a count. Use `McCabeChecker` directly if you need structured results without that print behavior.
- The threshold is inclusive in `0.7.0`: a function with complexity `10` passes when the limit is `10`; only values greater than the threshold trigger `C901`.
- Place `# noqa: C901` on the line Flake8 reports for that function, which can be the function definition line or a decorator line above it.

## Official Sources

- Maintainer repository: `https://github.com/PyCQA/mccabe`
- Package README and release notes: `https://github.com/PyCQA/mccabe#readme`
- PyPI package page: `https://pypi.org/project/mccabe/`
- Flake8 option reference for `--max-complexity`: `https://flake8.pycqa.org/en/7.1.0/user/options.html#cmdoption-flake8-max-complexity`
- Flake8 configuration reference: `https://flake8.pycqa.org/en/7.0.0/user/configuration.html`
- Flake8 error code reference for `C901`: `https://flake8.pycqa.org/en/3.2.1/user/error-codes.html`
