---
name: ptx-conflict-and-data-races
description: Two _overlapping_ memory operations are said to _conflict_ when at least
  one of them is a _write_.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.7.1. Conflict and Data-races

---
title: "8.7.1. Conflict and Data-races"
section: 8.7.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.7.1. Conflict and Data-races


Two _overlapping_ memory operations are said to _conflict_ when at least one of them is a _write_.

Two _conflicting_ memory operations are said to be in a _data-race_ if they are not related in _causality order_ and they are not _morally strong_.