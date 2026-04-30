---
name: ptx-major-ness-supported-by-strides
description: 'There are two strides involved while accessing a matrix from shared
  memory:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.16.3. Major-ness supported by Strides

---
title: "9.7.16.3. Major-ness supported by Strides"
section: 9.7.16.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.16.3. Major-ness supported by Strides


There are two strides involved while accessing a matrix from shared memory:

1. Leading dimension stride (byte offset or absolute address)

  2. Stride dimension byte offset

#####  9.7.16.3.1. [Leading Dimension Stride: relative offset or absolute address](<#tcgen05-leading-dimension-byte-offset>)

There are two modes of Leading Dimension Strides as described below. Bit #52 in the [Shared memory descriptor](<#tcgen05-shared-memory-descriptor>) is used to distinguish between two modes.

######  9.7.16.3.1.1. [Relative offset mode](<#tcgen05-leading-dimension-byte-offset-relative-offset>)

In this mode, the leading dimension stride is specified as a relative byte offset between the columns as explained in the below table. The leading dimension stride can either be specified as a relative offset between the columns or as an absolute byte address of next buffer. The leading dimension stride is defined differently for transposed and non-transposed matrices. The leading dimension stride is defined as follows for matrices whose element types are normalized to 128-bits:

Major-ness | Definition  
---|---  
K-Major | 

  * No-Swizzling: the stride from the first column to the second column of the 8x2 tile in the 128-bit element type normalized matrix.
  * Swizzled layouts: not used, assumed to be 1.

  
MN-Major | 

  * Interleave: stride from the first 8 columns to the next 8 columns.
  * Swizzled layouts: stride from the first (swizzle-byte-size/16) rows to the next (swizzle-byte-size/16) rows.

  
  
######  9.7.16.3.1.2. [Absolute address mode for K dimension being 48B](<#tcgen05-leading-dimension-byte-offset-absolute-address>)

The `tcgen05.mma` instruction with _K-dimension_ of 48B would overflow the 128B shared memory boundary if the data is packed contiguously.

In this case, the absolute address mode can be used to break up the data in the shared memory into two chunks such that both these chunks are laid out within the aligned 128-byte address boundary. The leading dimension absolute address can point to the second data chunk in the shared memory.

####### 9.7.16.3.1.2.1. [Restrictions on the Leading Dimension Absolute Address Stride](<#tcgen05-leading-dimension-byte-offset-absolute-address-restriction>)

