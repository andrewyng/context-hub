---
name: ptx-matrix-multiply-accumulate-operation-usingmmainstruction
description: This section describes warp-level `mma`, `ldmatrix`, `stmatrix`, and
  `movmatrix` instructions and the organization of various matrices involved in these
  instructions.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.14.5. Matrix multiply-accumulate operation usingmmainstruction

---
title: "9.7.14.5. Matrix multiply-accumulate operation usingmmainstruction"
section: 9.7.14.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.14.5. Matrix multiply-accumulate operation usingmmainstruction


This section describes warp-level `mma`, `ldmatrix`, `stmatrix`, and `movmatrix` instructions and the organization of various matrices involved in these instructions.

#####  9.7.14.5.1. [Matrix Fragments for `mma.m8n8k4` with `.f16` floating point type](<#warp-level-matrix-fragment-mma-884-f16>)

A warp executing `mma.m8n8k4` with `.f16` floating point type will compute 4 MMA operations of shape `.m8n8k4`.

Elements of 4 matrices need to be distributed across the threads in a warp. The following table shows distribution of matrices for MMA operations.

MMA Computation | Threads participating in MMA computation  
---|---  
MMA computation 1 | Threads with `%laneid` 0-3 (low group) and 16-19 (high group)  
MMA computation 2 | Threads with `%laneid` 4-7 (low group) and 20-23 (high group)  
MMA computation 3 | Threads with `%laneid` 8-11 (low group) and 24-27 (high group)  
MMA computation 4 | Threads with `%laneid` 12-15 (low group) and 28-31 (high group)  
  
For each of the individual MMA computation shown above, each of the required thread holds a fragment of the matrix for performing mma operation as follows:

  * Multiplicand A:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.f16` | A vector expression containing two `.f16x2` registers, with each register containing two `.f16` elements from the matrix A. | a0, a1, a2, a3  
  
The layout of the fragments held by different threads is shown below:

    * Fragment layout for Row Major matrix A is shown in [Figure 46](<#mma-884-a-row-f16>).

![_images/mma-884-A-row-f16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-884-A-row-f16.png)

Figure 46 MMA .m8n8k4 fragment layout for row-major matrix A with `.f16` type

The row and column of a matrix fragment can be computed as:
          
          row =            %laneid % 4          if %laneid < 16
                          (%laneid % 4) + 4     otherwise
          
          col =            i                    for ai where i = {0,..,3}
          

    * Fragment layout for Column Major matrix A is shown in [Figure 47](<#mma-884-a-col-f16>).

The layout of the fragments held by different threads is shown below:

![_images/mma-884-A-col-f16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-884-A-col-f16.png)

Figure 47 MMA .m8n8k4 fragment layout for column-major matrix A with `.f16` type

The row and column of a matrix fragment can be computed as:
          
          row =        i % 4            for ai  where i = {0,..,3}   if %laneid < 16
                      (i % 4) + 4       for ai  where i = {0,..,3}   otherwise
          
          col =        %laneid % 4
          

  * Multiplicand B:

.btype | Fragment | Elements (low to high)  
---|---|---  
`.f16` | A vector expression containing two `.f16x2` registers, with each register containing two `.f16` elements from the matrix B. | b0, b1, b2, b3  
  
The layout of the fragments held by different threads is shown below:

    * Fragment layout for Row Major matrix B is shown in [Figure 48](<#mma-884-b-row-f16>).

![_images/mma-884-B-row-f16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-884-B-row-f16.png)

Figure 48 MMA .m8n8k4 fragment layout for row-major matrix B with `.f16` type

The row and column of a matrix fragment can be computed as:
          
          row =        %laneid % 4
          
          col =         i      for bi   where i = {0,..,3}   if %laneid < 16
                       i+4     for bi   where i = {0,..,3}   otherwise
          

    * Fragment layout for Column Major matrix B is shown in [Figure 49](<#mma-884-b-col-f16>).

![_images/mma-884-B-col-f16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-884-B-col-f16.png)

Figure 49 MMA .m8n8k4 fragment layout for column-major matrix B with `.f16` type

The row and column of a matrix fragment can be computed as:
          
          row =       i                 for bi   where i = {0,..,3}
          
          col =      %laneid % 4        if %laneid < 16
                    (%laneid % 4) + 4   otherwise
          

  * Accumulators C (or D):

.ctype / .dtype | Fragment | Elements (low to high)  
---|---|---  
`.f16` | A vector expression containing four `.f16x2` registers, with each register containing two `.f16` elements from the matrix C (or D). | c0, c1, c2, c3, c4, c5, c6, c7  
`.f32` | A vector expression of eight `.f32` registers.  
  
The layout of the fragments held by different threads is shown below:

    * Fragment layout for accumulator matrix when `.ctype` is `.f16` is shown in [Figure 50](<#mma-884-c-f16>).

![_images/mma-884-C-f16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-884-C-f16.png)

Figure 50 MMA .m8n8k4 fragment layout for matrix C/D with `.ctype` = `.f16`

The row and column of a matrix fragment can be computed as:
          
          row =       %laneid % 4         if %laneid < 16
                     (%laneid % 4) + 4    otherwise
          
          col =          i                for ci   where i = {0,..,7}
          

    * Fragment layout for accumulator matrix when `.ctype` is `.f32` is shown in [Figure 51](<#mma-884-c-f32-1>) and [Figure 52](<#mma-884-c-f32-2>).

![_images/mma-884-C-f32-1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-884-C-f32-1.png)

Figure 51 MMA .m8n8k4 computation 1 and 2 fragment layout for matrix C/D with `.ctype` = `.f32`

![_images/mma-884-C-f32-2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-884-C-f32-2.png)

Figure 52 MMA .m8n8k4 computation 3 and 4 fragment layout for matrix C/D with `.ctype` = `.f32`

The row and column of a matrix fragment can be computed as:
          
          row =     X           if %laneid < 16
                  X + 4         otherwise
          
                    where X = (%laneid & 0b1) + (i & 0b10)  for ci where i = {0,..,7}
          
          col = (i & 0b100) + (%laneid & 0b10) + (i & 0b1)  for ci where i = {0,..,7}

#####  9.7.14.5.2. [Matrix Fragments for `mma.m8n8k4` with `.f64` floating point type](<#warp-level-matrix-fragment-mma-884-f64>)

A warp executing `mma.m8n8k4` with `.f64` floating point type will compute an MMA operation of shape `.m8n8k4`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.f64` | A vector expression containing a single `.f64` register, containing single `.f64` element from the matrix A. | a0  
  
