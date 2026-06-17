---
name: ptx-array-declarations
description: Array declarations are provided to allow the programmer to reserve space.
  To declare an array, the variable name is followed with dimensional declarations
  similar to fixed-size array declarations in C...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.4.3. Array Declarations

---
title: "5.4.3. Array Declarations"
section: 5.4.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.4.3. Array Declarations


Array declarations are provided to allow the programmer to reserve space. To declare an array, the variable name is followed with dimensional declarations similar to fixed-size array declarations in C. The size of each dimension is a constant expression.

Examples

.local  .u16 kernel[19][19];
    .shared .u8  mailbox[128];

The size of the array specifies how many elements should be reserved. For the declaration of array _kernel_ above, 19*19 = 361 halfwords are reserved, for a total of 722 bytes.

When declared with an initializer, the first dimension of the array may be omitted. The size of the first array dimension is determined by the number of elements in the array initializer.

Examples

.global .u32 index[] = { 0, 1, 2, 3, 4, 5, 6, 7 };
    .global .s32 offset[][2] = { {-1, 0}, {0, -1}, {1, 0}, {0, 1} };

Array _index_ has eight elements, and array _offset_ is a 4x2 array.