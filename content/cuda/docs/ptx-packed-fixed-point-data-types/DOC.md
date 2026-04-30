---
name: ptx-packed-fixed-point-data-types
description: PTX supports `.s2f6x2` packed fixed-point data type consisting of two
  `.s2f6` packed fixed-point values. A register variable containing `.s2f6x2` value
  must be declared with `.b16` type. Packed fixed-...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.2.5.3. Packed Fixed-Point Data Types

---
title: "5.2.5.3. Packed Fixed-Point Data Types"
section: 5.2.5.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.2.5.3. Packed Fixed-Point Data Types


PTX supports `.s2f6x2` packed fixed-point data type consisting of two `.s2f6` packed fixed-point values. A register variable containing `.s2f6x2` value must be declared with `.b16` type. Packed fixed-point data type cannot be used as fundamental type and is only supported as instruction type.