Following are the restrictions on the absolute address stride mode:

  1. Only 128B swizzle (with 16B atomicity) is supported.

  2. Only K-Major mode is supported. That is, the transpose bits(bits #15 and #16) in [Instruction descriptor](<#tcgen05-instruction-descriptor>) must be 0.

  3. The matrix base offset must be 0.

#####  9.7.16.3.2. [Stride Dimension Byte Offset](<#tcgen05-stride-dimension-byte-offset>)

The stride dimension byte offset is defined differently for transposed and non-transposed matrices. The stride dimension byte offset is defined as follows for matrices whose element types are normalized to 128-bits:

Major-ness | Definition  
---|---  
K-Major | The offset from the first 8 rows to the next 8 rows.  
MN-Major | 

  * Interleave: offset from the first row to the next row.
  * Swizzled layout: offset from the first 8 columns to the next 8 columns

#####  9.7.16.3.3. [Canonical Layouts](<#tcgen05-canonical-layouts>)  
  
In terms of [CuTe layouts](<https://docs.nvidia.com/cutlass/media/docs/cpp/cute/01_layout.html>) the canonical layout can be expressed as follows:

Major- ness | Swizzling mode | Canonical Layout without swizzling | [Swizzling](<https://github.com/NVIDIA/cutlass/blob/bf9da7b76c766d7ee7d536afc77880a4ef1f1156/include/cute/swizzle.hpp>) on the previous column  
---|---|---|---  
MN- major | No-swizzling or Interleaved | ((T,1,m),(8,k)):((1,T,SBO),(1T,LBO)) | Swizzle<0, 4, 3>  
32B Swizzling | ((T,2,m),(8,k)):((1,T,LBO),(2T,SBO)) | Swizzle<1, 4, 3>  
64B Swizzling | ((T,4,m),(8,k)):((1,T,LBO),(4T,SBO)) | Swizzle<2, 4, 3>  
128B Swizzling | ((T,8,m),(8,k)):((1,T,LBO),(8T,SBO)) | Swizzle<3, 4, 3>  
K- major | No-swizzling or Interleaved | ((8,m),(T,2k)):((1T,SBO),(1,LBO)) | Swizzle<0, 4, 3>  
32B Swizzling | ((8,m),(T,2k)):((2T,SBO),(1,T)) | Swizzle<1, 4, 3>  
64B Swizzling | ((8,m),(T,2k)):((4T,SBO),(1,T)) | Swizzle<2, 4, 3>  
128B Swizzling | ((8,m),(T,2k)):((8T,SBO),(1,T)) | Swizzle<3, 4, 3>  
  
where

  * T = 128 / sizeof-elements-in-bits T represents scale factor which normalizes matrix element types to 128-bits.

  * m represents the number of repeating patterns across rows.

  * k represents the number of repeating patterns across columns.


Examples

  * K-Major, no-swizzling and tf32 type: [Figure 188](<#tcgen05-k-no-swizzle-tf32>)

![_images/async-warpgroup-k-no-swizzle-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-k-no-swizzle-tf32.png)

Figure 188 K major, no-swizzling and tf32 type

the strides and related details are as follows:

Exact layout : Swizzle<0,4,3> o ((8,2),(4,4)):((4,32),(1,64))

Canonical Layout :Swizzle<0,4,3> o ((8,m),(T,2k)):((1T,SBO),(1,LBO))

Parameters | Value  
---|---  
T | 4  
m | 2  
k | 2  
LBO (relative offset) | 64*sizeof(tf32)  
SBO | 32*sizeof(tf32)  
Encoding of LBO in descriptor | (LBO) >> 4 = 16  
Encoding of SBO in descriptor | (SBO) >> 4 = 8  
  * K-Major, 32B swizzling and tf32 type: [Figure 189](<#tcgen05-k-32b-swizzle-tf32>)

![_images/async-warpgroup-k-32B-swizzle-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-k-32B-swizzle-tf32.png)

Figure 189 K major, 32B swizzling and tf32 type

the strides and related details are as follows:

Exact layout : Swizzle<1,4,3> o ((8,2),(4,4)):((8,64),(1,4))

Canonical Layout :Swizzle<1,4,3> o ((8,m),(T,2k)):((2T,SBO),(1,T))

Parameters | Value  
---|---  
T | 4  
m | 2  
k | 2  
LBO (relative offset) | NA  
SBO | 64*sizeof(tf32)  
Encoding of LBO in descriptor | 1 (assumed)  
Encoding of SBO in descriptor | (SBO) >> 4 = 16  
  * MN-Major, no-swizzling and bf16 type: [Figure 190](<#tcgen05-mn-no-swizzle-bf16>)

![_images/async-warpgroup-mn-no-swizzle-bf16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-mn-no-swizzle-bf16.png)

Figure 190 MN major, no-swizzling and bf16 type

the strides and related details are as follows:

Exact layout : Swizzle<0,4,3> o ((8,1,2),(8,2)):((1,8,64),(8,128))

Canonical Layout :Swizzle<0,4,3> o ((T,1,m),(8,k)):((1,T,SBO),(1T,LBO))

Parameters | Value  
---|---  
T | 8  
m | 2  
k | 2  
LBO (relative offset) | 128*sizeof(bf16)  
SBO | 64*sizeof(bf16)  
Encoding of LBO in descriptor | (LBO) >> 4 = 16  
Encoding of SBO in descriptor | (SBO) >> 4 = 8  
  * MN-Major, 32B swizzling and bf16 type: [Figure 191](<#tcgen05-mn-32b-swizzle-bf16>)

![_images/async-warpgroup-mn-32B-swizzle-bf16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-mn-32B-swizzle-bf16.png)

Figure 191 MN major, 32B swizzling and bf16 type

the strides and related details are as follows:

Exact layout : Swizzle<1,4,3> o ((8,2,2),(8,2)):((1,8,128),(16,256))

Canonical Layout :Swizzle<1,4,3> o ((T,2,m),(8,k)):((1,T,LBO),(2T,SBO))

Parameters | Value  
---|---  
T | 8  
m | 2  
k | 2  
LBO (relative offset) | 128*sizeof(bf16)  
SBO | 256*sizeof(bf16)  
Encoding of LBO in descriptor | (LBO) >> 4 = 16  
Encoding of SBO in descriptor | (SBO) >> 4 = 32  
  * MN-Major, 64B swizzling and bf16 type: [Figure 192](<#tcgen05-mn-64b-swizzle-bf16>)

![_images/async-warpgroup-mn-64B-swizzle-bf16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-mn-64B-swizzle-bf16.png)

Figure 192 MN major, 64B swizzling and bf16 type

the strides and related details are as follows:

Exact layout : Swizzle<2,4,3> o ((8,4,2),(8,2)):((1,8,256),(32,512))

Canonical Layout :Swizzle<2,4,3> o ((T,4,m),(8,k)):((1,T,LBO),(4T,SBO))

Parameters | Value  
---|---  
T | 8  
m | 2  
k | 2  
LBO (relative offset) | 256*sizeof(bf16)  
SBO | 512*sizeof(bf16)  
Encoding of LBO in descriptor | (LBO) >> 4 = 32  
Encoding of SBO in descriptor | (SBO) >> 4 = 64