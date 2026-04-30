---
name: ptx-packed-integer-data-types
description: 'PTX supports two variants of packed integer data types: `.u16x2` and
  `.s16x2`. The packed data type consists of two `.u16` or `.s16` values. A register
  variable containing `.u16x2` or `.s16x2` data mu...'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.2.5.2. Packed Integer Data Types

---
title: "5.2.5.2. Packed Integer Data Types"
section: 5.2.5.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.2.5.2. Packed Integer Data Types


PTX supports two variants of packed integer data types: `.u16x2` and `.s16x2`. The packed data type consists of two `.u16` or `.s16` values. A register variable containing `.u16x2` or `.s16x2` data must be declared with `.b32` type. Packed integer data types cannot be used as fundamental types. They are supported as instruction types on certain instructions.