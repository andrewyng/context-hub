---
name: ptx-predicate-constants
description: In PTX, integer constants may be used as predicates. For predicate-type
  data initializers and instruction operands, integer constants are interpreted as
  in C, i.e., zero values are `False` and non-zer...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 4.5.3. Predicate Constants

---
title: "4.5.3. Predicate Constants"
section: 4.5.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 4.5.3. Predicate Constants


In PTX, integer constants may be used as predicates. For predicate-type data initializers and instruction operands, integer constants are interpreted as in C, i.e., zero values are `False` and non-zero values are `True`.