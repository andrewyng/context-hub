---
name: ptx-memory-operations-on-packed-data-types
description: A packed data type consists of two values of the same scalar data type,
  as described in [Packed Data Types](<#packed-data-types>). These values are accessed
  in adjacent memory locations. A memory oper...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.2.5. Memory Operations on Packed Data Types

---
title: "8.2.5. Memory Operations on Packed Data Types"
section: 8.2.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.2.5. Memory Operations on Packed Data Types


A packed data type consists of two values of the same scalar data type, as described in [Packed Data Types](<#packed-data-types>). These values are accessed in adjacent memory locations. A memory operation on a packed data type is modelled as a pair of equivalent memory operations on the scalar data type, executed in an unspecified order on each element of the packed data.