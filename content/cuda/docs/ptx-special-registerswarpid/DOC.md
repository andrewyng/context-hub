---
name: ptx-special-registerswarpid
description: Warp identifier.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.4. Special Registers:%warpid

---
title: "10.4. Special Registers:%warpid"
section: 10.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.4. Special Registers:%warpid


`%warpid`

Warp identifier.

Syntax (predefined)

.sreg .u32 %warpid;

Description

A predefined, read-only special register that returns the thread’s warp identifier. The warp identifier provides a unique warp number within a CTA but not across CTAs within a grid. The warp identifier will be the same for all threads within a single warp.

Note that `%warpid` returns the location of a thread at the moment when read, but its value may change during execution, e.g., due to rescheduling of threads following preemption. For this reason, `%ctaid` and `%tid` should be used to compute a virtual warp index if such a value is needed in kernel code; `%warpid` is intended mainly to enable profiling and diagnostic code to sample and log information such as work place mapping and load distribution.

PTX ISA Notes

Introduced in PTX ISA version 1.3.

Target ISA Notes

Supported on all target architectures.

Examples

mov.u32  %r, %warpid;