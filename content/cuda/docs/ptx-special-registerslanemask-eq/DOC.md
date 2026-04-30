---
name: ptx-special-registerslanemask-eq
description: "32-bit mask with bit set in position equal to the thread\u2019s lane\
  \ number in the warp."
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.18. Special Registers:%lanemask_eq

---
title: "10.18. Special Registers:%lanemask_eq"
section: 10.18
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.18. Special Registers:%lanemask_eq


`%lanemask_eq`

32-bit mask with bit set in position equal to the thread’s lane number in the warp.

Syntax (predefined)

.sreg .u32 %lanemask_eq;

Description

A predefined, read-only special register initialized with a 32-bit mask with a bit set in the position equal to the thread’s lane number in the warp.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`%lanemask_eq` requires `sm_20` or higher.

Examples

mov.u32     %r, %lanemask_eq;