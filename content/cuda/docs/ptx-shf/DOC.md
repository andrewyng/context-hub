---
name: ptx-shf
description: Funnel shift.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.8.7. Logic and Shift Instructions:shf

---
title: "9.7.8.7. Logic and Shift Instructions:shf"
section: 9.7.8.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.8.7. Logic and Shift Instructions:shf


`shf`

Funnel shift.

Syntax

shf.l.mode.b32  d, a, b, c;  // left shift
    shf.r.mode.b32  d, a, b, c;  // right shift
    
    .mode = { .clamp, .wrap };

Description

Shift the 64-bit value formed by concatenating operands `a` and `b` left or right by the amount specified by the unsigned 32-bit value in `c`. Operand `b` holds bits `63:32` and operand a holds bits `31:0` of the 64-bit source value. The source is shifted left or right by the clamped or wrapped value in `c`. For `shf.l`, the most-significant 32-bits of the result are written into `d`; for `shf.r`, the least-significant 32-bits of the result are written into `d`.

Semantics

u32  n = (.mode == .clamp) ? min(c, 32) : c & 0x1f;
    switch (shf.dir) {  // shift concatenation of [b, a]
        case shf.l:     // extract 32 msbs
               u32  d = (b << n)      | (a >> (32-n));
        case shf.r:     // extract 32 lsbs
               u32  d = (b << (32-n)) | (a >> n);
    }

Notes

Use funnel shift for multi-word shift operations and for rotate operations. The shift amount is limited to the range `0..32` in clamp mode and `0..31` in wrap mode, so shifting multi-word values by distances greater than 32 requires first moving 32-bit words, then using `shf` to shift the remaining `0..31` distance.

To shift data sizes greater than 64 bits to the right, use repeated `shf.r` instructions applied to adjacent words, operating from least-significant word towards most-significant word. At each step, a single word of the shifted result is computed. The most-significant word of the result is computed using a `shr.{u32,s32}` instruction, which zero or sign fills based on the instruction type.

To shift data sizes greater than 64 bits to the left, use repeated `shf.l` instructions applied to adjacent words, operating from most-significant word towards least-significant word. At each step, a single word of the shifted result is computed. The least-significant word of the result is computed using a `shl` instruction.

Use funnel shift to perform 32-bit left or right rotate by supplying the same value for source arguments `a` and `b`.

PTX ISA Notes

Introduced in PTX ISA version 3.1.

Target ISA Notes

Requires `sm_32` or higher.

Example

shf.l.clamp.b32  r3,r1,r0,16;
    
    // 128-bit left shift; n < 32
    // [r7,r6,r5,r4] = [r3,r2,r1,r0] << n
    shf.l.clamp.b32  r7,r2,r3,n;
    shf.l.clamp.b32  r6,r1,r2,n;
    shf.l.clamp.b32  r5,r0,r1,n;
    shl.b32          r4,r0,n;
    
    // 128-bit right shift, arithmetic; n < 32
    // [r7,r6,r5,r4] = [r3,r2,r1,r0] >> n
    shf.r.clamp.b32  r4,r0,r1,n;
    shf.r.clamp.b32  r5,r1,r2,n;
    shf.r.clamp.b32  r6,r2,r3,n;
    shr.s32          r7,r3,n;     // result is sign-extended
    
    shf.r.clamp.b32  r1,r0,r0,n;  // rotate right by n; n < 32
    shf.l.clamp.b32  r1,r0,r0,n;  // rotate left by n; n < 32
    
    // extract 32-bits from [r1,r0] starting at position n < 32
    shf.r.clamp.b32  r0,r0,r1,n;