---
name: ptx-whalo
description: In `im2col::w` mode, the `wHalo` argument in the PTX instruction specifies
  how many filter halo elements must be loaded at the end of the image.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.5.5.3. wHalo

---
title: "5.5.5.3. wHalo"
section: 5.5.5.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.5.5.3. wHalo


In `im2col::w` mode, the `wHalo` argument in the PTX instruction specifies how many filter halo elements must be loaded at the end of the image.

In `im2col::w::128` mode, the halo elements are loaded after every 32 elements in the bounding box along the `W` dimension. The `wHalo` argument in the PTX instruction specifies how many halo elements must be loaded after every 32 elements.

Following is an example of `.im2col::w` mode access:

Tensor Size [0] = 128
    Tensor Size [1] = 9
    Tensor Size [2] = 7
    Tensor Size [3] = 64
    Pixels-per-column = 128
    Channels-per-pixel = 64
    Bounding Box Lower Corner W = 0
    Bounding Box Upper Corner W = 0
    
    Tensor Coordinates in the instruction = (7, 2, 3, 0)
    wHalo in the instruction = 2 (as 3x3 convolution filter is used)

A tensor copy operation with the above parameters loads 128 pixels and the two halo pixels as shown in [Figure 18](<#tensor-im2col-w-w128-modes-example3>).

![_images/tensor-im2col-w-w128-modes-example3.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-im2col-w-w128-modes-example3.png)

Figure 18 tensor copy operation with im2col::w mode example

The halo pixels are always loaded in the shared memory next to the main row pixels as shown in [Figure 18](<#tensor-im2col-w-w128-modes-example3>).

Following is an example of `.im2col::w::128` mode access:

Tensor Size [0] = 128
    Tensor Size [1] = 9
    Tensor Size [2] = 7
    Tensor Size [3] = 64
    Channels-per-pixel = 64
    Bounding Box Lower Corner W = 0
    Bounding Box Upper Corner W = 0
    
    Tensor Coordinates in the instruction = (7, 2, 3, 0)
    wHalo in the instruction = 2 (as 3x3 convolution filter is used)

A tensor copy operation with the above parameters loads 128 elements such that after every 32 elements, wHalo number of elements are loaded as shown in [Figure 19](<#tensor-im2col-w-w128-modes-example4>).

![_images/tensor-im2col-w-w128-modes-example4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-im2col-w-w128-modes-example4.png)

Figure 19 tensor copy operation with im2col::w::128 mode example