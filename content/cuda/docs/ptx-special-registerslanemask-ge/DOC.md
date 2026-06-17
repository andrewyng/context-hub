---
name: ptx-special-registerslanemask-ge
description: "32-bit mask with bits set in positions greater than or equal to the\
  \ thread\u2019s lane number in the warp."
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.21. Special Registers:%lanemask_ge

---
title: "10.21. Special Registers:%lanemask_ge"
section: 10.21
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.21. Special Registers:%lanemask_ge


`%lanemask_ge`

32-bit mask with bits set in positions greater than or equal to the thread’s lane number in the warp.

Syntax (predefined)

.sreg .u32 %lanemask_ge;

Description

A predefined, read-only special register initialized with a 32-bit mask with bits set in positions greater than or equal to the thread’s lane number in the warp.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`%lanemask_ge` requires `sm_20` or higher.

Examples

mov.u32     %r, %lanemask_ge;