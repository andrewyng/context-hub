---
name: ptx-performance-tuning-directivesmaxntid
description: Maximum number of threads in the thread block (CTA).
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.4.2. Performance-Tuning Directives:.maxntid

---
title: "11.4.2. Performance-Tuning Directives:.maxntid"
section: 11.4.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.4.2. Performance-Tuning Directives:.maxntid


`.maxntid`

Maximum number of threads in the thread block (CTA).

Syntax

.maxntid nx
    .maxntid nx, ny
    .maxntid nx, ny, nz

Description

Declare the maximum number of threads in the thread block (CTA). This maximum is specified by giving the maximum extent of each dimension of the 1D, 2D, or 3D CTA. The maximum number of threads is the product of the maximum extent in each dimension.

Semantics

The maximum number of threads in the thread block, computed as the product of the maximum extent specified for each dimension, is guaranteed not to be exceeded in any invocation of the kernel in which this directive appears. Exceeding the maximum number of threads results in a runtime error or kernel launch failure.

Note that this directive guarantees that the _total_ number of threads does not exceed the maximum, but does not guarantee that the limit in any particular dimension is not exceeded.

PTX ISA Notes

Introduced in PTX ISA version 1.3.

Target ISA Notes

Supported on all target architectures.

Examples

.entry foo .maxntid 256       { ... }  // max threads = 256
    .entry bar .maxntid 16,16,4   { ... }  // max threads = 1024