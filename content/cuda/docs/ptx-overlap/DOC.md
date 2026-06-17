---
name: ptx-overlap
description: Two memory locations are said to overlap when the starting address of
  one location is within the range of bytes constituting the other location. Two memory
  operations are said to overlap when they spe...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.2.1. Overlap

---
title: "8.2.1. Overlap"
section: 8.2.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.2.1. Overlap


Two memory locations are said to overlap when the starting address of one location is within the range of bytes constituting the other location. Two memory operations are said to overlap when they specify the same virtual address and the corresponding memory locations overlap. The overlap is said to be complete when both memory locations are identical, and it is said to be partial otherwise.