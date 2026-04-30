---
name: ptx-manipulating-predicates
description: 'Predicate values may be computed and manipulated using the following
  instructions: `and`, `or`, `xor`, `not`, and `mov`.'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.3.2. Manipulating Predicates

---
title: "9.3.2. Manipulating Predicates"
section: 9.3.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 9.3.2. Manipulating Predicates


Predicate values may be computed and manipulated using the following instructions: `and`, `or`, `xor`, `not`, and `mov`.

There is no direct conversion between predicates and integer values, and no direct way to load or store predicate register values. However, `setp` can be used to generate a predicate from an integer, and the predicate-based select (`selp`) instruction can be used to generate an integer value based on the value of a predicate; for example:

selp.u32 %r1,1,0,%p;    // convert predicate to 32-bit value