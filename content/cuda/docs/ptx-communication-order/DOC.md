---
name: ptx-communication-order
description: The _communication order_ is a non-transitive order, determined at runtime,
  that relates write operations to other _overlapping_ memory operations.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.9.7. Communication Order

---
title: "8.9.7. Communication Order"
section: 8.9.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.9.7. Communication Order


The _communication order_ is a non-transitive order, determined at runtime, that relates write operations to other _overlapping_ memory operations.

1. A write W precedes an _overlapping_ read R in _communication order_ if R returns the value of any byte that was written by W.

  2. A write W precedes a write W’ in _communication order_ if W precedes W’ in _coherence order_.

  3. A read R precedes an _overlapping_ write W in _communication order_ if, for any byte accessed by both R and W, R returns the value written by a write W’ that precedes W in _coherence order_.

_Communication order_ captures the visibility of memory operations — when a memory operation X1 precedes a memory operation X2 in _communication order_ , X1 is said to be visible to X2.