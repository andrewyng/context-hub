---
name: ptx-memory-operations-on-vector-data-types
description: The memory consistency model relates operations executed on memory locations
  with scalar data types, which have a maximum size and alignment of 64 bits. Memory
  operations with a vector data type are m...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.2.4. Memory Operations on Vector Data Types

---
title: "8.2.4. Memory Operations on Vector Data Types"
section: 8.2.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.2.4. Memory Operations on Vector Data Types


The memory consistency model relates operations executed on memory locations with scalar data types, which have a maximum size and alignment of 64 bits. Memory operations with a vector data type are modelled as a set of equivalent memory operations with a scalar data type, executed in an unspecified order on the elements in the vector.