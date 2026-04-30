---
name: ptx-linking-directivesextern
description: External symbol declaration.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.6.1. Linking Directives:.extern

---
title: "11.6.1. Linking Directives:.extern"
section: 11.6.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.6.1. Linking Directives:.extern


`.extern`

External symbol declaration.

Syntax

.extern identifier

Description

Declares identifier to be defined external to the current module. The module defining such identifier must define it as `.weak` or `.visible` only once in a single object file. Extern declaration of symbol may appear multiple times and references to that get resolved against the single definition of that symbol.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

.extern .global .b32 foo;  // foo is defined in another module