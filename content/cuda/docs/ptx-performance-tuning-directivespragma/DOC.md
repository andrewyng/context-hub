---
name: ptx-performance-tuning-directivespragma
description: Pass directives to PTX backend compiler.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.4.7. Performance-Tuning Directives:.pragma

---
title: "11.4.7. Performance-Tuning Directives:.pragma"
section: 11.4.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.4.7. Performance-Tuning Directives:.pragma


`.pragma`

Pass directives to PTX backend compiler.

Syntax

.pragma list-of-strings ;

Description

Pass module-scoped, entry-scoped, or statement-level directives to the PTX backend compiler.

The `.pragma` directive may occur at module-scope, at entry-scope, or at statement-level.

Semantics

The interpretation of `.pragma` directive strings is implementation-specific and has no impact on PTX semantics. See [Descriptions of .pragma Strings](<#descriptions-pragma-strings>) for descriptions of the pragma strings defined in `ptxas`.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

Supported on all target architectures.

Examples

.pragma "nounroll";    // disable unrolling in backend
    
    // disable unrolling for current kernel
    .entry foo .pragma "nounroll"; { ... }