---
name: ptx-special-registersdynamic-smem-size
description: '`%dynamic_smem_size`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.32. Special Registers:%dynamic_smem_size

---
title: "10.32. Special Registers:%dynamic_smem_size"
section: 10.32
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.32. Special Registers:%dynamic_smem_size


`%dynamic_smem_size`

Size of shared memory allocated dynamically at kernel launch.

Syntax (predefined)

.sreg .u32 %dynamic_smem_size;

Description

Size of shared memory allocated dynamically at kernel launch.

A predefined, read-only special register initialized with size of shared memory allocated dynamically for the CTA of a kernel at launch time.

PTX ISA Notes

Introduced in PTX ISA version 4.1.

Target ISA Notes

Requires `sm_20` or higher.

Examples

mov.u32  %r, %dynamic_smem_size;