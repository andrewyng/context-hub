---
name: ptx-special-registersctaid
description: CTA identifier within a grid.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.6. Special Registers:%ctaid

---
title: "10.6. Special Registers:%ctaid"
section: 10.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.6. Special Registers:%ctaid


`%ctaid`

CTA identifier within a grid.

Syntax (predefined)

.sreg .v4 .u32 %ctaid;                      // CTA id vector
    .sreg .u32 %ctaid.x, %ctaid.y, %ctaid.z;    // CTA id components

Description

A predefined, read-only special register initialized with the CTA identifier within the CTA grid. The `%ctaid` special register contains a 1D, 2D, or 3D vector, depending on the shape and rank of the CTA grid. The fourth element is unused and always returns zero.

It is guaranteed that:

0  <=  %ctaid.x <  %nctaid.x
    0  <=  %ctaid.y <  %nctaid.y
    0  <=  %ctaid.z <  %nctaid.z

PTX ISA Notes

Introduced in PTX ISA version 1.0 with type `.v4.u16`.

Redefined as type `.v4.u32` in PTX ISA version 2.0. For compatibility with legacy PTX code, 16-bit `mov` and `cvt` instructions may be used to read the lower 16-bits of each component of `%ctaid`.

Target ISA Notes

Supported on all target architectures.

Examples

mov.u32  %r0,%ctaid.x;
    mov.u16  %rh,%ctaid.y;   // legacy code