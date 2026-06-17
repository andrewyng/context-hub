---
name: ptx-not
description: "Bitwise negation; one\u2019s complement."
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.8.4. Logic and Shift Instructions:not

---
title: "9.7.8.4. Logic and Shift Instructions:not"
section: 9.7.8.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.8.4. Logic and Shift Instructions:not


`not`

Bitwise negation; one’s complement.

Syntax

not.type d, a;
    
    .type = { .pred, .b16, .b32, .b64 };

Description

Invert the bits in `a`.

Semantics

d = ~a;

Notes

The size of the operands must match, but not necessarily the type.

Allowed types include predicates.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

not.b32  mask,mask;
    not.pred  p,q;