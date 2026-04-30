---
name: ptx-testp
description: Test floating-point property.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.3.1. Floating Point Instructions:testp

---
title: "9.7.3.1. Floating Point Instructions:testp"
section: 9.7.3.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.3.1. Floating Point Instructions:testp


`testp`

Test floating-point property.

Syntax

testp.op.type  p, a;  // result is .pred
    
    .op   = { .finite, .infinite,
              .number, .notanumber,
              .normal, .subnormal };
    .type = { .f32, .f64 };

Description

`testp` tests common properties of floating-point numbers and returns a predicate value of `1` if `True` and `0` if `False`.

`testp.finite`
    

`True` if the input is not infinite or `NaN`

`testp.infinite`
    

`True` if the input is positive or negative infinity

`testp.number`
    

`True` if the input is not `NaN`

`testp.notanumber`
    

`True` if the input is `NaN`

`testp.normal`
    

`True` if the input is a normal number (not `NaN`, not infinity)

`testp.subnormal`
    

`True` if the input is a subnormal number (not `NaN`, not infinity)

As a special case, positive and negative zero are considered normal numbers.

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

Requires `sm_20` or higher.

Examples

testp.notanumber.f32  isnan, f0;
    testp.infinite.f64    p, X;