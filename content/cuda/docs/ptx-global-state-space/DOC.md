---
name: ptx-global-state-space
description: The global (`.global`) state space is memory that is accessible by all
  threads in a context. It is the mechanism by which threads in different CTAs, clusters,
  and grids can communicate. Use `ld.global...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.1.4. Global State Space

---
title: "5.1.4. Global State Space"
section: 5.1.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.1.4. Global State Space


The global (`.global`) state space is memory that is accessible by all threads in a context. It is the mechanism by which threads in different CTAs, clusters, and grids can communicate. Use `ld.global`, `st.global`, and `atom.global` to access global variables.

Global variables have an optional variable initializer; global variables with no explicit initializer are initialized to zero by default.