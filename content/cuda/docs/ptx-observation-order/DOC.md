---
name: ptx-observation-order
description: _Observation order_ relates a write W to a read R through an optional
  sequence of atomic read-modify-write operations.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.9.2. Observation Order

---
title: "8.9.2. Observation Order"
section: 8.9.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.9.2. Observation Order


_Observation order_ relates a write W to a read R through an optional sequence of atomic read-modify-write operations.

A write W precedes a read R in _observation order_ if:

1. R and W are _morally strong_ and R reads the value written by W, or

  2. For some atomic operation Z, W precedes Z and Z precedes R in _observation order_.