---
name: ptx-variable-declarations
description: All storage for data is specified with variable declarations. Every variable
  must reside in one of the state spaces enumerated in the previous section.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.4.1. Variable Declarations

---
title: "5.4.1. Variable Declarations"
section: 5.4.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.4.1. Variable Declarations


All storage for data is specified with variable declarations. Every variable must reside in one of the state spaces enumerated in the previous section.

A variable declaration names the space in which the variable resides, its type and size, its name, an optional array size, an optional initializer, and an optional fixed address for the variable.

Predicate variables may only be declared in the register state space.

Examples

.global .u32 loc;
    .reg    .s32 i;
    .const  .f32 bias[] = {-1.0, 1.0};
    .global .u8  bg[4] = {0, 0, 0, 0};
    .reg    .v4 .f32 accel;
    .reg    .pred p, q, r;