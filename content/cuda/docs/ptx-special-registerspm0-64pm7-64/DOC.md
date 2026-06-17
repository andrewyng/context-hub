---
name: ptx-special-registerspm0-64pm7-64
description: "`%pm0_64` \u2026 `%pm7_64`"
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.26. Special Registers:%pm0_64…%pm7_64

---
title: "10.26. Special Registers:%pm0_64…%pm7_64"
section: 10.26
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.26. Special Registers:%pm0_64…%pm7_64


`%pm0_64` … `%pm7_64`

64 bit Performance monitoring counters.

Syntax (predefined)

.sreg .u64 %pm0_64;
    .sreg .u64 %pm1_64;
    .sreg .u64 %pm2_64;
    .sreg .u64 %pm3_64;
    .sreg .u64 %pm4_64;
    .sreg .u64 %pm5_64;
    .sreg .u64 %pm6_64;
    .sreg .u64 %pm7_64;

Description

Special registers `%pm0_64` … `%pm7_64` are unsigned 64-bit read-only performance monitor counters. Their behavior is currently undefined.

Notes

The lower 32bits of `%pm0_64` … `%pm7_64` are identical to `%pm0` … `%pm7`.

PTX ISA Notes

`%pm0_64` … `%pm7_64` introduced in PTX ISA version 4.0.

Target ISA Notes

`%pm0_64` … `%pm7_64` require `sm_50` or higher.

Examples

mov.u32  r1,%pm0_64;
    mov.u32  r1,%pm7_64;