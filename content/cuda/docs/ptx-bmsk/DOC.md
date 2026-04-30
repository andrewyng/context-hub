---
name: ptx-bmsk
description: Bit Field Mask.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.22. Integer Arithmetic Instructions:bmsk

---
title: "9.7.1.22. Integer Arithmetic Instructions:bmsk"
section: 9.7.1.22
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.22. Integer Arithmetic Instructions:bmsk


`bmsk`

Bit Field Mask.

Syntax

bmsk.mode.b32  d, a, b;
    
    .mode = { .clamp, .wrap };

Description

Generates a 32-bit mask starting from the bit position specified in operand `a`, and of the width specified in operand `b`. The generated bitmask is stored in the destination operand `d`.

The resulting bitmask is 0 in the following cases:

* When the value of `a` is 32 or higher and `.mode` is `.clamp`.

  * When either the specified value of `b` or the wrapped value of `b` (when `.mode` is specified as `.wrap`) is 0.

Semantics

a1    = a & 0x1f;
    mask0 = (~0) << a1;
    b1    = b & 0x1f;
    sum   = a1 + b1;
    mask1 = (~0) << sum;
    
    sum-overflow          = sum >= 32 ? true : false;
    bit-position-overflow = false;
    bit-width-overflow    = false;
    
    if (.mode == .clamp) {
        if (a >= 32) {
            bit-position-overflow = true;
            mask0 = 0;
        }
        if (b >= 32) {
            bit-width-overflow = true;
        }
    }
    
    if (sum-overflow || bit-position-overflow || bit-width-overflow) {
        mask1 = 0;
    } else if (b1 == 0) {
        mask1 = ~0;
    }
    d = mask0 & ~mask1;

Notes

The bitmask width specified by operand `b` is limited to range `0..32` in `.clamp` mode and to range `0..31` in `.wrap` mode.

PTX ISA Notes

Introduced in PTX ISA version 7.6.

Target ISA Notes

`bmsk` requires `sm_70` or higher.

Examples

bmsk.clamp.b32  rd, ra, rb;
    bmsk.wrap.b32   rd, 1, 2; // Creates a bitmask of 0x00000006.