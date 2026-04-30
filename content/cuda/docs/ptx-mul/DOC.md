---
name: ptx-mul
description: Multiply two values.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.4.3. Half Precision Floating Point Instructions:mul

---
title: "9.7.4.3. Half Precision Floating Point Instructions:mul"
section: 9.7.4.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.4.3. Half Precision Floating Point Instructions:mul


`mul`

Multiply two values.

Syntax

mul{.rnd}{.ftz}{.sat}.f16   d, a, b;
    mul{.rnd}{.ftz}{.sat}.f16x2 d, a, b;
    
    mul{.rnd}.bf16   d, a, b;
    mul{.rnd}.bf16x2 d, a, b;
    
    .rnd = { .rn };

Description

Performs multiplication and writes the resulting value into a destination register.

For `.f16x2` and `.bf16x2` instruction type, forms input vectors by half word values from source operands. Half-word operands are then multiplied in parallel to produce `.f16x2` or `.bf16x2` result in destination.

For `.f16` instruction type, operands `d`, `a` and `b` have `.f16` or `.b16` type. For `.f16x2` instruction type, operands `d`, `a` and `b` have `.b32` type. For `.bf16` instruction type, operands `d`, `a`, `b` have `.b16` type. For `.bf16x2` instruction type, operands `d`, `a`, `b` have `.b32` type.

Semantics

if (type == f16 || type == bf16) {
        d = a * b;
    } else if (type == f16x2 || type == bf16x2) {
        fA[0] = a[0:15];
        fA[1] = a[16:31];
        fB[0] = b[0:15];
        fB[1] = b[16:31];
        for (i = 0; i < 2; i++) {
             d[i] = fA[i] * fB[i];
        }
    }

Notes

Rounding modifiers:

`.rn`
    

mantissa LSB rounds to nearest even

The default value of rounding modifier is `.rn`. Note that a `mul` instruction with an explicit rounding modifier is treated conservatively by the code optimizer. A `mul` instruction with no rounding modifier defaults to round-to-nearest-even and may be optimized aggressively by the code optimizer. In particular, `mul`/`add` and `mul/sub` sequences with no rounding modifiers may be optimized to use fused-multiply-add instructions on the target device.

Subnormal numbers:
    

By default, subnormal numbers are supported. `mul.ftz.{f16, f16x2}` flushes subnormal inputs and results to sign-preserving zero.

Saturation modifier:
    

`mul.sat.{f16, f16x2}` clamps the result to [0.0, 1.0]. `NaN` results are flushed to `+0.0f`.

PTX ISA Notes

Introduced in PTX ISA version 4.2.

`mul{.rnd}.bf16` and `mul{.rnd}.bf16x2` introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_53` or higher.

`mul{.rnd}.bf16` and `mul{.rnd}.bf16x2` requires `sm_90` or higher.

Examples

// scalar f16 multiplications
    mul.f16        d0, a0, b0;
    mul.rn.f16     d1, a1, b1;
    mul.bf16       bd0, ba0, bb0;
    mul.rn.bf16    bd1, ba1, bb1;
    
    // SIMD f16 multiplication
    cvt.rn.f16.f32 h0, f0;
    cvt.rn.f16.f32 h1, f1;
    cvt.rn.f16.f32 h2, f2;
    cvt.rn.f16.f32 h3, f3;
    mov.b32  p1, {h0, h1};   // pack two f16 to 32bit f16x2
    mov.b32  p2, {h2, h3};   // pack two f16 to 32bit f16x2
    mul.f16x2  p3, p1, p2;   // SIMD f16x2 multiplication
    
    // SIMD bf16 multiplication
    cvt.rn.bf16x2.f32 p4, f4, f5; // Convert two f32 into packed bf16x2
    cvt.rn.bf16x2.f32 p5, f6, f7; // Convert two f32 into packed bf16x2
    mul.bf16x2  p6, p4, p5;       // SIMD bf16x2 multiplication
    
    // SIMD fp16 multiplication
    ld.global.b32   f0, [addr];     // load 32 bit which hold packed f16x2
    ld.global.b32   f1, [addr + 4]; // load 32 bit which hold packed f16x2
    mul.f16x2       f2, f0, f1;     // SIMD f16x2 multiplication
    
    // SIMD bf16 multiplication
    ld.global.b32   f3, [addr + 8];  // load 32 bit which hold packed bf16x2
    ld.global.b32   f4, [addr + 12]; // load 32 bit which hold packed bf16x2
    mul.bf16x2      f5, f3, f4;      // SIMD bf16x2 multiplication