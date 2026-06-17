---
name: ptx-asynchronous-copy
description: An asynchronous copy operation performs the underlying operation asynchronously
  in the background, thus allowing the issuing threads to perform subsequent tasks.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.25. Data Movement and Conversion Instructions: Asynchronous copy

---
title: "9.7.9.25. Data Movement and Conversion Instructions: Asynchronous copy"
section: 9.7.9.25
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.25. Data Movement and Conversion Instructions: Asynchronous copy


An asynchronous copy operation performs the underlying operation asynchronously in the background, thus allowing the issuing threads to perform subsequent tasks.

An asynchronous copy operation can be a _bulk_ operation that operates on a large amount of data, or a _non-bulk_ operation that operates on smaller sized data. The amount of data handled by a bulk asynchronous operation must be a multiple of 16 bytes.

An asynchronous copy operation typically includes the following sequence:

* Optionally, reading from the tensormap.

  * Reading data from the source location(s).

  * Writing data to the destination location(s).

  * Writes being made visible to the executing thread or other threads.

#####  9.7.9.25.1. [Completion Mechanisms for Asynchronous Copy Operations](<#data-movement-and-conversion-instructions-asynchronous-copy-completion-mechanisms>)

A thread must explicitly wait for the completion of an asynchronous copy operation in order to access the result of the operation. Once an asynchronous copy operation is initiated, modifying the source memory location or tensor descriptor or reading from the destination memory location before the asynchronous operation completes, exhibits undefined behavior.

This section describes two asynchronous copy operation completion mechanisms supported in PTX: Async-group mechanism and mbarrier-based mechanism.

Asynchronous operations may be tracked by either of the completion mechanisms or both mechanisms. The tracking mechanism is instruction/instruction-variant specific.

######  9.7.9.25.1.1. [Async-group mechanism](<#data-movement-and-conversion-instructions-asynchronous-copy-completion-mechanisms-async-group>)

When using the async-group completion mechanism, the issuing thread specifies a group of asynchronous operations, called _async-group_ , using a _commit_ operation and tracks the completion of this group using a _wait_ operation. The thread issuing the asynchronous operation must create separate _async-groups_ for bulk and non-bulk asynchronous operations.

A _commit_ operation creates a per-thread _async-group_ containing all prior asynchronous operations tracked by _async-group_ completion and initiated by the executing thread but none of the asynchronous operations following the commit operation. A committed asynchronous operation belongs to a single _async-group_.

When an _async-group_ completes, all the asynchronous operations belonging to that group are complete and the executing thread that initiated the asynchronous operations can read the result of the asynchronous operations. All _async-groups_ committed by an executing thread always complete in the order in which they were committed. There is no ordering between asynchronous operations within an _async-group_.

A typical pattern of using _async-group_ as the completion mechanism is as follows:

  * Initiate the asynchronous operations.

  * Group the asynchronous operations into an _async-group_ using a _commit_ operation.

  * Wait for the completion of the async-group using the wait operation.

  * Once the _async-group_ completes, access the results of all asynchronous operations in that _async-group_.


######  9.7.9.25.1.2. [Mbarrier-based mechanism](<#data-movement-and-conversion-instructions-asynchronous-copy-completion-mechanisms-mbarrier>)

A thread can track the completion of one or more asynchronous operations using the current phase of an _mbarrier object_. When the current phase of the _mbarrier object_ is complete, it implies that all asynchronous operations tracked by this phase are complete, and all threads participating in that _mbarrier object_ can access the result of the asynchronous operations.

The _mbarrier object_ to be used for tracking the completion of an asynchronous operation can be either specified along with the asynchronous operation as part of its syntax, or as a separate operation. For a bulk asynchronous operation, the _mbarrier object_ must be specified in the asynchronous operation, whereas for non-bulk operations, it can be specified after the asynchronous operation.

