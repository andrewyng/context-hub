---
name: ptx-matrix-multiply-accumulate-operation-usingmmaspinstruction-with-sparse-matrix-a
description: This section describes warp-level `mma.sp{::ordered_metadata}` instruction
  with sparse matrix A. This variant of the `mma` operation can be used when A is
  a structured sparse matrix with 50% zeros in ...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.14.6. Matrix multiply-accumulate operation usingmma.spinstruction with sparse matrix A

---
title: "9.7.14.6. Matrix multiply-accumulate operation usingmma.spinstruction with sparse matrix A"
section: 9.7.14.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.14.6. Matrix multiply-accumulate operation usingmma.spinstruction with sparse matrix A


This section describes warp-level `mma.sp{::ordered_metadata}` instruction with sparse matrix A. This variant of the `mma` operation can be used when A is a structured sparse matrix with 50% zeros in each row distributed in a shape-specific granularity. For an `MxNxK` sparse `mma.sp{::ordered_metadata}` operation, the `MxK` matrix A is packed into `MxK/2` elements. For each K-wide row of matrix A, 50% elements are zeros and the remaining K/2 non-zero elements are packed in the operand representing matrix A. The mapping of these K/2 elements to the corresponding K-wide row is provided explicitly as metadata.

#####  9.7.14.6.1. [Sparse matrix storage](<#warp-level-sparse-matrix-storage>)

Granularity of sparse matrix A is defined as the ratio of the number of non-zero elements in a sub-chunk of the matrix row to the total number of elements in that sub-chunk where the size of the sub-chunk is shape-specific. For example, in a `16x16` matrix A, sparsity is expected to be at 2:4 granularity, i.e. each 4-element vector (i.e. a sub-chunk of 4 consecutive elements) of a matrix row contains 2 zeros. Index of each non-zero element in a sub-chunk is stored in the metadata operand. Values `0b0000`, `0b0101`, `0b1010`, `0b1111` are invalid values for metadata and will result in undefined behavior. In a group of four consecutive threads, one or more threads store the metadata for the whole group depending upon the matrix shape. These threads are specified using an additional _sparsity selector_ operand.

