---
name: ptx-source-format
description: Source modules are ASCII text. Lines are separated by the newline character
  (`\n`).
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 4.1. Source Format

---
title: "4.1. Source Format"
section: 4.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 4.1. Source Format


Source modules are ASCII text. Lines are separated by the newline character (`\n`).

All whitespace characters are equivalent; whitespace is ignored except for its use in separating tokens in the language.

The C preprocessor cpp may be used to process PTX source modules. Lines beginning with `#` are preprocessor directives. The following are common preprocessor directives:

`#include`, `#define`, `#if`, `#ifdef`, `#else`, `#endif`, `#line`, `#file`

_C: A Reference Manual_ by Harbison and Steele provides a good description of the C preprocessor.

PTX is case sensitive and uses lowercase for keywords.

Each PTX module must begin with a `.version` directive specifying the PTX language version, followed by a `.target` directive specifying the target architecture assumed. See [PTX Module Directives](<#ptx-module-directives>) for a more information on these directives.