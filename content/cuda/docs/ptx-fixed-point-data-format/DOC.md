---
name: ptx-fixed-point-data-format
description: 'PTX supports following fixed-point data formats:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.2.4. Fixed-point Data format

---
title: "5.2.4. Fixed-point Data format"
section: 5.2.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.2.4. Fixed-point Data format


PTX supports following fixed-point data formats:

`s2f6` data format:
    

This data format is 8-bit signed 2’s complement integer with 2 sign-integer bits and 6 fractional bits with form **xx.xxxxxx**. The `s2f6` encoding does not support infinity and `NaN`.

`s2f6` value = s8 value * 2^(-6) Positive max representation = 01.111111 = 127 * 2^(-6) = 1.984375 Negative max representation = 10.000000 = -128 * 2^(-6) = -2.0