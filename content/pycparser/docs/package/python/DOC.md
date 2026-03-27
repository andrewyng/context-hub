---
name: package
description: "pycparser guide for parsing C source into an AST, traversing nodes, and generating C from Python"
metadata:
  languages: "python"
  versions: "3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "pycparser,c,parser,ast,codegen,python"
---

# pycparser Python Package Guide

## Golden Rule

Use `pycparser` when you need a Python-native C parser that builds an AST. For `pycparser 3.0`, the maintained package requires Python 3.10+ and the supported public entry points are `CParser`, `parse_file`, `c_ast`, and `c_generator`.

Most real C files must be preprocessed before parsing. `pycparser` can run `cpp`, `gcc -E`, or `clang -E` for you through `parse_file(..., use_cpp=True)`.

## Install

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "pycparser==3.0"
```

`pycparser` itself has no external Python dependencies, but parsing non-trivial source usually also requires a C preprocessor on your machine.

## Parse C Source Already In Memory

Use `CParser` directly when your input string is already preprocessed or simple enough not to need the C preprocessor:

```python
from pycparser import CParser

source = r"""
int add(int left, int right) {
    return left + right;
}
"""

parser = CParser()
ast = parser.parse(source, filename="example.c")

ast.show()
```

Pass a real filename when you have one. Error coordinates in the AST and parse failures are more useful when `filename` is set.

## Parse A File With The C Preprocessor

`parse_file` can invoke the preprocessor for you. This is the normal path for source files that use `#include`, `#define`, or other preprocessor features.

This example uses two app-level environment variables:

```bash
export PYCPARSER_CPP=clang
export PYCPARSER_FAKE_LIBC_INCLUDE=/absolute/path/to/pycparser/utils/fake_libc_include
```

`pycparser` does not read these names itself; they are just a clean way to configure your application.

```python
import os
from pycparser import parse_file

cpp_path = os.environ.get("PYCPARSER_CPP", "cpp")
fake_libc = os.environ["PYCPARSER_FAKE_LIBC_INCLUDE"]

ast = parse_file(
    "hello.c",
    use_cpp=True,
    cpp_path=cpp_path,
    cpp_args=[
        "-E",
        rf"-I{fake_libc}",
    ],
    encoding="utf-8",
)

ast.show(showcoord=True)
```

`cpp_args` can be a string or a list of strings. A list is usually easier to extend safely.

## Walk The AST

Use `c_ast.NodeVisitor` to inspect the parse tree:

```python
from pycparser import CParser, c_ast

source = r"""
int add(int left, int right) {
    return left + right;
}

void log_message(void) {
}
"""

class FunctionCollector(c_ast.NodeVisitor):
    def __init__(self) -> None:
        self.names: list[str] = []

    def visit_FuncDef(self, node: c_ast.FuncDef) -> None:
        self.names.append(node.decl.name)
        self.generic_visit(node)

parser = CParser()
ast = parser.parse(source, filename="example.c")

collector = FunctionCollector()
collector.visit(ast)

print(collector.names)
```

## Rewrite The AST And Emit C Again

`pycparser` ships a C code generator. A common workflow is parse -> transform -> generate:

```python
from pycparser import CParser, c_ast, c_generator

source = r"""
void greet(void) {
}
"""

class ParamAdder(c_ast.NodeVisitor):
    def visit_FuncDecl(self, node: c_ast.FuncDecl) -> None:
        type_decl = c_ast.TypeDecl(
            declname="_hidden",
            quals=[],
            align=[],
            type=c_ast.IdentifierType(["int"]),
        )
        new_param = c_ast.Decl(
            name="_hidden",
            quals=[],
            align=[],
            storage=[],
            funcspec=[],
            type=type_decl,
            init=None,
            bitsize=None,
            coord=node.coord,
        )

        if node.args is None:
            node.args = c_ast.ParamList(params=[new_param])
        else:
            node.args.params.append(new_param)

parser = CParser()
ast = parser.parse(source, filename="example.c")

ParamAdder().visit(ast)

generator = c_generator.CGenerator()
print(generator.visit(ast))
```

## Common Pitfalls

- Do not point `parse_file(..., use_cpp=True)` at raw source unless a compatible preprocessor is installed and reachable through `cpp_path` or `PATH`.
- The maintainer README is explicit that `utils/fake_libc_include` is not installed with the `pip` package. If you need those headers, copy or vendor them from the source distribution or repository checkout.
- The fake libc headers now include C11 constructs. The maintainer docs note they may fail if you force the preprocessor to an older standard such as `-std=c99`.
- `pycparser` aims for full C99 and some C11, but only limited GCC extensions. If your codebase depends heavily on GCC-specific syntax, preprocess or normalize it before parsing.
- `CParser` still accepts old lexer/yacc compatibility arguments, but the current source says arguments after `lexer` are kept for backward compatibility and are otherwise unused.

## Version Notes For 3.0

- `pyproject.toml` for `pycparser 3.0` sets `requires-python = ">=3.10"`.
- The maintained package version is `3.0` on PyPI, while the repository README and source expose it as `v3.00` / `__version__ = "3.00"`.
