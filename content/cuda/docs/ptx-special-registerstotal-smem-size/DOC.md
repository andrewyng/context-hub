---
name: ptx-special-registerstotal-smem-size
description: Total size of shared memory used by a CTA of a kernel.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.30. Special Registers:%total_smem_size

---
title: "10.30. Special Registers:%total_smem_size"
section: 10.30
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.30. Special Registers:%total_smem_size


`%total_smem_size`

Total size of shared memory used by a CTA of a kernel.

Syntax (predefined)

.sreg .u32 %total_smem_size;

Description

A predefined, read-only special register initialized with total size of shared memory allocated (statically and dynamically, excluding the shared memory reserved for the NVIDIA system software use) for the CTA of a kernel at launch time.

Size is returned in multiples of shared memory allocation unit size supported by target architecture.

Allocation unit values are as follows:

Target architecture | Shared memory allocation unit size  
---|---  
`sm_2x` | 128 bytes  
`sm_3x`, `sm_5x`, `sm_6x`, `sm_7x` | 256 bytes  
`sm_8x`, `sm_9x`, `sm_10x`, `sm_12x` | 128 bytes

PTX ISA Notes

Introduced in PTX ISA version 4.1.

Target ISA Notes

Requires `sm_20` or higher.

Examples

mov.u32  %r, %total_smem_size;