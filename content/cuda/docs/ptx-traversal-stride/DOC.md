---
name: ptx-traversal-stride
description: The traversal stride, in im2col mode, does not impact the total number
  of elements (or pixels) being accessed unlike the tiled mode. Pixels-per-Column
  determines the total number of elements being acc...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.5.4.2. Traversal Stride

---
title: "5.5.4.2. Traversal Stride"
section: 5.5.4.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.5.4.2. Traversal Stride


The traversal stride, in im2col mode, does not impact the total number of elements (or pixels) being accessed unlike the tiled mode. Pixels-per-Column determines the total number of elements being accessed, in im2col mode.

The number of elements traversed along the D, H and W dimensions is strided by the traversal stride for that dimension.

The following example with [Figure 15](<#tensor-im2col-mode-example3>) illustrates accesse with traversal-strides:

Tensor Size[0] = 64
    Tensor Size[1] = 8
    Tensor Size[2] = 14
    Tensor Size[3] = 64
    Traversal Stride = 2
    Pixels-per-Column = 32
    channels-per-pixel = 16
    Bounding-Box Lower-Corner W = -1
    Bounding-Box Lower-Corner H = -1
    Bounding-Box Upper-Corner W = -1
    Bounding-Box Upper-Corner H = -1.
    Tensor coordinates in the instruction = (7, 7, 5, 0)
    Im2col offsets in the instruction : (1, 1)

![_images/tensor-im2col-mode-example3.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-im2col-mode-example3.png)

Figure 15 im2col mode traversal stride example