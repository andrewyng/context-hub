---
name: ptx-swizzling-modes
description: 'The layout of the data in the shared memory can be different to that
  of global memory, for access performance reasons. The following describes various
  swizzling modes:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.5.7. Swizzling Modes

---
title: "5.5.7. Swizzling Modes"
section: 5.5.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 5.5.7. Swizzling Modes


The layout of the data in the shared memory can be different to that of global memory, for access performance reasons. The following describes various swizzling modes:

* No swizzle mode:

There is no swizzling in this mode and the destination data layout is exactly similar to the source data layout.

0 | 1 | 2 | 3 | 4 | 5 | 6 | 7  
---|---|---|---|---|---|---|---  
0 | 1 | 2 | 3 | 4 | 5 | 6 | 7  
… Pattern repeats …  
  * 32 byte swizzle mode:

The following table, where each elements (numbered cell) is 16 byte and the starting address is 256 bytes aligned, shows the pattern of the destination data layout:

0 | 1 | 2 | 3 | 4 | 5 | 6 | 7  
---|---|---|---|---|---|---|---  
1 | 0 | 3 | 2 | 5 | 4 | 7 | 6  
… Pattern repeats …  
  
An example of the 32 byte swizzle mode for NC/(32B)HWC(32B) tensor of 1x2x10x10xC16 dimension, with the innermost dimension holding slice of 16 channels with 2 byte/channel, is shown in [Figure 25](<#tensor-32b-swizzle>).

![_images/tensor-32B-swizzle.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-32B-swizzle.png)

Figure 25 32-byte swizzle mode example

[Figure 26](<#tensor-32b-swizzle-frag>) shows the two fragments of the tensor : one for C/(32B) = 0 and another for C/(32B) = 1.

![_images/tensor-32B-swizzle-frag.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-32B-swizzle-frag.png)

Figure 26 32-byte swizzle mode fragments

[Figure 27](<#tensor-32b-swizzle-dst>) shows the destination data layout with 32 byte swizzling.

![_images/tensor-32B-swizzle-dst.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-32B-swizzle-dst.png)

Figure 27 32-byte swizzle mode destination data layout

  * 64 byte swizzle mode:

The following table, where each elements (numbered cell) is 16 byte and the starting address is 512 bytes aligned, shows the pattern of the destination data layout:

0 | 1 | 2 | 3 | 4 | 5 | 6 | 7  
---|---|---|---|---|---|---|---  
1 | 0 | 3 | 2 | 5 | 4 | 7 | 6  
2 | 3 | 0 | 1 | 6 | 7 | 4 | 5  
3 | 2 | 1 | 0 | 7 | 6 | 5 | 4  
… Pattern repeats …  
  
An example of the 64 byte swizzle mode for NHWC tensor of 1x10x10x64 dimension, with 2 bytes / channel and 32 channels, is shown in [Figure 28](<#tensor-64b-swizzle>).

![_images/tensor-64B-swizzle.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-64B-swizzle.png)

Figure 28 64-byte swizzle mode example

Each colored cell represents 8 channels. [Figure 29](<#tensor-64b-swizzle-src>) shows the source data layout.

![_images/tensor-64B-swizzle-src.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-64B-swizzle-src.png)

Figure 29 64-byte swizzle mode source data layout

[Figure 30](<#tensor-64b-swizzle-dst>) shows the destination data layout with 64 byte swizzling.

![_images/tensor-64B-swizzle-dst.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-64B-swizzle-dst.png)

Figure 30 64-byte swizzle mode destination data layout

  * 96 byte swizzle mode:

The following table where each element (numbered cell) is 16 byte shows the swizzling pattern at the destination data layout:

0 | 1 | 2 | 3 | 4 | 5 | 6 | 7  
---|---|---|---|---|---|---|---  
1 | 0 | 3 | 2 | 5 | 4 | 7 | 6  
… Pattern repeats …  
  
An example of the data layout in global memory and its swizzled data layout in shared memory where each element (colored cell) is 16 bytes and the starting address is 256 bytes aligned is shown in [Figure 31](<#tensor-96b-swizzle>).

![_images/tensor-96B-swizzle.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-96B-swizzle.png)

Figure 31 96-byte swizzle mode example

  * 128 byte swizzle mode:

The 128-byte swizzling mode supports the following sub-modes:

    * 16-byte atomicity sub-mode:

In this sub-mode, the 16-byte of data is kept intact while swizzling.

The following table, where each elements (numbered cell) is 16 byte and the starting address is 1024 bytes aligned, shows the pattern of the destination data layout:

0 | 1 | 2 | 3 | 4 | 5 | 6 | 7  
---|---|---|---|---|---|---|---  
1 | 0 | 3 | 2 | 5 | 4 | 7 | 6  
2 | 3 | 0 | 1 | 6 | 7 | 4 | 5  
3 | 2 | 1 | 0 | 7 | 6 | 5 | 4  
4 | 5 | 6 | 7 | 0 | 1 | 2 | 3  
5 | 4 | 7 | 6 | 1 | 0 | 3 | 2  
6 | 7 | 4 | 5 | 2 | 3 | 0 | 1  
7 | 6 | 5 | 4 | 3 | 2 | 1 | 0  
… Pattern repeats …  
  
An example of the 128 byte swizzle mode for NHWC tensor of 1x10x10x64 dimension, with 2 bytes / channel and 64 channels, is shown in [Figure 32](<#tensor-128b-swizzle>).

![_images/tensor-128B-swizzle.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-128B-swizzle.png)

Figure 32 128-byte swizzle mode example

Each colored cell represents 8 channels. [Figure 33](<#tensor-128b-swizzle-src>) shows the source data layout.

![_images/tensor-128B-swizzle-src.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-128B-swizzle-src.png)

Figure 33 128-byte swizzle mode source data layout

[Figure 34](<#tensor-128b-swizzle-dst>) shows the destination data layout with 128 byte swizzling.

![_images/tensor-128B-swizzle-dst.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-128B-swizzle-dst.png)

Figure 34 128-byte swizzle mode destination data layout

    * 32-byte atomicity sub-mode:

In this sub-mode, the 32-byte of data is kept intact while swizzling.

The following table where each element (numbered cell) is 16 byte shows the swizzling pattern at the destination data layout:

0 1 | 2 3 | 4 5 | 6 7  
---|---|---|---  
2 3 | 0 1 | 6 7 | 4 5  
4 5 | 6 7 | 0 1 | 2 3  
6 7 | 4 5 | 2 3 | 0 1  
… Pattern repeats …  
  
This sub-mode requires 32 byte alignment at shared memory.

An example of the data layout in global memory and its swizzled data layout in shared memory where each element (colored cell) is 16 bytes is shown in [Figure 35](<#tensor-128b-swizzle-32b-atom>)

![_images/tensor-128B-swizzle-32B-atom.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-128B-swizzle-32B-atom.png)

Figure 35 128-byte swizzle mode example with 32-byte atomicity

    * 32-byte atomicity with 8-byte flip sub-mode:

The swizzling pattern for this sub-mode is similar to the 32-byte atomicity sub-mode except that there is a flip of adjacent 8-bytes within the 16-byte data at every alternate shared memory line.

An example of the data layout in global memory and its swizzled data layout in shared memory where each element (colored cell) is 16 bytes (two 8-byte sub-elements for each 16-byte colored cell are shown to show the flip) is shown in [Figure 36](<#tensor-128b-swizzle-32b-atom-8b-flip>)

![_images/tensor-128B-swizzle-32B-atom-8B-flip.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-128B-swizzle-32B-atom-8B-flip.png)

Figure 36 128-byte swizzle mode example with 32-byte atomicity with 8-byte flip

    * 64-byte atomicity sub-mode:

In this sub-mode, the 64-byte of data is kept intact while swizzling.

The following table where each element (numbered cell) is 16 byte shows the swizzling pattern at the destination data layout:

0 1 2 3 | 4 5 6 7  
---|---  
4 5 6 7 | 0 1 2 3  
… Pattern repeats …  
  
This sub-mode requires 64-byte alignment at shared memory.

An example of the data layout in global memory and its swizzled data layout in shared memory where each element (colored cell) is 16 bytes is shown in [Figure 37](<#tensor-128b-swizzle-64b-atom>)

![_images/tensor-128B-swizzle-64B-atom.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-128B-swizzle-64B-atom.png)

Figure 37 128-byte swizzle mode example with 64-byte atomicity

[Table 14](<#valid-combination-of-swizzle-atomicity-with-swizzling-mode>) lists the valid combination of swizzle-atomicity with the swizzling-mode.

Table 14 Valid combination of swizzle-atomicity with swizzling-mode Swizzling Mode | Swizzle-Atomicity  
---|---  
No Swizzling | –  
32B Swizzling Mode | 16B  
64B Swizzling Mode | 16B  
96B Swizzling Mode | 16B  
128B Swizzling Mode | 

  * 16B
  * 32B
  * 32B + 8B-flip
  * 64B

The value of swizzle base offset is 0 when the `dstMem` shared memory address is located at the following boundary:

Swizzling Mode | Starting address of the repeating pattern  
---|---  
128-Byte swizzle | 1024-Byte boundary  
96-Byte swizzle | 256-Byte boundary  
64-Byte swizzle | 512-Byte boundary  
32-Byte swizzle | 256-Byte boundary

Otherwise, the swizzle base offset is a non-zero value, computed using following formula:

Swizzling Mode | Formula  
---|---  
128-Byte swizzle | base offset = (dstMem / 128) % 8  
96-Byte swizzle | base offset = (dstMem / 128) % 2  
64-Byte swizzle | base offset = (dstMem / 128) % 4  
32-Byte swizzle | base offset = (dstMem / 128) % 2