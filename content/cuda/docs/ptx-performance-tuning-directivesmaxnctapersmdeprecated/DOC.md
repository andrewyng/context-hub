---
name: ptx-performance-tuning-directivesmaxnctapersmdeprecated
description: Maximum number of CTAs per SM.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.4.5. Performance-Tuning Directives:.maxnctapersm(deprecated)

---
title: "11.4.5. Performance-Tuning Directives:.maxnctapersm(deprecated)"
section: 11.4.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.4.5. Performance-Tuning Directives:.maxnctapersm(deprecated)


`.maxnctapersm`

Maximum number of CTAs per SM.

Syntax

.maxnctapersm ncta

Description

Declare the maximum number of CTAs from the kernel’s grid that may be mapped to a single multiprocessor (SM).

Notes

Optimizations based on .maxnctapersm generally need `.maxntid` to be specified as well. The optimizing backend compiler uses `.maxntid` and `.maxnctapersm` to compute an upper-bound on per-thread register usage so that the specified number of CTAs can be mapped to a single multiprocessor. However, if the number of registers used by the backend is sufficiently lower than this bound, additional CTAs may be mapped to a single multiprocessor. For this reason, `.maxnctapersm` has been renamed to .minnctapersm in PTX ISA version 2.0.

PTX ISA Notes

Introduced in PTX ISA version 1.3. Deprecated in PTX ISA version 2.0.

Target ISA Notes

Supported on all target architectures.

Examples

.entry foo .maxntid 256 .maxnctapersm 4 { ... }