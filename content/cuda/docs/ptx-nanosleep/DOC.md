---
name: ptx-nanosleep
description: Suspend the thread for an approximate delay given in nanoseconds.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.19.2. Miscellaneous Instructions:nanosleep

---
title: "9.7.19.2. Miscellaneous Instructions:nanosleep"
section: 9.7.19.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.19.2. Miscellaneous Instructions:nanosleep


`nanosleep`

Suspend the thread for an approximate delay given in nanoseconds.

Syntax

nanosleep.u32 t;

Description

Suspends the thread for a sleep duration approximately close to the delay `t`, specified in nanoseconds. `t` may be a register or an immediate value.

The sleep duration is approximated, but guaranteed to be in the interval `[0, 2*t]`. The maximum sleep duration is 1 millisecond. The implementation may reduce the sleep duration for individual threads within a warp such that all sleeping threads in the warp wake up together.

PTX ISA Notes

`nanosleep` introduced in PTX ISA 6.3.

Target ISA Notes

`nanosleep` requires `sm_70` or higher.

Examples

.reg .b32 r;
    .reg .pred p;
    
    nanosleep.u32 r;
    nanosleep.u32 42;
    @p nanosleep.u32 r;