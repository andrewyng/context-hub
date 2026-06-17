---
name: ptx-performance-tuning-directivesmaxnreg
description: Maximum number of registers that can be allocated per thread.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.4.1. Performance-Tuning Directives:.maxnreg

---
title: "11.4.1. Performance-Tuning Directives:.maxnreg"
section: 11.4.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.4.1. Performance-Tuning Directives:.maxnreg


`.maxnreg`

Maximum number of registers that can be allocated per thread.

Syntax

.maxnreg n

Description

Declare the maximum number of registers per thread in a CTA.

Semantics

The compiler guarantees that this limit will not be exceeded. The actual number of registers used may be less; for example, the backend may be able to compile to fewer registers, or the maximum number of registers may be further constrained by `.maxntid` and `.maxctapersm`.

PTX ISA Notes

Introduced in PTX ISA version 1.3.

Target ISA Notes

Supported on all target architectures.

Examples

.entry foo .maxnreg 16 { ... }  // max regs per thread = 16