The layout of the fragments held by different threads is shown in [Figure 53](<#mma-884-a-f64>).

![_images/mma-884-A-f64.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-884-A-f64.png)

Figure 53 MMA .m8n8k4 fragment layout for matrix A with `.f64` type

The row and column of a matrix fragment can be computed as:
        
        row =        %laneid >> 2
        
        col =        %laneid % 4
        

  * Multiplicand B:

.btype | Fragment | Elements (low to high)  
---|---|---  
`.f64` | A vector expression containing a single `.f64` register, containing a single `.f64` element from the matrix B. | b0  
  
The layout of the fragments held by different threads is shown in [Figure 54](<#mma-884-b-f64>).

![_images/mma-884-B-f64.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-884-B-f64.png)

Figure 54 MMA .m8n8k4 fragment layout for matrix B with `.f64` type

The row and column of a matrix fragment can be computed as:
        
        row =        %laneid % 4
        
        col =        %laneid >> 2
        

  * Accumulators (C or D):

.ctype / .dtype | Fragment | Elements (low to high)  
---|---|---  
`.f64` | A vector expression containing of two `.f64` registers containing two `.f64` elements from the matrix C. | c0, c1  
  
The layout of the fragments held by different threads is shown in [Figure 55](<#mma-884-c-f64>).

![_images/mma-884-C-f64.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-884-C-f64.png)

Figure 55 MMA .m8n8k4 fragment layout for accumulator matrix C/D with `.f64` type

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID
        
        col =      (threadID_in_group * 2) + (i & 0x1)       for ci   where i = {0, 1}

#####  9.7.14.5.3. [Matrix Fragments for `mma.m8n8k16`](<#warp-level-matrix-fragment-mma-8816>)

A warp executing `mma.m8n8k16` will compute an MMA operation of shape `.m8n8k16`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.s8` / `.u8` | A vector expression containing a single `.b32` register, containing four `.s8` or `.u8` elements from the matrix A. | a0, a1, a2, a3  
  
The layout of the fragments held by different threads is shown in [Figure 56](<#mma-8816-a-i8>).

![_images/mma-8816-A-i8.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-8816-A-i8.png)

Figure 56 MMA .m8n8k16 fragment layout for matrix A with `.u8`/`.s8` type

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row = groupID
        
        col =  (threadID_in_group * 4) + i       for ai    where i = {0,..,3}
        

  * Multiplicand B:

.btype | Fragment | Elements (low to high)  
---|---|---  
`.s8` / `.u8` | A vector expression containing a single `.b32` register, containing four `.s8` or `.u8` elements from the matrix B. | b0, b1, b2, b3  
  
The layout of the fragments held by different threads is shown in [Figure 57](<#mma-8816-b-i8>).

![_images/mma-8816-B-i8.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-8816-B-i8.png)

Figure 57 MMA .m8n8k16 fragment layout for matrix B with `.u8`/`.s8` type

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =  (threadID_in_group * 4) + i         for bi    where i = {0,..,3}
        
        col =    groupID
        

  * Accumulators (C or D):

.ctype / .dtype | Fragment | Elements (low to high)  
---|---|---  
`.s32` | A vector expression containing of two `.s32` registers. | c0, c1  
  
The layout of the fragments held by different threads is shown in [Figure 58](<#mma-8816-c-i8>).

![_images/mma-8816-C-i8.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-8816-C-i8.png)

Figure 58 MMA .m8n8k16 fragment layout for accumulator matrix C/D with `.s32` type

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row = groupID
        
        col = (threadID_in_group * 2) + i         for ci    where i = {0, 1}

#####  9.7.14.5.4. [Matrix Fragments for `mma.m8n8k32`](<#warp-level-matrix-fragment-mma-8832>)

A warp executing `mma.m8n8k32` will compute an MMA operation of shape `.m8n8k32`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.s4` / `.u4` | A vector expression containing a single `.b32` register, containing eight `.s4` or `.u4` elements from the matrix A. | a0, a1, a2, a3, a4, a5, a6, a7  
  
The layout of the fragments held by different threads is shown in [Figure 59](<#mma-8832-a-i4>).

![_images/mma-8832-A-i4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-8832-A-i4.png)

Figure 59 MMA .m8n8k32 fragment layout for matrix A with `.u4`/`.s4` type

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID
        
        col = (threadID_in_group * 8) + i         for ai    where i = {0,..,7}
        

  * Multiplicand B:

.btype | Fragment | Elements (low to high)  
---|---|---  
`.s4` / `.u4` | A vector expression containing a single `.b32` register, containing eight `.s4` or `.u4` elements from the matrix B. | b0, b1, b2, b3, b4, b5, b6, b7  
  
The layout of the fragments held by different threads is shown in [Figure 60](<#mma-8832-b-i4>).

![_images/mma-8832-B-i4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-8832-B-i4.png)

Figure 60 MMA .m8n8k32 fragment layout for matrix B with `.u4`/`.s4` type

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row = (threadID_in_group * 8) + i         for bi   where i = {0,..,7}
        
        col = groupID
        

  * Accumulators (C or D):

.ctype / .dtype | Fragment | Elements (low to high)  
---|---|---  
`.s32` | A vector expression of two `.s32` registers. | c0, c1  
  
The layout of the fragments held by different threads is shown in [Figure 61](<#mma-8832-c-i4>):

![_images/mma-8832-C-i4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-8832-C-i4.png)

Figure 61 MMA .m8n8k32 fragment layout for accumulator matrix C/D with `.s32` type

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =   groupID
        col = (threadID_in_group * 2) + i         for ci   where i = {0, 1}

#####  9.7.14.5.5. [Matrix Fragments for `mma.m8n8k128`](<#warp-level-matrix-fragment-mma-88128>)

A warp executing `mma.m8n8k128` will compute an MMA operation of shape `.m8n8k128`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.b1` | A vector expression containing a single `.b32` register, containing thirty two `.b1` elements from the matrix A. | a0, a1, … a30, a31  
  
The layout of the fragments held by different threads is shown in [Figure 62](<#mma-88128-a>).

![_images/mma-88128-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-88128-A.png)

Figure 62 MMA .m8n8k128 fragment layout for matrix A with `.b1` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =  groupID
        
        col =  (threadID_in_group * 32) + i       for ai where i = {0,..,31}
        

  * Multiplicand B:

.btype | Fragment | Elements (low to high)  
---|---|---  
`.b1` | A vector expression containing a single `.b32` register, containing thirty two `.b1` elements from the matrix B. | b0, b1, …, b30, b31  
  
The layout of the fragments held by different threads is shown in [Figure 63](<#mma-88128-b>).

![_images/mma-88128-B.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-88128-B.png)

Figure 63 MMA .m8n8k128 fragment layout for matrix B with `.b1` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row = (threadID_in_group * 32) + i         for bi where i = {0,..,31}
        
        col = groupID
        

  * Accumulators (C or D):

.ctype / .dtype | Fragment | Elements (low to high)  
---|---|---  
`.s32` | A vector expression containing two `.s32` registers, containing two `.s32` elements from the matrix C (or D). | c0, c1  
  
The layout of the fragments held by different threads is shown in [Figure 64](<#mma-88128-c>).

![_images/mma-88128-C.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-88128-C.png)

Figure 64 MMA .m8n8k128 fragment layout for accumulator matrix C/D with `.s32` type

The row and column of a matrix fragment can be computed as:
        
        groupID = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID
        
        col =  (threadID_in_group * 2) + i    for ci where i = {0, 1}

#####  9.7.14.5.6. [Matrix Fragments for `mma.m16n8k4`](<#warp-level-matrix-fragment-mma-1684>)

A warp executing `mma.m16n8k4` will compute an MMA operation of shape `.m16n8k4`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

    * `.tf32`:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.tf32` | A vector expression containing two `.b32` registers, containing two `.tf32` elements from the matrix A. | a0, a1  
  
The layout of the fragments held by different threads is shown in [Figure 65](<#mma-1684-a-tf32>).

![_images/mma-1684-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1684-A.png)

Figure 65 MMA .m16n8k4 fragment layout for matrix A with `.tf32` type.

The row and column of a matrix fragment can be computed as:
          
          groupID           = %laneid >> 2
          threadID_in_group = %laneid % 4
          
          row =      groupID            for a0
                     groupID + 8        for a1
          
          col =  threadID_in_group
          

    * `.f64`:

> .atype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f64` | A vector expression containing two `.f64` registers, containing two `.f64` elements from the matrix A. | a0, a1  
>   
> The layout of the fragments held by different threads is shown in [Figure 66](<#mma-1684-a-f64>).
> 
> ![_images/mma-1684-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1684-A.png)
> 
> Figure 66 MMA .m16n8k4 fragment layout for matrix A with `.f64` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =      groupID            for a0
>                      groupID + 8        for a1
>           
>           col =  threadID_in_group
>           

  * Multiplicand B:

    * `.tf32`:

> .btype | Fragment | Elements (low to high)  
> ---|---|---  
> `.tf32` | A vector expression of a single `.b32` register, containing a single `.tf32` element from the matrix B. | b0  
>   
> The layout of the fragments held by different threads is shown in [Figure 67](<#mma-1684-b-tf32>).
> 
> ![_images/mma-1684-B.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1684-B.png)
> 
> Figure 67 MMA .m16n8k4 fragment layout for matrix B with `.tf32` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =  threadID_in_group
>           
>           col =  groupID
>           

    * `.f64`:

> .btype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f64` | A vector expression of a single `.f64` register, containing a single `.f64` element from the matrix B. | b0  
>   
> The layout of the fragments held by different threads is shown in [Figure 68](<#mma-1684-b-f64>).
> 
> ![_images/mma-1684-B.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1684-B.png)
> 
> Figure 68 MMA .m16n8k4 fragment layout for matrix B with `.f64` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =  threadID_in_group
>           
>           col =  groupID
>           

  * Accumulators (C or D):

    * `.tf32`:

> .ctype / .dtype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f32` | A vector expression containing four `.f32` registers, containing four `.f32` elements from the matrix C (or D). | c0, c1, c2, c3  
>   
> The layout of the fragments held by different threads is shown in [Figure 69](<#mma-1684-c-f32>).
> 
> ![_images/mma-1684-C.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1684-C.png)
> 
> Figure 69 MMA .m16n8k4 fragment layout for accumulator matrix C/D with `.f32` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =      groupID                            for c0 and c1
>                    groupID + 8                          for c2 and c3
>           
>           col =  (threadID_in_group * 2) + (i & 0x1)    for ci   where i = {0,..,3}
>           

    * `.f64`:

> .ctype / .dtype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f64` | A vector expression containing four `.f64` registers, containing four `.f64` elements from the matrix C (or D). | c0, c1, c2, c3  
>   
> The layout of the fragments held by different threads is shown in [Figure 70](<#mma-1684-c-f64>).
> 
> ![_images/mma-1684-C.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1684-C.png)
> 
> Figure 70 MMA .m16n8k4 fragment layout for accumulator matrix C/D with `.f64` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =      groupID                            for c0 and c1
>                    groupID + 8                          for c2 and c3
>           
>           col =  (threadID_in_group * 2) + (i & 0x1)    for ci   where i = {0,..,3}
>

#####  9.7.14.5.7. [Matrix Fragments for `mma.m16n8k8`](<#warp-level-matrix-fragment-mma-1688>)

A warp executing `mma.m16n8k8` will compute an MMA operation of shape `.m16n8k8`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

    * `.f16` and `.bf16` :

> .atype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f16` / `.bf16` | A vector expression containing two `.f16x2` registers, with each register containing two `.f16` / `.bf16` elements from the matrix A. | a0, a1, a2, a3  
>   
> The layout of the fragments held by different threads is shown in [Figure 71](<#mma-1688-a-f16>).
> 
> ![_images/mma-1688-A-f16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1688-A-f16.png)
> 
> Figure 71 MMA .m16n8k8 fragment layout for matrix A with `.f16` / `.bf16` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =      groupID            for a0 and a1
>                      groupID + 8        for a2 and a3
>           
>           col =  threadID_in_group * 2 + (i & 0x1)    for ai     where i = {0,..,3}
>           

    * `.tf32` :

> .atype | Fragment | Elements (low to high)  
> ---|---|---  
> `.tf32` | A vector expression containing four `.b32` registers, containing four `.tf32` elements from the matrix A. | a0, a1, a2, a3  
>   
> The layout of the fragments held by different threads is shown in [Figure 72](<#mma-1688-a-tf32>).
> 
> ![_images/mma-1688-A-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1688-A-tf32.png)
> 
> Figure 72 MMA .m16n8k8 fragment layout for matrix A with `.tf32` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =      groupID            for a0 and a2
>                      groupID + 8        for a1 and a3
>           
>           col =  threadID_in_group       for a0 and a1
>                  threadID_in_group + 4   for a2 and a3
>           

    * `.f64` :

.atype | Fragment | Elements (low to high)  
---|---|---  
`.f64` | A vector expression containing four `.f64` registers, containing four `.f64` elements from the matrix A. | a0, a1, a2, a3  
  
The layout of the fragments held by different threads is shown in [Figure 73](<#mma-1688-a-f64>).

![_images/mma-1688-A-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1688-A-tf32.png)

Figure 73 MMA .m16n8k8 fragment layout for matrix A with `.f64` type.

The row and column of a matrix fragment can be computed as:
          
          groupID           = %laneid >> 2
          threadID_in_group = %laneid % 4
          
          row =      groupID            for a0 and a2
                     groupID + 8        for a1 and a3
          
          col =  threadID_in_group       for a0 and a1
                 threadID_in_group + 4   for a2 and a3
          

  * Multiplicand B:

    * `.f16` and `.bf16` :

> .btype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f16` / `.bf16` | A vector expression containing a single `.f16x2` register, containing two `.f16` / `.bf16` elements from the matrix B. | b0, b1  
>   
> The layout of the fragments held by different threads is shown in [Figure 74](<#mma-1688-b-f16>).
> 
> ![_images/mma-1688-B-f16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1688-B-f16.png)
> 
> Figure 74 MMA .m16n8k8 fragment layout for matrix B with `.f16` / `.bf16` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row = (threadID_in_group * 2) + i       for bi    where i = {0, 1}
>           
>           col =  groupID
>           

    * `.tf32` :

> .btype | Fragment | Elements (low to high)  
> ---|---|---  
> `.tf32` | A vector expression containing two `.b32` registers, containing two `.tf32` elements from the matrix B. | b0, b1  
>   
> The layout of the fragments held by different threads is shown in [Figure 75](<#mma-1688-b-tf32>).
> 
> ![_images/mma-1688-B-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1688-B-tf32.png)
> 
> Figure 75 MMA .m16n8k8 fragment layout for matrix B with `.tf32` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =    threadID_in_group         for b0
>                  threadID_in_group + 4       for b1
>           
>           col =  groupID
>           

    * `.f64` :

> .btype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f64` | A vector expression containing two `.f64` registers, containing two `.f64` elements from the matrix B. | b0, b1  
>   
> The layout of the fragments held by different threads is shown in [Figure 76](<#mma-1688-b-f64>).
> 
> ![_images/mma-1688-B-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1688-B-tf32.png)
> 
> Figure 76 MMA .m16n8k8 fragment layout for matrix B with `.f64` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =    threadID_in_group         for b0
>                  threadID_in_group + 4       for b1
>           
>           col =  groupID
>           

  * Accumulators (C or D):

    * `.f16`, `.bf16` and `.tf32`:

> .ctype / .dtype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f16` | A vector expression containing two `.f16x2` registers, with each register containing two `.f16` elements from the matrix C (or D). | c0, c1, c2, c3  
> `.f32` | A vector expression of four `.f32` registers. |   
>   
> The layout of the fragments held by different threads is shown in [Figure 77](<#mma-1688-c-f16-f32>).
> 
> ![_images/mma-1688-C.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1688-C.png)
> 
> Figure 77 MMA .m16n8k8 fragment layout for accumulator matrix C/D with `.f16x2`/`.f32` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =      groupID                            for c0 and c1
>                    groupID + 8                          for c2 and c3
>           
>           col =  (threadID_in_group * 2) + (i & 0x1)    for ci   where i = {0,..,3}
>           

    * `.f64` :

> .ctype / .dtype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f64` | A vector expression of four `.f64` registers containing four `.f64` elements from the matrix C (or D). | c0, c1, c2, c3  
>   
> The layout of the fragments held by different threads is shown in [Figure 78](<#mma-1688-c-f64>).
> 
> ![_images/mma-1688-C.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-1688-C.png)
> 
> Figure 78 MMA .m16n8k8 fragment layout for accumulator matrix C/D with `.f64` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =      groupID                            for c0 and c1
>                    groupID + 8                          for c2 and c3
>           
>           col =  (threadID_in_group * 2) + (i & 0x1)    for ci   where i = {0,..,3}
>

#####  9.7.14.5.8. [Matrix Fragments for `mma.m16n8k16` with floating point type](<#warp-level-matrix-fragment-mma-16816-float>)

A warp executing `mma.m16n8k16` floating point types will compute an MMA operation of shape `.m16n8k16`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

    * `.f16` and `.bf16` :

> .atype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f16` / `.bf16` | A vector expression containing four `.f16x2` registers, with each register containing two `.f16` / `.bf16` elements from the matrix A. | a0, a1, a2, a3, a4, a5, a6, a7  
>   
> The layout of the fragments held by different threads is shown in [Figure 79](<#mma-16816-a-f16>).
> 
> ![_images/mma-16816-A-f16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16816-A-f16.png)
> 
> Figure 79 MMA .m16n8k16 fragment layout for matrix A with `.f16` / `.bf16` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =      groupID            for ai where  0 <= i < 2 || 4 <= i < 6
>                     groupID + 8         Otherwise
>           
>           col =  (threadID_in_group * 2) + (i & 0x1)          for ai where i <  4
>           (threadID_in_group * 2) + (i & 0x1) + 8      for ai where i >= 4
>           

    * `.f64` :

> .atype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f64` | A vector expression containing eight `.f64` registers, with each register containing one `.f64` element from the matrix A. | a0, a1, a2, a3, a4, a5, a6, a7  
>   
> The layout of the fragments held by different threads is shown in [Figure 80](<#mma-16816-a-f64>).
> 
> ![_images/mma-16816-A-f64.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16816-A-f64.png)
> 
> Figure 80 MMA .m16n8k16 fragment layout for matrix A with `.f64` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =  groupID                               for ai where  i % 2 = 0
>                  groupID + 8                           Otherwise
>           
>           col =  (i * 2) + threadID_in_group           for ai where i % 2 = 0
>                  (i * 2) - 2 + (threadID_in_group      Otherwise
>           

  * Multiplicand B:

    * `.f16` and `.bf16` :

> .btype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f16` / `.bf16` | A vector expression containing two `.f16x2` registers, with each register containing two `.f16` / `.bf16` elements from the matrix B. | b0, b1, b2, b3  
>   
> The layout of the fragments held by different threads is shown in [Figure 81](<#mma-16816-b-f16>).
> 
> ![_images/mma-16816-B-f16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16816-B-f16.png)
> 
> Figure 81 MMA .m16n8k16 fragment layout for matrix B with `.f16` / `.bf16` type.
> 
> where the row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =  (threadID_in_group * 2) + (i & 0x1)           for bi where i <  2
>                  (threadID_in_group * 2) + (i & 0x1) + 8       for bi where i >= 2
>           
>           col = groupID
>           

    * `.f64` :

> .atype | Fragment | Elements (low to high)  
> ---|---|---  
> `.f64` | A vector expression containing four `.f64` registers, with each register containing one `.f64` element from the matrix B. | b0, b1, b2, b3  
>   
> The layout of the fragments held by different threads is shown in [Figure 82](<#mma-16816-b-f64>).
> 
> ![_images/sparse-mma-16816-tf32-B.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/sparse-mma-16816-tf32-B.png)
> 
> Figure 82 MMA .m16n8k16 fragment layout for matrix B with `.f64` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =  threadID_in_group + (i * 4)           for bi where  i < 4
>           
>           col =  groupID
>           

  * Accumulators (C or D):

.ctype / .dtype | Fragment | Elements (low to high)  
---|---|---  
`.f64` | A vector expression containing four `.f64` registers containing `.f64` elements from the matrix C (or D). | c0, c1, c2, c3  
`.f32` | A vector expression containing four `.f32` registers containing four `.f32` elements from the matrix C (or D).  
`.f16` | A vector expression containing two `.f16x2` registers, with each register containing two `.f16` elements from the matrix C (or D).  
  
The layout of the fragments held by different threads is shown in [Figure 83](<#mma-16816-c>).

![_images/mma-16816-C-f16.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16816-C-f16.png)

Figure 83 MMA .m16n8k16 fragment layout for accumulator matrix matrix C/D.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID                               for ci where i <  2
                 groupID + 8                             for ci where i >= 2
        
        col =  (threadID_in_group * 2) + (i & 0x1)        for ci where i = {0,..,3}

#####  9.7.14.5.9. [Matrix Fragments for `mma.m16n8k16` with integer type](<#warp-level-matrix-fragment-mma-16816-i8-f8>)

A warp executing `mma.m16n8k16` will compute an MMA operation of shape `.m16n8k16`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.u8` / `.s8` | A vector expression containing two `.b32` registers, with each register containing four `.u8` / `.s8` elements from the matrix A. | a0, a1, a2, a3, a4, a5, a6, a7  
`.e4m3` / `.e5m2` | A vector expression containing two `.b32` registers, with each register containing four `.e4m3` / `.e5m2` elements from the matrix A. | a0, a1, a2, a3, a4, a5, a6, a7  
  
The layout of the fragments held by different threads is shown in [Figure 84](<#mma-16816-a-i8>).

![_images/mma-16816-A-i8.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16816-A-i8.png)

Figure 84 MMA .m16n8k16 fragment layout for matrix A with `.u8` / `.s8` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID                            for ai where i < 4
                 groupID + 8                          for ai where i >= 4
        
        col =  (threadID_in_group * 4) + (i & 0x3)    for ai where i = {0,..,7}
        

  * Multiplicand B:

.btype | Fragment | Elements (low to high)  
---|---|---  
`.u8` / `.s8` | A vector expression containing a single `.b32` register, containing four `.u8` / `.s8` elements from the matrix B. | b0, b1, b2, b3  
`.e4m3` / `.e5m2` | A vector expression containing a single `.b32` register, containing four `.e4m3` / `.e5m2` elements from the matrix B. | b0, b1. b2. b3  
  
The layout of the fragments held by different threads is shown in [Figure 85](<#mma-16816-b-i8>).

![_images/mma-16816-B-i8.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16816-B-i8.png)

Figure 85 MMA .m16n8k16 fragment layout for matrix B with `.u8` / `.s8` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =  (threadID_in_group * 4) + i         for bi where i = {0,..,3}
        
        col = groupID
        

  * Accumulators (C or D):

.ctype / .dtype | Fragment | Elements (low to high)  
---|---|---  
`.s32` | A vector expression containing four `.s32` registers, containing four `.s32` elements from the matrix C (or D). | c0, c1, c2, c3  
`.f32` | A vector expression containing four `.f32` registers, containing four `.f32` elements from the matrix C (or D). | c0, c1, c2, c3  
`.f16` | A vector expression containing two `.f16x2` registers, with each register containing two `.f16` elements from the matrix C (or D). | c0, c1, c1, c2  
  
The layout of the fragments held by different threads is shown in [Figure 86](<#mma-16816-c-i8>).

![_images/mma-16816-C-i8.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16816-C-i8.png)

Figure 86 MMA .m16n8k16 fragment layout for accumulator matrix C/D with `.s32` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID                           for ci where i <  2
                 groupID + 8                         for ci where i >= 2
        
        col =  (threadID_in_group * 2) + (i & 0x1)    for ci where i = {0,..,3}

#####  9.7.14.5.10. [Matrix Fragments for `mma.m16n8k32`](<#warp-level-matrix-fragment-mma-16832>)

A warp executing `mma.m16n8k32` will compute an MMA operation of shape `.m16n8k32`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

    * `.s4` or `.u4` :

> .atype | Fragment | Elements (low to high)  
> ---|---|---  
> `.s4` / `.u4` | A vector expression containing two `.b32` registers, with each register containing eight `.u4` / `.s4` elements from the matrix A. | a0, a1, …, a14, a15  
>   
> The layout of the fragments held by different threads is shown in [Figure 87](<#mma-16832-a-i4>).
> 
> ![_images/mma-16832-A-i4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16832-A-i4.png)
> 
> Figure 87 MMA .m16n8k32 fragment layout for matrix A with `.u4` / `.s4` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =      groupID                           for ai where i < 8
>                    groupID + 8                         for ai where i >= 8
>           
>           col =  (threadID_in_group * 8) + (i & 0x7)    for ai where i = {0,..,15}
>           

    * `.s8` or `.u8` or `.e4m3` or `.e5m2` or `.e3m2` or `.e2m3` or `.e2m1`:

> .atype | Fragment | Elements (low to high)  
> ---|---|---  
> `.s8` / `.u8` | A vector expression containing four `.b32` registers, with each register containing four `.s8` / `.u8` elements from the matrix A. | a0, a1, .., a14, a15  
> `.e4m3` / `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` | A vector expression containing four `.b32` registers, with each register containing four `.e4m3` / `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` elements from the matrix A. | a0, a1, …, a14, a15  
>   
> The layout of the fragments held by different threads is shown in [Figure 88](<#mma-16832-a-i8>).
> 
> ![_images/mma-16832-A-i8.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16832-A-i8.png)
> 
> Figure 88 MMA .m16n8k32 fragment layout for matrix A with `.u8` / `.s8` / `.e4m3` / `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =   groupID                                        for ai where 0 <= i < 4 || 8 <= i < 12
>                  groupID + 8                                     otherwise
>           
>           col =    (threadID_in_group * 4) + (i & 0x3)           for ai where i < 8
>                    (threadID_in_group * 4) + (i & 0x3) + 16      for ai where i >= 8
>           

  * Multiplicand B:

    * `.s4` or `.u4` :

> .btype | Fragment | Elements (low to high)  
> ---|---|---  
> `.s4` / `.u4` | A vector expression containing a single `.b32` register, containing eight `.s4` / `.u4` elements from the matrix B. | b0, b1, b2, b3, b4, b5, b6, b7  
>   
> The layout of the fragments held by different threads is shown in [Figure 89](<#mma-16832-b-i4>).
> 
> ![_images/mma-16832-B-i4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16832-B-i4.png)
> 
> Figure 89 MMA .m16n8k32 fragment layout for matrix B with `.u4` / `.s4` type.
> 
> The row and column of a matrix fragment can be computed as:
    
    groupID = %laneid >> 2
    threadID_in_group = %laneid % 4
    
    row =    (threadID_in_group * 8) + (i & 0x7)      for bi where i = {0,..,7}
    col =     groupID
    

    * `.s8` or `.u8` or `.e4m3` or `.e5m2` or `.e3m2` or `.e2m3` or `.e2m1`:

> .btype | Fragment | Elements (low to high)  
> ---|---|---  
> `.s8` / `.u8` | A vector expression containing two `.b32` registers, with each register containing four `.s8` / `.u8` elements from the matrix B. | b0, b1, b2, b3, b4, b5, b6, b7  
> `.e4m3` / `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` | A vector expression containing two `.b32` registers, with each register containing four `.e4m3` / `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` elements from the matrix B. | b0, b1, b2, b3, b4, b5, b6, b7  
>   
> The layout of the fragments held by different threads is shown in [Figure 90](<#mma-16832-b-i8-1>) and [Figure 91](<#mma-16832-b-i8-2>).
> 
> ![_images/mma-16832-B-i8_1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16832-B-i8_1.png)
> 
> Figure 90 MMA .m16n8k32 fragment layout for rows 0–15 of matrix B with `.u8` / `.s8` / `.e4m3` / `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` type.
> 
> ![_images/mma-16832-B-i8_2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16832-B-i8_2.png)
> 
> Figure 91 MMA .m16n8k32 fragment layout for rows 16–31 of matrix B with `.u8` / `.s8` / `.e4m3` / `.e5m2` / `.e3m2` / `.e2m3` / `.e2m1` type.
> 
> The row and column of a matrix fragment can be computed as:
>           
>           groupID           = %laneid >> 2
>           threadID_in_group = %laneid % 4
>           
>           row =      (threadID_in_group * 4) + (i & 0x3)           for bi where i < 4
>                      (threadID_in_group * 4) + (i & 0x3) + 16      for bi where i >= 4
>           
>           col =   groupID
>           

  * Accumulators (C or D):

.ctype / .dtype | Fragment | Elements (low to high)  
---|---|---  
`.s32` | A vector expression containing four `.s32` registers, containing four `.s32` elements from the matrix C (or D). | c0, c1, c2, c3  
`.f32` | A vector expression containing four `.f32` registers, containing four `.f32` elements from the matrix C (or D). | c0, c1, c2, c3  
`.f16` | A vector expression containing two `.f16x2` registers, with each register containing two `.f16` elements from the matrix C (or D). | c0, c1, c2, c3  
  
The layout of the fragments held by different threads is shown in [Figure 92](<#mma-16832-c>).

![_images/mma-16832-C.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16832-C.png)

Figure 92 MMA .m16n8k32 fragment layout for accumulator matrix C/D with `.s32` / `.f32` / `.f16` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID                           for ci where i <  2
                 groupID + 8                         for ci where i >= 2
        
        col =  (threadID_in_group * 2) + (i & 0x1)    for ci where i = {0,..,3}

#####  9.7.14.5.11. [Matrix Fragments for `mma.m16n8k64`](<#warp-level-matrix-fragment-mma-16864>)

A warp executing `mma.m16n8k64` will compute an MMA operation of shape `.m16n8k64`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.s4` / `.u4` | A vector expression containing four `.b32` registers, with each register containing eight `.s4` / `.u4` elements from the matrix A. | a0, a1, …, a30, a31  
`.e2m1` | A vector expression containing four `.b32` registers, with each register containing eight `.e2m1` elements from the matrix A. | a0, a1, …, a30, a31  
  
The layout of the fragments held by different threads is shown in [Figure 93](<#mma-16864-a>).

![_images/mma-16864-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16864-A.png)

Figure 93 MMA .m16n8k64 fragment layout for matrix A with `.u4` / `.s4` / `.e2m1` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =     groupID                                     for ai where 0 <= i < 8 || 16 <= i < 24
                groupID + 8                                   otherwise
        
        col =      (threadID_in_group * 8) + (i & 0x7)        for ai where i < 16
                   (threadID_in_group * 8) + (i & 0x7) + 32   for ai where i >= 16
        

  * Multiplicand B:

.btype | Fragment | Elements (low to high)  
---|---|---  
`.s4` / `.u4` | A vector expression containing two `.b32` registers, with each register containing eight `.s4` / `.u4` elements from the matrix B. | b0, b1, …, b14, b15  
`.e2m1` | A vector expression containing two `.b32` registers, with each register containing eight `.e2m1` elements from the matrix B. | b0, b1, …, b14, b15  
  
The layout of the fragments held by different threads is shown in [Figure 94](<#mma-16864-b-1>) and [Figure 95](<#mma-16864-b-2>).

![_images/mma-16864-B_1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16864-B_1.png)

Figure 94 MMA .m16n8k64 fragment layout for rows 0–31 of matrix B with `.u4` / `.s4` / `.e2m1` type.

![_images/mma-16864-B_2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16864-B_2.png)

Figure 95 MMA .m16n8k64 fragment layout for rows 32–63 of matrix B with `.u4` / `.s4` / `.e2m1` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      (threadID_in_group * 8) + (i & 0x7)          for bi where i < 8
                   (threadID_in_group * 8) + (i & 0x7) + 32     for bi where i >= 8
        
        col =   groupID
        

  * Accumulators (C or D):

.ctype / .dtype | Fragment | Elements (low to high)  
---|---|---  
`.s32` | A vector expression containing four `.s32` registers, containing four `.s32` elements from the matrix C (or D). | c0, c1, c2, c3  
`.f32` | A vector expression containing four `.f32` registers, containing four `.f32` elements from the matrix C (or D). | c0, c1, c2, c3  
  
The layout of the fragments held by different threads is shown in [Figure 96](<#mma-16864-c>).

![_images/mma-16864-C.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-16864-C.png)

Figure 96 MMA .m16n8k64 fragment layout for accumulator matrix C/D with `.s32` / `.f32` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID                           for ci where i <  2
                   groupID + 8                       for ci where i >= 2
        
        col =  (threadID_in_group * 2) + (i & 0x1)    for ci  where i = {0,..,3}

#####  9.7.14.5.12. [Matrix Fragments for `mma.m16n8k128`](<#warp-level-matrix-fragment-mma-168128>)

A warp executing `mma.m16n8k128` will compute an MMA operation of shape `.m16n8k128`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.b1` | A vector expression containing two `.b32` registers, with each register containing thirty two `.b1` elements from the matrix A. | a0, a1, …, a62, a63  
  
The layout of the fragments held by different threads is shown in [Figure 97](<#mma-168128-a>).

![_images/mma-168128-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-168128-A.png)

Figure 97 MMA .m16n8k128 fragment layout for matrix A with `.b1` type.

The row and column of a matrix fragment can be computed as:
        
        groupID = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID                              for ai where i < 32
                  groupID + 8                           for ai where i >= 32
        
        col =  (threadID_in_group * 32) + (i & 0x1F)     for ai where i = {0, ...,63}
        

  * Multiplicand B:

.btype | Fragment | Elements (low to high)  
---|---|---  
`.b1` | A vector expression containing a single `.b32` register containing thirty two `.b1` elements from the matrix B. | b0, b1, … , b30, b31  
  
The layout of the fragments held by different threads is shown in [Figure 98](<#mma-168128-b>).

![_images/mma-168128-B.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-168128-B.png)

Figure 98 MMA .m16n8k128 fragment layout for matrix B with `.b1` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =  (threadID_in_group * 32) + i         for bi where i = {0,...,31}
        col = groupID
        

  * Accumulators (C or D):

.ctype / .dtype | Fragment | Elements (low to high)  
---|---|---  
`.s32` | A vector expression containing four `.s32` registers, containing four `.s32` elements from the matrix C (or D). | c0, c1, c2, c3  
  
The layout of the fragments held by different threads is shown in [Figure 99](<#mma-168128-c>).

![_images/mma-168128-C.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-168128-C.png)

Figure 99 MMA .m16n8k128 fragment layout for accumulator matrix C/D with `.s32` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      groupID                           for ci where i <  2
                  groupID + 8                        for ci where i >= 2
        
        col =  (threadID_in_group * 2) + (i & 0x1)    for ci where i = {0, 1, 2, 3}

#####  9.7.14.5.13. [Matrix Fragments for `mma.m16n8k256`](<#warp-level-matrix-fragment-mma-168256>)

A warp executing `mma.m16n8k256` will compute an MMA operation of shape `.m16n8k256`.

Elements of the matrix are distributed across the threads in a warp so each thread of the warp holds a fragment of the matrix.

  * Multiplicand A:

.atype | Fragment | Elements (low to high)  
---|---|---  
`.b1` | A vector expression containing four `.b32` registers, with each register containing thirty two `.b1` elements from the matrix A. | a0, a1, …, a126, a127  
  
The layout of the fragments held by different threads is shown in [Figure 100](<#mma-168256-a>).

![_images/mma-168256-A.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-168256-A.png)

Figure 100 MMA .m16n8k256 fragment layout for matrix A with `.b1` type.

The row and column of a matrix fragment can be computed as:
        
        groupID = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =   groupID                                            for ai where 0 <= i < 32 || 64 <= i < 96
                groupID + 8                                        otherwise
        
        col =      (threadID_in_group * 32) + i                    for ai where i < 64
                   (threadID_in_group * 32) + (i & 0x1F) + 128     for ai where i >= 64
        

  * Multiplicand B:

.btype | Fragment | Elements (low to high)  
---|---|---  
`.b1` | A vector expression containing two `.b32` registers, with each register containing thirty two `.b1` elements from the matrix B. | b0, b1, …, b62, b63  
  
The layout of the fragments held by different threads is shown in [Figure 101](<#mma-168256-b-1>) and [Figure 102](<#mma-168256-b-2>).

![_images/mma-168256-B_1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-168256-B_1.png)

Figure 101 MMA .m16n8k256 fragment layout for rows 0–127 of matrix B with `.b1` type.

![_images/mma-168256-B_2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-168256-B_2.png)

Figure 102 MMA .m16n8k256 fragment layout for rows 128–255 of matrix B with `.b1` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =      (threadID_in_group * 32) + (i & 0x1F)             for bi where i < 32
                   (threadID_in_group * 32) + (i & 0x1F) + 128       for bi where i >= 32
        
        col =      groupID
        

  * Accumulators (C or D):

.ctype / .dtype | Fragment | Elements (low to high)  
---|---|---  
`.s32` | A vector expression containing four `.s32` registers, containing four `.s32` elements from the matrix C (or D). | c0, c1, c2, c3  
  
The layout of the fragments held by different threads is shown in [Figure 103](<#mma-168256-c>).

![_images/mma-168256-C.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-168256-C.png)

Figure 103 MMA .m16n8k256 fragment layout for accumulator matrix C/D with `.s32` type.

The row and column of a matrix fragment can be computed as:
        
        groupID           = %laneid >> 2
        threadID_in_group = %laneid % 4
        
        row =        groupID                         for ci where i < 2
                   groupID + 8                       for ci where i >= 2
        
        col =  (threadID_in_group * 2) + (i & 0x1)    for ci where i = {0, 1, 2, 3}

#####  9.7.14.5.14. [Multiply-and-Accumulate Instruction: `mma`](<#warp-level-matrix-instructions-mma>)

`mma`

Perform matrix multiply-and-accumulate operation

Syntax

Half precision floating point type:
    
    
    mma.sync.aligned.m8n8k4.alayout.blayout.dtype.f16.f16.ctype  d, a, b, c;
    mma.sync.aligned.m16n8k8.row.col.dtype.f16.f16.ctype  d, a, b, c;
    mma.sync.aligned.m16n8k16.row.col.dtype.f16.f16.ctype d, a, b, c;
    
    .alayout = {.row, .col};
    .blayout = {.row, .col};
    .ctype   = {.f16, .f32};
    .dtype   = {.f16, .f32};
    

Alternate floating point type:
    
    
    mma.sync.aligned.m16n8k4.row.col.f32.tf32.tf32.f32        d, a, b, c;
    mma.sync.aligned.m16n8k8.row.col.f32.atype.btype.f32      d, a, b, c;
    mma.sync.aligned.m16n8k16.row.col.f32.bf16.bf16.f32       d, a, b, c;
    mma.sync.aligned.shape.row.col.dtype.f8type.f8type.ctype  d, a, b, c;
    mma.sync.aligned.m16n8k32.row.col.kind.dtype.f8f6f4type.f8f6f4type.ctype d, a, b, c;
    
    .atype      = {.bf16, .tf32};
    .btype      = {.bf16, .tf32};
    .f8type     = {.e4m3, .e5m2};
    .f8f6f4type = {.e4m3, .e5m2, .e3m2, .e2m3, .e2m1};
    .ctype      = {.f16, .f32};
    .dtype      = {.f16, .f32};
    .shape      = {.m16n8k16, .m16n8k32};
    .kind       = {.kind::f8f6f4};
    

Alternate floating point type with block scaling:
    
    
    mma.sync.aligned.m16n8k64.row.col.kind.block_scale{.scale_vec_size}.f32.e2m1.e2m1.f32.stype d, a, b, c, scale-a-data, {byte-id-a, thread-id-a}, scale-b-data, {byte-id-b, thread-id-b};
    
    .kind           = {.kind::mxf4};
    .scale_vec_size = {.scale_vec::2X};
    .stype          = {.ue8m0};
    
    mma.sync.aligned.m16n8k64.row.col.kind.block_scale.scale_vec_size.f32.e2m1.e2m1.f32.stype d, a, b, c, scale-a-data, {byte-id-a, thread-id-a}, scale-b-data, {byte-id-b, thread-id-b};
    
    .kind           = {.kind::mxf4nvf4};
    .scale_vec_size = {.scale_vec::2X, .scale_vec::4X};
    .stype          = {.ue8m0, .ue4m3};
    
    mma.sync.aligned.m16n8k32.row.col.kind.block_scale{.scale_vec_size}.f32.f8f6f4type.f8f6f4type.f32.stype d, a, b, c, scale-a-data, {byte-id-a, thread-id-a}, scale-b-data, {byte-id-b, thread-id-b};
    
    .kind           = {.kind::mxf8f6f4};
    .scale_vec_size = {.scale_vec::1X};
    .f8f6f4type     = {.e4m3, .e5m2, .e3m2, .e2m3, .e2m1};
    .stype          = {.ue8m0};
    

Double precision floating point type:
    
    
    mma.sync.aligned.shape.row.col.f64.f64.f64.f64 d, a, b, c;
    
    .shape   = {.m8n84, .m16n8k4, .m16n8k8, .m16n8k16};
    

Integer type:
    
    
    mma.sync.aligned.shape.row.col{.satfinite}.s32.atype.btype.s32 d, a, b, c;
    
    .shape   = {.m8n8k16, .m16n8k16, .m16n8k32}
    .atype   = {.u8, .s8};
    .btype   = {.u8, .s8};
    
    mma.sync.aligned.shape.row.col{.satfinite}.s32.atype.btype.s32 d, a, b, c;
    
    .shape   = {.m8n8k32, .m16n8k32, .m16n8k64}
    .atype   = {.u4, .s4};
    .btype   = {.u4, .s4};
    

Single bit:
    
    
    mma.sync.aligned.shape.row.col.s32.b1.b1.s32.bitOp.popc d, a, b, c;
    
    .bitOp = {.xor, .and}
    .shape = {.m8n8k128, .m16n8k128, .m16n8k256}
    

Description

Perform a `MxNxK` matrix multiply and accumulate operation, `D = A*B+C`, where the A matrix is `MxK`, the B matrix is `KxN`, and the C and D matrices are `MxN`.

Qualifier `.block_scale` specifies that the matrices A and B are scaled with `scale_A` and `scale_B` matrices respectively before performing the matrix multiply and accumulate operation as specified in the section [Block Scaling](<#warp-level-block-scaling>). The data type corresponding to each of the element within `scale_A` and `Scale_B` matrices is specified by `.stype`. Qualifier `.scale_vec_size` specifies the number of columns of `scale_A` matrix and number of rows in the matrix `scale_B`.

The valid combinations of `.kind`, `.stype` and `.scale_vec_size` are described in [Table 36](<#mma-scaling-kind-type-valid-combination>). For `mma` with `.kind::mxf4` when the qualifier `.scale_vec_size` is not specified, then it defaults to `2X`. In contrast, when `.kind` is specified as `.kind::mxf8f6f4` then the qualifier `.scale_vec_size` defaults to `1X`. However, for `.kind::mxf4nvf4`, it is mandatory to provide valid `.scale_vec_size`.

A warp executing `mma.sync.m8n8k4` instruction computes 4 matrix multiply and accumulate operations. Rest of the `mma.sync` operations compute a single matrix mutliply and accumulate operation per warp.

For single-bit `mma.sync`, multiplication is replaced by a sequence of logical operations; specifically, `mma.xor.popc` and `mma.and.popc` computes the XOR, AND respectively of a k-bit row of A with a k-bit column of B, then counts the number of set bits in the result (`popc`). This result is added to the corresponding element of C and written into D.

Operands `a` and `b` represent two multiplicand matrices A and B, while `c` and `d` represent the accumulator and destination matrices, distributed across the threads in warp. When `.block_scale` qualifier is specified, operand `scale-a-data`, `scale-b-data` represents the scale matrix metadata corresponding to `scale_A` and `scale_B` matrices respectively. The tuple `{byte-id-a, thread-id-a}` and `{byte-id-b, thread-id-b}` represent selectors for matrices `scale_A` and `scale_B` respectively from their corresponding metadata arguments `scale-a-data`, `scale-b-data`. The operands `scale-a-data`, `scale-b-data` are of type `.b32`. The operands `byte-id-a`, `thread-id-a`, `byte-id-b`, `thread-id-b` are unsigned 16-bit integer values. For more details on selector arguments refer [Block Scaling](<#warp-level-block-scaling>) section.

The registers in each thread hold a fragment of matrix as described in [Matrix multiply-accumulate operation using mma instruction](<#warp-level-matrix-instructions-for-mma>).

The qualifiers `.dtype`, `.atype`, `.btype` and `.ctype` indicate the data-type of the elements in the matrices D, A, B and C respectively. The qualifier `.stype` indicate the data-type of the elements in the matrices `scale_A` and `scale_B`. Specific shapes have type restrictions :

  * `.m8n8k4` : When `.ctype` is `.f32`, `.dtype` must also be `.f32`.

  * `.m16n8k8` :

    * `.dtype` must be the same as `.ctype`.

    * `.atype` must be the same as `.btype`.

  * `.m16n8k16` and `.m16n8k32` :

    * `.dtype` must be the same as `.ctype`.


The qualifiers `.alayout` and `.blayout` indicate the row-major or column-major layouts of matrices A and B respectively.

When `.kind` is either of `.kind::mxf8f6f4` or `.kind::f8f6f4`, the individual 4-bit and the 6-bit floating point type elements must be packed in an 8-bit container. The matrix element of type `.e2m1` resides in central 4 bits of the 8-bit container with padding in the upper 2 bits and lower 2 bits of the container. When the matrix element is of type `.e3m2` or `.e2m3`, the matrix element resides in the lower 6 bits of the 8-bit container with padding in the upper 2 bits of the container. In contrast, note that when using `mma` with `.kind::mxf4` or `.kind::mxf4nvf4`, no explicit padding is necessary even though matrix elements are of type `.e2m1`.

Precision and rounding :
    

  * `.f16` floating point operations:

Element-wise multiplication of matrix A and B is performed with at least single precision. When `.ctype` or `.dtype` is `.f32`, accumulation of the intermediate values is performed with at least single precision. When both `.ctype` and `.dtype` are specified as `.f16`, the accumulation is performed with at least half precision.

The accumulation order, rounding and handling of subnormal inputs are unspecified.

  * `.e4m3`, `.e5m2`, `.e3m2`, `.e2m3`, `.e2m1` floating point operations :

Element-wise multiplication of matrix A and B is performed with specified precision. Accumulation of the intermediate values is performed with at least single precision.

The accumulation order, rounding, and handling of subnormal inputs are unspecified.

  * `.bf16` and `.tf32` floating point operations :

Element-wise multiplication of matrix A and B is performed with specified precision. Accumulation of the intermediate values is performed with at least single precision.

The accumulation order, rounding, and handling of subnormal inputs are unspecified.

  * `.f64` floating point operations :

Precision of the element-wise multiplication and addition operation is identical to that of `.f64` precision fused multiply-add. Supported rounding modifiers are :

    * `.rn` : mantissa LSB rounds to nearest even. This is the default.

    * `.rz` : mantissa LSB rounds towards zero.

    * `.rm` : mantissa LSB rounds towards negative infinity.

    * `.rp` : mantissa LSB rounds towards positive infinity.

  * Integer operations :

The integer `mma` operation is performed with `.s32` accumulators. The `.satfinite` qualifier indicates that on overflow, the accumulated value is limited to the range _MIN_INT32_.. _MAX_INT32_ (where the bounds are defined as the minimum negative signed 32-bit integer and the maximum positive signed 32-bit integer respectively).

If `.satfinite` is not specified, the accumulated value is wrapped instead.


The mandatory `.sync` qualifier indicates that `mma` instruction causes the executing thread to wait until all threads in the warp execute the same `mma` instruction before resuming execution.

The mandatory `.aligned` qualifier indicates that all threads in the warp must execute the same `mma` instruction. In conditionally executed code, a `mma` instruction should only be used if it is known that all threads in the warp evaluate the condition identically, otherwise behavior is undefined.

The behavior of `mma` instruction is undefined if all threads in the same warp do not use the same qualifiers, or if any thread in the warp has exited.

Notes

Programs using double precision floating point `mma` instruction with shapes `.m16n8k4`, `.m16n8k8`, and `.m16n8k16` require at least 64 registers for compilation.

PTX ISA Notes

Introduced in PTX ISA version 6.4.

`.f16` floating point type `mma` operation with `.m8n8k4` shape introduced in PTX ISA version 6.4.

`.f16` floating point type `mma` operation with `.m16n8k8` shape introduced in PTX ISA version 6.5.

`.u8/.s8` integer type `mma` operation with `.m8n8k16` shape introduced in PTX ISA version 6.5.

`.u4/.s4` integer type `mma` operation with `.m8n8k32` shape introduced in PTX ISA version 6.5.

`.f64` floating point type `mma` operation with `.m8n8k4` shape introduced in PTX ISA version 7.0.

`.f16` floating point type `mma` operation with `.m16n8k16` shape introduced in PTX ISA version 7.0.

`.bf16` alternate floating point type `mma` operation with `.m16n8k8` and `.m16n8k16` shapes introduced in PTX ISA version 7.0.

`.tf32` alternate floating point type `mma` operation with `.m16n8k4` and `.m16n8k8` shapes introduced in PTX ISA version 7.0.

`.u8/.s8` integer type `mma` operation with `.m16n8k16` and `.m16n8k32` shapes introduced in PTX ISA version 7.0.

`.u4/.s4` integer type `mma` operation with `.m16n8k32` and `.m16n8k64` shapes introduced in PTX ISA version 7.0.

`.b1` single-bit integer type `mma` operation with `.m8n8k128`, `.m16n8k128` and `.m16n8k256` shapes introduced in PTX ISA version 7.0.

Support for `.and` operation in single-bit `mma` introduced in PTX ISA version 7.1.

`.f64` floating point type `mma` operation with `.m16n8k4`, `.m16n8k8`, and `.m16n8k16` shapes introduced in PTX ISA version 7.8.

Support for `.e4m3` and `.e5m2` alternate floating point type `mma` operation introduced in PTX ISA version 8.4.

Support for shape `.m16n8k16` and `.f16` `dtype`/`ctype` with `.e4m3`/`.e5m2` alternate floating point type mma operation introduced in PTX ISA version 8.7.

Support for `.e3m2`, `.e2m3`, `.e2m1` alternate floating point type `mma` operation introduced in PTX ISA version 8.7.

Support for `.kind`, `.block_scale`, `.scale_vec_size` qualifier introduced in PTX ISA version 8.7.

Support for `.scale_vec::4X` on `.ue8m0` as `.stype` with `.kind::mxf4nvf4` is introduced in PTX ISA version 9.1.

Target ISA Notes

Requires `sm_70` or higher.

`.f16` floating point type `mma` operation with `.m8n8k4` shape requires `sm_70` or higher.

Note

`mma.sync.m8n8k4` is optimized for target architecture `sm_70` and may have substantially reduced performance on other target architectures.

`.f16` floating point type `mma` operation with `.m16n8k8` shape requires `sm_75` or higher.

`.u8/.s8` integer type `mma` operation with `.m8n8k16` shape requires `sm_75` or higher.

`.u4/.s4` integer type `mma` operation with `.m8n8k32` shape `sm_75` or higher.

`.b1` single-bit integer type `mma` operation with `.m8n8k128` shape `sm_75` or higher.

`.f64` floating point type `mma` operation with `.m8n8k4` shape requires `sm_80` or higher.

`.f16` floating point type `mma` operation with `.m16n8k16` shape requires `sm_80` or higher.

`.bf16` alternate floating point type `mma` operation with `.m16n8k8` and `.m16n8k16` shapes requires `sm_80` or higher.

`.tf32` alternate floating point type `mma` operation with `.m16n8k4` and `.m16n8k8` shapes requires `sm_80` or higher.

`.u8/.s8` integer type `mma` operation with `.m16n8k16` and `.m16n8k32` shapes requires `sm_80` or higher.

`.u4/.s4` integer type `mma` operation with `.m16n8k32` and `.m16n8k64` shapes requires `sm_80` or higher.

`.b1` single-bit integer type `mma` operation with `.m16n8k128` and `.m16n8k256` shapes requires `sm_80` or higher.

`.and` operation in single-bit `mma` requires `sm_80` or higher.

`.f64` floating point type `mma` operation with `.m16n8k4`, `.m16n8k8`, and `.m16n8k16` shapes require `sm_90` or higher.

`.e4m3` and `.e5m2` alternate floating point type `mma` operation requires `sm_89` or higher.

`.e3m2`, `.e2m3` and `.e2m1` alternate floating point type `mma` operation requires `sm_120a` and is supported on `sm_120f` from PTX ISA version 8.8.

Support for `.kind`, `.block_scale`, `.scale_vec_size` qualifier requires `sm_120a` and are supported on `sm_120f` or higher in the same family from PTX ISA version 8.8.

Examples of half precision floating point type
    
    
    // f16 elements in C and D matrix
    .reg .f16x2 %Ra<2> %Rb<2> %Rc<4> %Rd<4>
    mma.sync.aligned.m8n8k4.row.col.f16.f16.f16.f16
    {%Rd0, %Rd1, %Rd2, %Rd3},
    {%Ra0, %Ra1},
    {%Rb0, %Rb1},
    {%Rc0, %Rc1, %Rc2, %Rc3};
    
    
    // f16 elements in C and f32 elements in D
    .reg .f16x2 %Ra<2> %Rb<2> %Rc<4>
    .reg .f32 %Rd<8>
    mma.sync.aligned.m8n8k4.row.col.f32.f16.f16.f16
    {%Rd0, %Rd1, %Rd2, %Rd3, %Rd4, %Rd5, %Rd6, %Rd7},
    {%Ra0, %Ra1},
    {%Rb0, %Rb1},
    {%Rc0, %Rc1, %Rc2, %Rc3};
    
     // f32 elements in C and D
    .reg .f16x2 %Ra<2>, %Rb<1>;
    .reg .f32 %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k8.row.col.f32.f16.f16.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb0},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    .reg .f16x2 %Ra<4>, %Rb<2>, %Rc<2>, %Rd<2>;
    mma.sync.aligned.m16n8k16.row.col.f16.f16.f16.f16
      {%Rd0, %Rd1},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1};
    
    .reg .f16 %Ra<4>, %Rb<2>;
    .reg .f32 %Rc<2>, %Rd<2>;
    mma.sync.aligned.m16n8k16.row.col.f32.f16.f16.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    

Examples of alternate floating point type
    
    
    .reg .b32 %Ra<2>, %Rb<1>;
    .reg .f32 %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k4.row.col.f32.tf32.tf32.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb0},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    .reg .f16x2 %Ra<2>, %Rb<1>;
    .reg .f32 %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k8.row.col.f32.bf16.bf16.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb0},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    .reg .b32 %Ra<2>, %Rb<1>;
    .reg .f32 %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k8.row.col.f32.tf32.tf32.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Rb2, %Rb3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    .reg .f16x2 %Ra<2>, %Rb<1>;
    .reg .f32 %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k16.row.col.f32.bf16.bf16.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k32.row.col.f32.e4m3.e5m2.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k16.row.col.f32.e5m2.e4m3.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb0},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .b32 %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k32.row.col.f16.e4m3.e5m2.f16
      {%Rd0, %Rd1},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .b32 %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k16.row.col.f16.e5m2.e5m2.f16
      {%Rd0, %Rd1},
      {%Ra0, %Ra1},
      {%Rb0},
      {%Rc0, %Rc1};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k32.row.col.kind::f8f6f4.f32.e3m2.e2m3.f32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .b32 %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k32.row.col.kind::f8f6f4.f16.e2m3.e2m1.f16
      {%Rd0, %Rd1},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1};
    

Examples of integer type
    
    
    .reg .b32 %Ra, %Rb, %Rc<2>, %Rd<2>;
    
    // s8 elements in A and u8 elements in B
    mma.sync.aligned.m8n8k16.row.col.satfinite.s32.s8.u8.s32
      {%Rd0, %Rd1},
      {%Ra},
      {%Rb},
      {%Rc0, %Rc1};
    
    // u4 elements in A and B matrix
    mma.sync.aligned.m8n8k32.row.col.satfinite.s32.u4.u4.s32
      {%Rd0, %Rd1},
      {%Ra},
      {%Rb},
      {%Rc0, %Rc1};
    
    // s8 elements in A and u8 elements in B
    .reg .b32 %Ra<2>, %Rb, %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k16.row.col.satfinite.s32.s8.u8.s32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    // u4 elements in A and s4 elements in B
    .reg .b32 %Ra<2>, %Rb, %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k32.row.col.satfinite.s32.u4.s4.s32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    // s8 elements in A and s8 elements in B
    .reg .b32 %Ra<4>, %Rb<2>, %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k32.row.col.satfinite.s32.s8.s8.s32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    // u8 elements in A and u8 elements in B
    .reg .b32 %Ra<4>, %Rb<2>, %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k64.row.col.satfinite.s32.u4.u4.s32
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1 },
      {%Rc0, %Rc1, %Rc2, %Rc3};
    

Examples of single bit type
    
    
    // b1 elements in A and B
    .reg .b32 %Ra, %Rb, %Rc<2>, %Rd<2>;
    mma.sync.aligned.m8n8k128.row.col.s32.b1.b1.s32.and.popc
      {%Rd0, %Rd1},
      {%Ra},
      {%Rb},
      {%Rc0, %Rc1};
    
    // b1 elements in A and B
    .reg .b32 %Ra, %Rb, %Rc<2>, %Rd<2>;
    mma.sync.aligned.m8n8k128.row.col.s32.b1.b1.s32.xor.popc
      {%Rd0, %Rd1},
      {%Ra},
      {%Rb},
      {%Rc0, %Rc1};
    
    .reg .b32 %Ra<2>, %Rb, %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k128.row.col.s32.b1.b1.s32.xor.popc
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    .reg .b32 %Ra<2>, %Rb, %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k128.row.col.s32.b1.b1.s32.and.popc
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    .reg .b32 %Ra<4>, %Rb<2>, %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k256.row.col.s32.b1.b1.s32.xor.popc
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    .reg .b32 %Ra<4>, %Rb<2>, %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k256.row.col.s32.b1.b1.s32.and.popc
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    

Examples of `.f64` floating point type
    
    
    .reg .f64 %Ra, %Rb, %Rc<2>, %Rd<2>;
    mma.sync.aligned.m8n8k4.row.col.f64.f64.f64.f64
      {%Rd0, %Rd1},
      {%Ra},
      {%Rb},
      {%Rc0, %Rc1};
    
    .reg .f64 %Ra<8>, %Rb<4>, %Rc<4>, %Rd<4>;
    mma.sync.aligned.m16n8k4.row.col.f64.f64.f64.f64.rn
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1},
      {%Rb0},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    mma.sync.aligned.m16n8k8.row.col.f64.f64.f64.f64.rn
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    
    mma.sync.aligned.m16n8k16.row.col.f64.f64.f64.f64.rn
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3, %Ra4, %Ra5, %Ra6, %Ra7},
      {%Rb0, %Rb1, %Rb2, %Rb3},
      {%Rc0, %Rc1, %Rc2, %Rc3};
    

Examples of `mma` with block scale
    
    
     .reg .b32 %Ra<4>, %Rb<4>;
     .reg .f32 %Rc<4>, %Rd<4>;
     .reg .b32 scaleAData, scaleBData;
     mma.sync.aligned.m16n8k64.row.col.kind::mxf4.block_scale.f32.e2m1.e2m1.f32.ue8m0
       {%Rd0, %Rd1, %Rd2, %Rd3},
       {%Ra0, %Ra1, %Ra2, %Ra3},
       {%Rb0, %Rb1},
       {%Rc0, %Rc1, %Rc2, %Rc3},
       scaleAData, {2, 1}, scaleBData, {2, 3};
    
     .reg .b32 %Ra<4>, %Rb<4>;
     .reg .f32 %Rc<4>, %Rd<4>;
     .reg .b32 scaleAData, scaleBData;
     .reg .u16 bidA, bidB, tidA, tidB;
     mma.sync.aligned.m16n8k64.row.col.kind::mxf4nvf4.block_scale.scale_vec::4X.f32.e2m1.e2m1.f32.ue4m3
       {%Rd0, %Rd1, %Rd2, %Rd3},
       {%Ra0, %Ra1, %Ra2, %Ra3},
       {%Rb0, %Rb1},
       {%Rc0, %Rc1, %Rc2, %Rc3},
       scaleAData, {bidA, tidA}, scaleBData, {bidB, tidB};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 scaleAData, scaleBData;
    .reg .u16 bidA, bidB, tidA, tidB;
    mma.sync.aligned.m16n8k64.row.col.kind::mxf4nvf4.block_scale.scale_vec::4X.f32.e2m1.e2m1.f32.ue8m0
       {%Rd0, %Rd1, %Rd2, %Rd3},
       {%Ra0, %Ra1, %Ra2, %Ra3},
       {%Rb0, %Rb1},
       {%Rc0, %Rc1, %Rc2, %Rc3},
       scaleAData, {bidA, tidA}, scaleBData, {bidB, tidB};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 scaleAData, scaleBData;
    mma.sync.aligned.m16n8k32.row.col.kind::mxf8f6f4.block_scale.scale_vec::1X.f32.e3m2.e2m1.f32.ue8m0
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2, %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3},
      scaleAData, {0, 1}, scaleBData, {0, 1};
    
    .reg .b32 %Ra<4>, %Rb<4>;
    .reg .f32 %Rc<4>, %Rd<4>;
    .reg .b32 scaleAData, scaleBData;
    mma.sync.aligned.m16n8k32.row.col.kind::mxf8f6f4.block_scale.scale_vec::1X.f32.e4m3.e5m2.f32.ue8m0
      {%Rd0, %Rd1, %Rd2, %Rd3},
      {%Ra0, %Ra1, %Ra2,  %Ra3},
      {%Rb0, %Rb1},
      {%Rc0, %Rc1, %Rc2, %Rc3},
      scaleAData, {0, 1}, scaleBData, {0, 0};

#####  9.7.14.5.15. [Warp-level matrix load instruction: `ldmatrix`](<#warp-level-matrix-instructions-ldmatrix>)

`ldmatrix`

Collectively load one or more matrices from shared memory for `mma` instruction

Syntax
    
    
    ldmatrix.sync.aligned.shape.num{.trans}{.ss}.type r, [p];
    
    ldmatrix.sync.aligned.m8n16.num{.ss}.dst_fmt.src_fmt        r, [p];
    ldmatrix.sync.aligned.m16n16.num.trans{.ss}.dst_fmt.src_fmt r, [p];
    
    .shape   = {.m8n8, .m16n16};
    .num     = {.x1, .x2, .x4};
    .ss      = {.shared{::cta}};
    .type    = {.b16, .b8};
    .dst_fmt = { .b8x16 };
    .src_fmt = { .b6x16_p32, .b4x16_p64 };
    

Description

Collectively load one or more matrices across all threads in a warp from the location indicated by the address operand `p`, from `.shared` state space into destination register `r`. If no state space is provided, generic addressing is used, such that the address in `p` points into `.shared` space. If the generic address doesn’t fall in `.shared` state space, then the behavior is undefined.

The `.shape` qualifier indicates the dimensions of the matrices being loaded. Each matrix element holds 16-bit or 8-bit or 6-bit or 4-bit data.

Following table shows the matrix load case for each `.shape`.

.shape | Matrix shape | Element size  
---|---|---  
`.m8n8` | 8x8 | 16-bit  
`.m16n16` | 16x16 | 8-bit or 6-bit or 4-bit  
`.m8n16` | 8x16 | 6-bit or 4-bit  
  
Following table shows the valid use of 6-bit or 4-bit data load.

.src_fmt | .shape | Source data | Padding | .dst_fmt  
---|---|---|---|---  
`.b6x16_p32` | `.m8n16` | 16 6-bit elements | 32 bits | `.b8x16` (16 8-bit elements)  
`.m16n16`  
`.b4x16_p64` | `.m8n16` | 16 4-bit elements | 64 bits  
`.m16n16`  
  
For `.b6x16_p32` format source data is 16 unsigned 6-bit elements with 32 bits padding. For `.b4x16_p64` format source data is 16 unsigned 4-bit elements with 64 bits padding.

The values `.x1`, `.x2` and `.x4` for `.num` indicate one, two or four matrices respectively. When `.shape` is `.m16n16`, only `.x1` and `.x2` are valid values for `.num`.

The mandatory `.sync` qualifier indicates that `ldmatrix` causes the executing thread to wait until all threads in the warp execute the same `ldmatrix` instruction before resuming execution.

The mandatory `.aligned` qualifier indicates that all threads in the warp must execute the same `ldmatrix` instruction. In conditionally executed code, an `ldmatrix` instruction should only be used if it is known that all threads in the warp evaluate the condition identically, otherwise the behavior is undefined.

The behavior of `ldmatrix` is undefined if all threads do not use the same qualifiers, or if any thread in the warp has exited.

The destination operand `r` is a brace-enclosed vector expression consisting of 1, 2, or 4 32-bit registers as per the value of `.num`. Each component of the vector expression holds a fragment from the corresponding matrix.

Supported addressing modes for `p` are described in [Addresses as Operands](<#addresses-as-operands>).

Consecutive instances of row need not be stored contiguously in memory. The eight addresses required for each matrix are provided by eight threads, depending upon the value of `.num` as shown in the following table. Each address corresponds to the start of a matrix row. Addresses addr0–addr7 correspond to the rows of the first matrix, addresses addr8–addr15 correspond to the rows of the second matrix, and so on.

`.num` | Threads 0–7 | Threads 8–15 | Threads 16–23 | Threads 24–31  
---|---|---|---|---  
`.x1` | addr0–addr7 | – | – | –  
`.x2` | addr0–addr7 | addr8–addr15 | – | –  
`.x4` | addr0–addr7 | addr8–addr15 | addr16–addr23 | addr24–addr31  
  
Note

For .target `sm_75` or below, all threads must contain valid addresses. Otherwise, the behavior is undefined. For `.num = .x1` and `.num = .x2`, addresses contained in lower threads can be copied to higher threads to achieve the expected behavior.

When reading 8x8 matrices, a group of four consecutive threads loads 16 bytes. The matrix addresses must be naturally aligned accordingly.

Each thread in a warp loads fragments of a row, with thread 0 receiving the first fragment in its register `r`, and so on. A group of four threads loads an entire row of the matrix as shown in [Figure 104](<#mma-ldmatrix-fragments>).

![_images/mma-ldmatrix-fragments.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-ldmatrix-fragments.png)

Figure 104 ldmatrix fragment layout for one 8x8 Matrix with 16-bit elements

When `.num` = `.x2`, the elements of the second matrix are loaded in the next destination register in each thread as per the layout in above table. Similarly, when `.num` = `.x4`, elements of the third and fourth matrices are loaded in the subsequent destination registers in each thread.

For matrix shape 16x16, two destination registers `r0` and `r1` of type `.b32` must be specified and in each register four 8-bit elements are loaded. For 4-bit or 6-bit data, 8-bit element will have 4 bits or 2 bits of padding respectively. Refer [Optional Decompression](<#tcgen05-optional-decompression>) for more details on these formats.

An entire row of the matrix can be loaded by a group of four consecutive and aligned threads. Each thread in a warp loads 4 consecutive columns across 2 rows as shown in the [Figure 105](<#mma-ldmatrix-fragments-1616>).

![_images/mma-ldmatrix-fragments-1616.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-ldmatrix-fragments-1616.png)

Figure 105 ldmatrix fragment layout for one 16x16 matrix with 8-bit elements

For matrix shape 8x16, one destination register `r0` of type `.b32` must be specified where four 8-bit elements are loaded in the register. For 4-bit or 6-bit data, 8-bit element will have 4 bits or 2 bits of padding respectively.

An entire row of the matrix can be loaded by a group of four consecutive and aligned threads. Each thread in a warp loads 4 consecutive columns as shown in [Figure 106](<#mma-ldmatrix-fragments-816>).

![_images/mma-ldmatrix-fragments-816.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-ldmatrix-fragments-816.png)

Figure 106 ldmatrix fragment layout for one 8x16 matrix with 8-bit elements containing 4-bit/6-bit data

Optional qualifier `.trans` indicates that the matrix is loaded in column-major format. However, for 16x16 matrices, `.trans` is mandatory.

The `ldmatrix` instruction is treated as a weak memory operation in the [Memory Consistency Model](<#memory-consistency-model>).

PTX ISA Notes

Introduced in PTX ISA version 6.5.

Support for `::cta` sub-qualifier introduced in PTX ISA version 7.8.

Support for `.m16n16`, `.m8n16` shapes introduced in PTX ISA version 8.6.

Support for `.b8` type with `ldmatrix` is introduced in PTX ISA version 8.6.

Support for `.src_fmt`, `.dst_fmt` qualifiers introduced in PTX ISA version 8.6.

Target ISA Notes

Requires `sm_75` or higher.

Shapes `.m16n16`, `.m8n16` are supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And are supported on following family-specific architectures from PTX ISA version 8.8:

>     * `sm_100f` or higher in the same family
> 
>     * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)
> 
>     * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family


Type `.b8` with `ldmatrix` is supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And are supported on following family-specific architectures from PTX ISA version 8.8:

>     * `sm_100f` or higher in the same family
> 
>     * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)
> 
>     * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family


Qualifiers `.src_fmt`, `.dst_fmt` are supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And are supported on following family-specific architectures from PTX ISA version 8.8:

>     * `sm_100f` or higher in the same family
> 
>     * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)
> 
>     * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family


Examples
    
    
    // Load a single 8x8 matrix using 64-bit addressing
    .reg .b64 addr;
    .reg .b32 d;
    ldmatrix.sync.aligned.m8n8.x1.shared::cta.b16 {d}, [addr];
    
    // Load two 8x8 matrices in column-major format
    .reg .b64 addr;
    .reg .b32 d<2>;
    ldmatrix.sync.aligned.m8n8.x2.trans.shared.b16 {d0, d1}, [addr];
    
    // Load four 8x8 matrices
    .reg .b64 addr;
    .reg .b32 d<4>;
    ldmatrix.sync.aligned.m8n8.x4.b16 {d0, d1, d2, d3}, [addr];
    
    // Load one 16x16 matrices of 64-bit elements and transpose them
    .reg .b64 addr;
    .reg .b32 d<2>;
    ldmatrix.sync.aligned.m16n16.x1.trans.shared.b8 {d0, d1}, [addr];
    
    // Load two 16x16 matrices of 64-bit elements and transpose them
    .reg .b64 addr;
    .reg .b32 d<4>;
    ldmatrix.sync.aligned.m16n16.x2.trans.shared::cta.b8 {d0, d1, d2, d3}, [addr];
    
    // Load two 16x16 matrices of 6-bit elements and transpose them
    .reg .b64 addr;
    .reg .b32 d<4>;
    ldmatrix.sync.aligned.m16n16.x2.trans.shared::cta.b8x16.b6x16_p32 {d0, d1, d2, d3}, [addr];

#####  9.7.14.5.16. [Warp-level matrix store instruction: `stmatrix`](<#warp-level-matrix-instructions-stmatrix>)

`stmatrix`

Collectively store one or more matrices to shared memory.

Syntax
    
    
    stmatrix.sync.aligned.shape.num{.trans}{.ss}.type [p], r;
    
    .shape  = {.m8n8, .m16n8};
    .num    = {.x1, .x2, .x4};
    .ss     = {.shared{::cta}};
    .type   = {.b16, .b8};
    

Description

Collectively store one or more matrices across all threads in a warp to the location indicated by the address operand `p`, in `.shared` state space. If no state space is provided, generic addressing is used, such that the address in `p` points into `.shared` space. If the generic address doesn’t fall in `.shared` state space, then the behavior is undefined.

The `.shape` qualifier indicates the dimensions of the matrices being loaded. Each matrix element holds 16-bit or 8-bit data as indicated by the `.type` qualifier.

`.m16n8` shape is valid only for `.b8` type.

The values `.x1`, `.x2` and `.x4` for `.num` indicate one, two or four matrices respectively.

The mandatory `.sync` qualifier indicates that `stmatrix` causes the executing thread to wait until all threads in the warp execute the same `stmatrix` instruction before resuming execution.

The mandatory `.aligned` qualifier indicates that all threads in the warp must execute the same `stmatrix` instruction. In conditionally executed code, an `stmatrix` instruction should only be used if it is known that all threads in the warp evaluate the condition identically, otherwise the behavior is undefined.

The behavior of `stmatrix` is undefined if all threads do not use the same qualifiers, or if any thread in the warp has exited.

The source operand `r` is a brace-enclosed vector expression consisting of 1, 2, or 4 32-bit registers as per the value of `.num`. Each component of the vector expression holds a fragment from the corresponding matrix.

Supported addressing modes for `p` are described in [Addresses as Operands](<#addresses-as-operands>).

Consecutive instances of row need not be stored contiguously in memory. The eight addresses required for each matrix are provided by eight threads, depending upon the value of `.num` as shown in the following table. Each address corresponds to the start of a matrix row. Addresses addr0–addr7 correspond to the rows of the first matrix, addresses addr8–addr15 correspond to the rows of the second matrix, and so on.

`.num` | Threads 0–7 | Threads 8–15 | Threads 16–23 | Threads 24–31  
---|---|---|---|---  
`.x1` | addr0–addr7 | – | – | –  
`.x2` | addr0–addr7 | addr8–addr15 | – | –  
`.x4` | addr0–addr7 | addr8–addr15 | addr16–addr23 | addr24–addr31  
  
When storing 8x8 matrices, a group of four consecutive threads stores 16 bytes. The matrix addresses must be naturally aligned accordingly.

Each thread in a warp stores fragments of a row, with thread 0 storing the first fragment from its register `r`, and so on. A group of four threads stores an entire row of the matrix as shown in [Figure 107](<#mma-stmatrix-fragments>).

![_images/mma-stmatrix-fragments.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-stmatrix-fragments.png)

Figure 107 stmatrix fragment layout for one 8x8 matrix with 16-bit elements

When `.num` = `.x2`, the elements of the second matrix are storedd from the next source register in each thread as per the layout in above table. Similarly, when `.num` = `.x4`, elements of the third and fourth matrices are stored from the subsequent source registers in each thread.

For 16x8 matrix shape, each of the 32 threads in the warp provides four elements of data per matrix.

Each element in the source operand `r` is of type `.b32` and contains four 8 bit elements `e0`, `e1`, `e2`, `e3` with `e0` and `e3` containing the LSB and MSB respectively of register `r`.

![_images/mma-stmatrix-fragments-168.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-stmatrix-fragments-168.png)

Figure 108 stmatrix fragment layout for one 16x8 matrix with 8 bit elements

Optional qualifier `.trans` indicates that the matrix is stored in column-major format. However, for 16x8 matrices, `.trans` is mandatory.

The `stmatrix` instruction is treated as a weak memory operation in the [Memory Consistency Model](<#memory-consistency-model>).

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Support for `.m16n8` shape is introduced in PTX ISA version 8.6.

Support for `.b8` type with `stmatrix` is introduced in PTX ISA version 8.6.

Target ISA Notes

Requires `sm_90` or higher.

Shape `.m16n8` is supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

>     * `sm_100f` or higher in the same family
> 
>     * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)
> 
>     * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family


Type `.b8` with `stmatrix` is supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

>     * `sm_100f` or higher in the same family
> 
>     * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)
> 
>     * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family


Examples
    
    
    // Store a single 8x8 matrix using 64-bit addressing
    .reg .b64 addr;
    .reg .b32 r;
    stmatrix.sync.aligned.m8n8.x1.shared.b16 [addr], {r};
    
    // Store two 8x8 matrices in column-major format
    .reg .b64 addr;
    .reg .b32 r<2>;
    stmatrix.sync.aligned.m8n8.x2.trans.shared::cta.b16 [addr], {r0, r1};
    
    // Store four 8x8 matrices
    .reg .b64 addr;
    .reg .b32 r<4>;
    stmatrix.sync.aligned.m8n8.x4.b16 [addr], {r0, r1, r2, r3};
    
    // Store a single 16x8 matrix using generic addressing
    .reg .b64 addr;
    .reg .b32 r;
    stmatrix.sync.aligned.m16n8.x1.trans.shared.b8 [addr], {r};
    
    // Store two 16x8 matrices
    .reg .b64 addr;
    .reg .b32 r<2>;
    stmatrix.sync.aligned.m16n8.x2.trans.shared::cta.b8 [addr],{r0, r1};
    
    // Store four 16x8 matrices
    .reg .b64 addr;
    .reg .b32 r<4>;
    stmatrix.sync.aligned.m16n8.x4.b8 [addr], {r0, r1, r2, r3};

#####  9.7.14.5.17. [Warp-level matrix transpose instruction: `movmatrix`](<#warp-level-matrix-instructions-movmatrix>)

`movmatrix`

Transpose a matrix in registers across the warp.

Syntax
    
    
    movmatrix.sync.aligned.shape.trans.type d, a;
    
    .shape  = {.m8n8};
    .type   = {.b16};
    

Description

Move a row-major matrix across all threads in a warp, reading elements from source `a`, and writing the transposed elements to destination `d`.

The `.shape` qualifier indicates the dimensions of the matrix being transposed. Each matrix element holds 16-bit data as indicated by the `.type` qualifier.

The mandatory `.sync` qualifier indicates that `movmatrix` causes the executing thread to wait until all threads in the warp execute the same `movmatrix` instruction before resuming execution.

The mandatory `.aligned` qualifier indicates that all threads in the warp must execute the same `movmatrix` instruction. In conditionally executed code, a `movmatrix` instruction should only be used if it is known that all threads in the warp evaluate the condition identically, otherwise the behavior is undefined.

Operands `a` and `d` are 32-bit registers containing fragments of the input matrix and the resulting matrix respectively. The mandatory qualifier `.trans` indicates that the resulting matrix in `d` is a transpose of the input matrix specified by `a`.

Each thread in a warp holds a fragment of a row of the input matrix, with thread 0 holding the first fragment in register `a`, and so on. A group of four threads holds an entire row of the input matrix as shown in [Figure 109](<#mma-movmatrix-fragments-src>).

![_images/mma-movmatrix-fragments-src.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-movmatrix-fragments-src.png)

Figure 109 movmatrix source matrix fragment layout

Each thread in a warp holds a fragment of a column of the result matrix, with thread 0 holding the first fragment in register `d`, and so on. A group of four threads holds an entire column of the result matrix as shown in [Figure 110](<#mma-movmatrix-fragments-dst>).

![_images/mma-movmatrix-fragments-dst.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/mma-movmatrix-fragments-dst.png)

Figure 110 movmatrix result matrix fragment layout

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_75` or higher.

Examples
    
    
    .reg .b32 d, a;
    movmatrix.sync.aligned.m8n8.trans.b16 d, a;