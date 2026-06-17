---
name: ptx-alignment
description: Byte alignment of storage for all addressable variables can be specified
  in the variable declaration. Alignment is specified using an optional `.align` _byte-count_
  specifier immediately following the...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.4.5. Alignment

---
title: "5.4.5. Alignment"
section: 5.4.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.4.5. Alignment


Byte alignment of storage for all addressable variables can be specified in the variable declaration. Alignment is specified using an optional `.align` _byte-count_ specifier immediately following the state-space specifier. The variable will be aligned to an address which is an integer multiple of byte-count. The alignment value byte-count must be a power of two. For arrays, alignment specifies the address alignment for the starting address of the entire array, not for individual elements.

The default alignment for scalar and array variables is to a multiple of the base-type size. The default alignment for vector variables is to a multiple of the overall vector size.

Examples

// allocate array at 4-byte aligned address.  Elements are bytes.
    .const .align 4 .b8 bar[8] = {0,0,0,0,2,0,0,0};

Note that all PTX instructions that access memory require that the address be aligned to a multiple of the access size. The access size of a memory instruction is the total number of bytes accessed in memory. For example, the access size of `ld.v4.b32` is 16 bytes, while the access size of `atom.f16x2` is 4 bytes.