---
name: ptx-tensorcore-5th-generation-matrix-multiply-and-accumulate-operations
description: 'The 5th generation of TensorCore operations of shape _MxNxK_ perform
  matrix multiplication and accumulation of the form:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.16.10. TensorCore 5th Generation Matrix Multiply and accumulate Operations

---
title: "9.7.16.10. TensorCore 5th Generation Matrix Multiply and accumulate Operations"
section: 9.7.16.10
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.16.10. TensorCore 5th Generation Matrix Multiply and accumulate Operations


The 5th generation of TensorCore operations of shape _MxNxK_ perform matrix multiplication and accumulation of the form:

`D = A*B+D`

where:

* the `A` matrix has shape _MxK_ , in either Tensor Memory or Shared Memory

  * the `B` matrix has shape _KxN_ , in Shared Memory of the current CTA and optionally in peer CTA

  * the `D` matrix is of the shape _MxN_ , in Tensor Memory

Optionally an input predicate can be used to disable the input from the accumulator matrix and the following operation can be performed as

`D = A*B`

The matrix multiplication and accumulation operations are categorized into various kinds based on input types and the throughput of the multiplication operation. The following shows the different kinds of MMA operations that are supported:

1. `f16` : supports `f16` and `bf16` input types.

  2. `tf32` : supports `tf32` input types.

  3. `f8f6f4` : supports all input combinations of `f8`, `f6` and `f4` types.

  4. `i8` : supports signed and unsigned 8-bit integer input types.

  5. `mxf8f6f4`/`mxf4` : supports mx-floating points input types.

  6. `mxf4nvf4` : supports `mxf4` type and a custom NVIDIA floating-point type for inputs where the type of the vector elements is 4 bits and requires a common scaling factor to form the complete floating-point type, similar to other mx-types.

