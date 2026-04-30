---
name: ptx-special-registersclockclock-hi
description: '`%clock`, `%clock_hi`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.23. Special Registers:%clock,%clock_hi

---
title: "10.23. Special Registers:%clock,%clock_hi"
section: 10.23
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.23. Special Registers:%clock,%clock_hi


`%clock`, `%clock_hi`

`%clock`  
    

A predefined, read-only 32-bit unsigned cycle counter.

`%clock_hi`
    

The upper 32-bits of `%clock64` special register.

Syntax (predefined)

.sreg .u32 %clock;
    .sreg .u32 %clock_hi;

Description

Special register `%clock` and `%clock_hi` are unsigned 32-bit read-only cycle counters that wrap silently.

PTX ISA Notes

`%clock` introduced in PTX ISA version 1.0.

`%clock_hi` introduced in PTX ISA version 5.0.

Target ISA Notes

`%clock` supported on all target architectures.

`%clock_hi` requires `sm_20` or higher.

Examples

mov.u32 r1,%clock;
    mov.u32 r2, %clock_hi;