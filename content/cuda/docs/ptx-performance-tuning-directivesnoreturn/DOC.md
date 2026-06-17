---
name: ptx-performance-tuning-directivesnoreturn
description: Indicate that the function does not return to its caller function.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.4.6. Performance-Tuning Directives:.noreturn

---
title: "11.4.6. Performance-Tuning Directives:.noreturn"
section: 11.4.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.4.6. Performance-Tuning Directives:.noreturn


`.noreturn`

Indicate that the function does not return to its caller function.

Syntax

.noreturn

Description

Indicate that the function does not return to its caller function.

Semantics

An optional `.noreturn` directive indicates that the function does not return to caller function. `.noreturn` directive can only be specified on device functions and must appear between a `.func` directive and its body.

The directive cannot be specified on functions which have return parameters.

If a function with `.noreturn` directive returns to the caller function at runtime, then the behavior is undefined.

PTX ISA Notes

Introduced in PTX ISA version 6.4.

Target ISA Notes

Requires `sm_30` or higher.

Examples

.func foo .noreturn { ... }