---
name: ptx-cvtpack
description: Convert two integer values from one integer type to another and pack
  the results.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.22. Data Movement and Conversion Instructions:cvt.pack

---
title: "9.7.9.22. Data Movement and Conversion Instructions:cvt.pack"
section: 9.7.9.22
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.22. Data Movement and Conversion Instructions:cvt.pack


`cvt.pack`

Convert two integer values from one integer type to another and pack the results.

Syntax

cvt.pack.sat.convertType.abType  d, a, b;
        .convertType  = { .u16, .s16 }
        .abType       = { .s32 }
    
    cvt.pack.sat.convertType.abType.cType  d, a, b, c;
        .convertType  = { .u2, .s2, .u4, .s4, .u8, .s8 }
        .abType       = { .s32 }
        .cType        = { .b32 }

Description

Convert two 32-bit integers `a` and `b` into specified type and pack the results into `d`.

Destination `d` is an unsigned 32-bit integer. Source operands `a` and `b` are integers of type `.abType` and the source operand `c` is an integer of type `.cType`.

The inputs `a` and `b` are converted to values of type specified by `.convertType` with saturation and the results after conversion are packed into lower bits of `d`.

If operand `c` is specified then remaining bits of `d` are copied from lower bits of `c`.

Semantics

ta = a < MIN(convertType) ? MIN(convertType) : a;
    ta = a > MAX(convertType) ? MAX(convertType) : a;
    tb = b < MIN(convertType) ? MIN(convertType) : b;
    tb = b > MAX(convertType) ? MAX(convertType) : b;
    
    size = sizeInBits(convertType);
    td = tb ;
    for (i = size; i <= 2 * size - 1; i++) {
        td[i] = ta[i - size];
    }
    
    if (isU16(convertType) || isS16(convertType)) {
        d = td;
    } else {
        for (i = 0; i < 2 * size; i++) {
            d[i] = td[i];
        }
        for (i = 2 * size; i <= 31; i++) {
            d[i] = c[i - 2 * size];
        }
    }

`.sat` modifier limits the converted values to `MIN(convertType)`.. `MAX(convertedType)` (no overflow) if the corresponding inputs are not in the range of datatype specified as `.convertType`.

PTX ISA Notes

Introduced in PTX ISA version 6.5.

Target ISA Notes

Requires `sm_72` or higher.

Sub byte types (`.u4`/`.s4` and `.u2`/`.s2`) requires `sm_75` or higher.

Examples

cvt.pack.sat.s16.s32      %r1, %r2, %r3;           // 32-bit to 16-bit conversion
    cvt.pack.sat.u8.s32.b32   %r4, %r5, %r6, 0;        // 32-bit to 8-bit conversion
    cvt.pack.sat.u8.s32.b32   %r7, %r8, %r9, %r4;      // %r7 = { %r5, %r6, %r8, %r9 }
    cvt.pack.sat.u4.s32.b32   %r10, %r12, %r13, %r14;  // 32-bit to 4-bit conversion
    cvt.pack.sat.s2.s32.b32   %r15, %r16, %r17, %r18;  // 32-bits to 2-bit conversion