A typical pattern of using mbarrier-based completion mechanism is as follows:

  * Initiate the asynchronous operations.

  * Set up an _mbarrier object_ to track the asynchronous operations in its current phase, either as part of the asynchronous operation or as a separate operation.

  * Wait for the _mbarrier object_ to complete its current phase using `mbarrier.test_wait` or `mbarrier.try_wait`.

  * Once the `mbarrier.test_wait` or `mbarrier.try_wait` operation returns `True`, access the results of the asynchronous operations tracked by the _mbarrier object_.

#####  9.7.9.25.2. [Async Proxy](<#async-proxy>)

The `cp{.reduce}.async.bulk` operations are performed in the _asynchronous proxy_ (or _async proxy_).

Accessing the same memory location across multiple proxies needs a cross-proxy fence. For the _async proxy_ , `fence.proxy.async` should be used to synchronize memory between _generic proxy_ and the _async proxy_.

The completion of a `cp{.reduce}.async.bulk` operation is followed by an implicit _generic-async_ proxy fence. So the result of the asynchronous operation is made visible to the generic proxy as soon as its completion is observed. _Async-group_ OR _mbarrier-based_ completion mechanism must be used to wait for the completion of the `cp{.reduce}.async.bulk` instructions.

#####  9.7.9.25.3. [Data Movement and Conversion Instructions: Non-bulk copy](<#data-movement-and-conversion-instructions-non-bulk-copy>)

######  9.7.9.25.3.1. [Data Movement and Conversion Instructions: `cp.async`](<#data-movement-and-conversion-instructions-cp-async>)

`cp.async`

Initiates an asynchronous copy operation from one state space to another.

Syntax
    
    
    cp.async.ca.shared{::cta}.global{.level::cache_hint}{.level::prefetch_size}
                             [dst], [src], cp-size{, src-size}{, cache-policy} ;
    cp.async.cg.shared{::cta}.global{.level::cache_hint}{.level::prefetch_size}
                             [dst], [src], 16{, src-size}{, cache-policy} ;
    cp.async.ca.shared{::cta}.global{.level::cache_hint}{.level::prefetch_size}
                             [dst], [src], cp-size{, ignore-src}{, cache-policy} ;
    cp.async.cg.shared{::cta}.global{.level::cache_hint}{.level::prefetch_size}
                             [dst], [src], 16{, ignore-src}{, cache-policy} ;
    
    .level::cache_hint =     { .L2::cache_hint }
    .level::prefetch_size =  { .L2::64B, .L2::128B, .L2::256B }
    cp-size =                { 4, 8, 16 }
    

Description

`cp.async` is a non-blocking instruction which initiates an asynchronous copy operation of data from the location specified by source address operand `src` to the location specified by destination address operand `dst`. Operand `src` specifies a location in the global state space and `dst` specifies a location in the shared state space.

Operand `cp-size` is an integer constant which specifies the size of data in bytes to be copied to the destination `dst`. `cp-size` can only be 4, 8 and 16.

Instruction `cp.async` allows optionally specifying a 32-bit integer operand `src-size`. Operand `src-size` represents the size of the data in bytes to be copied from `src` to `dst` and must be less than `cp-size`. In such case, remaining bytes in destination `dst` are filled with zeros. Specifying `src-size` larger than `cp-size` results in undefined behavior.

The optional and non-immediate predicate argument `ignore-src` specifies whether the data from the source location `src` should be ignored completely. If the source data is ignored then zeros will be copied to destination `dst`. If the argument `ignore-src` is not specified then it defaults to `False`.

