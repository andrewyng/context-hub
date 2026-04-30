---
name: ptx-asynchronous-warpgroup-level-matrix-multiply-accumulate-operation-usingwgmmamma-asyncinstruction
description: This section describes warpgroup level `wgmma.mma_async` instruction
  and the organization of various matrices involved in this instruction.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.15.5. Asynchronous Warpgroup Level Matrix Multiply-Accumulate Operation usingwgmma.mma_asyncinstruction

---
title: "9.7.15.5. Asynchronous Warpgroup Level Matrix Multiply-Accumulate Operation usingwgmma.mma_asyncinstruction"
section: 9.7.15.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.15.5. Asynchronous Warpgroup Level Matrix Multiply-Accumulate Operation usingwgmma.mma_asyncinstruction


This section describes warpgroup level `wgmma.mma_async` instruction and the organization of various matrices involved in this instruction.

#####  9.7.15.5.1. [Register Fragments and Shared Memory Matrix Layouts](<#asynchronous-warpgroup-level-matrix-fragment>)  
  
The input matrix A of the warpgroup wide MMA operations can be either in registers or in the shared memory. The input matrix B of the warpgroup wide MMA operations must be in the shared memory. This section describes the layouts of register fragments and shared memory expected by the warpgroup MMA instructions.

When the matrices are in shared memory, their starting addresses must be aligned to 16 bytes.

######  9.7.15.5.1.1. [Register Fragments](<#asynchronous-warpgroup-level-matrix-register-fragment>)

This section describes the organization of various matrices located in register operands of the `wgmma.mma_async` instruction.

####### 9.7.15.5.1.1.1. [Matrix Fragments for `wgmma.mma_async.m64nNk16`](<#asynchronous-warpgroup-level-matrix-register-fragment-wgmma-64n16>)

