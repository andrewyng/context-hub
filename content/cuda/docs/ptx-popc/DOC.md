---
name: ptx-popc
description: Population count.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.1.14. Integer Arithmetic Instructions:popc

---
title: "9.7.1.14. Integer Arithmetic Instructions:popc"
section: 9.7.1.14
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.1.14. Integer Arithmetic Instructions:popc


`popc`

Population count.

Syntax

popc.type  d, a;
    
    .type = { .b32, .b64 };

Description

Count the number of one bits in `a` and place the resulting _population count_ in 32-bit destination register `d`. Operand `a` has the instruction type and destination `d` has type `.u32`.

Semantics

.u32  d = 0;
    while (a != 0) {
       if (a & 0x1)  d++;
       a = a >> 1;
    }

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`popc` requires `sm_20` or higher.

Examples

popc.b32  d, a;
    popc.b64  cnt, X;  // cnt is .u32