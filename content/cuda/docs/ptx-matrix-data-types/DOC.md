---
name: ptx-matrix-data-types
description: The matrix multiply and accumulate operation is supported separately
  on integer, floating-point, sub-byte integer and single bit data-types. All operands
  must contain the same basic type kind, i.e., i...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.14.2. Matrix Data-types

---
title: "9.7.14.2. Matrix Data-types"
section: 9.7.14.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.14.2. Matrix Data-types


The matrix multiply and accumulate operation is supported separately on integer, floating-point, sub-byte integer and single bit data-types. All operands must contain the same basic type kind, i.e., integer or floating-point.

For floating-point matrix multiply and accumulate operation, different matrix operands may have different precision, as described later.

Data-type | Multiplicands (A or B) | Accumulators (C or D)  
---|---|---  
Integer | `.u8`, `.s8` | `.s32`  
Floating Point | `.f16` | `.f16`, `.f32`  
Alternate floating Point | `.bf16` | `.f32`  
Alternate floating Point | `.tf32` | `.f32`  
Alternate floating Point | `.e4m3` or `.e5m2` or `.e3m2` or `.e2m3` or `.e2m1` | `.f16`, `.f32`  
Alternate floating Point with scale | `.e4m3` or `.e5m2` or `.e3m2` or `.e2m3` or `.e2m1` X (Scale) `.ue8m0` | `.f32`  
Alternate floating Point with scale | `.e2m1` X (Scale) `.ue8m0` or `.ue4m3` | `.f32`  
Floating Point | `.f64` | `.f64`  
Sub-byte integer | both `.u4` or both `.s4` | `.s32`  
Single-bit integer | `.b1` | `.s32`