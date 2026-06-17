---
name: ptx-kernel-parameter-attributeptr
description: Kernel parameter alignment attribute.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.1.6.3. Kernel Parameter Attribute:.ptr

---
title: "5.1.6.3. Kernel Parameter Attribute:.ptr"
section: 5.1.6.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.1.6.3. Kernel Parameter Attribute:.ptr


`.ptr`

Kernel parameter alignment attribute.

Syntax

.param .type .ptr .space .align N  varname
    .param .type .ptr        .align N  varname
    
    .space = { .const, .global, .local, .shared };

Description

Used to specify the state space and, optionally, the alignment of memory pointed to by a pointer type kernel parameter. The alignment value _N_ , if present, must be a power of two. If no state space is specified, the pointer is assumed to be a generic address pointing to one of const, global, local, or shared memory. If no alignment is specified, the memory pointed to is assumed to be aligned to a 4 byte boundary.

Spaces between `.ptr`, `.space`, and `.align` may be eliminated to improve readability.

PTX ISA Notes

* Introduced in PTX ISA version 2.2.

  * Support for generic addressing of .const space added in PTX ISA version 3.1.

Target ISA Notes

* Supported on all target architectures.

Examples

.entry foo ( .param .u32 param1,
                 .param .u32 .ptr.global.align 16 param2,
                 .param .u32 .ptr.const.align 8 param3,
                 .param .u32 .ptr.align 16 param4  // generic address
                                                   // pointer
    ) { .. }