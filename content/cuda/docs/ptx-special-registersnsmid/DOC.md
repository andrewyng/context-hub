---
name: ptx-special-registersnsmid
description: Number of SM identifiers.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.9. Special Registers:%nsmid

---
title: "10.9. Special Registers:%nsmid"
section: 10.9
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.9. Special Registers:%nsmid


`%nsmid`

Number of SM identifiers.

Syntax (predefined)

.sreg .u32 %nsmid;

Description

A predefined, read-only special register that returns the maximum number of SM identifiers. The SM identifier numbering is not guaranteed to be contiguous, so `%nsmid` may be larger than the physical number of SMs in the device.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`%nsmid` requires `sm_20` or higher.

Examples

mov.u32  %r, %nsmid;