[Figure 111](<#sparse-mma-storage-example>) shows an example of a 16x16 matrix A represented in sparse format and sparsity selector indicating which thread in a group of four consecutive threads stores the metadata.

![_images/sparse-mma-storage-example.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-storage-example.png)

Figure 111 Sparse MMA storage example

Granularities for different matrix shapes and data types are described below.

Sparse `mma.sp{::ordered_metadata}` with half-precision and `.bf16` type

For the `.m16n8k16` and `.m16n8k32` `mma.sp{::ordered_metadata}` operations, matrix A is structured sparse at a granularity of 2:4. In other words, each chunk of four adjacent elements in a row of matrix A has two zeros and two non-zero elements. Only the two non-zero elements are stored in the operand representing matrix A and their positions in the four-wide chunk in matrix A are indicated by two 2-bit indices in the metadata operand. For `mma.sp::ordered_metadata`, `0b0100`, `0b1000`, `0b1001`, `0b1100`, `0b1101`, `0b1110` are the meaningful values of indices; any other values result in an undefined behavior.

![_images/f16-metadata-example.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/f16-metadata-example.png)

Figure 112 Sparse MMA metadata example for `.f16`/`.bf16` type.

The sparsity selector indicates the threads which contribute metadata as listed below:

  * `m16n8k16`: One thread within a group of four consecutive threads contributes the metadata for the entire group. This thread is indicated by a value in {0, 1, 2, 3}.

  * `m16n8k32`: A thread-pair within a group of four consecutive threads contributes the sparsity metadata. Hence, the sparsity selector must be either 0 (threads T0, T1) or 1 (threads T2, T3); any other value results in an undefined behavior.


Sparse `mma.sp{::ordered_metadata}` with `.tf32` type

When matrix A has `.tf32` elements, matrix A is structured sparse at a granularity of 1:2. In other words, each chunk of two adjacent elements in a row of matrix A has one zero and one non-zero element. Only the non-zero elements are stored in the operand for matrix A and their positions in a two-wide chunk in matrix A are indicated by the 4-bit index in the metadata. `0b1110` and `0b0100` are the only meaningful index values; any other values result in an undefined behavior.

![_images/tf32-metadata-example.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tf32-metadata-example.png)

Figure 113 Sparse MMA metadata example for `.tf32` type.

The sparsity selector indicates the threads which contribute metadata as listed below:

  * `m16n8k8`: One thread within a group of four consecutive threads contributes the metadata for the entire group. This thread is indicated by a value in {0, 1, 2, 3}.

  * `m16n8k16`: A thread-pair within a group of four consecutive threads contributes the sparsity metadata. Hence, the sparsity selector must be either 0 (threads T0, T1) or 1 (threads T2, T3); any other value results in an undefined behavior.


Sparse `mma.sp{::ordered_metadata}` with integer type

When matrices A and B have `.u8`/`.s8` elements, matrix A is structured sparse at a granularity of 2:4. In other words, each chunk of four adjacent elements in a row of matrix A have two zeroes and two non-zero elements. Only the two non-zero elements are stored in sparse matrix and their positions in the four-wide chunk are indicated by two 2-bit indices in the metadata. For `mma.sp::ordered_metadata`, `0b0100`, `0b1000`, `0b1001`, `0b1100`, `0b1101`, `0b1110` are the meaningful values of indices; any other values result in an undefined behavior.

![_images/u8s8-metadata-example.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/u8s8-metadata-example.png)

Figure 114 Sparse MMA metadata example for `.u8`/`.s8` type.

when matrices A and B have `.u4`/`.s4` elements, matrix A is pair-wise structured sparse at a granularity of 4:8. In other words, each chunk of eight adjacent elements in a row of matrix A has four zeroes and four non-zero values. Further, the zero and non-zero values are clustered in sub-chunks of two elements each within the eight-wide chunk. i.e., each two-wide sub-chunk within the eight-wide chunk must be all zeroes or all non-zeros. Only the four non-zero values are stored in sparse matrix and the positions of the two two-wide sub-chunks with non-zero values in the eight-wide chunk of a row of matrix A are indicated by two 2-bit indices in the metadata. For `mma.sp::ordered_metadata`, `0b0100`, `0b1000`, `0b1001`, `0b1100`, `0b1101`, `0b1110` are the meaningful values of indices; any other values result in an undefined behavior.

![_images/u4s4-metadata-example.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/u4s4-metadata-example.png)

Figure 115 Sparse MMA metadata example for `.u4`/`.s4` type.

The sparsity selector indicates the threads which contribute metadata as listed below:

  * `m16n8k32` with `.u8`/`.s8` type and `m16n8k64` with `.u4`/`.s4` type: A thread-pair within a group of four consecutive threads contributes the sparsity metadata. Hence, the sparsity selector must be either 0 (threads T0, T1) or 1 (threads T2, T3); any other value results in an undefined behavior.

  * `m16n8k64` with `.u8`/`.s8` type and `m16n8k128` with `.u4`/`.s4` type: All threads within a group of four consecutive threads contribute the sparsity metadata. Hence, the sparsity selector in this case must be 0. Any other value of sparsity selector results in an undefined behavior.


Sparse `mma.sp{::ordered_metadata}` operating on `.e4m3`/`.e5m2`/`.e3m2`/`.e2m3`/`.e2m1` type with `.kind::f8f6f4` or `.kind::mxf8f6f4`

When matrices A and B have `.e4m3`/`.e5m2`/`.e3m2`/`.e2m3`/`.e2m1` elements, matrix A is structured sparse at a granularity of 2:4. In other words, each chunk of four adjacent elements in a row of matrix A have two zeroes and two non-zero elements. Only the two non-zero elements are stored in sparse matrix and their positions in the four-wide chunk are indicated by two 2-bit indices in the metadata. `0b0100`, `0b1000`, `0b1001`, `0b1100`, `0b1101`, `0b1110` are the meaningful values of indices; any other values result in an undefined behavior.

![_images/fp8-metadata-example.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/fp8-metadata-example.png)

Figure 116 Sparse MMA metadata example for `.e4m3`/`.e5m2`/`.e3m2`/`.e2m3`/`.e2m1` type.

The sparsity selector indicates the threads which contribute metadata as listed below:

  * `m16n8k64`: All threads within a group of four consecutive threads contribute the sparsity metadata. Hence, the sparsity selector in this case must be 0. Any other value of sparsity selector results in an undefined behavior.


Sparse `mma.sp::ordered_metadata` operating on `.e2m1` type with `.kind::mxf4` or `.kind::mxf4nvf4`

When matrices A and B have `.e2m1` elements, matrix A is pair-wise structured sparse at a granularity of 4:8. In other words, each chunk of eight adjacent elements in a row of matrix A has four zeroes and four non-zero values. Further, the zero and non-zero values are clustered in sub-chunks of two elements each within the eight-wide chunk. i.e., each two-wide sub-chunk within the eight-wide chunk must be all zeroes or all non-zeros. Only the four non-zero values are stored in sparse matrix and the positions of the two two-wide sub-chunks with non-zero values in the eight-wide chunk of a row of matrix A are indicated by two 2-bit indices in the metadata. `0b0100`, `0b1000`, `0b1001`, `0b1100`, `0b1101`, `0b1110` are the meaningful values of indices; any other values result in an undefined behavior.

![_images/fp4-metadata-example.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/fp4-metadata-example.png)

Figure 117 Sparse MMA metadata example for `.e2m1` type with `.kind::mxf4` or `.kind::mxf4nvf4`

The sparsity selector indicates the threads which contribute metadata as listed below:

  * `m16n8k128`: All threads within a group of four consecutive threads contribute the sparsity metadata. Hence, the sparsity selector in this case must be 0. Any other value of sparsity selector results in an undefined behavior.

#####  9.7.14.6.2. [Matrix fragments for multiply-accumulate operation with sparse matrix A](<#warp-level-matrix-fragments-for-sparse-mma>)

In this section we describe how the contents of thread registers are associated with fragments of various matrices and the sparsity metadata. The following conventions are used throughout this section:

  * For matrix A, only the layout of a fragment is described in terms of register vector sizes and their association with the matrix data.

  * For matrix B, when the combination of matrix dimension and the supported data type is not already covered in [Matrix multiply-accumulate operation using mma instruction](<#warp-level-matrix-instructions-for-mma>), a pictorial representation of matrix fragments is provided.

  * For matrices C and D, since the matrix dimension - data type combination is the same for all supported shapes, and is already covered in [Matrix multiply-accumulate operation using mma instruction](<#warp-level-matrix-instructions-for-mma>), the pictorial representations of matrix fragments are not included in this section.

  * For the metadata operand, pictorial representations of the association between indices of the elements of matrix A and the contents of the metadata operand are included. `Tk: [m..n]` present in cell `[x][y..z]` indicates that bits `m` through `n` (with `m` being higher) in the metadata operand of thread with `%laneid=k` contains the indices of the non-zero elements from the chunk `[x][y]..[x][z]` of matrix A.


######  9.7.14.6.2.1. [Matrix Fragments for sparse `mma.m16n8k16` with `.f16` and `.bf16` types](<#warp-level-matrix-fragment-sparse-mma-16816-f16bf16>)

A warp executing sparse `mma.m16n8k16` with `.f16` / `.bf16` floating point type will compute an MMA operation of shape `.m16n8k16`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements  
---|---|---  
`.f16` / `.bf16` | A vector expression containing two `.b32` registers, with each register containing two non-zero `.f16` / `.bf16` elements out of 4 consecutive elements from matrix A. | Mapping of the non-zero elements is as described in [Sparse matrix storage](<#warp-level-sparse-matrix-storage>).  
  
The layout of the fragments held by different threads is shown in [Figure 118](<#sparse-mma-16816-f16-bf16-a>).

![_images/sparse-mma-16816-f16-bf16-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16816-f16-bf16-A.png)

Figure 118 Sparse MMA .m16n8k16 fragment layout for matrix A with `.f16`/`.bf16` type.

The row and column of a matrix fragment can be computed as:
        
        groupID = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID            for a0 and a1
                   groupID + 8        for a2 and a3
        
        col = [firstcol ... lastcol]  // As per the mapping of non-zero elements
                                      // as described in Sparse matrix storage
        
        Where
        firstcol = threadID_in_group * 4
        lastcol  = firstcol + 3
        

  * Matrix fragments for multiplicand B and accumulators C and D are the same as in case of [Matrix Fragments for mma.m16n8k16 with floating point type](<#warp-level-matrix-fragment-mma-16816-float>) for `.f16`/`.b16` formats.

  * Metadata: A `.b32` register containing 16 2-bit vectors each storing the index of a non-zero element of a 4-wide chunk of matrix A as shown in [Figure 119](<#sparse-mma-metadata-16816-f16bf16>).

> ![_images/sparse-mma-metadata-16816-f16bf16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-metadata-16816-f16bf16.png)
> 
> Figure 119 Sparse MMA .m16n8k16 metadata layout for `.f16`/`.bf16` type.


######  9.7.14.6.2.2. [Matrix Fragments for sparse `mma.m16n8k32` with `.f16` and `.bf16` types](<#warp-level-matrix-fragment-sparse-mma-16832-f16bf16>)

A warp executing sparse `mma.m16n8k32` with `.f16` / `.bf16` floating point type will compute an MMA operation of shape `.m16n8k32`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements  
---|---|---  
`.f16` / `.bf16` | A vector expression containing four `.b32` registers, with each register containing two non-zero `.f16` / `.bf16` elements out of 4 consecutive elements from matrix A. | Mapping of the non-zero elements is as described in [Sparse matrix storage](<#warp-level-sparse-matrix-storage>).  
  
The layout of the fragments held by different threads is shown in [Figure 120](<#sparse-mma-16832-f16-bf16-a>).

![_images/sparse-mma-16832-f16-bf16-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16832-f16-bf16-A.png)

Figure 120 Sparse MMA .m16n8k32 fragment layout for matrix A with `.f16`/`.bf16` type.

The row and column of a matrix fragment can be computed as:
        
        groupID = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID            for ai where  0 <= i < 2 || 4 <= i < 6
                   groupID + 8        Otherwise
        
        col = [firstcol ... lastcol]  // As per the mapping of non-zero elements
                                      // as described in Sparse matrix storage
        
        Where
        firstcol = threadID_in_group * 4          For ai where i <  4
                   (threadID_in_group * 4) + 16   for ai where i >= 4
        lastcol  = firstcol + 3
        

  * Multiplicand B:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.f16` / `.bf16` | A vector expression containing four `.b32` registers, each containing two `.f16` / `.bf16` elements from matrix B. | b0, b1, b2, b3  
  
The layout of the fragments held by different threads is shown in [Figure 121](<#sparse-mma-16832-f16bf16-b>).

![_images/sparse-mma-16832-f16bf16-B.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16832-f16bf16-B.png)

Figure 121 Sparse MMA .m16n8k32 fragment layout for matrix B with `.f16`/`.bf16` type.

  * Matrix fragments for accumulators C and D are the same as in case of [Matrix Fragments for mma.m16n8k16 with floating point type](<#warp-level-matrix-fragment-mma-16816-float>) for `.f16`/`.b16` formats.

  * Metadata: A `.b32` register containing 16 2-bit vectors with each pair of 2-bit vectors storing the indices of two non-zero element from a 4-wide chunk of matrix A as shown in [Figure 122](<#sparse-mma-metadata-16832-f16bf16>).

> ![_images/sparse-mma-metadata-16832-f16bf16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-metadata-16832-f16bf16.png)
> 
> Figure 122 Sparse MMA .m16n8k32 metadata layout for `.f16`/`.bf16` type.


######  9.7.14.6.2.3. [Matrix Fragments for sparse `mma.m16n8k16` with `.tf32` floating point type](<#warp-level-matrix-fragment-sparse-mma-16816-tf32>)

A warp executing sparse `mma.m16n8k16` with `.tf32` floating point type will compute an MMA operation of shape `.m16n8k16`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements  
---|---|---  
`.tf32` | A vector expression containing four `.b32` registers, with each register containing one non-zero `.tf32` element out of 2 consecutive elements from matrix A. | Mapping of the non-zero elements is as described in [Sparse matrix storage](<#warp-level-sparse-matrix-storage>).  
  
The layout of the fragments held by different threads is shown in [Figure 123](<#sparse-mma-16816-tf32-a>).

![_images/sparse-mma-16816-tf32-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16816-tf32-A.png)

Figure 123 Sparse MMA .m16n8k16 fragment layout for matrix A with `.tf32` type.

The row and column of a matrix fragment can be computed as:
        
        groupID = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID            for a0 and a2
                   groupID + 8        for a1 and a3
        
        col = [firstcol ... lastcol]  // As per the mapping of non-zero elements
                                      // as described in Sparse matrix storage
        
        Where
        firstcol = threadID_in_group * 2          for a0 and a1
                   (threadID_in_group * 2) + 8    for a2 and a3
        lastcol  = firstcol + 1
        

  * Multiplicand B:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.tf32` | A vector expression containing four `.b32` registers, each containing four `.tf32` elements from matrix B. | b0, b1, b2, b3  
  
The layout of the fragments held by different threads is shown in [Figure 124](<#sparse-mma-16816-tf32-b>).

![_images/sparse-mma-16816-tf32-B.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16816-tf32-B.png)

Figure 124 Sparse MMA .m16n8k16 fragment layout for matrix B with `.tf32` type.

  * Matrix fragments for accumulators C and D are the same as in case of [Matrix Fragments for mma.m16n8k16 with floating point type](<#warp-level-matrix-fragment-mma-16816-float>).

  * Metadata: A `.b32` register containing 8 4-bit vectors each storing the index of a non-zero element of a 2-wide chunk of matrix A as shown in [Figure 125](<#sparse-mma-metadata-16816-tf32>).

> ![_images/sparse-mma-metadata-16816-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-metadata-16816-tf32.png)
> 
> Figure 125 Sparse MMA .m16n8k16 metadata layout for `.tf32` type.


######  9.7.14.6.2.4. [Matrix Fragments for sparse `mma.m16n8k8` with `.tf32` floating point type](<#warp-level-matrix-fragment-sparse-mma-1688-tf32>)

A warp executing sparse `mma.m16n8k8` with `.tf32` floating point type will compute an MMA operation of shape `.m16n8k8`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements  
---|---|---  
`.tf32` | A vector expression containing two `.b32` registers, each containing one non-zero `.tf32` element out of 2 consecutive elements from matrix A. | Mapping of the non-zero elements is as described in [Sparse matrix storage](<#warp-level-sparse-matrix-storage>).  
  
The layout of the fragments held by different threads is shown in [Figure 126](<#sparse-mma-1688-tf32>).

![_images/sparse-mma-1688-tf32-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-1688-tf32-A.png)

Figure 126 Sparse MMA .m16n8k8 fragment layout for matrix A with `.tf32` type.

The row and column of a matrix fragment can be computed as:
        
        groupID = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID            for a0
                   groupID + 8        for a1
        
        col = [firstcol ... lastcol]  // As per the mapping of non-zero elements
                                      // as described in Sparse matrix storage
        
        Where
        firstcol = threadID_in_group * 2
        lastcol  = firstcol + 1
        

  * Matrix fragments for multiplicand B and accumulators C and D are the same as in case of [Matrix Fragments for mma.m16n8k8](<#warp-level-matrix-fragment-mma-1688>) for `.tf32` format.

  * Metadata: A `.b32` register containing 8 4-bit vectors each storing the index of a non-zero element of a 2-wide chunk of matrix A as shown in [Figure 127](<#sparse-mma-metadata-1688-tf32>).

> ![_images/sparse-mma-metadata-1688-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-metadata-1688-tf32.png)
> 
> Figure 127 Sparse MMA .m16n8k8 metadata layout for `.tf32` type.


######  9.7.14.6.2.5. [Matrix Fragments for sparse `mma.m16n8k32` with `.u8` / `.s8` integer type](<#warp-level-matrix-fragment-sparse-mma-16832-u8s8>)

A warp executing sparse `mma.m16n8k32` with `.u8` / `.s8` integer type will compute an MMA operation of shape `.m16n8k32`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements  
---|---|---  
`.u8` / `.s8` | A vector expression containing two `.b32` registers, with each register containing four non-zero `.u8` / `.s8` elements out of 8 consecutive elements from matrix A. | Mapping of the non-zero elements is as described in [Sparse matrix storage](<#warp-level-sparse-matrix-storage>).  
  
The layout of the fragments held by different threads is shown in [Figure 128](<#sparse-mma-16832-u8s8-a>).

![_images/sparse-mma-16832-u8s8-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16832-u8s8-A.png)

Figure 128 Sparse MMA .m16n8k32 fragment layout for matrix A with `.u8`/`.s8` type.
        
        groupID = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID            for ai where  0 <= i < 4
                   groupID + 8        Otherwise
        
        col = [firstcol ... lastcol]  // As per the mapping of non-zero elements
                                      // as described in Sparse matrix storage
        
        Where
        firstcol = threadID_in_group * 8
        lastcol  = firstcol + 7
        

  * Matrix fragments for multiplicand B and accumulators C and D are the same as in case of [Matrix Fragments for mma.m16n8k32](<#warp-level-matrix-fragment-mma-16832>).

  * Metadata: A `.b32` register containing 16 2-bit vectors with each pair of 2-bit vectors storing the indices of two non-zero elements from a 4-wide chunk of matrix A as shown in [Figure 129](<#sparse-mma-metadata-16832-u8s8>).

> ![_images/sparse-mma-metadata-16832-u8s8.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-metadata-16832-u8s8.png)
> 
> Figure 129 Sparse MMA .m16n8k32 metadata layout for `.u8`/`.s8` type.


######  9.7.14.6.2.6. [Matrix Fragments for sparse `mma.m16n8k64` with `.u8` / `.s8` / `.e4m3` / `.e5m2` type](<#warp-level-matrix-fragment-sparse-mma-16864-u8s8-fp8>)

A warp executing sparse `mma.m16n8k64` with `.u8` / `.s8`/ `.e4m3`/ `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` type will compute an MMA operation of shape `.m16n8k64`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements  
---|---|---  
`.u8` / `.s8` | A vector expression containing four `.b32` registers, with each register containing four non-zero `.u8` / `.s8` elements out of 8 consecutive elements from matrix A. | Mapping of the non-zero elements is as described in [Sparse matrix storage](<#warp-level-sparse-matrix-storage>).  
`.e4m3` / `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` | A vector expression containing four `.b32` registers, with each register containing four non-zero `.e4m3` / `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` elements out of 8 consecutive elements from matrix A.  
  
The layout of the fragments held by different threads is shown in [Figure 130](<#sparse-mma-16864-u8s8-a-first32col>) and [Figure 131](<#sparse-mma-16864-u8s8-a-last32col>).

![_images/sparse-mma-16864-u8s8-A-first32col.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16864-u8s8-A-first32col.png)

Figure 130 Sparse MMA .m16n8k64 fragment layout for columns 0–31 of matrix A with `.u8`/`.s8`/`.e4m3`/`.e5m2`/`.e3m2`/`.e2m3`/`.e2m1` type.

![_images/sparse-mma-16864-u8s8-A-last32col.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16864-u8s8-A-last32col.png)

Figure 131 Sparse MMA .m16n8k64 fragment layout for columns 32–63 of matrix A with `.u8`/`.s8`/`.e4m3`/`.e5m2`/`.e3m2`/`.e2m3`/`.e2m1` type.
        
        groupID = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID            for ai where  0 <= i < 4 || 8 <= i < 12
                   groupID + 8        Otherwise
        
        col = [firstcol ... lastcol]  // As per the mapping of non-zero elements
                                      // as described in Sparse matrix storage
        
        Where
        firstcol = threadID_in_group * 8           For ai where i <  8
                   (threadID_in_group * 8) + 32    For ai where i >= 8
        lastcol  = firstcol + 7
        

  * Multiplicand B:

.btype | Fragment | Elements (low to high)  
---|---|---  
`.u8` / `.s8` | A vector expression containing four `.b32` registers, each containing four `.u8` / `.s8` elements from matrix B. | b0, b1, b2, b3, …, b15  
`.e4m3` / `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` | A vector expression containing four `.b32` registers, each containing four `.e4m3` / `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` elements from matrix B.  
  
The layout of the fragments held by different threads is shown in [Figure 132](<#sparse-mma-16864-u8s8-b1>), [Figure 133](<#sparse-mma-16864-u8s8-b2>), [Figure 134](<#sparse-mma-16864-u8s8-b3>) and [Figure 135](<#sparse-mma-16864-u8s8-b4>).

![_images/sparse-mma-16864-u8s8-B1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16864-u8s8-B1.png)

Figure 132 Sparse MMA .m16n8k64 fragment layout for rows 0–15 of matrix B with `.u8`/`.s8`/`.e4m3`/`.e5m2`/`.e3m2`/`.e2m3`/`.e2m1` type.

![_images/sparse-mma-16864-u8s8-B2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16864-u8s8-B2.png)

Figure 133 Sparse MMA .m16n8k64 fragment layout for rows 16–31 of matrix B with `.u8`/`.s8`/`.e4m3`/`.e5m2`/`.e3m2`/`.e2m3`/`.e2m1` type.

![_images/sparse-mma-16864-u8s8-B3.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16864-u8s8-B3.png)

Figure 134 Sparse MMA .m16n8k64 fragment layout for rows 32–47 of matrix B with `.u8`/`.s8`/`.e4m3`/`.e5m2`/`.e3m2`/`.e2m3`/`.e2m1` type.

![_images/sparse-mma-16864-u8s8-B4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16864-u8s8-B4.png)

Figure 135 Sparse MMA .m16n8k64 fragment layout for rows 48–63 of matrix B with `.u8`/`.s8`/`.e4m3`/`.e5m2`/`.e3m2`/`.e2m3`/`.e2m1` type.

  * Matrix fragments for accumulators C and D are the same as in case of [Matrix Fragments for mma.m16n8k16 with integer type](<#warp-level-matrix-fragment-mma-16816-i8-f8>).

  * Metadata: A `.b32` register containing 16 2-bit vectors with each pair of 2-bit vectors storing the indices of two non-zero elements from a 4-wide chunk of matrix A as shown in [Figure 136](<#sparse-mma-metadata-16864-u8s8-first32col>) and [Figure 137](<#sparse-mma-metadata-16864-u8s8-last32col>).

> ![_images/sparse-mma-metadata-16864-u8s8-first32col.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-metadata-16864-u8s8-first32col.png)
> 
> Figure 136 Sparse MMA .m16n8k64 metadata layout for columns 0–31 for `.u8`/`.s8`/`.e4m3`/`.e5m2`/`.e3m2`/`.e2m3`/`.e2m1` type.
> 
> ![_images/sparse-mma-metadata-16864-u8s8-last32col.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-metadata-16864-u8s8-last32col.png)
> 
> Figure 137 Sparse MMA .m16n8k64 metadata layout for columns 32–63 for `.u8`/`.s8`/`.e4m3`/`.e5m2`/`.e3m2`/`.e2m3`/`.e2m1` type.


######  9.7.14.6.2.7. [Matrix Fragments for sparse `mma.m16n8k64` with `.u4` / `.s4` integer type](<#warp-level-matrix-fragment-sparse-mma-16864-u4s4>)

A warp executing sparse `mma.m16n8k64` with `.u4` / `.s4` integer type will compute an MMA operation of shape `.m16n8k64`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements  
---|---|---  
`.u4` / `.s4` | A vector expression containing two `.b32` registers, with each register containing eight non-zero `.u4` / `.s4` elements out of 16 consecutive elements from matrix A. | Mapping of the non-zero elements is as described in [Sparse matrix storage](<#warp-level-sparse-matrix-storage>).  
  
The layout of the fragments held by different threads is shown in [Figure 138](<#sparse-mma-16864-u4s4-a>).

![_images/sparse-mma-16864-u4s4-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16864-u4s4-A.png)

Figure 138 Sparse MMA .m16n8k64 fragment layout for matrix A with `.u4`/`.s4` type.
        
        groupID = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID            for ai where  0 <= i < 8
                   groupID + 8        Otherwise
        
        col = [firstcol ... lastcol]  // As per the mapping of non-zero elements
                                      // as described in Sparse matrix storage
        
        Where
        firstcol = threadID_in_group * 16
        lastcol  = firstcol + 15
        

  * Matrix fragments for multiplicand B and accumulators C and D are the same as in case of [Matrix Fragments for mma.m16n8k64](<#warp-level-matrix-fragment-mma-16864>).

  * Metadata: A `.b32` register containing 16 2-bit vectors with each pair of 2-bit vectors storing the indices of four non-zero elements from a 8-wide chunk of matrix A as shown in [Figure 139](<#sparse-mma-metadata-16864-u4s4>).

> ![_images/sparse-mma-metadata-16864-u4s4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-metadata-16864-u4s4.png)
> 
> Figure 139 Sparse MMA .m16n8k64 metadata layout for `.u4`/`.s4` type.


######  9.7.14.6.2.8. [Matrix Fragments for sparse `mma.m16n8k128` with `.u4` / `.s4` integer type](<#warp-level-matrix-fragment-sparse-mma-168128-u4s4>)

A warp executing sparse `mma.m16n8k128` with `.u4` / `.s4` / `.e2m1` integer type will compute an MMA operation of shape `.m16n8k128`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements  
---|---|---  
`.u4` / `.s4` | A vector expression containing four `.b32` registers, with each register containing eight non-zero `.u4` / `.s4` elements out of 16 consecutive elements from matrix A. | Mapping of the non-zero elements is as described in [Sparse matrix storage](<#warp-level-sparse-matrix-storage>).  
`.e2m1` | A vector expression containing four `.b32` registers, with each register containing eight non-zero `.e2m1` elements out of 16 consecutive elements from matrix A.  
  
The layout of the fragments held by different threads is shown in [Figure 140](<#sparse-mma-168128-u4s4-a-first64col>) and [Figure 141](<#sparse-mma-168128-u4s4-a-last64col>).

![_images/sparse-mma-168128-u4s4-A-first64col.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-168128-u4s4-A-first64col.png)

Figure 140 Sparse MMA .m16n8k128 fragment layout for columns 0–63 of matrix A with `.u4`/`.s4`/`.e2m1` type.

![_images/sparse-mma-168128-u4s4-A-last64col.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-168128-u4s4-A-last64col.png)

Figure 141 Sparse MMA .m16n8k128 fragment layout for columns 64–127 of matrix A with `.u4`/`.s4`/`.e2m1` type.
        
        groupID = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID            for ai where  0 <= i < 8 || 16 <= i < 24
                   groupID + 8        Otherwise
        
        col = [firstcol ... lastcol]  // As per the mapping of non-zero elements
                                      // as described in Sparse matrix storage
        
        Where
        firstcol = threadID_in_group * 16           For ai where i <  16
                   (threadID_in_group * 16) + 64    For ai where i >= 16
        lastcol  = firstcol + 15
        

  * Multiplicand B:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.u4` / `.s4` | A vector expression containing four `.b32` registers, each containing eight `.u4` / `.s4` elements from matrix B. | b0, b1, b2, b3, …, b31  
`.e2m1` | A vector expression containing four `.b32` registers, each containing eight `.e2m1` elements from matrix B.  
  
The layout of the fragments held by different threads is shown in [Figure 142](<#sparse-mma-168128-u4s4-b1>), [Figure 143](<#sparse-mma-168128-u4s4-b2>), [Figure 144](<#sparse-mma-168128-u4s4-b3>), [Figure 145](<#sparse-mma-168128-u4s4-b4>).

![_images/sparse-mma-168128-u4s4-B1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-168128-u4s4-B1.png)

Figure 142 Sparse MMA .m16n8k128 fragment layout for rows 0–31 of matrix B with `.u4`/`.s4`/`.e2m1` type.

![_images/sparse-mma-168128-u4s4-B2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-168128-u4s4-B2.png)

Figure 143 Sparse MMA .m16n8k128 fragment layout for rows 32–63 of matrix B with `.u4`/`.s4`/`.e2m1` type.

![_images/sparse-mma-168128-u4s4-B3.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-168128-u4s4-B3.png)

Figure 144 Sparse MMA .m16n8k128 fragment layout for rows 64–95 of matrix B with `.u4`/`.s4`/`.e2m1` type.

![_images/sparse-mma-168128-u4s4-B4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-168128-u4s4-B4.png)

Figure 145 Sparse MMA .m16n8k128 fragment layout for rows 96–127 of matrix B with `.u4`/`.s4`/`.e2m1` type.

  * Matrix fragments for accumulators C and D are the same as in case of [Matrix Fragments for mma.m16n8k64](<#warp-level-matrix-fragment-mma-16864>).

  * Metadata: A `.b32` register containing 16 2-bit vectors with each pair of 2-bit vectors storing the indices of four non-zero elements from a 8-wide chunk of matrix A as shown in [Figure 146](<#sparse-mma-metadata-168128-u4s4-first64col>) and [Figure 147](<#sparse-mma-metadata-168128-u4s4-last64col>).

> ![_images/sparse-mma-metadata-168128-u4s4-first64col.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-metadata-168128-u4s4-first64col.png)
> 
> Figure 146 Sparse MMA .m16n8k128 metadata layout for columns 0–63 for `.u4`/`.s4`/`.e2m1` type.
> 
> ![_images/sparse-mma-metadata-168128-u4s4-last64col.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-metadata-168128-u4s4-last64col.png)
> 
> Figure 147 Sparse MMA .m16n8k128 metadata layout for columns 64–127 for `.u4`/`.s4`/`.e2m1` type.

#####  9.7.14.6.3. [Multiply-and-Accumulate Instruction: `mma.sp` / `mma.sp::ordered_metadata`](<#warp-level-matrix-instructions-sparse-mma>)

`mma.sp`, `mma.sp::ordered_metadata`

Perform matrix multiply-and-accumulate operation with sparse matrix A

Syntax

Half precision floating point type:
    
    
    mma.spvariant.sync.aligned.m16n8k16.row.col.dtype.f16.f16.ctype  d, a, b, c, e, f;
    mma.spvariant.sync.aligned.m16n8k32.row.col.dtype.f16.f16.ctype  d, a, b, c, e, f;
    
    .ctype     = {.f16, .f32};
    .dtype     = {.f16, .f32};
    .spvariant = {.sp, .sp::ordered_metadata};
    

Alternate floating point type:
    
    
    mma.spvariant.sync.aligned.m16n8k16.row.col.f32.bf16.bf16.f32     d, a, b, c, e, f;
    mma.spvariant.sync.aligned.m16n8k32.row.col.f32.bf16.bf16.f32     d, a, b, c, e, f;
    mma.spvariant.sync.aligned.m16n8k8.row.col.f32.tf32.tf32.f32      d, a, b, c, e, f;
    mma.spvariant.sync.aligned.m16n8k16.row.col.f32.tf32.tf32.f32     d, a, b, c, e, f;
    mma.spvariant.sync.aligned.m16n8k64.row.col.f32.f8type.f8type.f32 d, a, b, c, e, f;
    mma.sp::ordered_metadata.sync.aligned.m16n8k64.row.col.kind.dtype.f8f6f4type.f8f6f4type.ctype d, a, b, c, e, f;
    
    .f8type     = {.e4m3, .e5m2};
    .spvariant  = {.sp, .sp::ordered_metadata};
    .f8f6f4type = {.e4m3, .e5m2, .e3m2, .e2m3, .e2m1};
    .kind       = {kind::f8f6f4};
    .ctype      = {.f16, .f32};
    .dtype      = {.f16, .f32};
    

Alternate floating point type with block scaling:
    
    
    mma.spvariant.sync.aligned.m16n8k128.row.col.kind.block_scale{.scale_vec_size}.f32.e2m1.e2m1.f32.stype d, a, b, c, e, f, scale-a-data, {byte-id-a, thread-id-a}, scale-b-data, {byte-id-b, thread-id-b};
    
    .spvariant      = {.sp::ordered_metadata};
    .kind           = {.kind::mxf4};
    .scale_vec_size = {.scale_vec::2X};
    .stype          = {.ue8m0};
    
    mma.spvariant.sync.aligned.m16n8k128.row.col.kind.block_scale.scale_vec_size.f32.e2m1.e2m1.f32.stype d, a, b, c, e, f, scale-a-data, {byte-id-a, thread-id-a}, scale-b-data, {byte-id-b, thread-id-b};
    
    .spvariant      = {.sp::ordered_metadata};
    .kind           = {.kind::mxf4nvf4};
    .scale_vec_size = {.scale_vec::2X, .scale_vec::4X};
    .stype          = {.ue8m0, .ue4m3};
    
    mma.spvariant.sync.aligned.m16n8k64.row.col.kind.block_scale{.scale_vec_size}.f32.f8f6f4type.f8f6f4type.f32.stype d, a, b, c, e, f, scale-a-data, {byte-id-a, thread-id-a}, scale-b-data, {byte-id-b, thread-id-b};
    
    .spvariant      = {.sp::ordered_metadata};
    .kind           = {.kind::mxf8f6f4};
    .scale_vec_size = {.scale_vec::1X};
    .f8f6f4type     = {.e4m3, .e5m2, .e3m2, .e2m3, .e2m1};
    .stype          = {.ue8m0};
    

Integer type:
    
    
    mma.spvariant.sync.aligned.shape.row.col{.satfinite}.s32.atype.btype.s32 d, a, b, c, e, f;
    
    .shape     = {.m16n8k32, .m16n8k64}
    .atype     = {.u8, .s8};
    .btype     = {.u8, .s8};
    .spvariant = {.sp, .sp::ordered_metadata};
    
    mma.spvariant.sync.aligned.shape.row.col{.satfinite}.s32.atype.btype.s32 d, a, b, c, e, f;
    
    .shape     = {.m16n8k64, .m16n8k128}
    .atype     = {.u4, .s4};
    .btype     = {.u4, .s4};
    .spvariant = {.sp, .sp::ordered_metadata};
    

Description

Perform a `MxNxK` matrix multiply and accumulate operation, `D = A*B+C`, where the A matrix is `MxK`, the B matrix is `KxN`, and the C and D matrices are `MxN`.

A warp executing `mma.sp.sync/mma.sp::ordered_metadata.sync` instruction compute a single matrix multiply and accumulate operation.

Qualifier `.block_scale` specifies that the matrices `A` and `B` are scaled with `scale_A` and `scale_B` matrices respectively before performing the matrix multiply and accumulate operation as specified in the section [Block Scaling](<#warp-level-block-scaling>). The data type corresponding to each of the element within `scale_A` and `scale_B` matrices is specified by `.stype`. Qualifier `.scale_vec_size` specifies the number of columns of `scale_A` matrix and number of rows in the matrix `scale_B`.

The valid combinations of `.kind`, `.stype` and `.scale_vec_size` are described in [Table 36](<#mma-scaling-kind-type-valid-combination>). For `mma` with `.kind::mxf4` when the qualifier `.scale_vec_size` is not specified, then it defaults to `2X`. In contrast, when `.kind` is specified as `.kind::mxf8f6f4` then the qualifier `.scale_vec_size` defaults to `1X`. However, for `.kind::mxf4nvf4`, it is mandatory to provide valid `.scale_vec_size`.

Operands `a` and `b` represent two multiplicand matrices A and B, while `c` and `d` represent the accumulator and destination matrices, distributed across the threads in warp. Matrix A is structured sparse as described in [Sparse matrix storage](<#warp-level-sparse-matrix-storage>) Operands `e` and `f` represent sparsity metadata and sparsity selector respectively. Operand `e` is a 32-bit integer and operand `f` is a 32-bit integer constant with values in the range 0..3. When `.block_scale` qualifier is specified, operand `scale-a-data`, `scale-b-data` represents the scale matrix metadata corresponding to `scale_A` and `scale_B` matrices respectively. The tuple `{byte-id-a, thread-id-a}` and `{byte-id-b, thread-id-b}` represent selectors for matrices `scale_A` and `scale_B` respectively from their corresponding metadata arguments `scale-a-data`, `scale-b-data`. The operands `scale-a-data`, `scale-b-data` are of type `.b32`. The operands `byte-id-a`, `thread-id-a`, `byte-id-b`, `thread-id-b` are unsigned 16-bit integer values. For more details on selector arguments refer [Block Scaling for mma.sync](<#warp-level-block-scaling>) section.

Instruction `mma.sp::ordered_metadata` requires the indices in the sparsity metadata to be sorted in an increasing order starting from LSB, otherwise behavior is undefined.

The registers in each thread hold a fragment of matrix as described in [Matrix fragments for multiply-accumulate operation with sparse matrix A](<#warp-level-matrix-fragments-for-sparse-mma>).

The qualifiers `.dtype`, `.atype`, `.btype` and `.ctype` indicate the data-type of the elements in the matrices D, A, B and C respectively. The qualifier `.stype` indicate the data-type of the elements in the matrices `scale_A` and `scale_B`. In case of shapes `.m16n8k16`, `.m16n8k32` and `.m16n8k64`, `.dtype` must be the same as `.ctype`.

When `.kind` is either of `.kind::mxf8f6f4` or `.kind::f8f6f4`, the individual 4-bit and the 6-bit floating point type elements must be packed in an 8-bit container. The matrix element of type `.e2m1` resides in central 4 bits of the 8-bit container with padding in the upper 2 bits and lower 2 bits of the container. When the matrix element is of type `.e3m2` or `.e2m3`, the matrix element resides in the lower 6 bits of the 8-bit container with padding in the upper 2 bits of the container. In contrast, note that when using `mma` with `.kind::mxf4` or `.kind::mxf4nvf4`, no explicit padding is necessary even though matrix elements are of type `.e2m1`.

Precision and rounding :
    

  * `.f16` floating point operations :

Element-wise multiplication of matrix A and B is performed with at least single precision. When `.ctype` or `.dtype` is `.f32`, accumulation of the intermediate values is performed with at least single precision. When both `.ctype` and `.dtype` are specified as `.f16`, the accumulation is performed with at least half precision.

The accumulation order, rounding and handling of subnormal inputs are unspecified.

  * `.e4m3`, `.e5m2`, `.e3m2`, `.e2m3`, `.e2m1` floating point operations :

Element-wise multiplication of matrix A and B is performed with specified precision. Accumulation of the intermediate values is performed with at least single precision.

The accumulation order, rounding, and handling of subnormal inputs are unspecified.

  * `.bf16` and `.tf32` floating point operations :

Element-wise multiplication of matrix A and B is performed with specified precision. Accumulation of the intermediate values is performed with at least single precision.

The accumulation order, rounding, and handling of subnormal inputs are unspecified.

  * Integer operations :

The integer `mma.sp/mma.sp::ordered_metadata` operation is performed with `.s32` accumulators. The `.satfinite` qualifier indicates that on overflow, the accumulated value is limited to the range _MIN_INT32_.. _MAX_INT32_ (where the bounds are defined as the minimum negative signed 32-bit integer and the maximum positive signed 32-bit integer respectively).

If `.satfinite` is not specified, the accumulated value is wrapped instead.


The mandatory `.sync` qualifier indicates that `mma.sp/mma.sp::ordered_metadata` instruction causes the executing thread to wait until all threads in the warp execute the same `mma.sp/mma.sp::ordered_metadata` instruction before resuming execution.

The mandatory `.aligned` qualifier indicates that all threads in the warp must execute the same `mma.sp/mma.sp::ordered_metadata` instruction. In conditionally executed code, a `mma.sp/mma.sp::ordered_metadata` instruction should only be used if it is known that all threads in the warp evaluate the condition identically, otherwise behavior is undefined.

The behavior of `mma.sp/mma.sp::ordered_metadata` instruction is undefined if all threads in the same warp do not use the same qualifiers, or if any thread in the warp has exited.

Notes

`mma.sp` instruction may have substantially reduced performance on some target architectures. Hence, it is advised to use `mma.sp::ordered_metadata` instruction.

PTX ISA Notes

Introduced in PTX ISA version 7.1.

Support for `.e4m3` and `.e5m2` alternate floating point type `mma` operation introduced in PTX ISA version 8.4.

`mma.sp::ordered_metadata` introduced in PTX ISA version 8.5.

Support for shape `.m16n8k32` and `.f16` dtype/ctype with `.e4m3`/`.e5m2` alternate floating point type `mma` operation introduced in PTX ISA version 8.7.

Support for `.e3m2`, `.e2m3`, `.e2m1` alternate floating point type `mma` operation introduced in PTX ISA version 8.7.

Support for `.kind`, `.block_scale`, `.scale_vec_size` qualifier introduced in PTX ISA version 8.7.

Support for `.scale_vec::4X` on `.ue8m0` as `.stype` with `.kind::mxf4nvf4` is introduced in PTX ISA version 9.1

Target ISA Notes

Requires `sm_80` or higher.

`.e4m3` and `.e5m2` alternate floating point type `mma` operation requires `sm_89` or higher.

`mma.sp::ordered_metadata` requires `sm_80` or higher.

Support for shape `.m16n8k32` and `.f16` dtype/ctype with `.e4m3`/`.e5m2` alternate floating point type `mma` operation requires `sm_120`.

`.e3m2`, `.e2m3` and `.e2m1` alternate floating point type `mma` operation requires `sm_120a` and are supported on `sm_120f` or higher in the same family from PTX ISA version 8.8.

Support for `.kind`, `.block_scale`, `.scale_vec_size` qualifier requires `sm_120a` and are supported on `sm_120f` and later generation targets in the same family from PTX ISA version 8.8 except for `.kind::mxf4nvf4`/`.kind::mxf4`.

Qualifiers `.kind::mxf4nvf4` and `.kind::mxf4` are supported on following architectures:

  * `sm_120a`

  * `sm_121a`


Examples of half precision floating point type
    
    
    // f16 elements in C and D matrix
    .reg .f16x2 %Ra<2> %Rb<2> %Rc<2> %Rd<2>
    .reg .b32 %Re;
    mma.sp.sync.aligned.m16n8k16.row.col.f16.f16.f16.f16
      {%Rd0, %Rd1},
      {%Ra0, %Ra1},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1}, %Re, 0x1;
    
    .reg .f16x2 %Ra<2> %Rb<2> %Rc<2> %Rd<2>
    .reg .b32 %Re;
    
    mma.sp::ordered_metadata.sync.aligned.m16n8k16.row.col.f16.f16.f16.f16
      {%Rd0, %Rd1},
      {%Ra0, %Ra1},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1}, %Re, 0x1;
    

Examples of alternate floating point type
    
    
    .reg .b32 %Ra<2>, %Rb<2>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 %Re;
    mma.sp.sync.aligned.m16n8k8.row.col.f32.tf32.tf32.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3}, %Re, 0x1;
    
    .reg .b32 %Ra<2>, %Rb<2>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 %Re;
    mma.sp.sync.aligned.m16n8k16.row.col.f32.bf16.bf16.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3}, %Re, 0x1;
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 %Re;
    mma.sp.sync.aligned.m16n8k32.row.col.f32.bf16.bf16.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1, %Rb2, %Rb3},
      {%Rc0, %Rc1, %Rc2, %Rc3}, %Re, 0x1;
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 %Re;
    mma.sp.sync.aligned.m16n8k64.row.col.f32.e5m2.e4m3.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1, %Rb2, %Rb3},
      {%Rc0, %Rc1, %Rc2, %Rc3}, %Re, 0;
    
    .reg .b32 %Ra<2>, %Rb<2>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 %Re;
    mma.sp::ordered_metadata.sync.aligned.m16n8k16.row.col.f32.bf16.bf16.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3}, %Re, 0x1;
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 %Re;
    mma.sp::ordered_metadata.sync.aligned.m16n8k64.row.col.kind::f8f6f4.f32.e3m2.e2m3.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1, %Rb2, %Rb3},
      {%Rc0, %Rc1, %Rc2, %Rc3}, %Re, 0;
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .b32 %Rc<4>, %Rd<4>;
    .reg .b32 %Re;
    mma.sp::ordered_metadata.sync.aligned.m16n8k64.row.col.kind::f8f6f4.f16.e2m3.e2m1.f16
      {%Rd0, %Rd1},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1, %Rb2, %Rb3},
      {%Rc0, %Rc1}, %Re, 0;
    

Examples of integer type
    
    
    .reg .b32 %Ra<4>, %Rb<4>, %Rc<4>, %Rd<4>;
    .reg .u32 %Re;
    
    // u8 elements in A and B matrix
    mma.sp.sync.aligned.m16n8k32.row.col.satfinite.s32.u8.u8.s32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3}, %Re, 0x1;
    
    // s8 elements in A and B matrix
    mma.sp.sync.aligned.m16n8k64.row.col.satfinite.s32.s8.s8.s32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1, %Rb2, %Rb3},
      {%Rc0, %Rc1, %Rc2, %Rc3}, %Re, 0x0;
    
    // s8 elements in A and B matrix with ordered metadata
    mma.sp::ordered_metadata.sync.aligned.m16n8k64.row.col.satfinite.s32.s8.s8.s32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1, %Rb2, %Rb3},
      {%Rc0, %Rc1, %Rc2, %Rc3}, %Re, 0x0;
    
    // u4 elements in A and B matrix
    mma.sp.sync.aligned.m16n8k64.row.col.s32.s4.s4.s32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3}, %Re, 0x1;
    
    // u4 elements in A and B matrix
    mma.sp.sync.aligned.m16n8k128.row.col.satfinite.s32.u4.u4.s32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1, %Rb2, %Rb3},
      {%Rc0, %Rc1, %Rc2, %Rc3}, %Re, 0x0;
    

Examples of mma with block scale
    
    
     .reg .b32 %Ra<4>, %Rb<4>;
     .reg .f32 %Rc<4>, %Rd<4>;
     .reg .b32 scaleAData, scaleBData;
     .reg .b32 %Re;
     mma.sp::ordered_metadata.sync.aligned.m16n8k128.row.col.kind::mxf4.block_scale.f32.e2m1.e2m1.f32.ue8m0
       {%Rd0, %Rd1, %Rd2, %Rd3},
       {%Ra0, %Ra1, %Ra2, %Ra3},
       {%Rb0, %Rb1, %Rb2, %Rb3},
       {%Rc0, %Rc1, %Rc2, %Rc3},
       %Re, 0,
       scaleAData, {2, 1}, scaleBData, {2, 3};
    
     .reg .b32 %Ra<4>, %Rb<4>;
     .reg .f32 %Rc<4>, %Rd<4>;
     .reg .b32 scaleAData, scaleBData;
     .reg .u16 bidA, bidB, tidA, tidB;
     .reg .b32 %Re;
     mma.sp::ordered_metadata.sync.aligned.m16n8k128.row.col.kind::mxf4nvf4.block_scale.scale_vec::4X.f32.e2m1.e2m1.f32.ue4m3
       {%Rd0, %Rd1, %Rd2, %Rd3},
       {%Ra0, %Ra1, %Ra2, %Ra3},
       {%Rb0, %Rb1, %Rb2, %Rb3},
       {%Rc0, %Rc1, %Rc2, %Rc3},
       %Re, 0,
       scaleAData, {bidA, tidA}, scaleBData, {bidB, tidB};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 scaleAData, scaleBData;
    .reg .u16 bidA, bidB, tidA, tidB;
    .reg .b32 %Re;
    mma.sp::ordered_metadata.sync.aligned.m16n8k128.row.col.kind::mxf4nvf4.block_scale.scale_vec::4X.f32.e2m1.e2m1.f32.ue8m0
     {%Rd0, %Rd1, %Rd2, %Rd3},
     {%Ra0, %Ra1, %Ra2, %Ra3},
     {%Rb0, %Rb1, %Rb2, %Rb3},
     {%Rc0, %Rc1, %Rc2, %Rc3},
     %Re, 0,
     scaleAData, {bidA, tidA}, scaleBData, {bidB, tidB};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 scaleAData, scaleBData;
    .reg .b32 %Re;
    mma.sp::ordered_metadata.sync.aligned.m16n8k64.row.col.kind::mxf8f6f4.block_scale.scale_vec::1X.f32.e3m2.e2m1.f32.ue8m0
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1, %Rb2, %Rb3},
      {%Rc0, %Rc1, %Rc2, %Rc3},
      %Re, 0,
      scaleAData, {0, 1}, scaleBData, {0, 1};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 scaleAData, scaleBData;
    .reg .b32 %Re;
    mma.sp::ordered_metadata.sync.aligned.m16n8k64.row.col.kind::mxf8f6f4.block_scale.scale_vec::1X.f32.e4m3.e5m2.f32.ue8m0
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2,  %Ra3},
      {%Rb0, %Rb1, %Rb2, %Rb3},
      {%Rc0, %Rc1, %Rc2, %Rc3},
      %Re, 0,
      scaleAData, {0, 1}, scaleBData, {0, 0};