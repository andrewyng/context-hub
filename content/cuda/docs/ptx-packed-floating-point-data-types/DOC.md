---
name: ptx-packed-floating-point-data-types
description: PTX supports various variants of packed floating point data types. Out
  of them, only `.f16x2` is supported as a fundamental type, while others cannot be
  used as fundamental types - they are supported ...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.2.5.1. Packed Floating Point Data Types

---
title: "5.2.5.1. Packed Floating Point Data Types"
section: 5.2.5.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.2.5.1. Packed Floating Point Data Types


PTX supports various variants of packed floating point data types. Out of them, only `.f16x2` is supported as a fundamental type, while others cannot be used as fundamental types - they are supported as instruction types on certain instructions. When using an instruction with such non-fundamental types, the operand data variables must be of bit type of appropriate size. For example, all of the operand variables must be of type `.b32` for an instruction with instruction type as `.bf16x2`. [Table 9](<#operand-types-for-packed-floating-point-instruction-type>) described various variants of packed floating point data types in PTX.

Table 9 Operand types for packed floating point instruction type. Packed floating point type | Number of elements contained in a packed format | Type of each element | Register variable type to be used in the declaration  
---|---|---|---  
`.f16x2` | Two | `.f16` | `.f16x2` or `.b32`  
`.f32x2` | `.f32` | `.b64`  
`.bf16x2` | `.bf16` | `.b32`  
`.e4m3x2` | `.e4m3` | `.b16`  
`.e5m2x2` | `.e5m2`  
`.e2m3x2` | `.e2m3`  
`.e3m2x2` | `.e3m2`  
`.ue8m0x2` | `.ue8m0`  
`.s2f6x2` | `.s2f6`  
`.e2m1x2` | `.e2m1` | `.b8`  
`.e4m3x4` | Four | `.e4m3` | `.b32`  
`.e5m2x4` | `.e5m2`  
`.e2m3x4` | `.e2m3`  
`.e3m2x4` | `.e3m2`  
`.e2m1x4` | `.e2m1` | `.b16`