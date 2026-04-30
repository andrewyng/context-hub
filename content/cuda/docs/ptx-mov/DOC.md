---
name: ptx-mov
description: Move vector-to-scalar (pack) or scalar-to-vector (unpack).
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.4. Data Movement and Conversion Instructions:mov

---
title: "9.7.9.4. Data Movement and Conversion Instructions:mov"
section: 9.7.9.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.4. Data Movement and Conversion Instructions:mov


`mov`

Move vector-to-scalar (pack) or scalar-to-vector (unpack).

Syntax

mov.type  d, a;
    
    .type = { .b16, .b32, .b64, .b128 };

Description

Write scalar register `d` with the packed value of vector register `a`, or write vector register `d` with the unpacked values from scalar register `a`.

When destination operand `d` is a vector register, the sink symbol `'_'` may be used for one or more elements provided that at least one element is a scalar register.

For bit-size types, `mov` may be used to pack vector elements into a scalar register or unpack sub-fields of a scalar register into a vector. Both the overall size of the vector and the size of the scalar must match the size of the instruction type.

Semantics

// pack two 8-bit elements into .b16
    d = a.x | (a.y << 8)
    // pack four 8-bit elements into .b32
    d = a.x | (a.y << 8)  | (a.z << 16) | (a.w << 24)
    // pack two 16-bit elements into .b32
    d = a.x | (a.y << 16)
    // pack four 16-bit elements into .b64
    d = a.x | (a.y << 16)  | (a.z << 32) | (a.w << 48)
    // pack two 32-bit elements into .b64
    d = a.x | (a.y << 32)
    // pack four 32-bit elements into .b128
    d = a.x | (a.y << 32)  | (a.z << 64) | (a.w << 96)
    // pack two 64-bit elements into .b128
    d = a.x | (a.y << 64)
    
    // unpack 8-bit elements from .b16
    { d.x, d.y } = { a[0..7], a[8..15] }
    // unpack 8-bit elements from .b32
    { d.x, d.y, d.z, d.w }
            { a[0..7], a[8..15], a[16..23], a[24..31] }
    
    // unpack 16-bit elements from .b32
    { d.x, d.y }  = { a[0..15], a[16..31] }
    // unpack 16-bit elements from .b64
    { d.x, d.y, d.z, d.w } =
            { a[0..15], a[16..31], a[32..47], a[48..63] }
    
    // unpack 32-bit elements from .b64
    { d.x, d.y } = { a[0..31], a[32..63] }
    
    // unpack 32-bit elements from .b128
    { d.x, d.y, d.z, d.w } =
            { a[0..31], a[32..63], a[64..95], a[96..127] }
    // unpack 64-bit elements from .b128
    { d.x, d.y } = { a[0..63], a[64..127] }

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Support for `.b128` type introduced in PTX ISA version 8.3.

Target ISA Notes

Supported on all target architectures.

Support for `.b128` type requires `sm_70` or higher.

Examples

mov.b32 %r1,{a,b};      // a,b have type .u16
    mov.b64 {lo,hi}, %x;    // %x is a double; lo,hi are .u32
    mov.b32 %r1,{x,y,z,w};  // x,y,z,w have type .b8
    mov.b32 {r,g,b,a},%r1;  // r,g,b,a have type .u8
    mov.b64 {%r1, _}, %x;   // %x is.b64, %r1 is .b32
    mov.b128 {%b1, %b2}, %y;   // %y is.b128, %b1 and % b2 are .b64
    mov.b128 %y, {%b1, %b2};   // %y is.b128, %b1 and % b2 are .b64