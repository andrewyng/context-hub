---
name: ptx-initialization
description: Each byte in memory is initialized by a hypothetical write _W0_ executed
  before starting any thread in the program. If the byte is included in a program
  variable, and that variable has an initial valu...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.2.6. Initialization

---
title: "8.2.6. Initialization"
section: 8.2.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.2.6. Initialization


Each byte in memory is initialized by a hypothetical write _W0_ executed before starting any thread in the program. If the byte is included in a program variable, and that variable has an initial value, then _W0_ writes the corresponding initial value for that byte; else _W0_ is assumed to have written an unknown but constant value to the byte.