---
name: ptx-special-registerslanemask-le
description: "32-bit mask with bits set in positions less than or equal to the thread\u2019\
  s lane number in the warp."
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.19. Special Registers:%lanemask_le

---
title: "10.19. Special Registers:%lanemask_le"
section: 10.19
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.19. Special Registers:%lanemask_le


`%lanemask_le`

32-bit mask with bits set in positions less than or equal to the thread’s lane number in the warp.

Syntax (predefined)

.sreg .u32 %lanemask_le;

Description

A predefined, read-only special register initialized with a 32-bit mask with bits set in positions less than or equal to the thread’s lane number in the warp.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`%lanemask_le` requires `sm_20` or higher.

Examples

mov.u32     %r, %lanemask_le