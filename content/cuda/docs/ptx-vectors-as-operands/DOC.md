---
name: ptx-vectors-as-operands
description: Vector operands can be specified as source and destination operands for
  instructions. However, when specified as destination operand, all elements in vector
  expression must be unique, otherwise behavi...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 6.4.3. Vectors as Operands

---
title: "6.4.3. Vectors as Operands"
section: 6.4.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 6.4.3. Vectors as Operands


Vector operands can be specified as source and destination operands for instructions. However, when specified as destination operand, all elements in vector expression must be unique, otherwise behavior is undefined. Vectors may also be passed as arguments to called functions.

Vector elements can be extracted from the vector with the suffixes `.x`, `.y`, `.z` and `.w`, as well as the typical color fields `.r`, `.g`, `.b` and `.a`.

A brace-enclosed list is used for pattern matching to pull apart vectors.

.reg .v4 .f32 V;
    .reg .f32     a, b, c, d;
    
    mov.v4.f32 {a,b,c,d}, V;

Vector loads and stores can be used to implement wide loads and stores, which may improve memory performance. The registers in the load/store operations can be a vector, or a brace-enclosed list of similarly typed scalars. Here are examples:

ld.global.v4.f32  {a,b,c,d}, [addr+16];
    ld.global.v2.u32  V2, [addr+8];

Elements in a brace-enclosed vector, say {Ra, Rb, Rc, Rd}, correspond to extracted elements as follows:

Ra = V.x = V.r
    Rb = V.y = V.g
    Rc = V.z = V.b
    Rd = V.w = V.a