---
name: ptx-special-registersglobaltimerglobaltimer-loglobaltimer-hi
description: '`%globaltimer`, `%globaltimer_lo`, `%globaltimer_hi`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.28. Special Registers:%globaltimer,%globaltimer_lo,%globaltimer_hi

---
title: "10.28. Special Registers:%globaltimer,%globaltimer_lo,%globaltimer_hi"
section: 10.28
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.28. Special Registers:%globaltimer,%globaltimer_lo,%globaltimer_hi


`%globaltimer`, `%globaltimer_lo`, `%globaltimer_hi`

`%globaltimer`
    

A predefined, 64-bit global nanosecond timer.

`%globaltimer_lo`
    

The lower 32-bits of %globaltimer.

`%globaltimer_hi`
    

The upper 32-bits of %globaltimer.

Syntax (predefined)

.sreg .u64 %globaltimer;
    .sreg .u32 %globaltimer_lo, %globaltimer_hi;

Description

Special registers intended for use by NVIDIA tools. The behavior is target-specific and may change or be removed in future GPUs. When JIT-compiled to other targets, the value of these registers is unspecified.

PTX ISA Notes

Introduced in PTX ISA version 3.1.

Target ISA Notes

Requires target `sm_30` or higher.

Examples

mov.u64  r1,%globaltimer;