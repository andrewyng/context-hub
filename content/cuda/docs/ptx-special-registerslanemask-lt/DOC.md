---
name: ptx-special-registerslanemask-lt
description: "32-bit mask with bits set in positions less than the thread\u2019s lane\
  \ number in the warp."
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.20. Special Registers:%lanemask_lt

---
title: "10.20. Special Registers:%lanemask_lt"
section: 10.20
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.20. Special Registers:%lanemask_lt


`%lanemask_lt`

32-bit mask with bits set in positions less than the thread’s lane number in the warp.

Syntax (predefined)

.sreg .u32 %lanemask_lt;

Description

A predefined, read-only special register initialized with a 32-bit mask with bits set in positions less than the thread’s lane number in the warp.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`%lanemask_lt` requires `sm_20` or higher.

Examples

mov.u32     %r, %lanemask_lt;