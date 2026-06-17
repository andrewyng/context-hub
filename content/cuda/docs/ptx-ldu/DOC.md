---
name: ptx-ldu
description: Load read-only data from an address that is common across threads in
  the warp.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.10. Data Movement and Conversion Instructions:ldu

---
title: "9.7.9.10. Data Movement and Conversion Instructions:ldu"
section: 9.7.9.10
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.10. Data Movement and Conversion Instructions:ldu


`ldu`

Load read-only data from an address that is common across threads in the warp.

Syntax

ldu{.ss}.type      d, [a];       // load from address
    ldu{.ss}.vec.type  d, [a];       // vec load from address
    
    .ss   = { .global };             // state space
    .vec  = { .v2, .v4 };
    .type = { .b8, .b16, .b32, .b64, .b128,
              .u8, .u16, .u32, .u64,
              .s8, .s16, .s32, .s64,
                         .f32, .f64 };

Description

Load _read-only_ data into register variable `d` from the location specified by the source address operand `a` in the global state space, where the address is guaranteed to be the same across all threads in the warp. If no state space is given, perform the load using [Generic Addressing](<#generic-addressing>).

Supported addressing modes for operand `a` and alignment requirements are described in [Addresses as Operands](<#addresses-as-operands>).

Semantics

d = a;             // named variable a
    d = *(&a+immOff)   // variable-plus-offset
    d = *a;            // register
    d = *(a+immOff);   // register-plus-offset
    d = *(immAddr);    // immediate address

Notes

Destination `d` must be in the `.reg` state space.

A destination register wider than the specified type may be used. The value loaded is sign-extended to the destination register width for signed integers, and is zero-extended to the destination register width for unsigned and bit-size types. See [Table 28](<#operand-size-exceeding-instruction-type-size-relaxed-type-checking-rules-destination-operands>) for a description of these relaxed type-checking rules.

`.f16` data may be loaded using `ldu.b16`, and then converted to `.f32` or `.f64` using `cvt` or can be used in half precision floating point instructions.

`.f16x2` data may be loaded using `ldu.b32` and then used in half precision floating point instructions.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Support for `.b128` type introduced in PTX ISA version 8.3.

Target ISA Notes

`ldu.f64` requires `sm_13` or higher.

Support for `.b128` type requires `sm_70` or higher.

Examples

ldu.global.f32    d,[a];
    ldu.global.b32    d,[p+4];
    ldu.global.v4.f32 Q,[p];
    ldu.global.b128   d,[a];