---
name: ptx-special-registersntid
description: Number of thread IDs per CTA.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.2. Special Registers:%ntid

---
title: "10.2. Special Registers:%ntid"
section: 10.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.2. Special Registers:%ntid


`%ntid`

Number of thread IDs per CTA.

Syntax (predefined)

.sreg .v4 .u32 %ntid;                   // CTA shape vector
    .sreg .u32 %ntid.x, %ntid.y, %ntid.z;   // CTA dimensions

Description

A predefined, read-only special register initialized with the number of thread ids in each CTA dimension. The `%ntid` special register contains a 3D CTA shape vector that holds the CTA dimensions. CTA dimensions are non-zero; the fourth element is unused and always returns zero. The total number of threads in a CTA is `(%ntid.x * %ntid.y * %ntid.z)`.

%ntid.y == %ntid.z == 1 in 1D CTAs.
    %ntid.z ==1 in 2D CTAs.

Maximum values of %ntid.{x,y,z} are as follows:

.target architecture | %ntid.x | %ntid.y | %ntid.z  
---|---|---|---  
`sm_1x` | 512 | 512 | 64  
`sm_20`, `sm_3x`, `sm_5x`, `sm_6x`, `sm_7x`, `sm_8x`, `sm_9x`, `sm_10x`, `sm_12x` | 1024 | 1024 | 64

PTX ISA Notes

Introduced in PTX ISA version 1.0 with type `.v4.u16`.

Redefined as type `.v4.u32` in PTX ISA version 2.0. For compatibility with legacy PTX code, 16-bit `mov` and `cvt` instructions may be used to read the lower 16-bits of each component of `%ntid`.

Target ISA Notes

Supported on all target architectures.

Examples

// compute unified thread id for 2D CTA
    mov.u32  %r0,%tid.x;
    mov.u32  %h1,%tid.y;
    mov.u32  %h2,%ntid.x;
    mad.u32  %r0,%h1,%h2,%r0;
    
    mov.u16  %rh,%ntid.x;      // legacy code