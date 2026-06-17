---
name: ptx-matrix-descriptors
description: There are three kinds of matrix descriptors used by the `tcgen05` family
  of instructions.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.16.4. Matrix Descriptors

---
title: "9.7.16.4. Matrix Descriptors"
section: 9.7.16.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.16.4. Matrix Descriptors


There are three kinds of matrix descriptors used by the `tcgen05` family of instructions.

#####  9.7.16.4.1. [Shared memory descriptor](<#tcgen05-shared-memory-descriptor>)

The shared memory descriptor describes the properties of multiplicand matrix in shared memory including its location in the shared memory of the current _CTA_. It is a 64-bit value contained in a register with the following layout:

Table 40 Shared memory descriptor layout Bit-field | Size in bits | Description  
---|---|---  
0-13 | 14 | matrix-descriptor-encode (Matrix start address)  
16-29 | 14 |  matrix-descriptor-encode ([Leading dimension byte offset relative](<#tcgen05-leading-dimension-byte-offset>)) OR matrix-descriptor-encode ([Leading dimension byte address absolute](<#tcgen05-leading-dimension-byte-offset>))  
32-45 | 14 | matrix-descriptor-encode ([Stride dimension byte offset](<#tcgen05-stride-dimension-byte-offset>))  
46-48 | 3 | Fixed constant value of 0b001  
49-51 | 3 | Matrix base offset  
52 | 1 | Leading dimension stride mode: \- 0: byte offset relative \- 1: byte address absolute  
53-60 | 8 | Fixed constant value of 0xb00000000  
61-63 | 3 |  Specifies the swizzling mode to be used: 0\. No swizzling 1\. 128-Byte with 32B atomic swizzling 2\. 128-Byte swizzling 4\. 64-Byte swizzling 6\. 32-Byte swizzling Note: Values 3, 5 and 7 are invalid  
  
where matrix-descriptor-encode(x) = (x & 0x3FFFF) >> 4

The value of base offset is 0 when the repeating pattern of the specified swizzling mode starts as per shown in [Table 41](<#tcgen05-start-addr-swizzle-mode>).

Table 41 Starting address of repeating pattern for various swizzling modes Swizzling mode | Starting address of the repeating pattern  
---|---  
128-Byte swizzle | 1024-Byte boundary  
64-Byte swizzle | 512-Byte boundary  
32-Byte swizzle | 256-Byte boundary  
  
Otherwise, the base offset must be a non-zero value, computed using the following formula: `base offset = (pattern start addr >> 0x7) & 0x7`

The following must be 16-byte aligned:

  1. Matrix start address

  2. Leading dimension byte offset

  3. Stride dimension byte offset


######  9.7.16.4.1.1. [Target ISA Note](<#tcgen05-shared-memory-descriptor-target-isa-note>)

  * The byte address mode for the leading dimension stride is supported on `sm_103a`.

#####  9.7.16.4.2. [Instruction descriptor](<#tcgen05-instruction-descriptor>)

The instruction descriptor describes the shapes, types and other details of all the matrices and the matrix-multiplication-and-accumulation operation. It is a 32-bit value in registers and the exact layout is dependent on the MMA-Kind:

Table 42 Instruction descriptor format for .kind::tf32, .kind::f16, .kind::f8f6f4 and .kind::i8 Bits |  Size (bits) | Description | Values  
---|---|---|---  
.kind::tf32 | .kind::f16 | .kind::f8f6f4 | .kind::i8  
0-1 | 2 | [Sparsity selector](<#tcgen05-sparse-matrices-sparsity-selector>), if Sparsity is enabled | 0-3  
2 | 1 | Sparsity |  Dense = 0 Sparse = 1  
3 | 1 | Saturate for integer types | 0 (NA) | No Saturate = 0 Saturate = 1  
4-5 | 2 | dtype (Matrix D type) | F32 = 1 | F16 = 0 F32 = 1 | S32 = 2  
6 | 1 | Reserved | 0  
7-9 | 3 | atype (Matrix A type) | TF32 = 2 |  F16 = 0 BF16 = 1 | E4M3 = 0 E5M2 = 1 E2M3 = 3 E3M2 = 4 E2M1 = 5 |  Unsigned 8b = 0 Signed 8b = 1  
10-12 | 3 | btype (Matrix B type)  
13 | 1 | Negate A Matrix |  No Negate = 0 Negate = 1 | No Negate = 0  
14 | 1 | Negate B Matrix  
15 | 1 | Transpose A Matrix |  No Transpose = 0 Transpose = 1  
16 | 1 | Transpose B Matrix  
17-22 | 6 | N, Dimension of Matrix B (3 LSBs not included) | N >> 3  
23 | 1 | Reserved | 0  
24-28 | 5 | M, Dimension of Matrix A (4 LSBs not included) | M >> 4  
29 | 1 | Reserved | 0  
30-31 | 2 | Maximum shift while attempting B matrix -reuse in `.ws` | no shift = 0 maximum shift of 8 = 1 maximum shift of 16 = 2 maximum shift of 32 = 3  
Table 43 Instruction descriptor format for .kind::mxf8f6f4 Bits |  Size (bits) | Description | Values  
---|---|---|---  
.kind::mxf8f6f4  
0-1 | 2 | Reserved | 0  
2 | 1 | Sparsity |  Dense = 0 Sparse = 1  
3 | 1 | Reserved | 0  
4-5 | 2 | [Matrix B Scale Factor Data ID](<#tcgen05-mma-scale-factor-b>) | 0-3  
6 | 1 | Reserved | 0  
7-9 | 3 | atype (Matrix A type) | E4M3 = 0 E5M2 = 1 E2M3 = 3 E3M2 = 4 E2M1 = 5  
10-12 | 3 | btype (Matrix B type)  
13 | 1 | Negate A Matrix |  No Negate = 0 Negate = 1  
14 | 1 | Negate B Matrix  
15 | 1 | Transpose A Matrix |  No Transpose = 0 Transpose = 1  
16 | 1 | Transpose B Matrix  
17-22 | 6 | N, Dimension of Matrix B (3 LSBs not included) | N >> 3  
23 | 1 | Scale Matrix Type, for both scale_A / scale_B | UE8M0 = 1  
24-26 | 3 | Reserved | 0  
27-28 | 2 | M, Dimension of Matrix A (7 LSBs not included) | M >> 7  
29-30 | 2 | [Matrix A Scale Factor Data ID](<#tcgen05-mma-scale-factor-a>) | 0-3  
31 | 1 | Reserved | 0  
Table 44 Instruction descriptor format for .kind::mxf4 and .kind::mxf4nvf4 Bits |  Size (bits) | Description | Values  
---|---|---|---  
.kind::mxf4 | .kind::mxf4nvf4  
0-1 | 2 | Reserved | 0  
2 | 1 | Sparsity |  Dense = 0 Sparse = 1  
3 | 1 | Reserved | 0  
4-5 | 2 | [Matrix B Scale Factor Data ID](<#tcgen05-mma-scale-factor-b>) | 0 or 2  
6 | 1 | Reserved | 0  
7-9 | 3 | atype (Matrix A type) | E2M1 = 1  
10-11 | 2 | btype (Matrix B type)  
12 | 1 | Reserved | 0  
13 | 1 | Negate A Matrix |  No Negate = 0 Negate = 1  
14 | 1 | Negate B Matrix  
15 | 1 | Transpose A Matrix | No Transpose = 0  
16 | 1 | Transpose B Matrix  
17-22 | 6 | N, Dimension of Matrix B (3 LSBs not included) | N >> 3  
23 | 1 | Scale Matrix Type, for both scale_A / scale_B | UE8M0 = 1 | UE4M3 = 0  
24-26 | 3 | Reserved | 0  
27-28 | 2 | M, Dimension of Matrix A (7 LSBs not included) | M >> 7  
29-30 | 2 | [Matrix A Scale Factor Data ID](<#tcgen05-mma-scale-factor-a>) | 0 or 2  
31 | 1 | K Dimension |  (Dense K=64 / Sparse K=128) = 0 (Dense K=96) = 1

#####  9.7.16.4.3. [Zero-Column Mask Descriptor](<#tcgen05-zero-column-mask-descriptor>)  
  
The zero-column mask descriptor is used to generate a mask that specifies which columns of `B` matrix will have zero value for the MMA operation regardless of the values present in the shared memory. The total size of the generated mask is N-bits.

A 0-bit in the mask specifies that values of the corresponding column in matrix `B` should be used for the MMA operation. A 1-bit in the mask specifies 0s must be used for the entire column for the MMA operation.

The zero-column mask descriptor is a 64-bit value in registers with the following layout:

Table 45 Zero-Column Mask descriptor layout Bits | Size (bits) | Field Name | Description  
---|---|---|---  
0-7 | 8 | Start Count 0 (sc0) |  Specifies the LSBs that must be skipped for sub-mask mask-i  
8-15 | 8 | Start Count 1 (sc1)  
16-23 | 8 | Start Count 2 (sc2)  
24-31 | 8 | Start Count 3 (sc3)  
32 | 1 | First Span 0 (fs0) |  Specifies the starting value for sub-mask mask-i  
33 | 1 | First Span 1 (fs1)  
34 | 1 | First Span 2 (fs2)  
35 | 1 | First Span 3 (fs3)  
36-38 | 3 | Reserved |   
39 | 1 | Non-Zero Mask | Value 0 indicates generated mask will have all 0s Value 1 indicates the mask has to be generated  
40-47 | 8 | Skip Span | (Count of consecutive columns where B matrix is used) - 1  
48-55 | 8 | Use Span | (Count of consecutive columns where 0s ar used) - 1  
56-61 | 6 | Column Shift | Shifts column by specified amount. Thus allows MMA on non-0 starting column. Max shift amount = 16 for M=32 Max shift amount = 32 otherwise  
  
The zero-column mask is made up of one or more sub-mask depending on M, as shown in the table:

M | Zero-Column Mask breakup | Sub-masks | First Span used | Start Column used  
---|---|---|---|---  
128 | Single sub-mask of size N-bits | mask0 | fs0 | sc0  
64 | Two sub-masks, each with size of N/2 bits | mask0, mask1 | fs0, fs1 | sc0, sc1  
32 | Four sub-masks, each with size of N/4 bits | mask0, mask1 mask2, mask3 | fs0, fs1, fs2, fs3 | sc0, sc1, sc2, sc3  
  
The following table shows the coverage of the sub-masks across N-dimension:

Sub-mask | M  
---|---  
128 | 64 | 32  
mask0 | Columns [0, N-1] | Columns [0, N/2-1] | Columns [0, N/4-1]  
mask1 | – | Columns [N/2, N-1] | Columns [N/4, N/2-1]  
mask2 | – | – | Columns [N/2, (N/4*3)-1]  
mask3 | – | – | Columns [(N/4*3), N-1]  
  
The following examples shows zero-column mask descriptor and their corresponding mask generated:

  1. Example 1: M = 128

Input zero-column mask descriptor:

Start count | First span | Non-Zero Mask | Skip Span | Use Span | Shift  
---|---|---|---|---|---  
{0, 0, 0, 0} | {0, 0, 0, 0} | 0 | 4 | 3 | 0  
  
Output zero-column mask: 0x0.

As Non-Zero Mask field is 0, the mask is 0x0. All the columns of the matrix `B` will be used for the MMA operation.

  2. Example 2: M = 128

Input zero-column mask descriptor:

Start count | First span | Non-Zero Mask | Skip Span | Use Span | Shift  
---|---|---|---|---|---  
{-, -, -, 0} | {-, -, -, 0} | 1 | 2 | 3 | 0  
  
Output mask0: 0b … 111 0000 111 0000 (size = N)

  3. Example 3: M = 64

Input zero-column mask descriptor:

Start count {.., sc1, sc0} | First span {.., fs1, fs0} | Non-Zero Mask | Skip Span | Use Span | Shift  
---|---|---|---|---|---  
{-, -, 0, 0} | {-, -, 0, 1} | 1 | 2 | 3 | 0  
  
Output mask0: 0b … 111 0000 111 0000 111

Output masl1: 0b … 0000 111 0000 111 0000

  4. Example 4: M = 32

Input zero-column mask descriptor:

Start count {sc3, sc2, sc1, sc0} | First span {fs3, fs2, fs1, fs0} | Non-Zero Mask | Skip Span | Use Span | Shift  
---|---|---|---|---|---  
{1, 2, 1, 0} | {0, 0, 1, 1} | 1 | 2 | 3 | 2  
  
Output mask0: 0b … 0000 111 0000 111

Output mask1: 0b … 0000 111 0000 11

Output mask2: 0b … 111 0000 111 00

Output mask3: 0b … 111 0000 111 000

If N = 128 then `B` Matrix with columns from 2 to 129 will be used for the MMA operation, due to the shift of 2.