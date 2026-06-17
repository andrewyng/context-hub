---
name: ptx-performance-tuning-directivesminnctapersm
description: Minimum number of CTAs per SM.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.4.4. Performance-Tuning Directives:.minnctapersm

---
title: "11.4.4. Performance-Tuning Directives:.minnctapersm"
section: 11.4.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.4.4. Performance-Tuning Directives:.minnctapersm


`.minnctapersm`

Minimum number of CTAs per SM.

Syntax

.minnctapersm ncta

Description

Declare the minimum number of CTAs from the kernel’s grid to be mapped to a single multiprocessor (SM).

Notes

Optimizations based on `.minnctapersm` need either `.maxntid` or `.reqntid` to be specified as well.

If the total number of threads on a single SM resulting from `.minnctapersm` and `.maxntid` / `.reqntid` exceed maximum number of threads supported by an SM then directive `.minnctapersm` will be ignored.

In PTX ISA version 2.1 or higher, a warning is generated if `.minnctapersm` is specified without specifying either `.maxntid` or `.reqntid`.

PTX ISA Notes

Introduced in PTX ISA version 2.0 as a replacement for `.maxnctapersm`.

Target ISA Notes

Supported on all target architectures.

Examples

.entry foo .maxntid 256 .minnctapersm 4 { ... }