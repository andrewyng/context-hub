---
name: ptx-texture-and-surface-properties
description: Fields `width`, `height`, and `depth` specify the size of the texture
  or surface in number of elements in each dimension.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.3.1. Texture and Surface Properties

---
title: "5.3.1. Texture and Surface Properties"
section: 5.3.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.3.1. Texture and Surface Properties


Fields `width`, `height`, and `depth` specify the size of the texture or surface in number of elements in each dimension.

The `channel_data_type` and `channel_order` fields specify these properties of the texture or surface using enumeration types corresponding to the source language API. For example, see [Channel Data Type and Channel Order Fields](<#channel-data-type-and-channel-order-fields>) for the OpenCL enumeration types currently supported in PTX.