Supported alignment requirements and addressing modes for operand `src` and `dst` are described in [Addresses as Operands](<#addresses-as-operands>).

The mandatory `.async` qualifier indicates that the `cp` instruction will initiate the memory copy operation asynchronously and control will return to the executing thread before the copy operation is complete. The executing thread can then use [async-group based completion mechanism](<#data-movement-and-conversion-instructions-asynchronous-copy-completion-mechanisms-async-group>) or the [mbarrier based completion mechanism](<#data-movement-and-conversion-instructions-asynchronous-copy-completion-mechanisms-mbarrier>) to wait for completion of the asynchronous copy operation. No other synchronization mechanism guarantees the completion of the asynchronous copy operations.

There is no ordering guarantee between two `cp.async` operations if they are not explicitly synchronized using `cp.async.wait_all` or `cp.async.wait_group` or [mbarrier instructions](<#parallel-synchronization-and-communication-instructions-mbarrier>).

As described in [Cache Operators](<#cache-operators>), the `.cg` qualifier indicates caching of data only at global level cache L2 and not at L1 whereas `.ca` qualifier indicates caching of data at all levels including L1 cache. Cache operator are treated as performance hints only.

`cp.async` is treated as a weak memory operation in the [Memory Consistency Model](<#memory-consistency-model>).

The `.level::prefetch_size` qualifier is a hint to fetch additional data of the specified size into the respective cache level.The sub-qualifier `prefetch_size` can be set to either of `64B`, `128B`, `256B` thereby allowing the prefetch size to be 64 Bytes, 128 Bytes or 256 Bytes respectively.

The qualifier `.level::prefetch_size` may only be used with `.global` state space and with generic addressing where the address points to `.global` state space. If the generic address does not fall within the address window of the global memory, then the prefetching behavior is undefined.

The `.level::prefetch_size` qualifier is treated as a performance hint only.

When the optional argument `cache-policy` is specified, the qualifier `.level::cache_hint` is required. The 64-bit operand `cache-policy` specifies the cache eviction policy that may be used during the memory access.

The qualifier `.level::cache_hint` is only supported for `.global` state space and for generic addressing where the address points to the `.global` state space.

`cache-policy` is a hint to the cache subsystem and may not always be respected. It is treated as a performance hint only, and does not change the memory consistency behavior of the program.

PTX ISA Notes

Introduced in PTX ISA version 7.0.

Support for `.level::cache_hint` and `.level::prefetch_size` qualifiers introduced in PTX ISA version 7.4.

Support for `ignore-src` operand introduced in PTX ISA version 7.5.

Support for sub-qualifier `::cta` introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_80` or higher.

Sub-qualifier `::cta` requires `sm_30` or higher.

Examples
    
    
    cp.async.ca.shared.global  [shrd],    [gbl + 4], 4;
    cp.async.ca.shared::cta.global  [%r0 + 8], [%r1],     8;
    cp.async.cg.shared.global  [%r2],     [%r3],     16;
    
    cp.async.cg.shared.global.L2::64B   [%r2],      [%r3],     16;
    cp.async.cg.shared.global.L2::128B  [%r0 + 16], [%r1],     16;
    cp.async.cg.shared.global.L2::256B  [%r2 + 32], [%r3],     16;
    
    createpolicy.fractional.L2::evict_last.L2::evict_unchanged.b64 cache-policy, 0.25;
    cp.async.ca.shared.global.L2::cache_hint [%r2], [%r1], 4, cache-policy;
    
    cp.async.ca.shared.global                   [shrd], [gbl], 4, p;
    cp.async.cg.shared.global.L2::cache_hint   [%r0], [%r2], 16, q, cache-policy;
    

######  9.7.9.25.3.2. [Data Movement and Conversion Instructions: `cp.async.commit_group`](<#data-movement-and-conversion-instructions-cp-async-commit-group>)

`cp.async.commit_group`

Commits all prior initiated but uncommitted `cp.async` instructions into a _cp.async-group_.

Syntax
    
    
    cp.async.commit_group ;
    

Description

`cp.async.commit_group` instruction creates a new _cp.async-group_ per thread and batches all prior `cp.async` instructions initiated by the executing thread but not committed to any _cp.async-group_ into the new _cp.async-group_. If there are no uncommitted `cp.async` instructions then `cp.async.commit_group` results in an empty _cp.async-group._

An executing thread can wait for the completion of all `cp.async` operations in a _cp.async-group_ using `cp.async.wait_group`.

There is no memory ordering guarantee provided between any two `cp.async` operations within the same _cp.async-group_. So two or more `cp.async` operations within a _cp.async-group_ copying data to the same location results in undefined behavior.

PTX ISA Notes

Introduced in PTX ISA version 7.0.

Target ISA Notes

Requires `sm_80` or higher.

Examples
    
    
    // Example 1:
    cp.async.ca.shared.global [shrd], [gbl], 4;
    cp.async.commit_group ; // Marks the end of a cp.async group
    
    // Example 2:
    cp.async.ca.shared.global [shrd1],   [gbl1],   8;
    cp.async.ca.shared.global [shrd1+8], [gbl1+8], 8;
    cp.async.commit_group ; // Marks the end of cp.async group 1
    
    cp.async.ca.shared.global [shrd2],    [gbl2],    16;
    cp.async.cg.shared.global [shrd2+16], [gbl2+16], 16;
    cp.async.commit_group ; // Marks the end of cp.async group 2
    

######  9.7.9.25.3.3. [Data Movement and Conversion Instructions: `cp.async.wait_group` / `cp.async.wait_all`](<#data-movement-and-conversion-instructions-cp-async-wait-group>)

`cp.async.wait_group`, `cp.async.wait_all`

Wait for completion of prior asynchronous copy operations.

Syntax
    
    
    cp.async.wait_group N;
    cp.async.wait_all ;
    

Description

`cp.async.wait_group` instruction will cause executing thread to wait till only `N` or fewer of the most recent _cp.async-group_ s are pending and all the prior _cp.async-group_ s committed by the executing threads are complete. For example, when `N` is 0, the executing thread waits on all the prior _cp.async-group_ s to complete. Operand `N` is an integer constant.

`cp.async.wait_all` is equivalent to :
    
    
    cp.async.commit_group;
    cp.async.wait_group 0;
    

An empty _cp.async-group_ is considered to be trivially complete.

Writes performed by `cp.async` operations are made visible to the executing thread only after:

  1. The completion of `cp.async.wait_all` or

  2. The completion of `cp.async.wait_group` on the _cp.async-group_ in which the `cp.async` belongs to or

  3. [mbarrier.test_wait](<#parallel-synchronization-and-communication-instructions-mbarrier-test-wait-try-wait>) returns `True` on an _mbarrier object_ which is tracking the completion of the `cp.async` operation.


There is no ordering between two `cp.async` operations that are not synchronized with `cp.async.wait_all` or `cp.async.wait_group` or [mbarrier objects](<#parallel-synchronization-and-communication-instructions-mbarrier>).

`cp.async.wait_group` and `cp.async.wait_all` does not provide any ordering and visibility guarantees for any other memory operation apart from `cp.async`.

PTX ISA Notes

Introduced in PTX ISA version 7.0.

Target ISA Notes

Requires `sm_80` or higher.

Examples
    
    
    // Example of .wait_all:
    cp.async.ca.shared.global [shrd1], [gbl1], 4;
    cp.async.cg.shared.global [shrd2], [gbl2], 16;
    cp.async.wait_all;  // waits for all prior cp.async to complete
    
    // Example of .wait_group :
    cp.async.ca.shared.global [shrd3], [gbl3], 8;
    cp.async.commit_group;  // End of group 1
    
    cp.async.cg.shared.global [shrd4], [gbl4], 16;
    cp.async.commit_group;  // End of group 2
    
    cp.async.cg.shared.global [shrd5], [gbl5], 16;
    cp.async.commit_group;  // End of group 3
    
    cp.async.wait_group 1;  // waits for group 1 and group 2 to complete

#####  9.7.9.25.4. [Data Movement and Conversion Instructions: Bulk copy](<#data-movement-and-conversion-instructions-bulk-copy>)

######  9.7.9.25.4.1. [Data Movement and Conversion Instructions: `cp.async.bulk`](<#data-movement-and-conversion-instructions-cp-async-bulk>)

`cp.async.bulk`

Initiates an asynchronous copy operation from one state space to another.

Syntax
    
    
    // global -> shared::cta
    cp.async.bulk.dst.src.completion_mechanism{.level::cache_hint}
                          [dstMem], [srcMem], size, [mbar] {, cache-policy}
    
    .dst =                  { .shared::cta }
    .src =                  { .global }
    .completion_mechanism = { .mbarrier::complete_tx::bytes }
    .level::cache_hint =    { .L2::cache_hint }
    
    
    // global -> shared::cluster
    cp.async.bulk.dst.src.completion_mechanism{.multicast}{.level::cache_hint}
                          [dstMem], [srcMem], size, [mbar] {, ctaMask} {, cache-policy}
    
    .dst =                  { .shared::cluster }
    .src =                  { .global }
    .completion_mechanism = { .mbarrier::complete_tx::bytes }
    .level::cache_hint =    { .L2::cache_hint }
    .multicast =            { .multicast::cluster  }
    
    
    // shared::cta -> shared::cluster
    cp.async.bulk.dst.src.completion_mechanism [dstMem], [srcMem], size, [mbar]
    
    .dst =                  { .shared::cluster }
    .src =                  { .shared::cta }
    .completion_mechanism = { .mbarrier::complete_tx::bytes }
    
    
    // shared::cta -> global
    cp.async.bulk.dst.src.completion_mechanism{.level::cache_hint}{.cp_mask}
                          [dstMem], [srcMem], size {, cache-policy} {, byteMask}
    
    .dst =                  { .global }
    .src =                  { .shared::cta }
    .completion_mechanism = { .bulk_group }
    .level::cache_hint =    { .L2::cache_hint }
    

Description

`cp.async.bulk` is a non-blocking instruction which initiates an asynchronous bulk-copy operation from the location specified by source address operand `srcMem` to the location specified by destination address operand `dstMem`.

The direction of bulk-copy is from the state space specified by the `.src` modifier to the state space specified by the `.dst` modifiers.

The 32-bit operand `size` specifies the amount of memory to be copied, in terms of number of bytes. `size` must be a multiple of 16. If the value is not a multiple of 16, then the behavior is undefined. The memory range `[dstMem, dstMem + size - 1]` must not overflow the destination memory space and the memory range `[srcMem, srcMem + size - 1]` must not overflow the source memory space. Otherwise, the behavior is undefined. The addresses `dstMem` and `srcMem` must be aligned to 16 bytes.

When the destination of the copy is `.shared::cta` the destination address has to be in the shared memory of the executing CTA within the cluster, otherwise the behavior is undefined.

When the source of the copy is `.shared::cta` and the destination is `.shared::cluster`, the destination has to be in the shared memory of a different CTA within the cluster.

The modifier `.completion_mechanism` specifies the completion mechanism that is supported on the instruction variant. The completion mechanisms that are supported for different variants are summarized in the following table:

.completion-mechanism | `.dst` | `.src` | Completion mechanism  
---|---|---|---  
`.mbarrier::...` | `.shared::cta` | `.global` | mbarrier based  
`.shared::cluster` | `.global`  
`.shared::cluster` | `.shared::cta`  
`.bulk_group` | `.global` | `.shared::cta` | _Bulk async-group_ based  
  
The modifier `.mbarrier::complete_tx::bytes` specifies that the `cp.async.bulk` variant uses mbarrier based completion mechanism. The [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation, with `completeCount` argument equal to amount of data copied in bytes, will be performed on the mbarrier object specified by the operand `mbar`. This instruction accesses its `mbarrier` operand using generic-proxy.

The modifier `.bulk_group` specifies that the `cp.async.bulk` variant uses _bulk async-group_ based completion mechanism.

The optional modifier `.multicast::cluster` allows copying of data from global memory to shared memory of multiple CTAs in the cluster. Operand `ctaMask` specifies the destination CTAs in the cluster such that each bit position in the 16-bit `ctaMask` operand corresponds to the `%ctaid` of the destination CTA. The source data is multicast to the same CTA-relative offset as `dstMem` in the shared memory of each destination CTA. The mbarrier signal is also multicast to the same CTA-relative offset as `mbar` in the shared memory of the destination CTA.

When the optional argument `cache-policy` is specified, the qualifier `.level::cache_hint` is required. The 64-bit operand `cache-policy` specifies the cache eviction policy that may be used during the memory access.

`cache-policy` is a hint to the cache subsystem and may not always be respected. It is treated as a performance hint only, and does not change the memory consistency behavior of the program. The qualifier `.level::cache_hint` is only supported when at least one of the `.src` or `.dst` statespaces is `.global` state space.

When the optional qualifier `.cp_mask` is specified, the argument `byteMask` is required. The i-th bit in the 16-bit wide `byteMask` operand specifies whether the i-th byte of each 16-byte wide chunk of source data is copied to the destination. If the bit is set, the byte is copied.

The copy operation in `cp.async.bulk` is treated as a weak memory operation and the [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation on the mbarrier has `.release` semantics at the `.cluster` scope as described in the [Memory Consistency Model](<#memory-consistency-model>).

Notes

`.multicast::cluster` qualifier is optimized for target architecture `sm_90a`/`sm_100f`/`sm_100a`/ `sm_103f`/`sm_103a`/`sm_110f`/`sm_110a` and may have substantially reduced performance on other targets and hence `.multicast::cluster` is advised to be used with `.target` `sm_90a`/`sm_100f`/ `sm_100a`/`sm_103f`/`sm_103a`/`sm_110f`/`sm_110a`.

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Support for `.shared::cta` as destination state space is introduced in PTX ISA version 8.6.

Support for `.cp_mask` qualifier introduced in PTX ISA version 8.6.

Target ISA Notes

Requires `sm_90` or higher.

`.multicast::cluster` qualifier advised to be used with `.target` `sm_90a` or `sm_100f` or `sm_100a` or `sm_103f` or `sm_103a` or `sm_110f` or `sm_110a`.

Support for `.cp_mask` qualifier requires `sm_100` or higher.

Examples
    
    
    // .global -> .shared::cta (strictly non-remote):
    cp.async.bulk.shared::cta.global.mbarrier::complete_tx::bytes [dstMem], [srcMem], size, [mbar];
    
    cp.async.bulk.shared::cta.global.mbarrier::complete_tx::bytes.L2::cache_hint
                                                 [dstMem], [srcMem], size, [mbar], cache-policy;
    
    // .global -> .shared::cluster:
    cp.async.bulk.shared::cluster.global.mbarrier::complete_tx::bytes [dstMem], [srcMem], size, [mbar];
    
    cp.async.bulk.shared::cluster.global.mbarrier::complete_tx::bytes.multicast::cluster
                                                 [dstMem], [srcMem], size, [mbar], ctaMask;
    
    cp.async.bulk.shared::cluster.global.mbarrier::complete_tx::bytes.L2::cache_hint
                                                 [dstMem], [srcMem], size, [mbar], cache-policy;
    
    
    // .shared::cta -> .shared::cluster (strictly remote):
    cp.async.bulk.shared::cluster.shared::cta.mbarrier::complete_tx::bytes [dstMem], [srcMem], size, [mbar];
    
    // .shared::cta -> .global:
    cp.async.bulk.global.shared::cta.bulk_group [dstMem], [srcMem], size;
    
    cp.async.bulk.global.shared::cta.bulk_group.L2::cache_hint} [dstMem], [srcMem], size, cache-policy;
    
    // .shared::cta -> .global with .cp_mask:
    cp.async.bulk.global.shared::cta.bulk_group.L2::cache_hint.cp_mask [dstMem], [srcMem], size, cache-policy, byteMask;
    

######  9.7.9.25.4.2. [Data Movement and Conversion Instructions: `cp.reduce.async.bulk`](<#data-movement-and-conversion-instructions-cp-reduce-async-bulk>)

`cp.reduce.async.bulk`

Initiates an asynchronous reduction operation.

Syntax
    
    
    cp.reduce.async.bulk.dst.src.completion_mechanism.redOp.type
                  [dstMem], [srcMem], size, [mbar]
    
    .dst =                  { .shared::cluster }
    .src =                  { .shared::cta }
    .completion_mechanism = { .mbarrier::complete_tx::bytes }
    .redOp=                 { .and, .or, .xor,
                              .add, .inc, .dec,
                              .min, .max }
    .type =                 { .b32, .u32, .s32, .b64, .u64 }
    
    
    cp.reduce.async.bulk.dst.src.completion_mechanism{.level::cache_hint}.redOp.type
                   [dstMem], [srcMem], size{, cache-policy}
    
    .dst =                  { .global      }
    .src =                  { .shared::cta }
    .completion_mechanism = { .bulk_group }
    .level::cache_hint    = { .L2::cache_hint }
    .redOp=                 { .and, .or, .xor,
                              .add, .inc, .dec,
                              .min, .max }
    .type =                 { .f16, .bf16, .b32, .u32, .s32, .b64, .u64, .s64, .f32, .f64 }
    
    
    cp.reduce.async.bulk.dst.src.completion_mechanism{.level::cache_hint}.add.noftz.type
                   [dstMem], [srcMem], size{, cache-policy}
    .dst  =                 { .global }
    .src  =                 { .shared::cta }
    .completion_mechanism = { .bulk_group }
    .type =                 { .f16, .bf16 }
    

Description

`cp.reduce.async.bulk` is a non-blocking instruction which initiates an asynchronous reduction operation on an array of memory locations specified by the destination address operand `dstMem` with the source array whose location is specified by the source address operand `srcMem`. The size of the source and the destination array must be the same and is specified by the operand `size`.

Each data element in the destination array is reduced inline with the corresponding data element in the source array with the reduction operation specified by the modifier `.redOp`. The type of each data element in the source and the destination array is specified by the modifier `.type`.

The source address operand `srcMem` is located in the state space specified by `.src` and the destination address operand `dstMem` is located in the state specified by the `.dst`.

The 32-bit operand `size` specifies the amount of memory to be copied from the source location and used in the reduction operation, in terms of number of bytes. `size` must be a multiple of 16. If the value is not a multiple of 16, then the behavior is undefined. The memory range `[dstMem, dstMem + size - 1]` must not overflow the destination memory space and the memory range `[srcMem, srcMem + size - 1]` must not overflow the source memory space. Otherwise, the behavior is undefined. The addresses `dstMem` and `srcMem` must be aligned to 16 bytes.

The operations supported by `.redOp` are classified as follows:

  * The bit-size operations are `.and`, `.or`, and `.xor`.

  * The integer operations are `.add`, `.inc`, `.dec`, `.min`, and `.max`. The `.inc` and `.dec` operations return a result in the range `[0..x]` where `x` is the value at the source state space.

  * The floating point operation `.add` rounds to the nearest even. The current implementation of `cp.reduce.async.bulk.add.f32` flushes subnormal inputs and results to sign-preserving zero. The `cp.reduce.async.bulk.add.f16` and `cp.reduce.async.bulk.add.bf16` operations require `.noftz` qualifier. It preserves input and result subnormals, and does not flush them to zero.


The following table describes the valid combinations of `.redOp` and element type:

`.dst` | `.redOp` | Element type  
---|---|---  
`.shared::cluster` | `.add` | `.u32`, `.s32`, `.u64`  
`.min`, `.max` | `.u32`, `.s32`  
`.inc`, `.dec` | `.u32`  
`.and`, `.or`, `.xor` | `.b32`  
`.global` | `.add` | `.u32`, `.s32`, `.u64`, `.f32`, `.f64`, `.f16`, `.bf16`  
`.min`, `.max` | `.u32`, `.s32`, `.u64`, `.s64`, `.f16`, `.bf16`  
`.inc`, `.dec` | `.u32`  
`.and`, `.or`, `.xor` | `.b32`, `.b64`  
  
The modifier `.completion_mechanism` specifies the completion mechanism that is supported on the instruction variant. The completion mechanisms that are supported for different variants are summarized in the following table:

.completion-mechanism | `.dst` | `.src` | Completion mechanism  
---|---|---|---  
`.mbarrier::...` | `.shared::cluster` | `.global` | mbarrier based  
`.shared::cluster` | `.shared::cta`  
`.bulk_group` | `.global` | `.shared::cta` | _Bulk async-group_ based  
  
The modifier `.mbarrier::complete_tx::bytes` specifies that the `cp.reduce.async.bulk` variant uses mbarrier based completion mechanism. The [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation, with `completeCount` argument equal to amount of data copied in bytes, will be performed on the mbarrier object specified by the operand `mbar`. This instruction accesses its `mbarrier` operand using generic-proxy.

The modifier `.bulk_group` specifies that the `cp.reduce.async.bulk` variant uses _bulk async-group_ based completion mechanism.

When the optional argument `cache-policy` is specified, the qualifier `.level::cache_hint` is required. The 64-bit operand `cache-policy` specifies the cache eviction policy that may be used during the memory access.

`cache-policy` is a hint to the cache subsystem and may not always be respected. It is treated as a performance hint only, and does not change the memory consistency behavior of the program. The qualifier `.level::cache_hint` is only supported when at least one of the `.src` or `.dst` statespaces is `.global` state space.

Each reduction operation performed by the `cp.reduce.async.bulk` has individually `.relaxed.gpu` memory ordering semantics. The load operations in `cp.reduce.async.bulk` are treated as weak memory operation and the [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation on the mbarrier has `.release` semantics at the `.cluster` scope as described in the [Memory Consistency Model](<#memory-consistency-model>).

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90` or higher.

Examples
    
    
    cp.reduce.async.bulk.shared::cluster.shared::cta.mbarrier::complete_tx::bytes.add.u64
                                                                      [dstMem], [srcMem], size, [mbar];
    
    cp.reduce.async.bulk.shared::cluster.shared::cta.mbarrier::complete_tx::bytes.min.s32
                                                                      [dstMem], [srcMem], size, [mbar];
    
    cp.reduce.async.bulk.global.shared::cta.bulk_group.min.f16 [dstMem], [srcMem], size;
    
    cp.reduce.async.bulk.global.shared::cta.bulk_group.L2::cache_hint.xor.s32 [dstMem], [srcMem], size, policy;
    
    cp.reduce.async.bulk.global.shared::cta.bulk_group.add.noftz.f16 [dstMem], [srcMem], size;
    

######  9.7.9.25.4.3. [Data Movement and Conversion Instructions: `cp.async.bulk.prefetch`](<#data-movement-and-conversion-instructions-cp-async-bulk-prefetch>)

`cp.async.bulk.prefetch`

Provides a hint to the system to initiate the asynchronous prefetch of data to the cache.

Syntax
    
    
    cp.async.bulk.prefetch.L2.src{.level::cache_hint}   [srcMem], size {, cache-policy}
    
    .src =                { .global }
    .level::cache_hint =  { .L2::cache_hint }
    

Description

`cp.async.bulk.prefetch` is a non-blocking instruction which may initiate an asynchronous prefetch of data from the location specified by source address operand `srcMem`, in `.src` statespace, to the L2 cache.

The 32-bit operand `size` specifies the amount of memory to be prefetched in terms of number of bytes. `size` must be a multiple of 16. If the value is not a multiple of 16, then the behavior is undefined. The address `srcMem` must be aligned to 16 bytes.

When the optional argument `cache-policy` is specified, the qualifier `.level::cache_hint` is required. The 64-bit operand `cache-policy` specifies the cache eviction policy that may be used during the memory access.

`cache-policy` is a hint to the cache subsystem and may not always be respected. It is treated as a performance hint only, and does not change the memory consistency behavior of the program.

`cp.async.bulk.prefetch` is treated as a weak memory operation in the [Memory Consistency Model](<#memory-consistency-model>).

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90` or higher.

Examples
    
    
    cp.async.bulk.prefetch.L2.global                 [srcMem], size;
    
    cp.async.bulk.prefetch.L2.global.L2::cache_hint  [srcMem], size, policy;