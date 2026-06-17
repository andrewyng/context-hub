---
name: ptx-linking-directivescommon
description: Visible (externally) symbol declaration.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.6.4. Linking Directives:.common

---
title: "11.6.4. Linking Directives:.common"
section: 11.6.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.6.4. Linking Directives:.common


`.common`

Visible (externally) symbol declaration.

Syntax

.common identifier

Description

Declares identifier to be globally visible but “common”.

Common symbols are similar to globally visible symbols. However multiple object files may declare the same common symbol and they may have different types and sizes and references to a symbol get resolved against a common symbol with the largest size.

Only one object file can initialize a common symbol and that must have the largest size among all other definitions of that common symbol from different object files.

`.common` linking directive can be used only on variables with `.global` storage. It cannot be used on function symbols or on symbols with opaque type.

PTX ISA Notes

Introduced in PTX ISA version 5.0.

Target ISA Notes

`.common` directive requires `sm_20` or higher.

Examples

.common .global .u32 gbl;