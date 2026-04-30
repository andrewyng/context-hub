---
name: ptx-arrays-as-operands
description: Arrays of all types can be declared, and the identifier becomes an address
  constant in the space where the array is declared. The size of the array is a constant
  in the program.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 6.4.2. Arrays as Operands

---
title: "6.4.2. Arrays as Operands"
section: 6.4.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 6.4.2. Arrays as Operands


Arrays of all types can be declared, and the identifier becomes an address constant in the space where the array is declared. The size of the array is a constant in the program.

Array elements can be accessed using an explicitly calculated byte address, or by indexing into the array using square-bracket notation. The expression within square brackets is either a constant integer, a register variable, or a simple _register with constant offset_ expression, where the offset is a constant expression that is either added or subtracted from a register variable. If more complicated indexing is desired, it must be written as an address calculation prior to use. Examples are:

ld.global.u32  s, a[0];
    ld.global.u32  s, a[N-1];
    mov.u32        s, a[1];  // move address of a[1] into s