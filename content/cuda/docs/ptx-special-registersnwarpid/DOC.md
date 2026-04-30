---
name: ptx-special-registersnwarpid
description: Number of warp identifiers.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.5. Special Registers:%nwarpid

---
title: "10.5. Special Registers:%nwarpid"
section: 10.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.5. Special Registers:%nwarpid


`%nwarpid`

Number of warp identifiers.

Syntax (predefined)

.sreg .u32 %nwarpid;

Description

A predefined, read-only special register that returns the maximum number of warp identifiers.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`%nwarpid` requires `sm_20` or higher.

Examples

mov.u32  %r, %nwarpid;