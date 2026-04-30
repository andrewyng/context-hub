---
name: ptx-performance-tuning-directivesreqntid
description: Number of threads in the thread block (CTA).
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.4.3. Performance-Tuning Directives:.reqntid

---
title: "11.4.3. Performance-Tuning Directives:.reqntid"
section: 11.4.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.4.3. Performance-Tuning Directives:.reqntid


`.reqntid`

Number of threads in the thread block (CTA).

Syntax

.reqntid nx
    .reqntid nx, ny
    .reqntid nx, ny, nz

Description

Declare the number of threads in the thread block (CTA) by specifying the extent of each dimension of the 1D, 2D, or 3D CTA. The total number of threads is the product of the number of threads in each dimension.

Semantics

The size of each CTA dimension specified in any invocation of the kernel is required to be equal to that specified in this directive. Specifying a different CTA dimension at launch will result in a runtime error or kernel launch failure.

Notes

The `.reqntid` directive cannot be used in conjunction with the `.maxntid` directive.

PTX ISA Notes

Introduced in PTX ISA version 2.1.

Target ISA Notes

Supported on all target architectures.

Examples

.entry foo .reqntid 256       { ... }  // num threads = 256
    .entry bar .reqntid 16,16,4   { ... }  // num threads = 1024