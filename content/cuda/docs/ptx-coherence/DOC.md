---
name: ptx-coherence
description: "If a write W precedes an _overlapping_ write W\u2019 in _causality order_\
  \ , then W must precede W\u2019 in _coherence order_."
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.10.1. Coherence

---
title: "8.10.1. Coherence"
section: 8.10.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.10.1. Coherence


If a write W precedes an _overlapping_ write W’ in _causality order_ , then W must precede W’ in _coherence order_.