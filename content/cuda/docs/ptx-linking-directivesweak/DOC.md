---
name: ptx-linking-directivesweak
description: Visible (externally) symbol declaration.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.6.3. Linking Directives:.weak

---
title: "11.6.3. Linking Directives:.weak"
section: 11.6.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.6.3. Linking Directives:.weak


`.weak`

Visible (externally) symbol declaration.

Syntax

.weak identifier

Description

Declares identifier to be globally visible but _weak_. Weak symbols are similar to globally visible symbols, except during linking, weak symbols are only chosen after globally visible symbols during symbol resolution. Unlike globally visible symbols, multiple object files may declare the same weak symbol, and references to a symbol get resolved against a weak symbol only if no global symbols have the same name.

PTX ISA Notes

Introduced in PTX ISA version 3.1.

Target ISA Notes

Supported on all target architectures.

Examples

.weak .func (.reg .b32 val) foo;  // foo will be externally visible