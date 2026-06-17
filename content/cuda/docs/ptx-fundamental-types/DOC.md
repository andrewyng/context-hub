---
name: ptx-fundamental-types
description: In PTX, the fundamental types reflect the native data types supported
  by the target architectures. A fundamental type specifies both a basic type and
  a size. Register variables are always of a fundame...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.2.1. Fundamental Types

---
title: "5.2.1. Fundamental Types"
section: 5.2.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.2.1. Fundamental Types


In PTX, the fundamental types reflect the native data types supported by the target architectures. A fundamental type specifies both a basic type and a size. Register variables are always of a fundamental type, and instructions operate on these types. The same type-size specifiers are used for both variable definitions and for typing instructions, so their names are intentionally short.

[Table 8](<#fundamental-types-fundamental-type-specifiers>) lists the fundamental type specifiers for each basic type:

Table 8 Fundamental Type Specifiers Basic Type | Fundamental Type Specifiers  
---|---  
Signed integer | `.s8`, `.s16`, `.s32`, `.s64`  
Unsigned integer | `.u8`, `.u16`, `.u32`, `.u64`  
Floating-point | `.f16`, `.f16x2`, `.f32`, `.f64`  
Bits (untyped) | `.b8`, `.b16`, `.b32`, `.b64`, `.b128`  
Predicate | `.pred`

Most instructions have one or more type specifiers, needed to fully specify instruction behavior. Operand types and sizes are checked against instruction types for compatibility.

Two fundamental types are compatible if they have the same basic type and are the same size. Signed and unsigned integer types are compatible if they have the same size. The bit-size type is compatible with any fundamental type having the same size.

In principle, all variables (aside from predicates) could be declared using only bit-size types, but typed variables enhance program readability and allow for better operand type checking.