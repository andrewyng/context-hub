---
name: ptx-special-registersclock64
description: A predefined, read-only 64-bit unsigned cycle counter.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.24. Special Registers:%clock64

---
title: "10.24. Special Registers:%clock64"
section: 10.24
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.24. Special Registers:%clock64


`%clock64`

A predefined, read-only 64-bit unsigned cycle counter.

Syntax (predefined)

.sreg .u64 %clock64;

Description

Special register `%clock64` is an unsigned 64-bit read-only cycle counter that wraps silently.

Notes

The lower 32-bits of `%clock64` are identical to `%clock`.

The upper 32-bits of `%clock64` are identical to `%clock_hi`.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`%clock64` requires `sm_20` or higher.

Examples

mov.u64  r1,%clock64;