Optionally, the 5th generation of TensorCore MMAs support dense and sparse matrix `A`. [Sparse Matrices](<#tcgen05-sparse-matrices>) describes the details of the sparse matrices.

Some of the MMA-kinds requires scaling of input matrices from memory to form the matrix `A` and matrix `B` before performing the MMA operation. [Block Scaling for tcgen05.mma.sync](<#tcgen05-block-scaling>) describes the details of the scaling of matrices.

The following table show the various matrices involved in the MMA operations and the memory in which they can reside:

Matrix Type | Memory  
---|---  
`A` | Tensor Memory OR Shared Memory  
`B` | Shared Memory  
`D` | Tensor Memory  
`Sparse Meta Data`  
`A-Scale` / `B-Scale`

A sequence of MMA instructions may reuse the same `A` matrix with a sequence of `B` matrices or may reuse the same `B` matrix with a sequence of `A` matrices. In these patterns the TensorCore may be able to laod the unchanged matrix once and reuse it through the sequence without multiple reloads. The `A` or `B` matrices are loaded into a TensorCore collector buffer (i.e., special cache).

An MMA instruction has an optional `collector` qualifier to specify when an `A` or `B` matrix is new to the sequence and should be loaded, unchanged within the sequence and should be reused, or the last use in the sequence and should be discarded. The `collector` qualifier is used to give the TensorCore permission to reuse a previously loaded `A` or `B` matrix; however reuse is opportunistic in that the TensorCore may reload a matrix even when it has permission to reuse that matrix. Thus, the source memory of an `A` or `B` matrix must not be modified while the MMA instruction using those matrices has not completed - regardless of `collector` qualifier permissions.

The 5th generation of TensorCore MMAs can be used for general matrix multiplication OR for convolution operations. In case of convolutions, the activations can be stored in either matrix `A` or matrix `B` while the weights will be stored in the other matrix.

Activation Matrix | Weights Matrix | Name of the op | Instruction Name | Collector Buffer Applicability  
---|---|---|---|---  
`A` | `B` | Activation Stationary | (default `tcgen05.mma`) | Collector buffer is applicable on matrix `A`  
`B` | `A` | Weights Stationary | `.ws` | Collector buffer is applicable on matrix `B`

#####  9.7.16.10.1. [Transpose and Negate operations](<#tcgen05-transpose-and-negate-operations>)  
  
The matrices `A` and `B` can be transposed by specifying the Tranpose `A` Matrix and Transpose `B` Matrix bits in the instruction descriptor respectively.

The elements of the matrices `A` and `B` can be negated by specifying the Negate `A` Matrix and Negate `B` Matrix bits in the instruction descriptor respectively.

The support for Transpose and Negate operation for various MMA-Kind are shown in [Table 51](<#tcgen05-transpose-negate-mma-kind>).

Table 51 Transpose and Negate operation for various MMA-Kind MMA-Kind | Is Transpose A/B supported | Is Negate A/B supported  
---|---|---  
`.kind::tf32` | Yes | Yes  
`.kind::f16` | Yes | Yes  
`.kind::f8f6f4` | Yes | Yes  
`.kind::mxf8f6f4` | Yes | Yes  
`.kind::i8` | Yes | No  
`.kind::mxf4` | No | Yes  
`.kind::mxf4nvf4` | No | Yes  
  
For `.kind::tf32`, the transpose operations on matrices `A` and `B` are supported only with 128B swizzling mode with 32B swizzle-atomicity.

For all other MMA-Kinds, the transpose operations on matrices `A` and `B` are not supported on 128B swizzling mode with 32B swizzle-atomicity.

[Table 52](<#tcgen05-kind-shapes-8b-transpose-b>) shows the valid combinations of N shape with `.cta_group` qualifier for 8bit transpose B.

Table 52 Various combinations of N shape with .cta_group qualifier for 8bit transpose B .cta_group | N shape  
---|---  
1 | 16 <= N <= 256, step 16  
2 | 32 <= N <= 256, step 32

#####  9.7.16.10.2. [Matrix Layout Organization](<#tcgen05-matrix-layout-organization>)  
  
[Table 53](<#tcgen05-matrices-majorness>) describes the major-ness used for different matrices.

Table 53 Major-ness for different matrices Matrix | Residing in Memory | Default Major-ness  
---|---|---  
D | Tensor Memory | Row-Major  
A | Tensor Memory  
Shared Memory | Depends on swizzling mode. Refer [Shared Memory Layout and Swizzling](<#tcgen05-shared-memory-layout-swizzling>)  
B | Shared Memory

#####  9.7.16.10.3. [Valid Combinations of Type-Size, Major-ness and Swizzling](<#tcgen05-matrix-layout-organization-valid-comb-type-size-majorness-swizzle>)  
  
Table 54 Valid Combinations of Type-Size, Major-ness and Swizzling Type-Size | Major-ness | Matrix | Supported Swizzle  
---|---|---|---  
4-bit, 6-bit, 8-bit, 16-bit, 32-bit | Row | A | All swizzling modes  
Column | B  
8-bit 16-bit | Column (transpose) | A | All except 128B swizzling with 32B atomicity  
Row (transpose) | B  
32-bit | Column (transpose) | A | Only 128B swizzling with 32B atomicity  
Row (transpose) | B

#####  9.7.16.10.4. [Packing formats of elements in Tensor and Shared memory](<#tcgen05-packing-formats>)  
  
######  9.7.16.10.4.1. [Packing format for matrix D in Tensor Memory](<#tcgen05-packing-formats-mat-d>)

The sub-word elements of matrix `D` are expected not to be packed within a 32-bit Tensor Memory word. For example, if the type of elements of the matrix `D` is 16 bits then a Tensor Memory word would contain a single 16-bit element in its lower 16 bits.

######  9.7.16.10.4.2. [Packing format for matrix A and B](<#tcgen05-packing-formats-mat-a-b>)

The 6-bit and 4-bit floating point types have different packing format requirements for different MMA kinds in both Tensor memory and Shared memory. The requirements are as follows.

######  9.7.16.10.4.3. [Packing format used for matrix A by `.kind::mxf8f6f4` in Tensor Memory](<#tcgen05-packing-formats-mxf8f6f4-tmem>)

The individual 4-bit and the 6-bit floating point type elements must be packed in an 8-bit container in Tensor memory as shown below. The 8-bit containers must be contiguously packed in a 32-bit Tensor Memory word. For example, if the type of elements of the matrix `A` is 6 bits then 4 consecutive `A` elements should be packed in one 32-bit Tensor Memory word.

  * 4-bit packing format as shown in [Figure 199](<#tcgen05-packing-formats-mxf8f6f4-tmem-dig1>)

![_images/tcgen05-packing-formats-mxf8f6f4-tmem-dig1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-packing-formats-mxf8f6f4-tmem-dig1.png)

Figure 199 4-bit packing format with type E2M1

  * 6-bit packing format

    * Type E3M2 as shown in [Figure 200](<#tcgen05-packing-formats-mxf8f6f4-tmem-dig2>)

![_images/tcgen05-packing-formats-mxf8f6f4-tmem-dig2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-packing-formats-mxf8f6f4-tmem-dig2.png)

Figure 200 6-bit packing format with type E3M2

    * Type E2M3 as shown in [Figure 201](<#tcgen05-packing-formats-mxf8f6f4-tmem-dig3>)

![_images/tcgen05-packing-formats-mxf8f6f4-tmem-dig3.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-packing-formats-mxf8f6f4-tmem-dig3.png)

Figure 201 6-bit packing format with type E2M3


######  9.7.16.10.4.4. [Packing format used for matrix A and B by `.kind::mxf8f6f4` in Shared Memory](<#tcgen05-packing-formats-mxf8f6f4-smem>)

The 4-bit and 6-bit floating point elements in shared memory must be contiguously packed along with padding as follows.

  * 4-bit packing format as shown in [Figure 202](<#tcgen05-packing-formats-mxf8f6f4-smem-dig1>)

![_images/tcgen05-packing-formats-mxf8f6f4-smem-dig1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-packing-formats-mxf8f6f4-smem-dig1.png)

Figure 202 4-bit packing format

  * 6-bit packing format as shown in [Figure 203](<#tcgen05-packing-formats-mxf8f6f4-smem-dig2>)


> ![_images/tcgen05-packing-formats-mxf8f6f4-smem-dig2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-packing-formats-mxf8f6f4-smem-dig2.png)
> 
> Figure 203 6-bit packing format

######  9.7.16.10.4.5. [Packing format used for matrix A by `.kind::mxf4` and `.kind::mxf4nvf4` in Tensor Memory](<#tcgen05-packing-formats-mxf4-tmem>)

Two 4-bit floating point type elements must be packed in an 8-bit container in Tensor memory as shown in [Figure 204](<#tcgen05-packing-formats-mxf4-tmem-dig1>) for `mxf4`.

![_images/tcgen05-packing-formats-mxf4-tmem-dig1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-packing-formats-mxf4-tmem-dig1.png)

Figure 204 4-bit packing format with type E2M1

######  9.7.16.10.4.6. [Packing format used for matrix A and B by `.kind::mxf4` and `.kind::mxf4nvf4` in Shared Memory](<#tcgen05-packing-formats-mxf4-smem>)

The packing format for 4-bit floating point elements in shared memory is to pack two 4-bit elements in a 8-bit container, with no padding.

#####  9.7.16.10.5. [Data Path Layout Organization](<#tcgen05-data-path-layout-organization>)

Different MMA variants access the tensor memory with different layout organization. The following table lists the various layouts:

M | cta_group | A-Sparsity | Is .ws mode | Datapath organization | Layout ID | Tensor Memory Datapath Lane Alignment  
---|---|---|---|---|---|---  
32 | ::1 | Either | Yes | 1x4 | [Layout G](<#tcgen05-data-path-layout-g>) | 0  
64 | ::1 | Either | Yes | 2x3 | [Layout E](<#tcgen05-data-path-layout-e>) | 0  
64 | ::1 | Either | No | 4x1 (1/2 datapath utilized) | [Layout F](<#tcgen05-data-path-layout-f>) | 0 or 16  
128 | ::1 | Either | Either | 4x1 | [Layout D](<#tcgen05-data-path-layout-d>) | 0  
128 | ::2 | Dense | N/A | 2x2 | [Layout B](<#tcgen05-data-path-layout-b>) | 0  
128 | ::2 | Sparse | N/A | 4x1 (1/2 datapath utilized) | [Layout C](<#tcgen05-data-path-layout-c>) | 0 or 16  
256 | ::2 | Either | N/A | 4x1 | [Layout A](<#tcgen05-data-path-layout-a>) | 0  
  
The layouts which utilize only half the datapath lanes, i.e., [Layout F](<#tcgen05-data-path-layout-f>) and [Layout C](<#tcgen05-data-path-layout-c>), must use the same Tensor Memory lane alignment across matrices `A`, `D` and the sparsity metadata matrix.

The following shows the warps that can access the Tensor Memory regions via `tcgen05.ld` / `tcgen05.st` along with the addresses for various Tensor Memory Layouts.

######  9.7.16.10.5.1. [Layout A (M = 256)](<#tcgen05-data-path-layout-a>)

Layout organization for M = 256 is shown in [Figure 205](<#tcgen05-data-path-layout-a1>).

![_images/tcgen05-data-path-layout-a1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-a1.png)

Figure 205 Layout organization for M = 256

Addresses for the above region to be used in `tcgen05.ld` / `tcgen05.st` is shown in [Figure 206](<#tcgen05-data-path-layout-a2>)

![_images/tcgen05-data-path-layout-a2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-a2.png)

Figure 206 Addresses to use in `tcgen05.ld` / `tcgen05.st`

######  9.7.16.10.5.2. [Layout B (M = 128 + cta-group::2 + Dense A matrix)](<#tcgen05-data-path-layout-b>)

Layout organization for M = 128 + .cta_group::2 + Dense A matrix is shown in [Figure 207](<#tcgen05-data-path-layout-b1>).

![_images/tcgen05-data-path-layout-b1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-b1.png)

Figure 207 Layout organization for M = 128 + .cta_group::2 + Dense A matrix

Addresses for the above region to be used in `tcgen05.ld` / `tcgen05.st` is shown in [Figure 208](<#tcgen05-data-path-layout-b2>)

![_images/tcgen05-data-path-layout-b2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-b2.png)

Figure 208 Addresses to use in `tcgen05.ld` / `tcgen05.st`

######  9.7.16.10.5.3. [Layout C (M = 128 + cta-group::2 + Sparse A matrix)](<#tcgen05-data-path-layout-c>)

Layout organization for M = 128 + .cta_group::2 + Sparse A matrix is shown in [Figure 209](<#tcgen05-data-path-layout-c1>).

![_images/tcgen05-data-path-layout-c1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-c1.png)

Figure 209 Layout organization for M = 128 + .cta_group::2 + Sparse A matrix

Addresses for the above region to be used in `tcgen05.ld` / `tcgen05.st` is shown in [Figure 210](<#tcgen05-data-path-layout-c2>)

![_images/tcgen05-data-path-layout-c2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-c2.png)

Figure 210 Addresses to use in `tcgen05.ld` / `tcgen05.st`

######  9.7.16.10.5.4. [Layout D (M = 128 + cta-group::1)](<#tcgen05-data-path-layout-d>)

Layout organization for M = 128 + .cta_group::1 is shown in [Figure 211](<#tcgen05-data-path-layout-d1>).

![_images/tcgen05-data-path-layout-d1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-d1.png)

Figure 211 Layout organization for M = 128 + .cta_group::1

Addresses for the above region to be used in `tcgen05.ld` / `tcgen05.st` is shown in [Figure 212](<#tcgen05-data-path-layout-d2>)

![_images/tcgen05-data-path-layout-d2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-d2.png)

Figure 212 Addresses to use in `tcgen05.ld` / `tcgen05.st`

######  9.7.16.10.5.5. [Layout E (M = 64 + .ws mode)](<#tcgen05-data-path-layout-e>)

Layout organization for M = 64 + .ws mode is shown in [Figure 213](<#tcgen05-data-path-layout-e1>).

![_images/tcgen05-data-path-layout-e1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-e1.png)

Figure 213 Layout organization for M = 64 + .ws mode

Addresses for the above region to be used in `tcgen05.ld` / `tcgen05.st` is shown in [Figure 214](<#tcgen05-data-path-layout-e2>)

![_images/tcgen05-data-path-layout-e2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-e2.png)

Figure 214 Addresses to use in `tcgen05.ld` / `tcgen05.st`

######  9.7.16.10.5.6. [Layout F (M = 64 + non .ws mode)](<#tcgen05-data-path-layout-f>)

Layout organization for M = 64 + non .ws mode is shown in [Figure 215](<#tcgen05-data-path-layout-f1>).

![_images/tcgen05-data-path-layout-f1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-f1.png)

Figure 215 Layout organization for M = 64 + non .ws mode

Addresses for the above region to be used in `tcgen05.ld` / `tcgen05.st` is shown in [Figure 216](<#tcgen05-data-path-layout-f2>)

![_images/tcgen05-data-path-layout-f2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-f2.png)

Figure 216 Addresses to use in `tcgen05.ld` / `tcgen05.st`

######  9.7.16.10.5.7. [Layout G (M = 32)](<#tcgen05-data-path-layout-g>)

Layout organization for M = 32 is shown in [Figure 217](<#tcgen05-data-path-layout-g1>).

![_images/tcgen05-data-path-layout-g1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-g1.png)

Figure 217 Layout organization for M = 32

Addresses for the above region to be used in `tcgen05.ld` / `tcgen05.st` is shown in [Figure 218](<#tcgen05-data-path-layout-g2>)

![_images/tcgen05-data-path-layout-g2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-data-path-layout-g2.png)

Figure 218 Addresses to use in `tcgen05.ld` / `tcgen05.st`

#####  9.7.16.10.6. [Shared Memory Layout and Swizzling](<#tcgen05-shared-memory-layout-swizzling>)

If the bit `Transpose A Matrix` / `Transpose B Matrix` in the [Instruction descriptor](<#tcgen05-instruction-descriptor>) is 0, then _K-major_ is used for matrix `A` / `B` respectively. If the bit `Transpose A Matrix` in the [Instruction descriptor](<#tcgen05-instruction-descriptor>) is 1 then _M-major_ is used for matrix `A`. If the bit `Transpose B Matrix` in the [Instruction descriptor](<#tcgen05-instruction-descriptor>) is 1, then _N-major_ is used for matrix `B`.

In a column-major default BLAS library such as cuBLAS, the matrices `A` and `B` with and without transpose can be classified as either _K-Major_ or _M-or-N-Major_ as shown in the following table:

| Non-Transposed | Transposed  
---|---|---  
A | K-major | M-major  
B | K-major | N-major  
  
To avoid confusion with `A`, `B`, `row-major`, `col-major`, `transpose`, and `non-transpose`, we will use _MN-Major_ and _K-Major_ throughout this section.

The matrices in the shared memory are made up of one or more “swizzle layout atom”. The exact layout of these swizzle atoms depends on the swizzling mode, swizzle-atomicity, and the leading dimension. The layout of the swizzle are shown in [Table 55](<#tcgen05-smem-swizzle-mode>)

Table 55 Layout for swizzle atoms Swizzling mode and Swizzle-Atomicity | Leading Dimension | Swizzle atom layout (128b element)  
---|---|---  
128B Swizzling with 32B atomicity | M/N | 8x4  
– | –  
128B Swizzling with 16B atomicity | M/N | 8x8  
K | 8x8  
64B Swizzling Mode | M/N | 4x8  
K | 8x4  
32B Swizzling Mode | M/N | 2x8  
K | 8x2  
None | M/N | 1x8  
K | 8x1  
  
The above shapes are for elements of size 128 bits. For smaller element sizes, the same shapes would get multiplied along the leading dimension by a factor of `128 / sizeof_bits(Element)`. For example, 128B MN major swizzle atom would have a shape of (8*(128/32))x8 = 32x8 for tf32 tensor core inputs.

Some example Layouts of _MxK_ or _KxN_ matrices with various swizzling modes, and are in units of 128b elements as shown by each colored cell as shown in [Figure 219](<#tcgen05-smem-layout-128b-32b-atom-mn>), [Figure 220](<#tcgen05-smem-layout-128b-mn>), [Figure 221](<#tcgen05-smem-layout-128b-k>), [Figure 222](<#tcgen05-smem-layout-64b-mn>), [Figure 223](<#tcgen05-smem-layout-64b-k>), [Figure 224](<#tcgen05-smem-layout-32b-mn>), [Figure 225](<#tcgen05-smem-layout-32b-k>), [Figure 226](<#tcgen05-smem-layout-no-swizzle-mn>), [Figure 227](<#tcgen05-smem-layout-no-swizzle-k>).

![_images/tcgen05-smem-layout-128B-32B-atom-mn.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-smem-layout-128B-32B-atom-mn.png)

Figure 219 MN major 128B swizzling with 32B atomicity

![_images/tcgen05-smem-layout-128B-mn.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-smem-layout-128B-mn.png)

Figure 220 MN major 128B swizzling

![_images/tcgen05-smem-layout-128B-k.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-smem-layout-128B-k.png)

Figure 221 K major 128B swizzling

![_images/tcgen05-smem-layout-64B-mn.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-smem-layout-64B-mn.png)

Figure 222 MN major 64B swizzling

![_images/tcgen05-smem-layout-64B-k.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-smem-layout-64B-k.png)

Figure 223 K major 64B swizzling

![_images/tcgen05-smem-layout-32B-mn.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-smem-layout-32B-mn.png)

Figure 224 MN major 32B swizzling

![_images/tcgen05-smem-layout-32B-k.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-smem-layout-32B-k.png)

Figure 225 K major 32B swizzling

![_images/tcgen05-smem-layout-no-swizzle-mn.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-smem-layout-no-swizzle-mn.png)

Figure 226 MN major no-swizzling mode

![_images/tcgen05-smem-layout-no-swizzle-k.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-smem-layout-no-swizzle-k.png)

Figure 227 K major no-swizzling mode

Following are some of the examples of the 128B swizzling layout for `tf32` element type.

  * K-Major: [Figure 228](<#tcgen05-smem-layout-k>)

> ![_images/tcgen05-smem-layout-k.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-smem-layout-k.png)
> 
> Figure 228 K major

  * MN-Major: [Figure 229](<#tcgen05-smem-layout-mn>)

> ![_images/tcgen05-smem-layout-mn.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-smem-layout-mn.png)
> 
> Figure 229 MN major

#####  9.7.16.10.7. [Block Scaling for `tcgen05.mma.sync`](<#tcgen05-block-scaling>)

The `tcgen05.mma` instructions with the following `.kind` qualifier:

  * `.kind::mxf8f6f4`

  * `.kind::mxf4`

  * `.kind::mxf4nvf4`


perform matrix multiplication with block scaling. This operation has the following form:

`(A * scale_A) * (B * scale_B) + D`

where `scale_A` and `scale_B` are matrices residing in [Tensor Memory](<#tensor-memory>).

For a `scale_A` matrix of shape _M x SFA_N_ , each row of matrix `A` is divided into _SFA_N_ number of chunks and each chunk of a row is multiplied with the corresponding element in the _SF_A_ of the same row.

Similarly, for a `scale_B` matrix of shape _SFB_M x N_ , each column of matrix `B` is divided into the _SFB_M_ number of chunks and each chunk of a column is multiplied with the corresponding element in the _SF_B_ of the same column.

Scale factors for `A` and `B` matrices need to be duplicated to all 32 lane partitions of tensor memory.

[Figure 230](<#tcgen05-mma-block-scaling>) shows an example of `tcgen05.mma` with block scaling of `scale_vec::2X`.

![_images/tcgen05-mma-block-scaling.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-block-scaling.png)

Figure 230 `tcgen05.mma` with block scaling of `scale_vec::2X`

######  9.7.16.10.7.1. [Valid combinations of scale_vectorsize with types and MMA-Kind](<#tcgen05-mma-scale-valid-vec-size>)

The shape of _scale_A_ and _scale_B_ matrices depend on the `.scale_vectorsize` as shown in [Table 56](<#tcgen05-mma-scale-valid-comb>).

Table 56 Valid combinations of scale_vectorsize and shapes .scale_vectorsize | .kind::* | K | Shape of scale_A | Shape of scale_B  
---|---|---|---|---  
`.scale_vec::1X` | `.kind::mxf8f6f4` | All supported values of K | M x 1 | 1 x N  
`.scale_vec::2X` | `.kind::mxf4`, `.kind::mxf4nvf4` | All supported values of K | M x 2 | 2 x N  
`.scale_vec::4X` | `.kind::mxf4nvf4` | All supported values of K | M x 4 | 4 x N  
`.block16` | `.kind::mxf4nvf4` | K = 96 | M x 6 | 6 x N  
All supported values of K except 96 | M x 4 | 4 x N  
`.block32` | `.kind::mxf4`, `.kind::mxf4nvf4` | K = 96 | M x 3 | 3 x N  
All supported values of K except 96 | M x 2 | 2 x N  
`.kind::mxf8f6f4` | All supported values of K | M x 1 | 1 x N  
  
The valid combination of the exact element types and the `.scale_vectorsize` are listed in [Table 57](<#tcgen05-mma-scale-valid-comb-detail>).

Table 57 Valid combinations of scale_vectorsize with types and MMA-Kind .kind::* | Element Data Type | Scale Data Type | .scale_vectorsize  
---|---|---|---  
`.kind::mxf8f6f4` | E4M3, E5M2, E2M3 E3M2, E2M1 | UE8M0 | `.scale_vec::1X` / `.block32`  
`.kind::mxf4` | E2M1 | UE8M0 | `.scale_vec::2X` / `.block32`  
`.kind::mxf4nvf4` | E2M1 | UE8M0 | `.scale_vec::2X` / `.block32`, `.scale_vec::4X` / `.block16`  
E2M1 | UE4M3 | `.scale_vec::4X` / `.block16`  
  
New `.blockN` qualifiers are aliases for `.scale_vec::NX` qualifiers as:

  * `.block32` is alias for `.scale_vec::1X` or `.scale_vec::2X` based on `.kind` and K dimension

  * `.block16` is alias for `.scale_vec::4X`


######  9.7.16.10.7.2. [Scale Factor A ID](<#tcgen05-mma-scale-factor-a>)

The value of the scale factor `A ID` selects the sub-columns in the Tensor Memory to form the scale factor `A` matrix, which is used to scale the matrix `A`.

The following shows the scale factor matrix layout for various scale vector sizes:

####### 9.7.16.10.7.2.1. [Layout of the Scale Factor A Matrix for scale_vec::1X/block32 with K=32/K=64](<#tcgen05-mma-scale-factor-a-layout-1x>)

There is one scale factor per row of the `A` matrix with block size as 32 and the scale factor must be provided in 1-byte aligned sub-column of the Tensor Memory. _SFA_ID_ specifies the byte offset in the Tensor Memory word that must be used for the scale factor matrix. [Figure 231](<#tcgen05-mma-scale-factor-a-1x-dig>) shows which sub-columns get selected for different values of _SFA_ID_.

![_images/tcgen05-mma-scale-factor-a-1x-dig.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-a-1x-dig.png)

Figure 231 Layout of scale factor A matrix with scale_vec::1X/block32 with K=32/K=64

For example, if _SFA_ID_ is 0, then all the green columns are selected to form the scale factor matrix. Similarly, _SFA_ID_ values of 1, 2 and 3 would select the blue, yellow, and red columns, respectively.

####### 9.7.16.10.7.2.2. [Layout of the Scale Factor A Matrix for scale_vec::2X/block32 with K=64/K=128](<#tcgen05-mma-scale-factor-a-layout-2x>)

There are two scale factors per row of the `A` matrix with block size as 32 and the scale factor must be provided in 2-byte aligned sub-column of the Tensor Memory. _SFA_ID_ specifies the half word offset in the Tensor Memory word that must be used for the scale factor matrix. [Figure 232](<#tcgen05-mma-scale-factor-a-2x-dig>) shows which sub-columns gets selected for different values of _SFA_ID_.

![_images/tcgen05-mma-scale-factor-a-2x-dig.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-a-2x-dig.png)

Figure 232 Layout of scale factor A matrix with scale_vec::2X/block32 with K=64/K=128

For example, if _SFA_ID_ is 0, then all the green columns are selected to form the scale factor matrix. Similarly, if _SFA_ID_ is 2, then all of the blue columns are selected to form the scale factor matrix.

####### 9.7.16.10.7.2.3. [Layout of the Scale Factor A Matrix for scale_vec::4X/block16 with K=64/K=128](<#tcgen05-mma-scale-factor-a-layout-4x>)

There are four scale factors per row of the `A` matrix with block size as 16 and the scale factor must be provided in 4-byte aligned sub-column of the Tensor Memory. The _SFA_ID_ value must be 0 and this specifies that all of the columns (in green) will be used for the scale factor matrix. [Figure 233](<#tcgen05-mma-scale-factor-a-4x-dig>) shows which sub-columns gets selected for different values of _SFA_ID_.

![_images/tcgen05-mma-scale-factor-a-4x-dig.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-a-4x-dig.png)

Figure 233 Layout of scale factor A matrix with scale_vec::4X/block16 with K=64/K=128

####### 9.7.16.10.7.2.4. [Layout of the Scale Factor A Matrix for block32 with K=96 (Semantically equivalent to scale_vec::3X)](<#tcgen05-mma-scale-factor-a-layout-block32-k96>)

There are three scale factors per row of the `A` matrix with block size as 32 and the scale factor must be provided in 4-byte aligned sub-column of the Tensor Memory. _SFA_ID_ specifies the byte offset in the Tensor Memory word that must be used for the scale factor matrix. [Figure 234](<#tcgen05-mma-scale-factor-a-block32-k96-dig1>), [Figure 235](<#tcgen05-mma-scale-factor-a-block32-k96-dig2>), [Figure 236](<#tcgen05-mma-scale-factor-a-block32-k96-dig3>) and [Figure 237](<#tcgen05-mma-scale-factor-a-block32-k96-dig4>) show which sub-columns get selected for different values of _SFA_ID_.

![_images/tcgen05-mma-scale-factor-a-block32-k96-dig1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-a-block32-k96-dig1.png)

Figure 234 Layout of scale factor A matrix with block32 with K=96 with SFA_ID=00

![_images/tcgen05-mma-scale-factor-a-block32-k96-dig2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-a-block32-k96-dig2.png)

Figure 235 Layout of scale factor A matrix with block32 with K=96 with SFA_ID=01

![_images/tcgen05-mma-scale-factor-a-block32-k96-dig3.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-a-block32-k96-dig3.png)

Figure 236 Layout of scale factor A matrix with block32 with K=96 with SFA_ID=10

![_images/tcgen05-mma-scale-factor-a-block32-k96-dig4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-a-block32-k96-dig4.png)

Figure 237 Layout of scale factor A matrix with block32 with K=96 with SFA_ID=11

For example, if _SFA_ID_ is 0, then all the green columns are selected to form the scale factor matrix. Similarly, _SFA_ID_ values of 1, 2 and 3 would select the blue, yellow, and red columns, respectively.

####### 9.7.16.10.7.2.5. [Layout of the Scale Factor A Matrix for block16 with K=96 (Semantically equivalent to scale_vec::6X)](<#tcgen05-mma-scale-factor-a-layout-block16-k96>)

There are six scale factors per row of the `A` matrix with block size as 16 and the scale factor must be provided in 4-byte aligned sub-column of the Tensor Memory. _SFA_ID_ specifies the byte offset in the Tensor Memory word that must be used for the scale factor matrix. [Figure 238](<#tcgen05-mma-scale-factor-a-block16-k96-dig1>) and [Figure 239](<#tcgen05-mma-scale-factor-a-block16-k96-dig2>) show which sub-columns get selected for different values of _SFA_ID_.

![_images/tcgen05-mma-scale-factor-a-block16-k96-dig1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-a-block16-k96-dig1.png)

Figure 238 Layout of scale factor A matrix with block16 with K=96 with SFA_ID=00

![_images/tcgen05-mma-scale-factor-a-block16-k96-dig2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-a-block16-k96-dig2.png)

Figure 239 Layout of scale factor A matrix with block16 with K=96 with SFA_ID=10

For example, if _SFA_ID_ is 0, then all the green columns are selected to form the scale factor matrix. Similarly, if _SFA_ID_ is 2, then all of the blue columns are selected to form the scale factor matrix.

######  9.7.16.10.7.3. [Scale Factor B ID](<#tcgen05-mma-scale-factor-b>)

The value of the scale factor `B ID` selects the sub-columns in the Tensor Memory to form the scale factor `B` matrix, which is used to scale the matrix `B`.

The following shows the scale factor matrix layout for various scale vector sizes:

####### 9.7.16.10.7.3.1. [Layout of the Scale Factor B Matrix for scale_vec::1X/block32 with K=32/K=64](<#tcgen05-mma-scale-factor-b-layout-1x>)

There is one scale factor per row of the `B` matrix with block size as 32 and the scale factor must be provided in 1-byte aligned sub-column of the Tensor Memory. _SFB_ID_ specifies the byte offset in the Tensor Memory word that must be used for the scale factor matrix. [Figure 240](<#tcgen05-mma-scale-factor-b-1x-dig>) shows which sub-columns get selected for different values of _SFB_ID_.

![_images/tcgen05-mma-scale-factor-b-1x-dig.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-1x-dig.png)

Figure 240 Layout of scale factor B matrix with scale_vec::1X/block32 with K=32/K=64

For example, if _SFB_ID_ is 0, then all the green columns are selected to form the scale factor matrix. Similarly, _SFB_ID_ values of 1, 2 and 3 would select the blue, yellow, and red columns, respectively.

####### 9.7.16.10.7.3.2. [Layout of the Scale Factor B Matrix for scale_vec::2X/block32 with K=64/K=128](<#tcgen05-mma-scale-factor-b-layout-2x>)

There are two scale factors per row of the `B` matrix with block size as 32 and the scale factor must be provided in 2-byte aligned sub-column of the Tensor Memory. _SFB_ID_ specifies the half word offset in the Tensor Memory word that must be used for the scale factor matrix. [Figure 241](<#tcgen05-mma-scale-factor-b-2x-dig>) shows which sub-columns get selected for different values of _SFB_ID_.

![_images/tcgen05-mma-scale-factor-b-2x-dig.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-2x-dig.png)

Figure 241 Layout of scale factor B matrix with scale_vec::2X/block32 with K=64/K=128

For example, if _SFB_ID_ is 0, then all the green columns are selected to form the scale factor matrix. Similarly, if _SFB_ID_ is 2, then all of the blue columns are selected to form the scale factor matrix.

####### 9.7.16.10.7.3.3. [Layout of the Scale Factor B Matrix for scale_vec::4X/block16 with K=64/K=128](<#tcgen05-mma-scale-factor-b-layout-4x>)

There are four scale factors per row of the `B` matrix with block size as 16 and the scale factor must be provided in 4-byte aligned sub-column of the Tensor Memory. The _SFB_ID_ value must be 0 and this specifies that all of the columns (in green) will be used for the scale factor matrix. [Figure 242](<#tcgen05-mma-scale-factor-b-4x-dig>) shows which sub-columns get selected for different values of _SFB_ID_.

![_images/tcgen05-mma-scale-factor-b-4x-dig.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-4x-dig.png)

Figure 242 Layout of scale factor B matrix with scale_vec::4X/block16 with K=64/K=128

####### 9.7.16.10.7.3.4. [Layout of the Scale Factor B Matrix for block32 with K=96 (Semantically equivalent to scale_vec::3X)](<#tcgen05-mma-scale-factor-b-layout-block32-k96>)

There are three scale factors per row of the `B` matrix with block size as 32 and the scale factor must be provided in 4-byte aligned sub-column of the Tensor Memory. _SFB_ID_ specifies the byte offset in the Tensor Memory word that must be used for the scale factor matrix.

For N<=128, [Figure 243](<#tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig1>), [Figure 244](<#tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig2>), [Figure 245](<#tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig3>) and [Figure 246](<#tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig4>) show which sub-columns get selected for different values of _SFB_ID_.

![_images/tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig1.png)

Figure 243 Layout of scale factor B matrix with block32 with K=96 and N<=128 with SFA_ID=00

![_images/tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig2.png)

Figure 244 Layout of scale factor B matrix with block32 with K=96 and N<=128 with SFA_ID=01

![_images/tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig3.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig3.png)

Figure 245 Layout of scale factor B matrix with block32 with K=96 and N<=128 with SFA_ID=10

![_images/tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block32-k96-nlt128-dig4.png)

Figure 246 Layout of scale factor B matrix with block32 with K=96 and N<=128 with SFA_ID=11

For N>128, [Figure 247](<#tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig1>), [Figure 248](<#tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig2>), [Figure 249](<#tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig3>), [Figure 250](<#tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig4>), [Figure 251](<#tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig5>) and [Figure 252](<#tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig6>) show which sub-columns get selected for different values of _SFB_ID_.

![_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig1.png)

Figure 247 Layout of scale factor B matrix with block32 with K=96 and N>128 with SFA_ID=00

![_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig2.png)

Figure 248 Layout of scale factor B matrix with block32 with K=96 and N>128 with SFA_ID=01

![_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig3.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig3.png)

Figure 249 Layout of scale factor B matrix with block32 with K=96 and N>128 with SFA_ID=10

![_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig4.png)

Figure 250 Layout of scale factor B matrix with block32 with K=96 and N>128 with SFA_ID=10

![_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig5.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig5.png)

Figure 251 Layout of scale factor B matrix with block32 with K=96 and N>128 with SFA_ID=11

![_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig6.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block32-k96-ngt128-dig6.png)

Figure 252 Layout of scale factor B matrix with block32 with K=96 and N>128 with SFA_ID=11

For example, if _SFB_ID_ is 0, then all the green columns are selected to form the scale factor matrix. Similarly, _SFB_ID_ values of 1, 2 and 3 would select the blue, yellow, and red columns, respectively.

####### 9.7.16.10.7.3.5. [Layout of the Scale Factor B Matrix for block16 with K=96 (Semantically equivalent to scale_vec::6X)](<#tcgen05-mma-scale-factor-b-layout-block16-k96>)

There are six scale factors per row of the `B` matrix with block size as 16 and the scale factor must be provided in 4-byte aligned sub-column of the Tensor Memory. _SFB_ID_ specifies the byte offset in the Tensor Memory word that must be used for the scale factor matrix.

For N<=128, [Figure 253](<#tcgen05-mma-scale-factor-b-block16-k96-nlt128-dig1>) and [Figure 254](<#tcgen05-mma-scale-factor-b-block16-k96-nlt128-dig2>) show which sub-columns get selected for different values of _SFB_ID_.

![_images/tcgen05-mma-scale-factor-b-block16-k96-nlt128-dig1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block16-k96-nlt128-dig1.png)

Figure 253 Layout of scale factor B matrix with block16 with K=96 and N<=128 with SFA_ID=00

![_images/tcgen05-mma-scale-factor-b-block16-k96-nlt128-dig2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block16-k96-nlt128-dig2.png)

Figure 254 Layout of scale factor B matrix with block16 with K=96 and N<=128 with SFA_ID=10

For N>128, [Figure 255](<#tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig1>), [Figure 256](<#tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig2>), [Figure 257](<#tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig3>) and [Figure 258](<#tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig4>) show which sub-columns get selected for different values of _SFB_ID_.

![_images/tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig1.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig1.png)

Figure 255 Layout of scale factor B matrix with block16 with K=96 and N>128 with SFA_ID=00

![_images/tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig2.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig2.png)

Figure 256 Layout of scale factor B matrix with block16 with K=96 and N>128 with SFA_ID=00

![_images/tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig3.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig3.png)

Figure 257 Layout of scale factor B matrix with block16 with K=96 and N>128 with SFA_ID=10

![_images/tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-mma-scale-factor-b-block16-k96-ngt128-dig4.png)

Figure 258 Layout of scale factor B matrix with block16 with K=96 and N>128 with SFA_ID=10

For example, if _SFB_ID_ is 0, then all the green columns are selected to form the scale factor matrix. Similarly, if _SFB_ID_ is 2, then all of the blue columns are selected to form the scale factor matrix.

#####  9.7.16.10.8. [Sparse Matrices](<#tcgen05-sparse-matrices>)

This instruction `tcgen05.mma.sp` can be used when the matrix `A` is a structured sparse matrix with 50% zeros in each row distributed as per its sparse granularity.

In a _MxNxK_ sparse `tcgen05.mma.sp` operation, the matrix `A` of shape _MxK_ is stored in a packed form as _Mx(K/2)_ in memory. For each _K-wide_ row of matrix `A`, 50% of elements are zeros and the remaining _K/2_ non-zero elements are stored in memory. The metadata specifies the mapping of the _K/2_ non-zero elements to the _K_ elements before performing the MMA operation.

Granularity of sparse matrix `A` is defined as the ratio of the number of non-zero elements in a sub-chunk of the matrix row to the total number of elements in that sub-chunk where the size of the sub-chunk is shape-specific. The following table lists the granularity of different `tcgen05.mma.sp` variants:

.kind of tcgen05.mma | Sparse Granularity  
---|---  
`.kind::tf32` | 1:2  
`.kind::f16` | 2:4  
`.kind::f8f6f4`  
`.kind::mxf8f6f4`  
`.kind::i8`  
`.kind::mxf4` | 4:8 (in pairs)  
  
######  9.7.16.10.8.1. [Sparse `tcgen05.mma.sp` with `.kind::tf32`](<#tcgen05-sparse-matrices-kind-tf32>)

For `.kind::tf32`, matrix `A` is structured sparse at a granularity of `1:2`. In other words, each chunk of two adjacent elements in a row of matrix `A` has one zero and one non-zero element. Only the non-zero element is stored in memory and the 4-bit index in the metadata indicates the position of the non-zero element in the two-wide chunk. The only meaningful values of the index are:

  * `0b1110`

  * `0b0100`


Rest of the values result in undefined behavior.

![_images/tcgen05-sparse-mma-metadata-tf32.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-sparse-mma-metadata-tf32.png)

Figure 259 Sparse tcgen05.mma metadata example for tf32 kind

######  9.7.16.10.8.2. [Sparse `tcgen05.mma.sp` with `.kind::f16`, `.kind::f8f6f4`, `.kind::mxf8f6f4`, `.kind::i8`](<#tcgen05-sparse-matrices-kind-f16-f8f8f4-mxf8f6f4>)

For the following `.kind` variants of `tcgen05.mma`:

  * `.kind::f16`

  * `.kind::f8f8f4`

  * `.kind::mxf8f6f4`

  * `.kind::i8`


matrix `A` is structured sparse at a granularity of `2:4`. In other words, each chunk of four adjacent elements in a row of matrix `A` has two zero and two non-zero elements. Only the non-zero elements are stored in memory and the two 2-bit indices in the metadata indicates the position of the two non-zero elements in the four-wide chunk. The only meaningful values of the index are:

  * `0b0100`

  * `0b1000`

  * `0b1100`

  * `0b1001`

  * `0b1101`

  * `0b0110`

  * `0b1110`


![_images/tcgen05-sparse-mma-metadata-f16-f8f6f4-mxf8f6f4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-sparse-mma-metadata-f16-f8f6f4-mxf8f6f4.png)

Figure 260 Sparse tcgen05.mma metadata example for f16/f8f6f4/mxf8f6f4 kind

######  9.7.16.10.8.3. [Sparse `tcgen05.mma.sp` with `.kind::mxf4` and `.kind::mxf4nvf4`](<#tcgen05-sparse-matrices-kind-mxf4>)

For `.kind::mxf4` and `.kind::mxf4nvf4`, matrix `A` is pair-wise structured sparse at a granularity of `4:8`. In other words, each chunk of eight adjacent elements in a row of matrix `A` has four zero and four non-zero elements. The zero and non-zero elements are clustered in sub-chunks of two elements each within the eight-wide chunk, so each two-wide sub-chunk within the eight-wide chunk must be all zeros or all non-zeros. Only the four non-zero elements are stored in memory and the two 2-bit indices in the metadata indicates the position of the two two-wide sub-chunks with non-zero values in the eight-wide chunk of a row of matrix `A`. The only meaningful values of the index are:

  * `0b0100`

  * `0b1000`

  * `0b1100`

  * `0b1001`

  * `0b1101`

  * `0b0110`

  * `0b1110`


Rest of the values result in undefined behavior.

![_images/tcgen05-sparse-mma-metadata-mxf4.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-sparse-mma-metadata-mxf4.png)

Figure 261 Sparse tcgen05.mma metadata example for mxf4 kind

######  9.7.16.10.8.4. [Sparsity selector](<#tcgen05-sparse-matrices-sparsity-selector>)

The value of the sparsity selector selects the sub-columns in the Tensor Memory to form the sparsity metadata matrix, which is used with matrix `A` to form the multiplicand matrix.

The following shows the sparse metadata matrix layout in Tensor Memory for various MMA variants:

####### 9.7.16.10.8.4.1. [Layout of the Sparsity Metadata Matrix for M = 64 for `.kind::f16`](<#tcgen05-sparse-matrices-sparsity-selector-kind-f16-m64>)

[Figure 262](<#tcgen05-sparse-matrices-sparsity-selector-kind-f16-m64-dig>) shows which sub-columns gets selected for different values of Sparsity Selector.

![_images/tcgen05-sparse-matrices-sparsity-selector-kind-f16-m64.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-sparse-matrices-sparsity-selector-kind-f16-m64.png)

Figure 262 Sparsity Metadata Layout for M = 64 for `.kind::f16`

####### 9.7.16.10.8.4.2. [Layout of the Sparsity Metadata Matrix for M = 128 / M = 256 for `.kind::f16`](<#tcgen05-sparse-matrices-sparsity-selector-kind-f16-m128-256>)

[Figure 263](<#tcgen05-sparse-matrices-sparsity-selector-kind-f16-m128-256-dig>) shows which sub-columns gets selected for different values of Sparsity Selector.

![_images/tcgen05-sparse-matrices-sparsity-selector-kind-f16-m128-256.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-sparse-matrices-sparsity-selector-kind-f16-m128-256.png)

Figure 263 Sparsity Metadata Layout for M = 128 / M = 256 for `.kind::f16`

####### 9.7.16.10.8.4.3. [Layout of the Sparsity Metadata Matrix for M = 64 for `.kind::tf32`](<#tcgen05-sparse-matrices-sparsity-selector-kind-tf32-m64>)

[Figure 264](<#tcgen05-sparse-matrices-sparsity-selector-kind-tf32-m64-dig>) shows which sub-columns gets selected for different values of Sparsity Selector.

![_images/tcgen05-sparse-matrices-sparsity-selector-kind-tf32-m64.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-sparse-matrices-sparsity-selector-kind-tf32-m64.png)

Figure 264 Sparsity Metadata Layout for M = 64 for `.kind::tf32`

####### 9.7.16.10.8.4.4. [Layout of the Sparsity Metadata Matrix for M = 128 / M = 256 for `.kind::tf32`](<#tcgen05-sparse-matrices-sparsity-selector-kind-tf32-m128-256>)

[Figure 265](<#tcgen05-sparse-matrices-sparsity-selector-kind-tf32-m128-256-dig>) shows which sub-columns gets selected for different values of Sparsity Selector.

![_images/tcgen05-sparse-matrices-sparsity-selector-kind-tf32-m128-256.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-sparse-matrices-sparsity-selector-kind-tf32-m128-256.png)

Figure 265 Sparsity Metadata Layout for M = 128 / M = 256 for `.kind::tf32`

####### 9.7.16.10.8.4.5. [Layout of the Sparsity Metadata Matrix for M = 64 for `.kind::f8f6f4`, `.kind::mxf8f6f4`, `.kind::i8`, `.kind::mxf4`, `.kind::mxf4nvf4`](<#tcgen05-sparse-matrices-sparsity-selector-kind-f8f6f4-mxf8f6f4-m64>)

The value of the sparsity selector:

  * must be 0 for `.kind::i8` and `.kind::f8f6f4`

  * is assumed to be 0 for `.kind::mxf8f6f4`, `.kind::mxf4` and `.kind::mxf4nvf4`


and all of the columns are selected as shown in [Figure 266](<#tcgen05-sparse-matrices-sparsity-selector-kind-f8f6f4-mxf8f6f4-m64-dig>)

![_images/tcgen05-sparse-matrices-sparsity-selector-kind-f8f6f4-mxf8f6f4-m64.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-sparse-matrices-sparsity-selector-kind-f8f6f4-mxf8f6f4-m64.png)

Figure 266 Sparsity Metadata Layout for M = 64 for `.kind::f8f6f4`, `.kind::mxf8f6f4`, `.kind::i8`, `.kind::mxf4`, `.kind::mxf4nvf4`

####### 9.7.16.10.8.4.6. [Layout of the Sparsity Metadata Matrix for M = 128 / M = 256 for `.kind::f8f6f4`, `.kind::mxf8f6f4`, `.kind::i8`, `.kind::mxf4`, `.kind::mxf4nvf4`](<#tcgen05-sparse-matrices-sparsity-selector-kind-f8f6f4-mxf8f6f4-m128-256>)

The value of the sparsity selector:

  * must be 0 for `.kind::i8` and `.kind::f8f6f4`

  * is assumed to be 0 for `.kind::mxf8f6f4`, `.kind::mxf4` and `.kind::mxf4nvf4`


and all of the columns are selected as shown in [Figure 267](<#tcgen05-sparse-matrices-sparsity-selector-kind-f8f6f4-mxf8f6f4-m128-256-dig>)

![_images/tcgen05-sparse-matrices-sparsity-selector-kind-f8f6f4-mxf8f6f4-m128-256.png](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/tcgen05-sparse-matrices-sparsity-selector-kind-f8f6f4-mxf8f6f4-m128-256.png)

Figure 267 Sparsity Metadata Layout for M = 128 / M = 256 for `.kind::f8f6f4`, `.kind::mxf8f6f4`, `.kind::i8`, `.kind::mxf4`, `.kind::mxf4nvf4`

######  9.7.16.10.8.5. [Alignment restriction](<#tcgen05-sparse-matrices-alignment-restriction>)

The layouts which utilize only half the datapath lanes as specified in [Data Path Layout Organization](<#tcgen05-data-path-layout-organization>), i.e. [Layout F](<#tcgen05-data-path-layout-f>) and [Layout C](<#tcgen05-data-path-layout-c>), must use the same alignment across matrices A, D and the sparsity metadata matrix.

#####  9.7.16.10.9. [TensorCore 5th Generation of MMA Instructions](<#tcgen05-mma-instructions>)

######  9.7.16.10.9.1. [TensorCore 5th Generation Instructions: `tcgen05.mma`](<#tcgen05-mma-instructions-mma>)

`tcgen05.mma`

Perform the 5th generation of matrix multiply and accumulate operation.

Syntax
    
    
    // 1. Floating-point type without block scaling:
    
    tcgen05.mma.cta_group.kind   [d-tmem],  a-desc,  b-desc, idesc,
                                 { disable-output-lane }, enable-input-d {, scale-input-d};
    
    tcgen05.mma.cta_group.kind   [d-tmem], [a-tmem], b-desc, idesc,
                                 { disable-output-lane }, enable-input-d {, scale-input-d};
    
    .kind      = { .kind::f16, .kind::tf32, .kind::f8f6f4 }
    .cta_group = { .cta_group::1, .cta_group::2 }
    
    ----------------------------------------------------------------------------------
    
    // 2. Floating-point type with block scaling:
    
    tcgen05.mma.cta_group.kind.block_scale{.scale_vectorsize}
                                            [d-tmem],  a-desc,  b-desc, idesc,
                                            [scale-A-tmem], [scale-B-tmem], enable-input-d;
    
    tcgen05.mma.cta_group.kind.block_scale{.scale_vectorsize}
                                            [d-tmem], [a-tmem], b-desc, idesc,
                                            [scale-A-tmem], [scale-B-tmem], enable-input-d;
    
    .kind = { .kind::mxf8f6f4, .kind::mxf4, .kind::mxf4nvf4 }
    .cta_group      = { .cta_group::1,   .cta_group::2 }
    .scale_vectorsize = { .scale_vec::1X, .scale_vec::2X, .scale_vec::4X, .block16, .block32 }
    
    ----------------------------------------------------------------------------------
    
    // 3. Convolution MMA for floating-point type without block scaling:
    
    tcgen05.mma.cta_group.kind.collector_usage [d-tmem],  a-desc,  b-desc, idesc,
                                               { disable-output-lane }, enable-input-d {, scale-input-d};
    
    tcgen05.mma.cta_group.kind{.ashift}.collector_usage [d-tmem], [a-tmem], b-desc, idesc,
                                                        { disable-output-lane }, enable-input-d {, scale-input-d};
    
    tcgen05.mma.cta_group.kind.ashift{.collector_usage} [d-tmem], [a-tmem], b-desc, idesc,
                                                        { disable-output-lane }, enable-input-d {, scale-input-d};
    
    .kind      = { .kind::f16, .kind::tf32, .kind::f8f6f4 }
    .cta_group = { .cta_group::1,   .cta_group::2 }
    .collector_usage = { .collector::buffer::op }
    ::buffer         = { ::a }
    ::op             = { ::fill, ::use, ::lastuse, ::discard* }
    
    ----------------------------------------------------------------------------------
    
    // 4. Activation Stationary MMA for floating-point type with block scaling:
    
    tcgen05.mma.cta_group.kind.block_scale{.scale_vectorsize}.collector_usage
                                                [d-tmem],  a-desc,  b-desc, idesc,
                                                [scale-A-tmem], [scale-B-tmem], enable-input-d;
    
    tcgen05.mma.cta_group.kind.block_scale{.scale_vectorsize}.collector_usage
                                                [d-tmem], [a-tmem], b-desc, idesc,
                                                [scale-A-tmem], [scale-B-tmem], enable-input-d;
    
    .cta_group       = { .cta_group::1,   .cta_group::2 }
    .scale_vectorsize  = { .scale_vec::1X, .scale_vec::2X, .scale_vec::4X, .block16, .block32 }
    .kind            = { .kind::mxf8f6f4, .kind::mxf4, .kind::mxf4nvf4 }
    .collector_usage = { .collector::buffer::op }
    ::buffer         = { ::a }
    ::op             = { ::fill, ::use, ::lastuse, ::discard* }
    
    ----------------------------------------------------------------------------------
    
    // 5. Integer type:
    
    tcgen05.mma.cta_group.kind::i8  [d-tmem],  a-desc,  b-desc, idesc,
                                    { disable-output-lane }, enable-input-d;
    
    tcgen05.mma.cta_group.kind::i8  [d-tmem], [a-tmem], b-desc, idesc,
                                    { disable-output-lane }, enable-input-d;
    
    .cta_group = { .cta_group::1,   .cta_group::2  }
    
    ----------------------------------------------------------------------------------
    
    // 6. Convolution MMA for integer type:
    
    tcgen05.mma.cta_group.kind::i8.collector_usage          [d-tmem],  a-desc,  b-desc, idesc,
                                                            { disable-output-lane }, enable-input-d;
    
    tcgen05.mma.cta_group.kind::i8.ashift{.collector_usage} [d-tmem], [a-tmem], b-desc, idesc,
                                                            { disable-output-lane }, enable-input-d;
    
    tcgen05.mma.cta_group.kind::i8{.ashift}.collector_usage [d-tmem], [a-tmem], b-desc, idesc,
                                                            { disable-output-lane }, enable-input-d;
    
    .cta_group       = { .cta_group::1,   .cta_group::2  }
    .collector_usage = { .collector::buffer::op }
    ::buffer         = { ::a }
    ::op             = { ::fill, ::use, ::lastuse, ::discard* }
    

Description

Instruction `tcgen05.mma` is an asynchronous instruction which initiates an _MxNxK_ matrix multiply and accumulate operation, `D = A*B+D` where the `A` matrix is _MxK_ , the `B` matrix is _KxN_ , and the `D` matrix is _MxN_.

The operation of the form `D = A*B` is issued when the input predicate argument `enable-input-d` is false.

The optional immediate argument `scale-input-d` can be specified to scale the input matrix `D` as follows: `D = A*B+D * (2 ^ - scale-input-d)`

The valid range of values for argument `scale-input-d` is [0, 15]. The argument `scale-input-d` is only valid for `.kind::tf32` and `.kind::f16`.

The 32-bit register operand `idesc` is the instruction descriptor as described in [Instruction descriptor](<#tcgen05-instruction-descriptor>), specifies the shapes, exact types, sparsity and other details of the input matrices, output matrix and the matrix multiply and accumulate operation.

The qualifier `.cta_group::1` specifies that the matrix multiply and accumulate operation is performed on the [Tensor Memory](<#tensor-memory>) of the executing thread’s CTA only. The qualifier `.cta_group::2` specifies that the matrix multiply and accumulate operation is performed on the [Tensor Memory](<#tensor-memory>) of the executing thread’s CTA and its [peer CTA](<#tcgen05-peer-cta>).

All `tcgen05` instructions within a kernel must specify the same value for the `.cta_group` qualifier.

The instruction `tcgen05.mma` has single thread semantics, unlike the collective instructions `mma.sync` or `wgmma.mma_async`. So, a single thread issuing the `tcgen05.mma` will result in the initiation of the whole matrix multiply and accumulate operation. Refer to the section [Issue Granularity](<#tcgen05-issue-granularity>).

The qualifier `.kind` specifies the general kind of the element types of the multiplicand matrices. The exact types of the elements of the input and output matrices for each MMA-kind are specified in the [Instruction descriptor](<#tcgen05-instruction-descriptor>).

The address operand `d-tmem` specifies the address of the destination and the accumulation matrix `D` in the [Tensor Memory](<#tensor-memory>). The address operand `a-tmem` specifies the address of the matrix `A` in the [Tensor Memory](<#tensor-memory>). The 64-bit register operand `a-desc` and `b-desc` are the matrix descriptors which represent the matrices `A` and `B` in shared memory respectively. The format of the matrix descriptor is described in [Matrix Descriptors](<#tcgen05-matrix-descriptors>).

The vector operand `disable-output-lane` specifies the lane(s) in the [Tensor Memory](<#tensor-memory>) that should be not be updated with the resultant matrix `D`. Elements of the vector operand `disable-output-lane` forms a mask where each bit corresponds to a lane of the [Tensor Memory](<#tensor-memory>), with least significant bit of the first element of the vector (leftmost in syntax) corresponding to the lane 0 of the [Tensor Memory](<#tensor-memory>). If a bit in the mask is 1, then the corresponding lane in the Tensor Memory for the resultant matrix `D` will not be updated. The size of the vector is as follows:

.cta_group | Size of the vector disable-output-lane  
---|---  
::1 | 4  
::2 | 8  
  
Qualifier `.block_scale` specifies that the matrices `A` and `B` are scaled with `scale_A` and `scale_B` matrices respectively before performing the matrix multiply and accumulate operation as specified in the section [Block Scaling for tcgen05.mma.sync](<#tcgen05-block-scaling>). The address operand `scale-A-tmem` and `scale-B-tmem` specify the base address the matrices `scale_A` and `scale_B` respectively in the [Tensor Memory](<#tensor-memory>).

For qualifier `.scale_vectorsize`,

  * If `.scale_vec::NX` is specified: N specifies the number of columns in `scale_A` matrix and number of rows in `scale_B` matrix.

  * If `.blockN` is specified: N specifies the block size for which single scale factor will be applied. In this form, value of N is same as the K-dimension / (N of `.scale_vec::NX`).


Aliased `.scale_vectorsize` variants:

  1. `.block16` is aliased with:

     1. `.scale_vec::4X` when `.kind = .kind::mxf4nvf4` and K = 64 or 128

  2. `.block32` is aliased with:

     1. `.scale_vec::1X` when `.kind = .kind::mxf8f6f4` for all supported values of K

     2. `.scale_vec::2X` when `.kind = .kind::mxf4` or `.kind::mxf4nvf4` and K = 64 or 128


The valid combinations of MMA-kind and `.scale_vectorsize` are described in [Table 56](<#tcgen05-mma-scale-valid-comb>). For `.kind::mxf4` when the qualifier `.scale_vectorsize` is not specified, then it defaults to `.block32`. For `.kind::mxf4nvf4`, the qualifier `.scale_vectorsize` must be explicitly specified.

The qualifier `.ashift` shifts the rows of the `A` matrix down by one row, except for the last row in the [Tensor Memory](<#tensor-memory>). Qualifier `.ashift` is only allowed with _M_ = 128 or _M_ = 256.

The qualifier `.collector_usage` specifies the usage of collector buffer for matrix `A`. Following collector buffer operations can be specified:

.collector_usage | Semantics  
---|---  
`.collector::a::fill` | Specifies that the `A` matrix read from the memory should be filled in collector buffer.  
`.collector::a::use` | Specifies that the `A` matrix can be read from the collector buffer. This requires a previous fill to the collector buffer to be still valid.  
`.collector::a::lastuse` | Specifies that the `A` matrix can be read from the collector buffer and the contents of the collector buffer can be discarded. This requires a previous fill to the collector buffer to be valid till the collector buffer is read.  
`.collector::a::discard` | Specifies that the contents of the collector buffer for `A` can be discarded.  
  
If no `.collector_usage` qualifier is specified, then it defaults to `.collector::a::discard`. It is illegal to specify either of `.collector::a::use` or `.collector::a::fill` along with `.ashift`.

PTX ISA Notes

Introduced in PTX ISA version 8.6.

Qualifier `.kind::mxf4nvf4` introduced in PTX ISA version 8.7.

Qualifiers `.block16` and `.block32` introduced in PTX ISA version 8.8.

Target ISA Notes

Supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * And is supported on following family-specific architectures from PTX ISA version 8.8 except `.kind::i8`:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family


Qualifier `.kind::i8` is supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_110a`


Argument `scale-input-d` requires `sm_100a` and is supported on `sm_100f` or higher in the same family from PTX ISA version 8.8.

For `.scale_vectorsize`,

  * `.scale_vec::1X`, `.scale_vec::2X`, `.scale_vec::4X` requires `sm_100a`.

  * `.block16`, `.block32` requires `sm_100f` or `sm_110f`.


For Target ISA details on matrix shape, check [Target ISA Note](<#tcgen05-matrix-shape-target-isa-note>).

For Target ISA details on shared memory descriptor, check [Target ISA Note](<#tcgen05-shared-memory-descriptor-target-isa-note>).

Examples
    
    
    tcgen05.mma.cta_group::1.kind::tf32      [taddr0],  adesc,  bdesc, idesc, {m0, m1, m2, m3}, p;
    tcgen05.mma.cta_group::1.kind::mxf8f6f4  [taddr2],  [taddr1],  bdesc, idesc,
                                             [tmem_scaleA], [tmem_scaleB], p;
    
    tcgen05.commit.cta_group::1.mbarrier::arrive::one.b64 [mbarObj0];
    
    loop:
    mbarrier.try_wait.parity.b64 p, [mbarObj0], 0;
    @!p bra loop;
    

######  9.7.16.10.9.2. [TensorCore 5th Generation Instructions: `tcgen05.mma.sp`](<#tcgen05-mma-instructions-mma-sp>)

`tcgen05.mma.sp`

Perform the 5th generation of matrix multiply and accumulate operation with sparse `A` matrix.

Syntax
    
    
    // 1. Floating-point type without block scaling:
    
    tcgen05.mma.sp.cta_group.kind  [d-tmem],  a-desc,  b-desc, [sp-meta-tmem] ,  idesc,
                                   { disable-output-lane }, enable-input-d{, scale-input-d};
    
    tcgen05.mma.sp.cta_group.kind  [d-tmem], [a-tmem], b-desc, [sp-meta-tmem] , idesc,
                                   { disable-output-lane }, enable-input-d{, scale-input-d};
    
    .kind       = { .kind::f16, , .kind::tf32, .kind::f8f6f4 }
    .cta_group  = { .cta_group::1,  .cta_group::2 }
    
    ----------------------------------------------------------------------------------
    
    // 2. Floating-point type with block scaling:
    
    tcgen05.mma.sp.cta_group.kind.block_scale{.scale_vectorsize}
                                             [d-tmem],  a-desc,  b-desc , [sp-meta-tmem] , idesc,
                                             [scale-A-tmem], [scale-B-tmem], enable-input-d;
    
    tcgen05.mma.sp.cta_group.kind.block_scale{.scale_vectorsize}
                                             [d-tmem], [a-tmem], b-desc , [sp-meta-tmem] , idesc,
                                             [scale-A-tmem], [scale-B-tmem], enable-input-d;
    
    .scale_vectorsize = { .scale_vec::1X, .scale_vec::2X, .scale_vec::4X, .block16, .block32 }
    .cta_group      = { .cta_group::1,  .cta_group::2 }
    .kind = { .kind::mxf8f6f4, .kind::mxf4, .kind::mxf4nvf4 }
    
    ----------------------------------------------------------------------------------
    
    // 3. Convolution MMA with floating-point type without block scaling:
    
    tcgen05.mma.sp.cta_group.kind.collector_usage           [d-tmem],  a-desc,  b-desc,
                                                            [sp-meta-tmem] ,  idesc,
                                                            { disable-output-lane }, enable-input-d
                                                            {, scale-input-d};
    
    tcgen05.mma.sp.cta_group.kind.ashift{.collector_usage}  [d-tmem], [a-tmem], b-desc,
                                                            [sp-meta-tmem] , idesc,
                                                            { disable-output-lane }, enable-input-d
                                                            {, scale-input-d};
    
    tcgen05.mma.sp.cta_group.kind{.ashift}.collector_usage  [d-tmem], [a-tmem], b-desc,
                                                            [sp-meta-tmem] , idesc,
                                                            { disable-output-lane }, enable-input-d
                                                            {, scale-input-d};
    
    .kind            = { .kind::f16, .kind::tf32, .kind::f8f6f4 }
    .collector_usage = { .collector::buffer::op }
    ::buffer         = { ::a }
    ::op             = { ::fill, ::use, ::lastuse, ::discard* }
    
    ----------------------------------------------------------------------------------
    
    // 4. Activation Stationary MMA with floating-point type with block scaling:
    
    tcgen05.mma.sp.cta_group.kind.block_scale{.scale_vectorsize}.collector_usage
                                             [d-tmem],  a-desc,  b-desc , [sp-meta-tmem] , idesc,
                                             [scale-A-tmem], [scale-B-tmem], enable-input-d;
    
    tcgen05.mma.sp.cta_group.kind.block_scale{.scale_vectorsize}.collector_usage
                                             [d-tmem], [a-tmem], b-desc , [sp-meta-tmem] , idesc,
                                             [scale-A-tmem], [scale-B-tmem], enable-input-d;
    
    .kind = { .kind::mxf8f6f4, .kind::mxf4, .kind::mxf4nvf4 }
    .scale_vectorsize = { .scale_vec::1X, .scale_vec::2X, .scale_vec::4X, .block16, .block32 }
    .collector_usage = { .collector::buffer::op }
    ::buffer         = { ::a }
    ::op             = { ::fill, ::use, ::lastuse, ::discard* }
    
    ----------------------------------------------------------------------------------
    
    // 5. Integer type:
    
    tcgen05.mma.sp.cta_group.kind::i8 [d-tmem],  a-desc,  b-desc, [sp-meta-tmem] , idesc,
                                      { disable-output-lane }, enable-input-d;
    
    tcgen05.mma.sp.cta_group.kind::i8 [d-tmem], [a-tmem], b-desc, [sp-meta-tmem] , idesc,
                                      { disable-output-lane }, enable-input-d;
    
    .cta_group      = { .cta_group::1,  .cta_group::2 }
    
    ----------------------------------------------------------------------------------
    
    // 6. Convolution MMA with Integer type:
    
    tcgen05.mma.sp.cta_group.kind::i8.collector_usage          [d-tmem],  a-desc,  b-desc,
                                                               [sp-meta-tmem] , idesc,
                                                               { disable-output-lane }, enable-input-d;
    
    tcgen05.mma.sp.cta_group.kind::i8.ashift{.collector_usage} [d-tmem], [a-tmem], b-desc,
                                                               [sp-meta-tmem], idesc ,
                                                               { disable-output-lane }, enable-input-d;
    
    tcgen05.mma.sp.cta_group.kind::i8{.ashift}.collector_usage [d-tmem], [a-tmem], b-desc,
                                                               [sp-meta-tmem], idesc ,
                                                               { disable-output-lane }, enable-input-d;
    
    .collector_usage = { .collector::buffer::op }
    ::buffer         = { ::a }
    ::op             = { ::fill, ::use, ::lastuse, ::discard* }
    

Description

Instruction `tcgen05.mma.sp` is an asynchronous instruction which initiates an _MxNxK_ matrix multiply and accumulate operation of the form `D = A*B+D` where the `A` matrix is _Mx(K/2)_ , the `B` matrix is _KxN_ , and the `D` matrix is _MxN_. [Sparse Matrices](<#tcgen05-sparse-matrices>) describes the details of the sparsity.

The operation of the form `D = A*B` is issued when the input predicate argument `enable-input-d` is false.

The optional immediate argument `scale-input-d` can be specified to scale the input matrix `D` as follows: `D = A*B+D * (2 ^ - scale-input-d)`

The valid range of values for argument `scale-input-d` is [0, 15]. The argument `scale-input-d` is only valid for `.kind::tf32` and `.kind::f16`.

The 32-bit register operand `idesc` is the instruction descriptor as described in [Instruction descriptor](<#tcgen05-instruction-descriptor>), specifies the shapes, exact types, sparsity and other details of the input matrices, output matrix and the matrix multiply and accumulate operation.

The qualifier `.cta_group::1` specifies that the matrix multiply and accumulate operation is performed on the [Tensor Memory](<#tensor-memory>) of the executing thread’s CTA only. The qualifier `.cta_group::2` specifies that the matrix multiply and accumulate operation is performed on the [Tensor Memory](<#tensor-memory>) of the executing thread’s CTA and its [peer CTA](<#tcgen05-peer-cta>).

All `tcgen05` instructions within a kernel must specify the same value for the `.cta_group` qualifier.

The instruction `tcgen05.mma.sp` has single thread semantics, unlike the collective instructions `mma.sync` or `wgmma.mma_async`. So, a single thread issuing the `tcgen05.mma.sp` will result in the initiation of the whole matrix multiply and accumulate operation. Refer to the section [Issue Granularity](<#tcgen05-issue-granularity>).

The qualifier `.kind` specifies the general kind of the element types of the multiplicand matrices. The exact types of the elements of the input and output matrices for each MMA-kind are specified in the [Instruction descriptor](<#tcgen05-instruction-descriptor>).

The address operand `d-tmem` specifies the address of the destination and the accumulation matrix `D` in the [Tensor Memory](<#tensor-memory>). The address operand `a-tmem` specifies the address of the matrix `A` in the [Tensor Memory](<#tensor-memory>). The 64-bit register operand `a-desc` and `b-desc` are the matrix descriptors which represent the matrices `A` and `B` in shared memory respectively. The format of the matrix descriptor is described in [Matrix Descriptors](<#tcgen05-matrix-descriptors>).

The vector operand `disable-output-lane` specifies the lane(s) in the [Tensor Memory](<#tensor-memory>) that should be not be updated with the resultant matrix `D`. Elements of the vector operand `disable-output-lane` forms a mask where each bit corresponds to a lane of the [Tensor Memory](<#tensor-memory>). with least significant bit of the first element of the vector (leftmost in syntax) corresponding to the lane 0 of the Tensor Memory. If a bit in the mask is 1, then the corresponding lane in the Tensor Memory for the resultant matrix `D` will not be updated. The size of the vector is as follows:

.cta_group | Size of the vector disable-output-lane  
---|---  
::1 | 4  
::2 | 8  
  
Qualifier `.block_scale` specifies that the matrices `A` and `B` are scaled with `scale_A` and `scale_B` matrices respectively before performing the matrix multiply and accumulate operation as specified in the section [Block Scaling for tcgen05.mma.sync](<#tcgen05-block-scaling>). The address operand `scale-A-tmem` and `scale-B-tmem` specify the base address the matrices `scale_A` and `scale_B` respectively in the [Tensor Memory](<#tensor-memory>).

For qualifier `.scale_vectorsize`,

  * If `.scale_vec::NX` is specified: N specifies the number of columns in `scale_A` matrix and number of rows in `scale_B` matrix.

  * If `.blockN` is specified: N specifies the block size for which single scale factor will be applied. In this form, value of N is same as the K-dimension / (N of `.scale_vec::NX`).


Aliased `.scale_vectorsize` variants:

  1. `.block16` is aliased with:

     1. `.scale_vec::4X` when `.kind = .kind::mxf4nvf4` and K = 64 or 128

  2. `.block32` is aliased with:

     1. `.scale_vec::1X` when `.kind = .kind::mxf8f6f4` for all supported values of K

     2. `.scale_vec::2X` when `.kind = .kind::mxf4` or `.kind::mxf4nvf4` and K = 64 or 128


The valid combinations of MMA-kind and `.scale_vectorsize` are described in [Table 56](<#tcgen05-mma-scale-valid-comb>). For `.kind::mxf4` when the qualifier `.scale_vectorsize` is not specified, then it defaults to `.block32`. For `.kind::mxf4nvf4`, the qualifier `.scale_vectorsize` must be explicitly specified.

The qualifier `.ashift` shifts the rows of the `A` matrix down by one row, except for the last row in the [Tensor Memory](<#tensor-memory>). Qualifier `.ashift` is only allowed with _M_ = 128 or _M_ = 256.

The qualifier `.collector_usage` specifies the usage of collector buffer for matrix `A`. Following collector buffer operations can be specified:

.collector_usage | Semantics  
---|---  
`.collector::a::fill` | Specifies that the `A` matrix read from the memory should be filled in collector buffer.  
`.collector::a::use` | Specifies that the `A` matrix can be read from the collector buffer. This requires a previous fill to the collector buffer to be still valid.  
`.collector::a::lastuse` | Specifies that the `A` matrix can be read from the collector buffer and the contents of the collector buffer can be discarded. This requires a previous fill to the collector buffer to be valid till the collector buffer is read.  
`.collector::a::discard` | Specifies that the contents of the collector buffer for `A` can be discarded.  
  
If no `.collector_usage` qualifier is specified, then it defaults to `.collector::a::discard`. It is illegal to specify either of `.collector::a::use` or `.collector::a::fill` along with `.ashift`.

PTX ISA Notes

Introduced in PTX ISA version 8.6.

Qualifier `.kind::mxf4nvf4` introduced in PTX ISA version 8.7.

Qualifiers `.block16` and `.block32` introduced in PTX ISA version 8.8.

Target ISA Notes

Supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * And is supported on following family-specific architectures from PTX ISA version 8.8 except `.kind::i8`/`.kind::mxf4nvf4`/`.kind::mxf4`:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family


Qualifier `.kind::i8` is supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_110a`


Qualifiers `.kind::mxf4nvf4` and `.kind::mxf4` are supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_103a`

  * `sm_110a`


Argument `scale-input-d` requires `sm_100a` and is supported on `sm_100f` or higher in the same family from PTX ISA version 8.8.

For `.scale_vectorsize`,

  * `.scale_vec::1X`, `.scale_vec::2X`, `.scale_vec::4X` requires `sm_100a`.

  * `.block16`, `.block32` requires `sm_100f` or `sm_110f`.


For Target ISA details on matrix shape, check [Target ISA Note](<#tcgen05-matrix-shape-target-isa-note>).

For Target ISA details on shared memory descriptor, check [Target ISA Note](<#tcgen05-shared-memory-descriptor-target-isa-note>).

Examples
    
    
    tcgen05.mma.sp.cta_group::1.kind::f16      [taddr0],  adesc,  bdesc, [tmem_spmeta0], idesc, p;
    
    tcgen05.mma.sp.cta_group::1.kind::mxf8f6f4.collector::a:fill
                                               [taddr2],  [taddr1],  bdesc, [tmem_spmeta1], idesc,
                                               [tmem_scaleA], [tmem_scaleB], p;
    
    tcgen05.commit.cta_group::1.mbarrier::arrive::one.b64 [mbarObj0];
    
    loop:
    mbarrier.try_wait.parity.b64 p, [mbarObj0], 0;
    @!p bra loop;
    

######  9.7.16.10.9.3. [TensorCore 5th Generation Instructions: `tcgen05.mma.ws`](<#tcgen05-mma-instructions-mma-ws>)

`tcgen05.mma.ws`

Perform the 5th generation of weight stationary convolution matrix multiply and accumulate operation.

Syntax
    
    
    // 1. Floating-point type without block scaling:
    
    tcgen05.mma.ws.cta_group::1.kind{.collector_usage}    [d-tmem],  a-desc,  b-desc,  idesc,
                                                          enable-input-d {, zero-column-mask-desc };
    
    tcgen05.mma.ws.cta_group::1.kind{.collector_usage}    [d-tmem], [a-tmem], b-desc, idesc,
                                                          enable-input-d {, zero-column-mask-desc };
    
    .kind = { .kind::f16, .kind::tf32, .kind::f8f6f4 }
    
    ----------------------------------------------------------------------------------
    
    // 2. Integer type:
    
    tcgen05.mma.ws.cta_group::1.kind::i8{.collector_usage} [d-tmem],  a-desc,  b-desc, idesc,
                                                           enable-input-d {, zero-column-mask-desc};
    
    tcgen05.mma.ws.cta_group::1.kind::i8{.collector_usage} [d-tmem], [a-tmem], b-desc, idesc,
                                                           enable-input-d {, zero-column-mask-desc};
    
    .collector_usage = { .collector::buffer::op }
    ::buffer = { ::b0, ::b1, ::b2, ::b3 }
    ::op   = { ::fill, ::use, ::lastuse, ::discard}
    

Description

Instruction `tcgen05.mma.ws` is an asynchronous instruction which initiates an _MxNxK_ matrix multiply and accumulate operation, `D = A*B+D` where the `A` matrix is _MxK_ , the `B` matrix is _KxN_ , and the `D` matrix is _MxN_.

The operation of the form `D = A*B` is issued when the input predicate argument `enable-input-d` is false.

The 32-bit register operand `idesc` is the instruction descriptor as described in [Instruction descriptor](<#tcgen05-instruction-descriptor>), specifies the shapes, exact types, sparsity and other details of the input matrices, output matrix and the matrix multiply and accumulate operation.

The qualifier `.cta_group::1` specifies that the matrix multiply and accumulate operation is performed on the [Tensor Memory](<#tensor-memory>) of the executing thread’s CTA only.

All `tcgen05` instructions within a kernel must specify the same value for the `.cta_group` qualifier.

The instruction `tcgen05.mma.ws` has single thread semantics, unlike the collective instructions `mma.sync` or `wgmma.mma_async`. So, a single thread issuing the `tcgen05.mma.ws` will result in the initiation of the whole matrix multiply and accumulate operation. Refer to the section [Issue Granularity](<#tcgen05-issue-granularity>).

The qualifier `.kind` specifies the general kind of the element types of the multiplicand matrices. The exact types of the elements of the input and output matrices for each MMA-kind are specified in the [Instruction descriptor](<#tcgen05-instruction-descriptor>).

The address operand `d-tmem` specifies the address of the destination and the accumulation matrix `D` in the [Tensor Memory](<#tensor-memory>). The address operand `a-tmem` specifies the address of the matrix `A` in the [Tensor Memory](<#tensor-memory>). The 64-bit register operand `a-desc` and `b-desc` are the matrix descriptors which represent the matrices `A` and `B` in shared memory respectively. The format of the matrix descriptor is described in [Matrix Descriptors](<#tcgen05-matrix-descriptors>).

The optional operand `zero-column-mask-desc` is a 64-bit register which specifies the [Zero-Column Mask Descriptor](<#tcgen05-zero-column-mask-descriptor>). The zero-column mask descriptor is used to generate a mask that specifies which columns of `B` matrix will have zero value for the matrix multiply and accumulate operation regardless of the values present in the shared memory.

The qualifier `.collector_usage` specifies the usage of collector buffer for Matrix `B`. Following collector buffer operations can be specified:

.collector_usage | Semantics  
---|---  
`.collector::bN::fill` | Specifies that the `B` matrix read from the memory should be filled in collector buffer #N.  
`.collector::bN::use` | Specifies that the `B` matrix can be read from the collector buffer #N. This requires a previous fill to the collector buffer #N to be still valid.  
`.collector::bN::lastuse` | Specifies that the `B` matrix can be read from the collector buffer #N after which the contents of the collector buffer #N can be discarded. This requires a previous fill to the collector buffer #N to be valid till the collector buffer #N is read.  
`.collector::bN::discard` | Specifies that the contents of the collector buffer #N can be discarded.  
  
If no `.collector_usage` qualifier is specified, then it defaults to `.collector::b0::discard`.

PTX ISA Notes

Introduced in PTX ISA version 8.6.

Target ISA Notes

Supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * And is supported on following family-specific architectures from PTX ISA version 8.8 except `.kind::i8`:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family


Qualifier `.kind::i8` is supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_110a`


Examples
    
    
    tcgen05.mma.ws.cta_group::1.kind::i8.collector::b2:use [taddr2], [taddr1], bdesc, idesc, p;
    tcgen05.commit.cta_group::1.mbarrier::arrive::one.b64 [mbarObj0];
    
    loop:
    mbarrier.try_wait.parity.b64 p, [mbarObj0], 0;
    @!p bra loop;
    

######  9.7.16.10.9.4. [TensorCore 5th Generation Instructions: `tcgen05.mma.ws.sp`](<#tcgen05-mma-instructions-mma-ws-sp>)

`tcgen05.mma.ws.sp`

Perform the 5th generation of weight stationary convolution matrix multiply and accumulate operation with sparse `A` matrix.

Syntax
    
    
    // 1. Floating-point type without block scaling:
    
    tcgen05.mma.ws.sp.cta_group::1.kind{.collector_usage} [d-tmem],  a-desc,  b-desc,
                                                          [sp-meta-tmem] ,  idesc,
                                                          enable-input-d {, zero-column-mask-desc};
    
    tcgen05.mma.ws.sp.cta_group::1.kind{.collector_usage} [d-tmem], [a-tmem], b-desc,
                                                          [sp-meta-tmem] , idesc,
                                                          enable-input-d {, zero-column-mask-desc};
    
    .kind = { .kind::f16, .kind::tf32, .kind::f8f6f4 }
    
    ----------------------------------------------------------------------------------
    
    // 2. Integer type:
    
    tcgen05.mma.ws.sp.cta_group::1.kind::i8{.collector_usage} [d-tmem], a-desc, b-desc,
                                                              [sp-meta-tmem] , idesc,
                                                              enable-input-d {, zero-column-mask-desc};
    
    tcgen05.mma.ws.sp.cta_group::1.kind::i8{.collector_usage} [d-tmem], [a-tmem], b-desc,
                                                              [sp-meta-tmem] , idesc,
                                                              enable-input-d {, zero-column-mask-desc};
    
    .collector_usage = { .collector::buffer::op }
    ::buffer = { ::b0, ::b1, ::b2, ::b3 }
    ::op   = { ::fill, ::use, ::lastuse, ::discard}
    

Description

Instruction `tcgen05.mma.ws.sp` is an asynchronous instruction which initiates an _MxNxK_ matrix multiply and accumulate operation, `D = A*B+D` where the `A` matrix is _Mx(K/2)_ , the `B` matrix is _KxN_ , and the `D` matrix is _MxN_. [Sparse Matrices](<#tcgen05-sparse-matrices>) describes the details of the sparsity.

The operation of the form `D = A*B` is issued when the input predicate argument `enable-input-d` is false.

The 32-bit register operand `idesc` is the instruction descriptor as described in [Instruction descriptor](<#tcgen05-instruction-descriptor>), specifies the shapes, exact types, sparsity and other details of the input matrices, output matrix and the matrix multiply and accumulate operation.

The qualifier `.cta_group::1` specifies that the matrix multiply and accumulate operation is performed on the Tensor Memory of the executing thread’s CTA only.

All `tcgen05` instructions within a kernel must specify the same value for the `.cta_group` qualifier.

The instruction `tcgen05.mma.ws.sp` has single thread semantics, unlike the collective instructions `mma.sync` or `wgmma.mma_async`. So, a single thread issuing the `tcgen05.mma.ws.sp` will result in the initiation of the whole matrix multiply and accumulate operation. Refer to the section [Issue Granularity](<#tcgen05-issue-granularity>).

The qualifier `.kind` specifies the general kind of the element types of the multiplicand matrices. The exact types of the elements of the input and output matrices for each MMA-kind are specified in the [Instruction descriptor](<#tcgen05-instruction-descriptor>).

The address operand `d-tmem` specifies the address of the destination and the accumulation matrix `D` in the [Tensor Memory](<#tensor-memory>). The address operand `a-tmem` specifies the address of the matrix `A` in the [Tensor Memory](<#tensor-memory>). The 64-bit register operand `a-desc` and `b-desc` are the matrix descriptors which represent the matrices `A` and `B` in shared memory respectively. The format of the matrix descriptor is described in [Matrix Descriptors](<#tcgen05-matrix-descriptors>).

The optional operand `zero-column-mask-desc` is a 64-bit register which specifies the [Zero-Column Mask Descriptor](<#tcgen05-zero-column-mask-descriptor>). The zero-column mask descriptor is used to generate a mask that specifies which columns of `B` matrix will have zero value for the matrix multiply and accumulate operation regardless of the values present in the shared memory.

The qualifier `.collector_usage` specifies the usage of collector buffer for Matrix `B`. Following collector buffer operations can be specified:

.collector_usage | Semantics  
---|---  
`.collector::bN::fill` | Specifies that the `B` matrix read from the memory should be filled in collector buffer #N.  
`.collector::bN::use` | Specifies that the `B` matrix can be read from the collector buffer #N. This requires a previous fill to the collector buffer #N to be still valid.  
`.collector::bN::lastuse` | Specifies that the `B` matrix can be read from the collector buffer #N after which the contents of the collector buffer #N can be discarded. This requires a previous fill to the collector buffer #N to be valid till the collector buffer #N is read.  
`.collector::bN::discard` | Specifies that the contents of the collector buffer #N can be discarded.  
  
If no `.collector_usage` qualifier is specified, then it defaults to `.collector::b0::discard`.

PTX ISA Notes

Introduced in PTX ISA version 8.6.

Target ISA Notes

Supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * And is supported on following family-specific architectures from PTX ISA version 8.8 except `.kind::i8`:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family


Qualifier `.kind::i8` is supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_110a`


Examples
    
    
    tcgen05.mma.ws.sp.cta_group::1.kind::tf32.collector::b1::fill  [taddr1], [taddr0], bdesc,
                                                                   [tmem_spmeta0], idesc, p;
    
    tcgen05.commit.cta_group::1.mbarrier::arrive::one.b64 [mbarObj0];
    
    loop:
    mbarrier.try_wait.parity.b64 p, [mbarObj0], 0;
    @!p bra loop;