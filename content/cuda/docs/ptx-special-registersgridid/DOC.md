---
name: ptx-special-registersgridid
description: Grid identifier.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.10. Special Registers:%gridid

---
title: "10.10. Special Registers:%gridid"
section: 10.10
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.10. Special Registers:%gridid


`%gridid`

Grid identifier.

Syntax (predefined)

.sreg .u64 %gridid;

Description

A predefined, read-only special register initialized with the per-grid temporal grid identifier. The `%gridid` is used by debuggers to distinguish CTAs and clusters within concurrent (small) grids.

During execution, repeated launches of programs may occur, where each launch starts a grid-of-CTAs. This variable provides the temporal grid launch number for this context.

For `sm_1x` targets, `%gridid` is limited to the range [0..216-1]. For `sm_20`, `%gridid` is limited to the range [0..232-1]. `sm_30` supports the entire 64-bit range.

PTX ISA Notes

Introduced in PTX ISA version 1.0 as type `.u16`.

Redefined as type `.u32` in PTX ISA version 1.3.

Redefined as type `.u64` in PTX ISA version 3.0.

For compatibility with legacy PTX code, 16-bit and 32-bit `mov` and `cvt` instructions may be used to read the lower 16-bits or 32-bits of each component of `%gridid`.

Target ISA Notes

Supported on all target architectures.

Examples

mov.u64  %s, %gridid;  // 64-bit read of %gridid
    mov.u32  %r, %gridid;  // legacy code with 32-bit %gridid