---
name: ptx-multimemcpreduceasyncbulk
description: '`multimem.cp.reduce.async.bulk`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.27. Data Movement and Conversion Instructions:multimem.cp.reduce.async.bulk

---
title: "9.7.9.27. Data Movement and Conversion Instructions:multimem.cp.reduce.async.bulk"
section: 9.7.9.27
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.27. Data Movement and Conversion Instructions:multimem.cp.reduce.async.bulk


`multimem.cp.reduce.async.bulk`

Initiates an asynchronous reduction operation to a multimem address range.

Syntax

multimem.cp.reduce.async.bulk.dst.src.completion_mechanism.redOp.type  [dstMem], [srcMem], size;
    
        .dst                  = { .global }
        .src                  = { .shared::cta }
        .completion_mechanism = { .bulk_group }
        .redOp                = { .and, .or, .xor,
                                  .add, .inc, .dec,
                                  .min, .max }
        .type                 = { .f16, .bf16,
                                  .b32, .u32, .s32,
                                  .b64, .u64, .s64,
                                  .f32, .f64 }
    
    multimem.cp.reduce.async.bulk.dst.src.completion_mechanism.add.noftz.type  [dstMem], [srcMem], size;
    
        .dst                  = { .global }
        .src                  = { .shared::cta }
        .completion_mechanism = { .bulk_group }
        .type                 = { .f16, .bf16 }

Description

Instruction `multimem.cp.reduce.async.bulk` initiates an element-wise asynchronous reduction operation with elements from source memory address range `[srcMem, srcMem + size)` to memory locations residing on each GPU’s memory referred to by the multimem destination address range `[dstMem, dstMem + size)`.

Each data element in the destination array is reduced inline with the corresponding data element in the source array with the reduction operation specified by the modifier `.redOp`. The type of each data element in the source and the destination array is specified by the modifier `.type`.

The source address operand `srcMem` is in the state space specified by `.src` and the destination address operand `dstMem` is in the state specified by the `.dst`.

The 32-bit operand `size` specifies the amount of memory to be copied from the source location and used in the reduction operation, in terms of number of bytes. Operand `size` must be a multiple of 16. The memory range `[dstMem, dstMem + size)` must not overflow the destination multimem memory space. The memory range `[srcMem, srcMem + size)` must not overflow the source memory space. The addresses `dstMem` and `srcMem` must be aligned to 16 bytes. If any of these preconditions is not met, the behavior is undefined.

The operations supported by `.redOp` are classified as follows:

The bit-size operations are `.and`, `.or`, and `.xor`.

The integer operations are `.add`, `.inc`, `.dec`, `.min`, and `.max`. The `.inc` and `.dec` operations return a result in the range `[0..x]` where `x` is the value at the source state space.

The floating point operation `.add` rounds to the nearest even, preserve input and result subnormals, and does not flush them to zero, except for the current implementation of `multimem.cp.reduce.async.bulk.add.f32` which flushes subnormal inputs and results to sign-preserving zero. The `multimem.cp.reduce.async.bulk.add.f16` and `multimem.cp.reduce.async.bulk.add.bf16` operations require `.noftz` qualifier. It preserves input and result subnormals, and does not flush them to zero.

The following table describes the valid combinations of `.redOp` and element type:

.redOp | element type  
---|---  
.add | .u32, .s32, .u64, .f32, .f64, .f16, .bf16  
.min, .max | .u32, .s32, .u64, .s64, .f16, .bf16  
.inc, .dec | .u32  
.and, .or, .xor | .b32, .b64

The modifier `.completion_mechanism` specifies the completion mechanism that is supported by the instruction. The modifier `.bulk_group` specifies that the `multimem.cp.reduce.async.bulk` uses bulk async-group based completion mechanism.

