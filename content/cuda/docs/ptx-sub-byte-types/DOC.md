---
name: ptx-sub-byte-types
description: 'The sub-byte types are expected to packed contiguously in the global
  memory and the Tensor copy instruction will expand them by appending empty spaces
  as shown below:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.5.1.1. Sub-byte Types

---
title: "5.5.1.1. Sub-byte Types"
section: 5.5.1.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.5.1.1. Sub-byte Types


#####  5.5.1.1.1. [Padding and alignment of the sub-byte types](<#tensor-dimension-size-format-sub-bytes-padding-align>)

The sub-byte types are expected to packed contiguously in the global memory and the Tensor copy instruction will expand them by appending empty spaces as shown below:

  1. Type `.b4x16`: With this type, there is no padding involved and the packed sixteen `.b4` elements in a 64-bits container is copied as is between the shared memory and the global memory.

  2. Type `.b4x16_p64`: With this type, sixteen contiguous 4-bits of data is copied from global memory to the shared memory with the append of 64-bits of padding as shown in [Figure 5](<#tensor-dimension-size-format-sub-bytes-padding-align-b4-16-p64>)

![_images/tensor-dimension-size-format-sub-bytes-padding-align-b4-16-p64.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-dimension-size-format-sub-bytes-padding-align-b4-16-p64.png)

Figure 5 Layout for .b4x16_p64

The padded region that gets added is un-initialized.

  3. Type `.b6x16_p32`: With this type, sixteen 6-bits of data is copied from global memory to the shared memory with an append of 32-bits of padding as shown in [Figure 6](<#tensor-dimension-size-format-sub-bytes-padding-align-b6-16-p32>)

![_images/tensor-dimension-size-format-sub-bytes-padding-align-b6-16-p32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-dimension-size-format-sub-bytes-padding-align-b6-16-p32.png)

Figure 6 Layout for .b6x16_p32

The padded region that gets added is un-initialized.

  4. Type `.b6p2x16`: With this type, sixteen elements, each containing 6-bits of data at the LSB and 2-bits of padding at the MSB, are copied from shared memory into the global memory by discarding the 2-bits of padding data and packing the 6-bits data contiguously as shown in [Figure 7](<#tensor-dimension-size-format-sub-bytes-padding-align-b6-p2-16>)

![_images/tensor-dimension-size-format-sub-bytes-padding-align-b6-p2-16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tensor-dimension-size-format-sub-bytes-padding-align-b6-p2-16.png)

Figure 7 Layout for .b6p2x16


In case of `.b6x16_p32` and `.b4x16_p64`, the padded region that gets added is un-initialized.

The types `.b6x16_p32` and `.b6p2x16` share the same encoding value in the descriptor (value 15) as the two types are applicable for different types of tensor copy operations:

Type | Valid Tensor Copy Direction  
---|---  
`.b6x16_p32` | `.shared::cluster.global`, `.shared::cta.global`  
`.b6p2x16` | `.global.shared::cta`