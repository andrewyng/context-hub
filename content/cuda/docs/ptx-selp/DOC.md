---
name: ptx-selp
description: Select between source operands, based on the value of the predicate source
  operand.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.6.3. Comparison and Selection Instructions:selp

---
title: "9.7.6.3. Comparison and Selection Instructions:selp"
section: 9.7.6.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.6.3. Comparison and Selection Instructions:selp


`selp`

Select between source operands, based on the value of the predicate source operand.

Syntax

selp.type d, a, b, c;
    
    .type = { .b16, .b32, .b64,
              .u16, .u32, .u64,
              .s16, .s32, .s64,
                    .f32, .f64 };

Description

Conditional selection. If `c` is `True`, `a` is stored in `d`, `b` otherwise. Operands `d`, `a`, and `b` must be of the same type. Operand `c` is a predicate.

Semantics

d = (c == 1) ? a : b;

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

`selp.f64` requires `sm_13` or higher.

Examples

selp.s32  r0,r,g,p;
    @q  selp.f32  f0,t,x,xp;