Each reduction operation performed by the `multimem.cp.reduce.async.bulk` has individually `.relaxed.sys` memory ordering semantics. The load operations in `multimem.cp.reduce.async.bulk` are treated as weak memory operations as described in the [Memory Consistency Model](<#memory-consistency-model>).

PTX ISA Notes

Introduced in PTX ISA version 9.1.

Target ISA Notes

Requires `sm_90` or higher.

Examples

multimem.cp.reduce.async.bulk.global.shared::cta.bulk_group.add.u32 [dstMem], [srcMem], size;
    
    multimem.cp.reduce.async.bulk.global.shared::cta.bulk_group.xor.b64 [dstMem], [srcMem], size;
    
    multimem.cp.reduce.async.bulk.global.shared::cta.bulk_group.inc.u32 [dstMem], [srcMem], size;
    
    multimem.cp.reduce.async.bulk.global.shared::cta.bulk_group.dec.u32 [dstMem], [srcMem], size;
    
    multimem.cp.reduce.async.bulk.global.shared::cta.bulk_group.max.s32 [dstMem], [srcMem], size;
    
    multimem.cp.reduce.async.bulk.global.shared::cta.bulk_group.add.noftz.f16 [dstMem], [srcMem], size;
    
    multimem.cp.reduce.async.bulk.global.shared::cta.bulk_group.min.bf16 [dstMem], [srcMem], size;
    
    multimem.cp.reduce.async.bulk.global.shared::cta.bulk_group.add.noftz.bf16 [dstMem], [srcMem], size;

#####  9.7.9.27.1. [Data Movement and Conversion Instructions: Tensor copy](<#data-movement-and-conversion-instructions-tensor-copy>)  
  
######  9.7.9.27.1.1. [Restriction on Tensor Copy instructions](<#data-movement-and-conversion-instructions-tensor-copy-restrictions>)

Following are the restrictions on the types `.b4x16`, `.b4x16_p64`, `.b6x16_p32` and `.b6p2x16`:

  1. `cp.reduce.async.bulk` doesn’t support the types `.b4x16`, `.b4x16_p64`, `.b6x16_p32` and `.b6p2x16`.

  2. `cp.async.bulk.tensor` with the direction `.global.shared::cta` doesn’t support the type `.b4x16_p64`.

  3. `cp.async.bulk.tensor` with the direction `.shared::cluster.global` doesn’t support the sub-byte types on `sm_120a`.

  4. OOB-NaN fill mode doesn’t support the types `.b4x16`, `.b4x16_p64`, `.b6x16_p32` and `.b6p2x16`.

  5. Box-Size[0] must be exactly:

     1. 96B for `b6x16_p32` and `.b6p2x16`.

     2. 64B for `b4x16_p64`.

  6. Tensor-Size[0] must be a multiple of:

     1. 96B for `b6x16_p32` and `.b6p2x16`.

     2. 64B for `b4x16_p64`.

  7. For `.b4x16_p64`, `.b6x16_p32` and `.b6p2x16`, the first coordinate in the tensorCoords argument vector must be a multiple of 128.

  8. For `.b4x16_p64`, `.b6x16_p32` and `.b6p2x16`, the global memory address must be 32B aligned. Additionally, tensor stride in every dimension must be 32B aligned.

  9. `.b4x16_p64`, `.b6x16_p32` and `.b6p2x16` supports the following swizzling modes:

     1. None.

     2. 128B (With all potential swizzle atomicity values except: 32B with 8B flip)


Following are the restrictions on the 96B swizzle mode:

  1. The `.swizzle_atomicity` must be 16B.

  2. The `.interleave_layout` must not be set.

  3. Box-Size[0] must be less than or equal to 96B.

  4. The type must not be among following: `.b4x16_p64`, `.b6x16_p32` and `.b6p2x16`.

  5. The `.load_mode` must not be set to `.im2col::w::128`.


Following are the restrictions on the `.global.shared::cta` direction:

  1. Starting co-ordinates for Bounding Box (`tensorCoords`) must be non-negative.

  2. The bounding box along the D, W and H dimensions must stay within the tensor boundaries. This implies:

     1. Bounding-Box Lower-Corner must be non-negative.

     2. Bounding-Box Upper-Corner must be non-positive.


Following are the restrictions for `sm_120a`:

  1. `cp.async.bulk.tensor` with the direction `.shared::cluster.global` doesn’t support:

     1. the sub-byte types

     2. the qualifier `.swizzle_atomicity`


Following are the restrictions for `sm_103a` while using type `.b6p2x16` on `cp.async.bulk.tensor` with the direction `.global.shared::cta`:

  1. Box-Size[0] must be exactly either of 48B or 96B.

  2. The global memory address must be 16B aligned.

  3. Tensor Stride in every dimension must be 16B aligned.

  4. The first coordinate in the tensorCoords argument vector must be a multiple of 64.

  5. Tensor-Size[0] must be a multiple of 48B.

  6. The following swizzle modes are supported:

     1. None.

     2. 128B (With all potential swizzle atomicity values except: 32B with 8B flip)

     3. 64B swizzle with 16B swizzle atomicity


######  9.7.9.27.1.2. [Data Movement and Conversion Instructions: `cp.async.bulk.tensor`](<#data-movement-and-conversion-instructions-cp-async-bulk-tensor>)

`cp.async.bulk.tensor`

Initiates an asynchronous copy operation on the tensor data from one state space to another.

Syntax
    
    
    // global -> shared::cta
    cp.async.bulk.tensor.dim.dst.src{.load_mode}.completion_mechanism{.cta_group}{.level::cache_hint}
                                       [dstMem], [tensorMap, tensorCoords], [mbar]{, im2colInfo} {, cache-policy}
    
    .dst =                  { .shared::cta }
    .src =                  { .global }
    .dim =                  { .1d, .2d, .3d, .4d, .5d }
    .completion_mechanism = { .mbarrier::complete_tx::bytes }
    .cta_group =            { .cta_group::1, .cta_group::2 }
    .load_mode =            { .tile, .tile::gather4, .im2col, .im2col::w, .im2col::w::128 }
    .level::cache_hint =    { .L2::cache_hint }
    
    
    // global -> shared::cluster
    cp.async.bulk.tensor.dim.dst.src{.load_mode}.completion_mechanism{.multicast}{.cta_group}{.level::cache_hint}
                                       [dstMem], [tensorMap, tensorCoords], [mbar]{, im2colInfo}
                                       {, ctaMask} {, cache-policy}
    
    .dst =                  { .shared::cluster }
    .src =                  { .global }
    .dim =                  { .1d, .2d, .3d, .4d, .5d }
    .completion_mechanism = { .mbarrier::complete_tx::bytes }
    .cta_group =            { .cta_group::1, .cta_group::2 }
    .load_mode =            { .tile, .tile::gather4, .im2col, .im2col::w, .im2col::w::128 }
    .level::cache_hint =    { .L2::cache_hint }
    .multicast =            { .multicast::cluster  }
    
    
    // shared::cta -> global
    cp.async.bulk.tensor.dim.dst.src{.load_mode}.completion_mechanism{.level::cache_hint}
                                       [tensorMap, tensorCoords], [srcMem] {, cache-policy}
    
    .dst =                  { .global }
    .src =                  { .shared::cta }
    .dim =                  { .1d, .2d, .3d, .4d, .5d }
    .completion_mechanism = { .bulk_group }
    .load_mode =            { .tile, .tile::scatter4, .im2col_no_offs }
    .level::cache_hint =    { .L2::cache_hint }
    

Description

`cp.async.bulk.tensor` is a non-blocking instruction which initiates an asynchronous copy operation of tensor data from the location in `.src` state space to the location in the `.dst` state space.

The operand `dstMem` specifies the location in the `.dst` state space into which the tensor data has to be copied and `srcMem` specifies the location in the `.src` state space from which the tensor data has to be copied.

When `.dst` is specified as `.shared::cta`, the address `dstMem` must be in the shared memory of the executing CTA within the cluster, otherwise the behavior is undefined.

When `.dst` is specified as `.shared::cluster`, the address `dstMem` can be in the shared memory of any of the CTAs within the current cluster.

The operand `tensorMap` is the generic address of the opaque tensor-map object which resides in `.param` space or `.const` space or `.global` space. The operand `tensorMap` specifies the properties of the tensor copy operation, as described in [Tensor-map](<#tensor-tensormap>). The `tensorMap` is accessed in tensormap proxy. Refer to the _CUDA programming guide_ for creating the tensor-map objects on the host side.

The dimension of the tensor data is specified by the `.dim` modifier.

The vector operand `tensorCoords` specifies the starting coordinates in the tensor data in the global memory from or to which the copy operation has to be performed. The individual tensor coordinates in `tensorCoords` are of type `.s32`. The format of vector argument `tensorCoords` is dependent on `.load_mode` specified and is as follows:

.load_mode | tensorCoords | Semantics  
---|---|---  
`.tile::scatter4` | {col_idx, row_idx0, row_idx1, row_idx2, row_idx3} | Fixed length vector of size 5. The five elements together specify the start co-ordinates of the four rows.  
`.tile::gather4`  
Rest all | {d0, .., dn} for n = .dim | Vector of n elements where n = .dim. The elements indicate the offset in each of the dimension.  
  
The modifier `.completion_mechanism` specifies the completion mechanism that is supported on the instruction variant. The completion mechanisms that are supported for different variants are summarized in the following table:

.completion-mechanism | `.dst` | `.src` | Completion mechanism  
---|---|---|---  
Needed for completion of entire Async operation | optionally can be used for the completion of reading of the tensormap object  
`.mbarrier::...` | `.shared::cta` | `.global` | mbarrier based | _Bulk async-group_ based  
`.shared::cluster` | `.global`  
`.bulk_group` | `.global` | `.shared::cta` | _Bulk async-group_ based  
  
The modifier `.mbarrier::complete_tx::bytes` specifies that the `cp.async.bulk.tensor` variant uses mbarrier based completion mechanism. Upon the completion of the asynchronous copy operation, the [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation, with `completeCount` argument equal to amount of data copied in bytes, will be performed on the mbarrier object specified by the operand `mbar`. This instruction accesses its `mbarrier` operand using generic-proxy.

The modifier `.cta_group` can only be specified with the mbarrier based completion mechanism. The modifier `.cta_group` is used to signal either the odd numbered CTA or the even numbered CTA among the [CTA-Pair](<#tcgen05-cta-pair>). When `.cta_group::1` is specified, the mbarrier object `mbar` that is specified must be in the shared memory of the same CTA as the shared memory destination `dstMem`. When `.cta_group::2` is specified, the mbarrier object `mbar` can be in shared memory of either the same CTA as the shared memory destination `dstMem` or in its [peer-CTA](<#tcgen05-peer-cta>). If `.cta_group` is not specified, then it defaults to `.cta_group::1`.

The modifier `.bulk_group` specifies that the `cp.async.bulk.tensor` variant uses _bulk async-group_ based completion mechanism.

The qualifier `.load_mode` specifies how the data in the source location is copied into the destination location. If `.load_mode` is not specified, it defaults to `.tile`.

In `.tile` mode, the multi-dimensional layout of the source tensor is preserved at the destination. In `.tile::gather4` mode, four rows in 2-dimnesional source tensor are combined to form a single 2-dimensional destination tensor. In `.tile::scatter4` mode, single 2-dimensional source tensor is divided into four rows in 2-dimensional destination tensor. Details of `.tile::scatter4`/`.tile::gather4` modes are described in [.tile::scatter4 and .tile::gather4 modes](<#tensor-tiled-scatter4-gather4-modes>).

In `.im2col` and `.im2col::*` modes, some dimensions of the source tensors are unrolled in a single dimensional column at the destination. Details of the `im2col` and `.im2col::*` modes are described in [im2col mode](<#tensor-im2col-mode>) and [im2col::w and im2col::w::128 modes](<#tensor-im2col-w-w128-modes>) respectively. In `.im2col` and `.im2col::*` modes, the tensor has to be at least 3-dimensional. The vector operand `im2colInfo` can be specified only when `.load_mode` is `.im2col` or `.im2col::w` or `.im2col::w::128`. The format of the vector argument `im2colInfo` is dependent on the exact im2col mode and is as follows:

Exact im2col mode | im2colInfo argument | Semantics  
---|---|---  
`.im2col` | { i2cOffW , i2cOffH , i2cOffD } for `.dim` = `.5d` | A vector of im2col offsets whose vector size is two less than number of dimensions .dim.  
`.im2col::w` | { wHalo, wOffset } | A vector of 2 arguments containing [wHalo](<#tensor-im2col-w-w128-modes-whalo>) and [wOffset](<#tensor-im2col-w-w128-modes-woffset>) arguments.  
`.im2col::w::128`  
`.im2col_no_offs` | `im2colInfo` is not applicable. | `im2colInfo` is not applicable.  
  
Argument `wHalo` is a 16bit unsigned integer whose valid set of values differs on the load-mode and is as follows: \- Im2col::w mode : valid range is [0, 512). \- Im2col::w::128 mode : valid range is [0, 32).

Argument `wOffset` is a 16bit unsigned integer whose valid range of values is [0, 32).

The optional modifier `.multicast::cluster` allows copying of data from global memory to shared memory of multiple CTAs in the cluster. Operand `ctaMask` specifies the destination CTAs in the cluster such that each bit position in the 16-bit `ctaMask` operand corresponds to the `%ctaid` of the destination CTA. The source data is multicast to the same offset as `dstMem` in the shared memory of each destination CTA. When `.cta_group` is specified as:

  * `.cta_group::1` : The mbarrier signal is also multicasted to the same offset as `mbar` in the shared memory of the destination CTA.

  * `.cta_group::2` : The mbarrier signal is multicasted either to all the odd numbered CTAs or the even numbered CTAs within the corresponding [CTA-Pair](<#tcgen05-cta-pair>). For each destination CTA specified in the `ctaMask`, the mbarrier signal is sent either to the destination CTA or its [peer-CTA](<#tcgen05-peer-cta>) based on CTAs `%cluster_ctarank` parity of shared memory where the mbarrier object `mbar` resides.


When the optional argument `cache-policy` is specified, the qualifier `.level::cache_hint` is required. The 64-bit operand `cache-policy` specifies the cache eviction policy that may be used during the memory access.

`cache-policy` is a hint to the cache subsystem and may not always be respected. It is treated as a performance hint only, and does not change the memory consistency behavior of the program.

The copy operation in `cp.async.bulk.tensor` is treated as a weak memory operation and the [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation on the mbarrier has `.release` semantics at the `.cluster` scope as described in the [Memory Consistency Model](<#memory-consistency-model>).

Notes

`.multicast::cluster` qualifier is optimized for target architecture `sm_90a`/`sm_100f`/`sm_100a`/ `sm_103f`/`sm_103a`/`sm_110f`/`sm_110a` and may have substantially reduced performance on other targets and hence `.multicast::cluster` is advised to be used with `.target` `sm_90a`/`sm_100f`/ `sm_100a`/`sm_103f`/`sm_103a`/`sm_110f`/`sm_110a`.

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Support for `.shared::cta` as destination state space is introduced in PTX ISA version 8.6.

Support for qualifiers `.tile::gather4` and `.tile::scatter4` introduced in PTX ISA version 8.6.

Support for qualifiers `.im2col::w` and `.im2col::w::128` introduced in PTX ISA version 8.6.

Support for qualifier `.cta_group` introduced in PTX ISA version 8.6.

Target ISA Notes

Requires `sm_90` or higher.

`.multicast::cluster` qualifier advised to be used with `.target` `sm_90a` or `sm_100f` or `sm_100a` or `sm_103f` or `sm_103a` or `sm_110f` or `sm_110a`.

Qualifiers `.tile::gather4` and `.im2col::w` require:

  * `sm_100a` when destination state space is `.shared::cluster` and is supported on `sm_100f` from PTX ISA version 8.8.

  * `sm_100` or higher when destination state space is `.shared::cta`.


Qualifier `.tile::scatter4` is supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family


Qualifier `.im2col::w::128` is supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family


Qualifier `.cta_group` is supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family


Examples
    
    
    .reg .b16 ctaMask;
    .reg .u16 i2cOffW, i2cOffH, i2cOffD;
    .reg .b64 l2CachePolicy;
    
    cp.async.bulk.tensor.1d.shared::cta.global.mbarrier::complete_tx::bytes.tile  [sMem0], [tensorMap0, {tc0}], [mbar0];
    
    @p cp.async.bulk.tensor.5d.shared::cta.global.im2col.mbarrier::complete_tx::bytes
                         [sMem2], [tensorMap2, {tc0, tc1, tc2, tc3, tc4}], [mbar2], {i2cOffW, i2cOffH, i2cOffD};
    
    cp.async.bulk.tensor.1d.shared::cluster.global.mbarrier::complete_tx::bytes.tile  [sMem0], [tensorMap0, {tc0}], [mbar0];
    
    @p cp.async.bulk.tensor.2d.shared::cluster.global.mbarrier::complete_tx::bytes.multicast::cluster
                         [sMem1], [tensorMap1, {tc0, tc1}], [mbar2], ctaMask;
    
    @p cp.async.bulk.tensor.5d.shared::cluster.global.im2col.mbarrier::complete_tx::bytes
                         [sMem2], [tensorMap2, {tc0, tc1, tc2, tc3, tc4}], [mbar2], {i2cOffW, i2cOffH, i2cOffD};
    
    @p cp.async.bulk.tensor.3d.im2col.shared::cluster.global.mbarrier::complete_tx::bytes.L2::cache_hint
                         [sMem3], [tensorMap3, {tc0, tc1, tc2}], [mbar3], {i2cOffW}, policy;
    
    @p cp.async.bulk.tensor.1d.global.shared::cta.bulk_group  [tensorMap3, {tc0}], [sMem3];
    
    cp.async.bulk.tensor.2d.tile::gather4.shared::cluster.global.mbarrier::complete_tx::bytes
                         [sMem5], [tensorMap6, {x0, y0, y1, y2, y3}], [mbar5];
    
    cp.async.bulk.tensor.3d.im2col::w.shared::cluster.global.mbarrier::complete_tx::bytes
                         [sMem4], [tensorMap5, {t0, t1, t2}], [mbar4], {im2colwHalo, im2colOff};
    
    cp.async.bulk.tensor.1d.shared::cluster.global.tile.cta_group::2
                         [sMem6], [tensorMap7, {tc0}], [peerMbar];
    

######  9.7.9.27.1.3. [Data Movement and Conversion Instructions: `cp.reduce.async.bulk.tensor`](<#data-movement-and-conversion-instructions-cp-reduce-async-bulk-tensor>)

`cp.reduce.async.bulk.tensor`

Initiates an asynchronous reduction operation on the tensor data.

Syntax
    
    
    // shared::cta -> global:
    cp.reduce.async.bulk.tensor.dim.dst.src.redOp{.load_mode}.completion_mechanism{.level::cache_hint}
                                              [tensorMap, tensorCoords], [srcMem] {,cache-policy}
    
    .dst =                  { .global }
    .src =                  { .shared::cta }
    .dim =                  { .1d, .2d, .3d, .4d, .5d }
    .completion_mechanism = { .bulk_group }
    .load_mode =            { .tile, .im2col_no_offs }
    .redOp =                { .add, .min, .max, .inc, .dec, .and, .or, .xor}
    

Description

`cp.reduce.async.bulk.tensor` is a non-blocking instruction which initiates an asynchronous reduction operation of tensor data in the `.dst` state space with tensor data in the `.src` state space.

The operand `srcMem` specifies the location of the tensor data in the `.src` state space using which the reduction operation has to be performed.

The operand `tensorMap` is the generic address of the opaque tensor-map object which resides in `.param` space or `.const` space or `.global` space. The operand `tensorMap` specifies the properties of the tensor copy operation, as described in [Tensor-map](<#tensor-tensormap>). The `tensorMap` is accessed in tensormap proxy. Refer to the _CUDA programming guide_ for creating the tensor-map objects on the host side.

Each element of the tensor data in the `.dst` state space is reduced inline with the corresponding element from the tensor data in the `.src` state space. The modifier `.redOp` specifies the reduction operation used for the inline reduction. The type of each tensor data element in the source and the destination tensor is specified in [Tensor-map](<#tensor-tensormap>).

The dimension of the tensor is specified by the `.dim` modifier.

The vector operand `tensorCoords` specifies the starting coordinates of the tensor data in the global memory on which the reduce operation is to be performed. The number of tensor coordinates in the vector argument `tensorCoords` should be equal to the dimension specified by the modifier `.dim`. The individual tensor coordinates are of the type `.s32`.

The following table describes the valid combinations of `.redOp` and element type:

`.redOp` | Element type  
---|---  
`.add` | `.u32`, `.s32`, `.u64`, `.f32`, `.f16`, `.bf16`  
`.min`, `.max` | `.u32`, `.s32`, `.u64`, `.s64`, `.f16`, `.bf16`  
`.inc`, `.dec` | `.u32`  
`.and`, `.or`, `.xor` | `.b32`, `.b64`  
  
The modifier `.completion_mechanism` specifies the completion mechanism that is supported on the instruction variant. Value `.bulk_group` of the modifier `.completion_mechanism` specifies that `cp.reduce.async.bulk.tensor` instruction uses _bulk async-group_ based completion mechanism.

The qualifier `.load_mode` specifies how the data in the source location is copied into the destination location. If `.load_mode` is not specified, it defaults to `.tile`. In `.tile` mode, the multi-dimensional layout of the source tensor is preserved at the destination. In `.im2col_no_offs` mode, some dimensions of the source tensors are unrolled in a single dimensional column at the destination. Details of the `im2col` mode are described in [im2col mode](<#tensor-im2col-mode>). In `.im2col` mode, the tensor has to be at least 3-dimensional.

When the optional argument `cache-policy` is specified, the qualifier `.level::cache_hint` is required. The 64-bit operand `cache-policy` specifies the cache eviction policy that may be used during the memory access.

`cache-policy` is a hint to the cache subsystem and may not always be respected. It is treated as a performance hint only, and does not change the memory consistency behavior of the program. The qualifier `.level::cache_hint` is only supported when at least one of the `.src` or `.dst` statespaces is `.global` state space.

Each reduction operation performed by `cp.reduce.async.bulk.tensor` has individually `.relaxed.gpu` memory ordering semantics. The load operations in `cp.reduce.async.bulk.tensor` are treated as weak memory operations and the [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation on the mbarrier has `.release` semantics at the `.cluster` scope as described in the [Memory Consistency Model](<#memory-consistency-model>).

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90` or higher.

Examples
    
    
    cp.reduce.async.bulk.tensor.1d.global.shared::cta.add.tile.bulk_group
                                                 [tensorMap0, {tc0}], [sMem0];
    
    cp.reduce.async.bulk.tensor.2d.global.shared::cta.and.bulk_group.L2::cache_hint
                                                 [tensorMap1, {tc0, tc1}], [sMem1] , policy;
    
    cp.reduce.async.bulk.tensor.3d.global.shared::cta.xor.im2col.bulk_group
                                                 [tensorMap2, {tc0, tc1, tc2}], [sMem2]
    

######  9.7.9.27.1.4. [Data Movement and Conversion Instructions: `cp.async.bulk.prefetch.tensor`](<#data-movement-and-conversion-instructions-cp-async-bulk-prefetch-tensor>)

`cp.async.bulk.prefetch.tensor`

Provides a hint to the system to initiate the asynchronous prefetch of tensor data to the cache.

Syntax
    
    
    // global -> shared::cluster:
    cp.async.bulk.prefetch.tensor.dim.L2.src{.load_mode}{.level::cache_hint} [tensorMap, tensorCoords]
                                                                 {, im2colInfo } {, cache-policy}
    
    .src =                { .global }
    .dim =                { .1d, .2d, .3d, .4d, .5d }
    .load_mode =          { .tile, .tile::gather4, .im2col, .im2col::w, .im2col::w::128 }
    .level::cache_hint =  { .L2::cache_hint }
    

Description

`cp.async.bulk.prefetch.tensor` is a non-blocking instruction which may initiate an asynchronous prefetch of tensor data from the location in `.src` statespace to the L2 cache.

The operand `tensorMap` is the generic address of the opaque tensor-map object which resides in `.param` space or `.const` space or `.global` space. The operand `tensorMap` specifies the properties of the tensor copy operation, as described in [Tensor-map](<#tensor-tensormap>). The `tensorMap` is accessed in tensormap proxy. Refer to the _CUDA programming guide_ for creating the tensor-map objects on the host side.

The dimension of the tensor data is specified by the `.dim` modifier.

The vector operand `tensorCoords` specifies the starting coordinates in the tensor data in the global memory from which the copy operation has to be performed. The individual tensor coordinates in `tensorCoords` are of type `.s32`. The format of vector argument `tensorCoords` is dependent on `.load_mode` specified and is as follows:

.load_mode | tensorCoords | Semantics  
---|---|---  
`.tile::gather4` | {col_idx, row_idx0, row_idx1, row_idx2, row_idx3} | Fixed length vector of size 5. The five elements together specify the start co-ordinates of the four rows.  
Rest all | {d0, .., dn} for n = .dim | Vector of n elements where n = .dim. The elements indicate the offset in each of the dimension.  
  
The qualifier `.load_mode` specifies how the data in the source location is copied into the destination location. If `.load_mode` is not specified, it defaults to `.tile`.

In `.tile` mode, the multi-dimensional layout of the source tensor is preserved at the destination. In `.tile::gather4` mode, four rows in the 2-dimnesional source tensor are fetched to L2 cache. Details of `.tile::gather4` modes are described in [.tile::scatter4 and .tile::gather4 modes](<#tensor-tiled-scatter4-gather4-modes>).

In `.im2col` and `.im2col::*` modes, some dimensions of the source tensors are unrolled in a single dimensional column at the destination. Details of the `im2col` and `.im2col::*` modes are described in [im2col mode](<#tensor-im2col-mode>) and [im2col::w and im2col::w::128 modes](<#tensor-im2col-w-w128-modes>) respectively. In `.im2col` and `.im2col::*` modes, the tensor has to be at least 3-dimensional. The vector operand `im2colInfo` can be specified only when `.load_mode` is `.im2col` or `.im2col::w` or `.im2col::w::128`. The format of the vector argument `im2colInfo` is dependent on the exact im2col mode and is as follows:

Exact im2col mode | im2colInfo argument | Semantics  
---|---|---  
`.im2col` | { i2cOffW , i2cOffH , i2cOffD } for `.dim` = `.5d` | A vector of im2col offsets whose vector size is two less than number of dimensions .dim.  
`.im2col::w` | { wHalo, wOffset } | A vector of 2 arguments containing [wHalo](<#tensor-im2col-w-w128-modes-whalo>) and [wOffset](<#tensor-im2col-w-w128-modes-woffset>) arguments.  
`.im2col::w::128`  
  
When the optional argument `cache-policy` is specified, the qualifier `.level::cache_hint` is required. The 64-bit operand `cache-policy` specifies the cache eviction policy that may be used during the memory access.

`cache-policy` is a hint to the cache subsystem and may not always be respected. It is treated as a performance hint only, and does not change the memory consistency behavior of the program.

`cp.async.bulk.prefetch.tensor` is treated as a weak memory operation in the [Memory Consistency Model](<#memory-consistency-model>).

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Support for qualifier `.tile::gather4` introduced in PTX ISA version 8.6.

Support for qualifiers `.im2col::w` and `.im2col::w::128` introduced in PTX ISA version 8.6.

Target ISA Notes

Requires `sm_90` or higher.

Qualifier `.tile::gather4` is supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family


Qualifiers `.im2col::w` and `.im2col::w::128` are supported on following architectures:

  * `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * And are supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

  * `sm_110f` or higher in the same family


Examples
    
    
    .reg .b16 ctaMask, im2colwHalo, im2colOff;
    .reg .u16 i2cOffW, i2cOffH, i2cOffD;
    .reg .b64 l2CachePolicy;
    
    cp.async.bulk.prefetch.tensor.1d.L2.global.tile  [tensorMap0, {tc0}];
    
    @p cp.async.bulk.prefetch.tensor.2d.L2.global    [tensorMap1, {tc0, tc1}];
    
    @p cp.async.bulk.prefetch.tensor.5d.L2.global.im2col
                          [tensorMap2, {tc0, tc1, tc2, tc3, tc4}], {i2cOffW, i2cOffH, i2cOffD};
    
    @p cp.async.bulk.prefetch.tensor.3d.L2.global.im2col.L2::cache_hint
                          [tensorMap3, {tc0, tc1, tc2}], {i2cOffW}, policy;
    
    cp.async.bulk.prefetch.tensor.2d.L2.global.tile::gather4 [tensorMap5, {col_idx, row_idx0, row_idx1, row_idx2, row_idx3}];
    
    cp.async.bulk.prefetch.tensor.4d.L2.global.im2col::w::128
                          [tensorMap4, {t0, t1, t2, t3}], {im2colwHalo, im2colOff};

#####  9.7.9.27.2. [Data Movement and Conversion Instructions: Bulk and Tensor copy completion instructions](<#data-movement-and-conversion-instructions-bulk-tensor-copy-completion>)

######  9.7.9.27.2.1. [Data Movement and Conversion Instructions: `cp.async.bulk.commit_group`](<#data-movement-and-conversion-instructions-cp-async-bulk-commit-group>)

`cp.async.bulk.commit_group`

Commits all prior initiated but uncommitted `cp.async.bulk` instructions into a _cp.async.bulk-group_.

Syntax
    
    
    cp.async.bulk.commit_group;
    

Description

`cp.async.bulk.commit_group` instruction creates a new per-thread _bulk async-group_ and batches all prior `cp{.reduce}.async.bulk.{.prefetch}{.tensor}` instructions satisfying the following conditions into the new _bulk async-group_ :

  * The prior `cp{.reduce}.async.bulk.{.prefetch}{.tensor}` instructions use _bulk_group_ based completion mechanism, and

  * They are initiated by the executing thread but not committed to any _bulk async-group_.


If there are no uncommitted `cp{.reduce}.async.bulk.{.prefetch}{.tensor}` instructions then `cp.async.bulk.commit_group` results in an empty _bulk async-group_.

An executing thread can wait for the completion of all `cp{.reduce}.async.bulk.{.prefetch}{.tensor}` operations in a _bulk async-group_ using `cp.async.bulk.wait_group`.

There is no memory ordering guarantee provided between any two `cp{.reduce}.async.bulk.{.prefetch}{.tensor}` operations within the same _bulk async-group_.

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90` or higher.

Examples
    
    
    cp.async.bulk.commit_group;
    

######  9.7.9.27.2.2. [Data Movement and Conversion Instructions: `cp.async.bulk.wait_group`](<#data-movement-and-conversion-instructions-cp-async-bulk-wait-group>)

`cp.async.bulk.wait_group`

Wait for completion of _bulk async-groups_.

Syntax
    
    
    cp.async.bulk.wait_group{.read} N;
    

Description

`cp.async.bulk.wait_group` instruction will cause the executing thread to wait until only N or fewer of the most recent _bulk async-groups_ are pending and all the prior _bulk async-groups_ committed by the executing threads are complete. For example, when N is 0, the executing thread waits on all the prior _bulk async-groups_ to complete. Operand N is an integer constant.

By default, `cp.async.bulk.wait_group` instruction will cause the executing thread to wait until completion of all the bulk async operations in the specified _bulk async-group_. A bulk async operation includes the following:

  * Optionally, reading from the tensormap.

  * Reading from the source locations.

  * Writing to their respective destination locations.

  * Writes being made visible to the executing thread.


The optional `.read` modifier indicates that the waiting has to be done until all the bulk async operations in the specified _bulk async-group_ have completed:

  1. reading from the tensormap

  2. the reading from their source locations.


PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90` or higher.

Examples
    
    
    cp.async.bulk.wait_group.read   0;
    cp.async.bulk.wait_group        2;