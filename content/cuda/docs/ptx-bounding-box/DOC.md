---
name: ptx-bounding-box
description: In these modes, the size of the bounding box in `D` and `H` dimensions
  are 1.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.5.5.1. Bounding Box

---
title: "5.5.5.1. Bounding Box"
section: 5.5.5.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.5.5.1. Bounding Box


In these modes, the size of the bounding box in `D` and `H` dimensions are 1.

The `D` and `H` dimensions in the tensor coordinates argument in the PTX instruction specify the position of the bounding box in the tensor space.

The Bounding-Box `Lower-Corner-W` and Bounding-Box `Upper-Corner-W` specify the two opposite corners of the Bounding Box in the `W` dimension.

The `W` dimension in the tensor coordinates argument in the PTX instruction specify the location of the first element that is to be accessed in the bounding box.

Number of pixels loaded in `im2col::w` mode is as specified by Pixels-per-Column in the TensorMap. Number of pixels loaded in `im2col::w::128` mode is always 128. So, Pixels-per-Column is ignored in `im2col::w::128` mode.

[Figure 16](<#tensor-im2col-w-w128-modes-example>) shows an example of the `im2col::w` and `im2col::w:128` modes.

![_images/tensor-im2col-w-w128-modes-example.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-im2col-w-w128-modes-example.png)

Figure 16 im2col::w and im2col::w::128 modes example

The first element can lie outside of the Bounding Box in the W-dimension only and only on the left side of the Bounding Box. [Figure 17](<#tensor-im2col-w-w128-modes-example2>) shows of an example of this.

![_images/tensor-im2col-w-w128-modes-example2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-im2col-w-w128-modes-example2.png)

Figure 17 im2col::w and im2col::w::128 modes first element outside Bounding Box example