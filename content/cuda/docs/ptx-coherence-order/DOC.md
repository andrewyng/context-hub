---
name: ptx-coherence-order
description: There exists a partial transitive order that relates _overlapping_ write
  operations, determined at runtime, called the _coherence order_ 1. Two _overlapping_
  write operations are related in _coherence...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.9.6. Coherence Order

---
title: "8.9.6. Coherence Order"
section: 8.9.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.9.6. Coherence Order


There exists a partial transitive order that relates _overlapping_ write operations, determined at runtime, called the _coherence order_ 1. Two _overlapping_ write operations are related in _coherence order_ if they are _morally strong_ or if they are related in _causality order_. Two _overlapping_ writes are unrelated in _coherence order_ if they are in a _data-race_ , which gives rise to the partial nature of _coherence order_.

1 _Coherence order_ cannot be observed directly since it consists entirely of write operations. It may be observed indirectly by its use in constraining the set of candidate writes that a read operation may read from.