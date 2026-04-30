---
name: ptx-warpgroup
description: A warpgroup is a set of four contiguous warps such that the _warp-rank_
  of the first warp is a multiple of 4.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.15.1. Warpgroup

---
title: "9.7.15.1. Warpgroup"
section: 9.7.15.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.15.1. Warpgroup


A warpgroup is a set of four contiguous warps such that the _warp-rank_ of the first warp is a multiple of 4.

warp-rank of a warp is defined as:

(%tid.x + %tid.y * %ntid.x  + %tid.z * %ntid.x * %ntid.y) / 32