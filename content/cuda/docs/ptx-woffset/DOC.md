---
name: ptx-woffset
description: In the convolution calculations, the same elements along the `W` dimension
  are reused for different locations within the convolution filter footprint. Based
  on the number of times a pixel is used, the...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.5.5.4. wOffset

---
title: "5.5.5.4. wOffset"
section: 5.5.5.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.5.5.4. wOffset


In the convolution calculations, the same elements along the `W` dimension are reused for different locations within the convolution filter footprint. Based on the number of times a pixel is used, the pixels may be loaded into different shared memory buffers. Each buffer can be loaded by a separate tensor copy operation.

The `wOffset` argument in the tensor copy and prefetch instruction adjusts the source pixel location for each buffer. The exact position of the buffer is adjusted along the `W` dimension using the following formula:

Bounding Box Lower Corner W += wOffset
    Bounding Box Upper Corner W += wOffset
    W += wOffset

Following are examples of tensor copy to multiple buffers with various `wHalo` and `wOffset` values:

Example 1:

Tensor Size [0] = 128
    Tensor Size [1] = 9
    Tensor Size [2] = 67
    Tensor Size [3] = 64
    Pixels-per-Column = 128
    Channels-per-pixel = 64
    Bounding Box Lower Corner W = -1
    Bounding Box Upper Corner W = 0
    Traversal Stride = 2
    
    Tensor Coordinates in the instruction = (7, 2, -1, 0)
    
    Shared memory buffer 1:
       wHalo = 1
       wOffset = 0
    
    Shared memory buffer 2:
       wHalo = 0
       wOffset = 1

![_images/tensor-im2col-w-w128-modes-example5.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-im2col-w-w128-modes-example5.png)

Figure 20 tensor copy operation to buffer 1 of Example 1

![_images/tensor-im2col-w-w128-modes-example6.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-im2col-w-w128-modes-example6.png)

Figure 21 tensor copy operation to buffer 2 of Example 1

Example 2:

Tensor Size [0] = 128
    Tensor Size [1] = 7
    Tensor Size [2] = 7
    Tensor Size [3] = 64
    Pixels-per-Column = 128
    Channels-per-pixel = 64
    Bounding Box Lower Corner W = -1
    Bounding Box Upper Corner W = -1
    Traversal Stride = 3
    
    Tensor Coordinates in the instruction = (7, 2, -1, 0)
    
    Shared memory buffer 1:
       wHalo = 0
       wOffset = 0
    
    Shared memory buffer 2:
       wHalo = 0
       wOffset = 1
    
    Shared memory buffer 3:
       wHalo = 0
       wOffset = 2

![_images/tensor-im2col-w-w128-modes-example7.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-im2col-w-w128-modes-example7.png)

Figure 22 tensor copy operation to buffer 1 of Example 2

![_images/tensor-im2col-w-w128-modes-example8.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-im2col-w-w128-modes-example8.png)

Figure 23 tensor copy operation to buffer 2 of Example 2

![_images/tensor-im2col-w-w128-modes-example9.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-im2col-w-w128-modes-example9.png)

Figure 24 tensor copy operation to buffer 3 of Example 2