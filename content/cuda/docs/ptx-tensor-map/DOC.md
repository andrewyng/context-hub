---
name: ptx-tensor-map
description: The tensor-map is a 128-byte opaque object either in `.const` space or
  `.param` (kernel function parameter) space or `.global` space which describes the
  tensor properties and the access properties of ...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.5.8. Tensor-map

---
title: "5.5.8. Tensor-map"
section: 5.5.8
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.5.8. Tensor-map


The tensor-map is a 128-byte opaque object either in `.const` space or `.param` (kernel function parameter) space or `.global` space which describes the tensor properties and the access properties of the tensor data described in previous sections.

Tensor-Map can be created using CUDA APIs. Refer to _CUDA programming guide_ for more details.