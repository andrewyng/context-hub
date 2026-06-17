---
name: ptx-special-registerslaneid
description: Lane Identifier.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.3. Special Registers:%laneid

---
title: "10.3. Special Registers:%laneid"
section: 10.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.3. Special Registers:%laneid


`%laneid`

Lane Identifier.

Syntax (predefined)

.sreg .u32 %laneid;

Description

A predefined, read-only special register that returns the thread’s lane within the warp. The lane identifier ranges from zero to `WARP_SZ-1`.

PTX ISA Notes

Introduced in PTX ISA version 1.3.

Target ISA Notes

Supported on all target architectures.

Examples

mov.u32  %r, %laneid;