A warpgroup executing `wgmma.mma_async.m64nNk16` will compute an MMA operation of shape `.m64nNk16` where N is a valid `n` dimension as listed in [Matrix Shape](<#asynchronous-warpgroup-level-matrix-shape>).

Elements of the matrix are distributed across the threads in a warpgroup so each thread of the warpgroup holds a fragment of the matrix.

  * Multiplicand A in registers:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.f16`/`.bf16` | A vector expression containing four `.f16x2` registers, with each register containing two `.f16`/ `.bf16` elements from matrix A. | a0, a1, a2, a3, a4, a5, a6, a7  
  
The layout of the fragments held by different threads is shown in [Figure 148](<#wgmma-64n16-a>).

![_images/wgmma-64N16-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/wgmma-64N16-A.png)

Figure 148 WGMMA .m64nNk16 register fragment layout for matrix A.

  * Accumulator D:

.dtype | Fragment | Elements (low to high)  
---|---|---  
`.f16` | A vector expression containing N/4 number of `.f16x2` registers, with each register containing two `.f16` elements from matrix D. |  d0, d1, d2, d3, …, dX, dY, dZ, dW where `X = N/2 - 4` `Y = N/2 - 3` `Z = N/2 - 2` `W = N/2 - 1` `N = 8*i where i = {1, 2, ... , 32}`  
`.f32` | A vector expression containing N/2 number of `.f32` registers.  
  
The layout of the fragments held by different threads is shown in [Figure 149](<#wgmma-64n16-d>).

![_images/wgmma-64N16-D.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/wgmma-64N16-D.png)

Figure 149 WGMMA .m64nNk16 register fragment layout for accumulator matrix D.


####### 9.7.15.5.1.1.2. [Matrix Fragments for `wgmma.mma_async.m64nNk8`](<#asynchronous-warpgroup-level-matrix-register-fragment-wgmma-64n8>)

A warpgroup executing `wgmma.mma_async.m64nNk8` will compute an MMA operation of shape `.m64nNk8` where N is a valid `n` dimension as listed in [Matrix Shape](<#asynchronous-warpgroup-level-matrix-shape>).

Elements of the matrix are distributed across the threads in a warpgroup so each thread of the warpgroup holds a fragment of the matrix.

  * Multiplicand A in registers:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.tf32` | A vector expression containing four `.b32` registers containing four `.tf32` elements from matrix A. | a0, a1, a2, a3  
  
The layout of the fragments held by different threads is shown in [Figure 150](<#wgmma-64n8-a>).

![_images/wgmma-64N8-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/wgmma-64N8-A.png)

Figure 150 WGMMA .m64nNk8 register fragment layout for matrix A.

  * Accumulator D:

.dtype | Fragment | Elements (low to high)  
---|---|---  
`.f32` | A vector expression containing N/2 number of `.f32` registers. |  d0, d1, d2, d3, …, dX, dY, dZ, dW where `X = N/2 - 4` `Y = N/2 - 3` `Z = N/2 - 2` `W = N/2 - 1` `N = 8*i where i = {1, 2, ... , 32}`  
  
The layout of the fragments held by different threads is shown in [Figure 151](<#wgmma-64n8-d>).

![_images/wgmma-64N8-D.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/wgmma-64N8-D.png)

Figure 151 WGMMA .m64nNk8 register fragment layout for accumulator matrix D.


####### 9.7.15.5.1.1.3. [Matrix Fragments for `wgmma.mma_async.m64nNk32`](<#asynchronous-warpgroup-level-matrix-register-fragment-wgmma-64n32>)

A warpgroup executing `wgmma.mma_async.m64nNk32` will compute an MMA operation of shape `.m64nNk32` where N is a valid `n` dimension as listed in [Matrix Shape](<#asynchronous-warpgroup-level-matrix-shape>).

Elements of the matrix are distributed across the threads in a warpgroup so each thread of the warpgroup holds a fragment of the matrix.

  * Multiplicand A in registers:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.s8`/`.u8` | A vector expression containing four `.b32` registers, with each register containing four `.u8`/ `.s8` elements from matrix A. | a0, a1, a2, a3, … , a14, a15  
`.e4m3`/ `.e5m2` | A vector expression containing four `.b32` registers, with each register containing four `.e4m3`/ `.e5m2` elements from matrix A.  
  
The layout of the fragments held by different threads is shown in [Figure 152](<#wgmma-64n32-a>).

![_images/wgmma-64N32-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/wgmma-64N32-A.png)

Figure 152 WGMMA .m64nNk32 register fragment layout for matrix A.

  * Accumulator D:

.dtype | Fragment | Elements (low to high) | Miscellaneous Information  
---|---|---|---  
`.s32` | A vector expression containing N/2 number of `.s32` registers. |  d0, d1, d2, d3, …, dX, dY, dZ, dW where `X = N/2 - 4` `Y = N/2 - 3` `Z = N/2 - 2` `W = N/2 - 1` `N` depends on .dtype, as described in the next column. |  `N = 8*i where i = {1, 2, 3, 4}`

> `= 16*i where i = {3, 4, ..., 15, 16}`  
  
`.f32` | A vector expression containing N/2 number of `.f32` registers. | `N = 8*i where i = {1, 2, ... , 32}`  
`.f16` | A vector expression containing N/4 number of `.f16x2` registers, with each register containing two `.f16` elements from matrix D.  
  
The layout of the fragments held by different threads is shown in [Figure 153](<#wgmma-64n32-d>).

![_images/wgmma-64N32-D.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/wgmma-64N32-D.png)

Figure 153 WGMMA .m64nNk32 register fragment layout for accumulator matrix D.


####### 9.7.15.5.1.1.4. [Matrix Fragments for `wgmma.mma_async.m64nNk256`](<#asynchronous-warpgroup-level-matrix-register-fragment-wgmma-64n256>)

A warpgroup executing `wgmma.mma_async.m64nNk256` will compute an MMA operation of shape `.m64nNk256` where N is a valid `n` dimension as listed in [Matrix Shape](<#asynchronous-warpgroup-level-matrix-shape>).

Elements of the matrix are distributed across the threads in a warpgroup so each thread of the warpgroup holds a fragment of the matrix.

  * Multiplicand A in registers:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.b1` | A vector expression containing four `.b32` registers, with each register containing thirty two `.b1` element from matrix A. | a0, a1, a2, …, a127  
  
The layout of the fragments held by different threads is shown in [Figure 154](<#wgmma-64n256-a>).

![_images/wgmma-64N256-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/wgmma-64N256-A.png)

Figure 154 WGMMA .m64nNk256 register fragment layout for matrix A.

  * Accumulator D:

.dtype | Fragment | Elements (low to high)  
---|---|---  
`.s32` | A vector expression containing N/2 number of `.s32` registers. |  d0, d1, d2, d3, …, dX, dY, dZ, dW where `X = N/2 - 4` `Y = N/2 - 3` `Z = N/2 - 2` `W = N/2 - 1` `N = 8*i where i = {1, 2, 3, 4}` `= 16*i where i = {3, 4, ..., 15, 16}`  
  
The layout of the fragments held by different threads is shown in [Figure 155](<#wgmma-64n256-d>).

![_images/wgmma-64N256-D.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/wgmma-64N256-D.png)

Figure 155 WGMMA .m64nNk256 register fragment layout for accumulator matrix D.


######  9.7.15.5.1.2. [Shared Memory Matrix Layout](<#asynchronous-warpgroup-level-matrix-shared-memory-layout>)

If the argument `imm-trans-a` / `imm-trans-b` of the instruction `wgmma.mma_async{.sp}` is 0, then _K-major_ is used for matrix `A` / `B` respectively. If the value of argument `imm-trans-a` is 1 then _M-major_ is used for matrix `A`. If the value of the argument `imm-trans-b` is 1, then _N-major_ is used for matrix `B`.

In a column-major default BLAS library such as cuBLAS, the matrices `A` and `B` with and without transpose can be classified as either _K-Major_ or _M-or-N-Major_ as shown in the following table:

| Non-Transposed | Transposed  
---|---|---  
A | K-major | M-major  
B | K-major | N-major  
  
To avoid confusion with `A`, `B`, `row-major`, `col-major`, `transpose`, and `non-transpose`, we will use _MN-Major_ and _K-Major_ throughout this section.

The matrices in the shared memory are made up of one or more “swizzle layout atom”. The exact layout of these swizzle atoms depends on the swizzling mode, swizzle-atomicity, and the leading dimension. The layout of the swizzle are shown in [Table 38](<#asynchronous-warpgroup-level-swizzle-lead-dim>).

Table 38 Various combinations of swizzling mode, leading dimension and swizzle-atom layout Swizzling mode | Leading Dimension / Major-ness | Swizzle atom layout (128b element)  
---|---|---  
128B Swizzling Mode | M/N | 8x8  
K | 8x8  
64B Swizzling Mode | M/N | 4x8  
K | 8x4  
32B Swizzling Mode | M/N | 2x8  
K | 8x2  
None | M/N | 1x8  
K | 8x1  
  
The above shapes are for elements of size 128 bits. For smaller elements sizes, the same shapes would get multiplied along the leading dimension by a factor of `128/sizeof_bits(Element)`. For example, 128B MN major swizzle atom would have a shape of `(8*(128/32))x8 = 32x8` for `tf32` tensor core inputs.

Examples

The following are some example layouts of _MxK_ or _KxN_ matrices with various swizzling modes, and are in units of 128b elements as shown by each colored cell as shown in [Figure 156](<#async-warpgroup-smem-layout-128b-mn>), [Figure 157](<#async-warpgroup-smem-layout-128b-k>), [Figure 158](<#async-warpgroup-smem-layout-64b-mn>), [Figure 159](<#async-warpgroup-smem-layout-64b-k>), [Figure 160](<#async-warpgroup-smem-layout-32b-mn>), [Figure 161](<#async-warpgroup-smem-layout-32b-k>), [Figure 162](<#async-warpgroup-smem-layout-mn-interleaved>), [Figure 163](<#async-warpgroup-smem-layout-k-interleaved>).

![_images/async-warpgroup-smem-layout-128B-mn.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-smem-layout-128B-mn.png)

Figure 156 MN major 128B swizzling

![_images/async-warpgroup-smem-layout-128B-k.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-smem-layout-128B-k.png)

Figure 157 K major 128B swizzling

![_images/async-warpgroup-smem-layout-64B-mn.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-smem-layout-64B-mn.png)

Figure 158 MN major 64B swizzling

![_images/async-warpgroup-smem-layout-64B-k.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-smem-layout-64B-k.png)

Figure 159 K major 64B swizzling

![_images/async-warpgroup-smem-layout-32B-mn.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-smem-layout-32B-mn.png)

Figure 160 MN major 32B swizzling

![_images/async-warpgroup-smem-layout-32B-k.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-smem-layout-32B-k.png)

Figure 161 K major 32B swizzling

![_images/async-warpgroup-smem-layout-mn-interleaved.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-smem-layout-mn-interleaved.png)

Figure 162 MN major interleaved

![_images/async-warpgroup-smem-layout-k-interleaved.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-smem-layout-k-interleaved.png)

Figure 163 K major interleaved

Following are some of the examples of the 128B swizzling layout for `tf32` element type.

  * K-Major: [Figure 164](<#async-warpgroup-smem-layout-128b-k-tf32>)

> ![_images/async-warpgroup-smem-layout-128B-k-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-smem-layout-128B-k-tf32.png)
> 
> Figure 164 K major

  * MN-Major: [Figure 165](<#async-warpgroup-smem-layout-128b-mn-tf32>)

> ![_images/async-warpgroup-smem-layout-128B-mn-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-smem-layout-128B-mn-tf32.png)
> 
> Figure 165 MN major


####### 9.7.15.5.1.2.1. [Major-ness supported by Strides](<#asynchronous-warpgroup-level-majorness-supported-by-strides>)

There are two strides involved while accessing a matrix from shared memory:

  1. Leading dimension byte offset

  2. Stride dimension byte offset


######## 9.7.15.5.1.2.1.1. [Leading Dimension Byte Offset](<#asynchronous-warpgroup-level-leading-dimension-byte-offset>)

The leading dimension byte offset is defined differently for transposed and non-transposed matrices. The leading byte offset is defined as follows for matrices whose element types are normalized to 128-bits:

Major-ness | Definition  
---|---  
K-Major | 

  * No-Swizzling: the offset from the first column to the second columns of the 8x2 tile in the 128-bit element type normalized matrix.
  * Swizzled layouts: not used, assumed to be 1.

  
MN-Major | 

  * Interleave: offset from the first 8 columns to the next 8 columns.
  * Swizzled layouts: offset from the first (swizzle-byte-size/16) rows to the next (swizzle-byte-size/16) rows.

  
  
######## 9.7.15.5.1.2.1.2. [Stride Dimension Byte Offset](<#asynchronous-warpgroup-level-stride-dimension-byte-offset>)

The stride dimension byte offset is defined differently for transposed and non-transposed matrices. The stride dimension byte offset is defined as follows for matrices whose element types are normalized to 128-bits:

Major-ness | Definition  
---|---  
K-Major | The offset from the first 8 rows to the next 8 rows.  
MN-Major | 

  * Interleave: offset from the first row to the next row.
  * Swizzled layout: offset from the first 8 columns to the next 8 columns

  
  
######## 9.7.15.5.1.2.1.3. [Canonical Layouts](<#asynchronous-warpgroup-level-canonical-layouts>)

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

  * K-Major, no-swizzling and tf32 type: [Figure 166](<#async-warpgroup-k-no-swizzle-tf32>)

![_images/async-warpgroup-k-no-swizzle-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-k-no-swizzle-tf32.png)

Figure 166 K major, no-swizzling and tf32 type

the strides and related details are as follows:

Exact layout : Swizzle<0,4,3> o ((8,2),(4,4)):((4,32),(1,64))

Canonical Layout :Swizzle<0,4,3> o ((8,m),(T,2k)):((1T,SBO),(1,LBO))

Parameters | Value  
---|---  
T | 4  
m | 2  
k | 2  
LBO | 64*sizeof(tf32)  
SBO | 32*sizeof(tf32)  
Encoding of LBO in descriptor | (LBO) >> 4 = 16  
Encoding of SBO in descriptor | (SBO) >> 4 = 8  
  * K-Major, 32B swizzling and tf32 type: [Figure 167](<#async-warpgroup-k-32b-swizzle-tf32>)

![_images/async-warpgroup-k-32B-swizzle-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-k-32B-swizzle-tf32.png)

Figure 167 K major, 32B swizzling and tf32 type

the strides and related details are as follows:

Exact layout : Swizzle<1,4,3> o ((8,2),(4,4)):((8,64),(1,4))

Canonical Layout :Swizzle<1,4,3> o ((8,m),(T,2k)):((2T,SBO),(1,T))

Parameters | Value  
---|---  
T | 4  
m | 2  
k | 2  
LBO | NA  
SBO | 64*sizeof(tf32)  
Encoding of LBO in descriptor | 1 (assumed)  
Encoding of SBO in descriptor | (SBO) >> 4 = 16  
  * MN-Major, no-swizzling and bf16 type: [Figure 168](<#async-warpgroup-mn-no-swizzle-bf16>)

![_images/async-warpgroup-mn-no-swizzle-bf16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-mn-no-swizzle-bf16.png)

Figure 168 MN major, no-swizzling and bf16 type

the strides and related details are as follows:

Exact layout : Swizzle<0,4,3> o ((8,1,2),(8,2)):((1,8,64),(8,128))

Canonical Layout :Swizzle<0,4,3> o ((T,1,m),(8,k)):((1,T,SBO),(1T,LBO))

Parameters | Value  
---|---  
T | 8  
m | 2  
k | 2  
LBO | 128*sizeof(bf16)  
SBO | 64*sizeof(bf16)  
Encoding of LBO in descriptor | (LBO) >> 4 = 16  
Encoding of SBO in descriptor | (SBO) >> 4 = 8  
  * MN-Major, 32B swizzling and bf16 type: [Figure 169](<#async-warpgroup-mn-32b-swizzle-bf16>)

![_images/async-warpgroup-mn-32B-swizzle-bf16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-mn-32B-swizzle-bf16.png)

Figure 169 MN major, 32B swizzling and bf16 type

the strides and related details are as follows:

Exact layout : Swizzle<1,4,3> o ((8,2,2),(8,2)):((1,8,128),(16,256))

Canonical Layout :Swizzle<1,4,3> o ((T,2,m),(8,k)):((1,T,LBO),(2T,SBO))

Parameters | Value  
---|---  
T | 8  
m | 2  
k | 2  
LBO | 128*sizeof(bf16)  
SBO | 256*sizeof(bf16)  
Encoding of LBO in descriptor | (LBO) >> 4 = 16  
Encoding of SBO in descriptor | (SBO) >> 4 = 32  
  * MN-Major, 64B swizzling and bf16 type: [Figure 170](<#async-warpgroup-mn-64b-swizzle-bf16>)

![_images/async-warpgroup-mn-64B-swizzle-bf16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/async-warpgroup-mn-64B-swizzle-bf16.png)

Figure 170 MN major, 64B swizzling and bf16 type

the strides and related details are as follows:

Exact layout : Swizzle<2,4,3> o ((8,4,2),(8,2)):((1,8,256),(32,512))

Canonical Layout :Swizzle<2,4,3> o ((T,4,m),(8,k)):((1,T,LBO),(4T,SBO))

Parameters | Value  
---|---  
T | 8  
m | 2  
k | 2  
LBO | 256*sizeof(bf16)  
SBO | 512*sizeof(bf16)  
Encoding of LBO in descriptor | (LBO) >> 4 = 32  
Encoding of SBO in descriptor | (SBO) >> 4 = 64  


####### 9.7.15.5.1.2.2. [Matrix Descriptor Format](<#asynchronous-warpgroup-level-matrix-shared-memory-layout-matrix-descriptor>)

Matrix descriptor specifies the properties of the matrix in shared memory that is a multiplicand in the matrix multiply and accumulate operation. It is a 64-bit value contained in a register with the following layout:

Bit-field | Size in bits | Description  
---|---|---  
13–0 | 14 | matrix-descriptor-encode(Matrix start address)  
29–16 | 14 | matrix-descriptor-encode ([Leading dimension byte offset](<#asynchronous-warpgroup-level-leading-dimension-byte-offset>))  
45–32 | 14 | matrix-descriptor-encode ([Stride dimension byte offset](<#asynchronous-warpgroup-level-stride-dimension-byte-offset>))  
51–49 | 3 | Matrix base offset. This is valid for all swizzling modes except the no-swizzle mode.  
63–62 | 2 |  Specifies the swizzling mode to be used:

  * 0: No swizzle
  * 1: 128-Byte swizzle
  * 2: 64-Byte swizzle
  * 3: 32-Byte swizzle

  
  
where
    
    
    matrix-descriptor-encode(x) = (x & 0x3FFFF) >> 4
    

The value of base offset is 0 when the repeating pattern of the specified swizzling mode starts as per the below table:

> Swizzling mode | Starting address of the repeating pattern  
> ---|---  
> 128-Byte swizzle | 1024-Byte boundary  
> 64-Byte swizzle | 512-Byte boundary  
> 32-Byte swizzle | 256-Byte boundary  
  
Otherwise, the base offset must be a non-zero value, computed using the following formula:
    
    
    base offset = (pattern start addr >> 0x7) & 0x7

#####  9.7.15.5.2. [Asynchronous Multiply-and-Accumulate Instruction: `wgmma.mma_async`](<#asynchronous-warpgroup-level-matrix-instructions-wgmma-mma>)

`wgmma.mma_async`

Perform matrix multiply-and-accumulate operation across warpgroup

Syntax

Half precision floating point type:
    
    
    wgmma.mma_async.sync.aligned.shape.dtype.f16.f16  d, a-desc, b-desc, scale-d, imm-scale-a, imm-scale-b, imm-trans-a, imm-trans-b;
    
    wgmma.mma_async.sync.aligned.shape.dtype.f16.f16  d, a, b-desc, scale-d, imm-scale-a, imm-scale-b, imm-trans-b;
    
    .shape   = {.m64n8k16, .m64n16k16, .m64n24k16, .m64n32k16,
                .m64n40k16, .m64n48k16, .m64n56k16, .m64n64k16,
                .m64n72k16, .m64n80k16, .m64n88k16, .m64n96k16,
                .m64n104k16, .m64n112k16, .m64n120k16, .m64n128k16,
                .m64n136k16, .m64n144k16, .m64n152k16, .m64n160k16,
                .m64n168k16, .m64n176k16, .m64n184k16, .m64n192k16,
                .m64n200k16, .m64n208k16, .m64n216k16, .m64n224k16,
                .m64n232k16, .m64n240k16, .m64n248k16, .m64n256k16};
    .dtype   = {.f16, .f32};
    

Alternate floating point type :
    
    
    .bf16 floating point type:
    
    wgmma.mma_async.sync.aligned.shape.dtype.bf16.bf16  d, a-desc, b-desc, scale-d, imm-scale-a, imm-scale-b, imm-trans-a, imm-trans-b;
    
    wgmma.mma_async.sync.aligned.shape.dtype.bf16.bf16  d, a, b-desc, scale-d, imm-scale-a, imm-scale-b, imm-trans-b;
    
    .shape   = {.m64n8k16, .m64n16k16, .m64n24k16, .m64n32k16,
                .m64n40k16, .m64n48k16, .m64n56k16, .m64n64k16,
                .m64n72k16, .m64n80k16, .m64n88k16, .m64n96k16,
                .m64n104k16, .m64n112k16, .m64n120k16, .m64n128k16,
                .m64n136k16, .m64n144k16, .m64n152k16, .m64n160k16,
                .m64n168k16, .m64n176k16, .m64n184k16, .m64n192k16,
                .m64n200k16, .m64n208k16, .m64n216k16, .m64n224k16,
                .m64n232k16, .m64n240k16, .m64n248k16, .m64n256k16};
    .dtype  = {.f32};
    
    .tf32 floating point type:
    
    wgmma.mma_async.sync.aligned.shape.dtype.tf32.tf32  d, a-desc, b-desc, scale-d, imm-scale-a, imm-scale-b;
    
    wgmma.mma_async.sync.aligned.shape.dtype.tf32.tf32  d, a, b-desc, scale-d, imm-scale-a, imm-scale-b;
    
    .shape   = {.m64n8k8, .m64n16k8, .m64n24k8, .m64n32k8,
                .m64n40k8, .m64n48k8, .m64n56k8, .m64n64k8,
                .m64n72k8, .m64n80k8, .m64n88k8, .m64n96k8,
                .m64n104k8, .m64n112k8, .m64n120k8, .m64n128k8,
                .m64n136k8, .m64n144k8, .m64n152k8, .m64n160k8,
                .m64n168k8, .m64n176k8, .m64n184k8, .m64n192k8,
                .m64n200k8, .m64n208k8, .m64n216k8, .m64n224k8,
                .m64n232k8, .m64n240k8, .m64n248k8, .m64n256k8};
    .dtype  = {.f32};
    
    FP8 floating point type
    
    wgmma.mma_async.sync.aligned.shape.dtype.atype.btype  d, a-desc, b-desc, scale-d, imm-scale-a, imm-scale-b;
    
    wgmma.mma_async.sync.aligned.shape.dtype.atype.btype  d, a, b-desc, scale-d, imm-scale-a, imm-scale-b;
    
    .shape   = {.m64n8k32, .m64n16k32, .m64n24k32, .m64n32k32,
                .m64n40k32, .m64n48k32, .m64n56k32, .m64n64k32,
                .m64n72k32, .m64n80k32, .m64n88k32, .m64n96k32,
                .m64n104k32, .m64n112k32, .m64n120k32, .m64n128k32,
                .m64n136k32, .m64n144k32, .m64n152k32, .m64n160k32,
                .m64n168k32, .m64n176k32, .m64n184k32, .m64n192k32,
                .m64n200k32, .m64n208k32, .m64n216k32, .m64n224k32,
                .m64n232k32, .m64n240k32, .m64n248k32, .m64n256k32};
    .atype  = {.e4m3, .e5m2};
    .btype  = {.e4m3, .e5m2};
    .dtype  = {.f16, .f32};
    

Integer type:
    
    
    wgmma.mma_async.sync.aligned.shape{.satfinite}.s32.atype.btype  d, a-desc, b-desc, scale-d;
    
    wgmma.mma_async.sync.aligned.shape{.satfinite}.s32.atype.btype  d, a, b-desc, scale-d;
    
    .shape   = {.m64n8k32, .m64n16k32, .m64n24k32, .m64n32k32,
                .m64n48k32, .m64n64k32, .m64n80k32, .m64n96k32,
                .m64n112k32, .m64n128k32, .m64n144k32, .m64n160k32,
                .m64n176k32, .m64n192k32, .m64n208k32, .m64n224k32};
    .atype  = {.s8, .u8};
    .btype  = {.s8, .u8};
    

Single bit:
    
    
    wgmma.mma_async.sync.aligned.shape.s32.b1.b1.op.popc  d, a-desc, b-desc, scale-d;
    
    wgmma.mma_async.sync.aligned.shape.s32.b1.b1.op.popc  d, a, b-desc, scale-d;
    
    .shape   = {.m64n8k256, .m64n16k256, .m64n24k256, .m64n32k256,
                .m64n48k256, .m64n64k256, .m64n80k256, .m64n96k256,
                .m64n112k256, .m64n128k256, .m64n144k256, .m64n160k256,
                .m64n176k256, .m64n192k256, .m64n208k256, .m64n224k256,
                .m64n240k256, .m64n256k256};
    .op  = {.and};
    

Description

Instruction `wgmma.mma_async` issues a `MxNxK` matrix multiply and accumulate operation, `D = A*B+D`, where the A matrix is `MxK`, the B matrix is `KxN`, and the D matrix is `MxN`.

The operation of the form `D = A*B` is issued when the input predicate argument `scale-d` is false.

`wgmma.fence` instruction must be used to fence the register accesses of `wgmma.mma_async` instruction from their prior accesses. Otherwise, the behavior is undefined.

`wgmma.commit_group` and `wgmma.wait_group` operations must be used to wait for the completion of the asynchronous matrix multiply and accumulate operations before the results are accessed.

Register operand `d` represents the accumulator matrix as well as the destination matrix, distributed across the participating threads. Register operand `a` represents the multiplicand matrix A in register distributed across the participating threads. The 64-bit register operands `a-desc` and `b-desc` are the matrix descriptors which represent the multiplicand matrices A and B in shared memory respectively. The contents of a matrix descriptor must be same across all the warps in the warpgroup. The format of the matrix descriptor is described in [Matrix Descriptor Format](<#asynchronous-warpgroup-level-matrix-shared-memory-layout-matrix-descriptor>).

Matrices A and B are stored in row-major and column-major format respectively. For certain floating point variants, the input matrices A and B can be transposed by specifying the value 1 for the immediate integer arguments `imm-trans-a` and `imm-trans-b` respectively. A value of 0 can be used to avoid the transpose operation. The valid values of `imm-trans-a` and `imm-trans-b` are 0 and 1. The transpose operation is only supported for the `wgmma.mma_async` variants with `.f16`/ `.bf16` types on matrices accessed from shared memory using matrix descriptors.

For the floating point variants of the `wgmma.mma_async` operation, each element of the input matrices A and B can be negated by specifying the value -1 for operands `imm-scale-a` and `imm-scale-b` respectively. A value of 1 can be used to avoid the negate operation. The valid values of `imm-scale-a` and `imm-scale-b` are -1 and 1.

The qualifiers `.dtype`, `.atype` and `.btype` indicate the data type of the elements in matrices D, A and B respectively. `.atype` and `.btype` must be the same for all floating point `wgmma.mma_async` variants except for the FP8 floating point variants. The sizes of individual data elements of matrices A and B in alternate floating point variants of the `wgmma.mma_async` operation are as follows:

  * Matrices A and B have 8-bit data elements when `.atype`/ `.btype` is `.e4m3`/`.e5m2`.

  * Matrices A and B have 16-bit data elements when `.atype`/ `.btype` is `.bf16`.

  * Matrices A and B have 32-bit data elements when `.atype`/ `.btype` is `.tf32`.


Precision and rounding:

  * Floating point operations:

Element-wise multiplication of matrix A and B is performed with at least single precision. When `.dtype` is `.f32`, accumulation of the intermediate values is performed with at least single precision. When `.dtype` is `.f16`, the accumulation is performed with at least half precision.

The accumulation order, rounding and handling of subnormal inputs are unspecified.

  * `.bf16` and `.tf32` floating point operations:

Element-wise multiplication of matrix A and B is performed with specified precision. `wgmma.mma_async` operation involving type `.tf32` will truncate lower 13 bits of the 32-bit input data before multiplication is issued. Accumulation of the intermediate values is performed with at least single precision.

The accumulation order, rounding, and handling of subnormal inputs are unspecified.

  * Integer operations:

The integer `wgmma.mma_async` operation is performed with `.s32` accumulators. The `.satfinite` qualifier indicates that on overflow, the accumulated value is limited to the range _MIN_INT32_.. _MAX_INT32_ (where the bounds are defined as the minimum negative signed 32-bit integer and the maximum positive signed 32-bit integer respectively).

If `.satfinite` is not specified, the accumulated value is wrapped instead.


The mandatory `.sync` qualifier indicates that `wgmma.mma_async` instruction causes the executing thread to wait until all threads in the warp execute the same `wgmma.mma_async` instruction before resuming execution.

The mandatory `.aligned` qualifier indicates that all threads in the warpgroup must execute the same `wgmma.mma_async` instruction. In conditionally executed code, a `wgmma.mma_async` instruction should only be used if it is known that all threads in the warpgroup evaluate the condition identically, otherwise behavior is undefined.

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Support for `.u8.s8` and `.s8.u8` as .atype.btype introduced in PTX ISA version 8.4.

Target ISA Notes

Requires `sm_90a`.

Examples of half precision floating point type
    
    
    .reg .f16x2 f16a<40>, f16d<40>;
    .reg .f32   f32d<40>;
    .reg .b64   descA, descB;
    .reg .pred  scaleD;
    wgmma.mma_async.sync.aligned.m64n8k16.f32.f16.f16
      {f32d0, f32d1, f32d2, f32d3},
      {f16a0, f16a1, f16a2, f16a3},
      descB,
      1, -1, -1, 1;
    
    wgmma.mma_async.sync.aligned.m64n72k16.f16.f16.f16
      {f16d0, f16d1,  f16d2,  f16d3,  f16d4,  f16d5,  f16d6,  f16d7,  f16d8,
       f16d9, f16d10, f16d11, f16d12, f16d13, f16d14, f16d15, f16d16, f16d17},
      descA,
      descB,
      scaleD, -1, 1, 1, 0;
    

Examples of alternate floating point type
    
    
    .reg .f32   f32d<40>;
    .reg .b32   bf16a<40>
    .reg .b64   descA, descB;
    
    wgmma.mma_async.sync.aligned.m64n120k16.f32.bf16.bf16
      {f32d0, f32d1, f32d2, f32d3, f32d4, f32d5, f32d6, f32d7, f32d8, f32d9,
       f32d10, f32d11, f32d12, f32d13, f32d14, f32d15, f32d16, f32d17, f32d18, f32d19,
       f32d20, f32d21, f32d22, f32d23, f32d24, f32d25, f32d26, f32d27, f32d28, f32d29,
       f32d30, f32d31, f32d32, f32d33, f32d34, f32d35, f32d36, f32d37, f32d38, f32d39,
       f32d40, f32d41, f32d42, f32d43, f32d44, f32d45, f32d46, f32d47, f32d48, f32d49,
       f32d50, f32d51, f32d52, f32d53, f32d54, f32d55, f32d56, f32d57, f32d58, f32d59},
      {bf16a0, bf16a1, bf16a2, bf16a3},
      descB,
      scaleD, -1, -1, 0;
    
    .reg .f32   f32d<40>;
    .reg .b64   descA, descB;
    
    wgmma.mma_async.sync.aligned.m64n16k8.f32.tf32.tf32
      {f32d0, f32d1, f32d2, f32d3, f32d4, f32d5, f32d6, f32d7},
      descA,
      descB,
      0, -1, -1;
    
    .reg .b32 f16d<8>, f16a<8>;
    .reg .f32 f32d<8>;
    .reg .b64   descA, descB;
    
    wgmma.mma_async.sync.aligned.m64n8k32.f16.e4m3.e5m2
      {f16d0, f16d1},
      descA,
      descB,
      scaleD, -1, 1;
    
    wgmma.mma_async.sync.aligned.m64n8k32.f32.e5m2.e4m3
      {f32d0, f32d1, f32d2, f32d3},
      {f16a0, f16a1, f16a2, f16a3},
      descB,
      1, -1, -1;
    

Examples of integer type
    
    
    .reg .s32 s32d<8>, s32a<8>;
    .reg .u32 u32a<8>;
    .reg .pred scaleD;
    .reg .b64   descA, descB;
    
    wgmma.mma_async.sync.aligned.m64n8k32.s32.s8.s8.satfinite
      {s32d0, s32d1, s32d2, s32d3},
      {s32a0, s32a1, s32a2, s32a3},
      descB,
      1;
    
    wgmma.mma_async.sync.aligned.m64n8k32.s32.u8.u8
      {s32d0, s32d1, s32d2, s32d3},
      descA,
      descB,
      scaleD;
    
    wgmma.mma_async.sync.aligned.m64n8k32.s32.s8.u8.satfinite
      {s32d0, s32d1, s32d2, s32d3},
      {s32a0, s32a1, s32a2, s32a3},
      descB,
      scaleD;
    
    wgmma.mma_async.sync.aligned.m64n8k32.s32.u8.s8
      {s32d0, s32d1, s32d2, s32d3},
      descA,
      descB,
      scaleD;
    

Examples of single bit type
    
    
    .reg .s32 s32d<4>;
    .reg .b32 b32a<4>;
    .reg .pred scaleD;
    .reg .b64   descA, descB;
    
    
    wgmma.mma_async.sync.aligned.m64n8k256.s32.b1.b1.and.popc
      {s32d0, s32d1, s32d2, s32d3},
      {b32a0, b32a1, b32a2, b32a3},
      descB,
      scaleD;