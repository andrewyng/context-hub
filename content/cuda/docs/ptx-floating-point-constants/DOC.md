---
name: ptx-floating-point-constants
description: Floating-point constants are represented as 64-bit double-precision values,
  and all floating-point constant expressions are evaluated using 64-bit double precision
  arithmetic. The only exception is th...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 4.5.2. Floating-Point Constants

---
title: "4.5.2. Floating-Point Constants"
section: 4.5.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 4.5.2. Floating-Point Constants


Floating-point constants are represented as 64-bit double-precision values, and all floating-point constant expressions are evaluated using 64-bit double precision arithmetic. The only exception is the 32-bit hex notation for expressing an exact single-precision floating-point value; such values retain their exact 32-bit single-precision value and may not be used in constant expressions. Each 64-bit floating-point constant is converted to the appropriate floating-point size based on the data or instruction type at its use.

Floating-point literals may be written with an optional decimal point and an optional signed exponent. Unlike C and C++, there is no suffix letter to specify size; literals are always represented in 64-bit double-precision format.

PTX includes a second representation of floating-point constants for specifying the exact machine representation using a hexadecimal constant. To specify IEEE 754 double-precision floating point values, the constant begins with `0d` or `0D` followed by 16 hex digits. To specify IEEE 754 single-precision floating point values, the constant begins with `0f` or `0F` followed by 8 hex digits.

0[fF]{hexdigit}{8}      // single-precision floating point
    0[dD]{hexdigit}{16}     // double-precision floating point

Example

mov.f32  $f3, 0F3f800000;       //  1.0