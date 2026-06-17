---
name: ptx-special-registerspm0pm7
description: Performance monitoring counters.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.25. Special Registers:%pm0…%pm7

---
title: "10.25. Special Registers:%pm0…%pm7"
section: 10.25
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.25. Special Registers:%pm0…%pm7


`%pm0` … `%pm7`

Performance monitoring counters.

Syntax (predefined)

.sreg .u32 %pm<8>;

Description

Special registers `%pm0` … `%pm7` are unsigned 32-bit read-only performance monitor counters. Their behavior is currently undefined.

PTX ISA Notes

`%pm0` … `%pm3` introduced in PTX ISA version 1.3.

`%pm4` … `%pm7` introduced in PTX ISA version 3.0.

Target ISA Notes

`%pm0` … `%pm3` supported on all target architectures.

`%pm4` … `%pm7` require `sm_20` or higher.

Examples

mov.u32  r1,%pm0;
    mov.u32  r1,%pm7;