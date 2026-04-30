---
name: ptx-rounding-modifiers
description: Conversion instructions may specify a rounding modifier. In PTX, there
  are four integer rounding modifiers and six floating-point rounding modifiers. [Table
  17](<#rounding-modifiers-floating-point-rou...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 6.5.2. Rounding Modifiers

---
title: "6.5.2. Rounding Modifiers"
section: 6.5.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 6.5.2. Rounding Modifiers


Conversion instructions may specify a rounding modifier. In PTX, there are four integer rounding modifiers and six floating-point rounding modifiers. [Table 17](<#rounding-modifiers-floating-point-rounding-modifiers>) and [Table 18](<#rounding-modifiers-integer-rounding-modifiers>) summarize the rounding modifiers.

Table 17 Floating-Point Rounding Modifiers Modifier | Description  
---|---  
`.rn` | rounds to nearest even  
`.rna` | rounds to nearest, ties away from zero  
`.rz` | rounds towards zero  
`.rm` | rounds towards negative infinity  
`.rp` | rounds towards positive infinity  
`.rs` | rounds either towards zero or away from zero based on the carry out of the integer addition of random bits and the discarded bits of mantissa

Table 18 Integer Rounding Modifiers Modifier | Description  
---|---  
`.rni` | round to nearest integer, choosing even integer if source is equidistant between two integers.  
`.rzi` | round to nearest integer in the direction of zero  
`.rmi` | round to nearest integer in direction of negative infinity  
`.rpi` | round to nearest integer in direction of positive infinity