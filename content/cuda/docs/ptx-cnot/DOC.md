---
name: ptx-cnot
description: C/C++ style logical negation.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.8.5. Logic and Shift Instructions:cnot

---
title: "9.7.8.5. Logic and Shift Instructions:cnot"
section: 9.7.8.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.8.5. Logic and Shift Instructions:cnot


`cnot`

C/C++ style logical negation.

Syntax

cnot.type d, a;
    
    .type = { .b16, .b32, .b64 };

Description

Compute the logical negation using C/C++ semantics.

Semantics

d = (a==0) ? 1 : 0;

Notes

The size of the operands must match, but not necessarily the type.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

cnot.b32 d,a;