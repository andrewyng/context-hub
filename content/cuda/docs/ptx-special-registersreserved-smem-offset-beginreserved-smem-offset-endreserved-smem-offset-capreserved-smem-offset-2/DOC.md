---
name: ptx-special-registersreserved-smem-offset-beginreserved-smem-offset-endreserved-smem-offset-capreserved-smem-offset-2
description: '`%reserved_smem_offset_begin`, `%reserved_smem_offset_end`, `%reserved_smem_offset_cap`,
  `%reserved_smem_offset_<2>`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.29. Special Registers:%reserved_smem_offset_begin,%reserved_smem_offset_end,%reserved_smem_offset_cap,%reserved_smem_offset_<2>

---
title: "10.29. Special Registers:%reserved_smem_offset_begin,%reserved_smem_offset_end,%reserved_smem_offset_cap,%reserved_smem_offset_<2>"
section: 10.29
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.29. Special Registers:%reserved_smem_offset_begin,%reserved_smem_offset_end,%reserved_smem_offset_cap,%reserved_smem_offset_<2>


`%reserved_smem_offset_begin`, `%reserved_smem_offset_end`, `%reserved_smem_offset_cap`, `%reserved_smem_offset_<2>`

`%reserved_smem_offset_begin`
    

Start of the reserved shared memory region.

`%reserved_smem_offset_end`
    

End of the reserved shared memory region.

`%reserved_smem_offset_cap`
    

Total size of the reserved shared memory region.

`%reserved_smem_offset_<2>`
    

Offsets in the reserved shared memory region.

Syntax (predefined)

.sreg .b32 %reserved_smem_offset_begin;
    .sreg .b32 %reserved_smem_offset_end;
    .sreg .b32 %reserved_smem_offset_cap;
    .sreg .b32 %reserved_smem_offset_<2>;

Description

These are predefined, read-only special registers containing information about the shared memory region which is reserved for the NVIDIA system software use. This region of shared memory is not available to users, and accessing this region from user code results in undefined behavior. Refer to _CUDA Programming Guide_ for details.

PTX ISA Notes

Introduced in PTX ISA version 7.6.

Target ISA Notes

Require `sm_80` or higher.

Examples

.reg .b32 %reg_begin, %reg_end, %reg_cap, %reg_offset0, %reg_offset1;
    
    mov.b32 %reg_begin,   %reserved_smem_offset_begin;
    mov.b32 %reg_end,     %reserved_smem_offset_end;
    mov.b32 %reg_cap,     %reserved_smem_offset_cap;
    mov.b32 %reg_offset0, %reserved_smem_offset_0;
    mov.b32 %reg_offset1, %reserved_smem_offset_1;