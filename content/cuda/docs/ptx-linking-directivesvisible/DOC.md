---
name: ptx-linking-directivesvisible
description: Visible (externally) symbol declaration.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.6.2. Linking Directives:.visible

---
title: "11.6.2. Linking Directives:.visible"
section: 11.6.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.6.2. Linking Directives:.visible


`.visible`

Visible (externally) symbol declaration.

Syntax

.visible identifier

Description

Declares identifier to be globally visible. Unlike C, where identifiers are globally visible unless declared static, PTX identifiers are visible only within the current module unless declared `.visible` outside the current.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

.visible .global .b32 foo;  // foo will be externally visible