---
name: ptx-mbarrier
description: '`mbarrier` is a barrier created in shared memory that supports :'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.15. Parallel Synchronization and Communication Instructions:mbarrier

---
title: "9.7.13.15. Parallel Synchronization and Communication Instructions:mbarrier"
section: 9.7.13.15
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.15. Parallel Synchronization and Communication Instructions:mbarrier


`mbarrier` is a barrier created in shared memory that supports :

* Synchronizing any subset of threads within a CTA

  * One-way synchronization of threads across CTAs of a cluster. As noted in [mbarrier support with shared memory](<#parallel-synchronization-and-communication-instructions-mbarrier-smem>), threads can perform only _arrive_ operations but not _*_wait_ on an mbarrier located in `shared::cluster` space.

  * Waiting for completion of asynchronous memory operations initiated by a thread and making them visible to other threads.

An _mbarrier object_ is an opaque object in memory which can be initialized and invalidated using :

* `mbarrier.init`

  * `mbarrier.inval`

Operations supported on _mbarrier object_ s are :

* `mbarrier.expect_tx`

  * `mbarrier.complete_tx`

  * `mbarrier.arrive`

  * `mbarrier.arrive_drop`

  * `mbarrier.test_wait`

  * `mbarrier.try_wait`

  * `mbarrier.pending_count`

  * `cp.async.mbarrier.arrive`

Performing any _mbarrier_ operation except `mbarrier.init` on an uninitialized _mbarrier object_ results in undefined behavior. Performing any _non-mbarrier_ or `mbarrier.init` operations on an initialized _mbarrier object_ results in undefined behavior.

Unlike `bar{.cta}`/`barrier{.cta}` instructions which can access a limited number of barriers per CTA, _mbarrier objects_ are user defined and are only limited by the total shared memory size available.

_mbarrier_ operations enable threads to perform useful work after the arrival at the _mbarrier_ and before waiting for the _mbarrier_ to complete.

#####  9.7.13.15.1. [Size and alignment of mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-size-alignment>)

An mbarrier object is an opaque object with the following type and alignment requirements :

Type | Alignment (bytes) | Memory space  
---|---|---  
`.b64` | 8 | `.shared`

#####  9.7.13.15.2. [Contents of the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-contents>)  
  
An opaque _mbarrier object_ keeps track of the following information :

  * Current phase of the _mbarrier object_

  * Count of pending arrivals for the current phase of the _mbarrier object_

  * Count of expected arrivals for the next phase of the _mbarrier object_

  * Count of pending asynchronous memory operations (or transactions) tracked by the current phase of the _mbarrier object_. This is also referred to as _tx-count_.


An _mbarrier object_ progresses through a sequence of phases where each phase is defined by threads performing an expected number of [arrive-on](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) operations.

The valid range of each of the counts is as shown below:

Count name | Minimum value | Maximum value  
---|---|---  
Expected arrival count | 1 | 220 \- 1  
Pending arrival count | 0 | 220 \- 1  
tx-count | -(220 \- 1) | 220 \- 1

#####  9.7.13.15.3. [Lifecycle of the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-lifecycle>)  
  
The _mbarrier object_ must be initialized prior to use.

An _mbarrier object_ is used to synchronize threads and asynchronous memory operations.

An _mbarrier object_ may be used to perform a sequence of such synchronizations.

An _mbarrier object_ must be invalidated to repurpose its memory for any purpose, including repurposing it for another mbarrier object.

#####  9.7.13.15.4. [Phase of the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-phase>)

The phase of an _mbarrier object_ is the number of times the _mbarrier object_ has been used to synchronize threads and [asynchronous](<#program-order-async-operations>) operations. In each phase {0, 1, 2, …}, threads perform in program order :

  * [arrive-on](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) operations to complete the current phase and

  * _test_wait_ / _try_wait_ operations to check for the completion of the current phase.


An _mbarrier object_ is automatically reinitialized upon completion of the current phase for immediate use in the next phase. The current phase is incomplete and all prior phases are complete.

For each phase of the mbarrier object, at least one _test_wait_ or _try_wait_ operation must be performed which returns `True` for `waitComplete` before an [arrive-on](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) operation in the subsequent phase.

#####  9.7.13.15.5. [Tracking asynchronous operations by the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-tracking-async-operations>)

Starting with the Hopper architecture (`sm_9x`), _mbarrier object_ supports a new count, called _tx-count_ , which is used for tracking the completion of asynchronous memory operations or transactions. _tx-count_ tracks the number of asynchronous transactions, in units specified by the asynchronous memory operation, that are outstanding and yet to be complete.

The _tx-count_ of an _mbarrier object_ must be set to the total amount of asynchronous memory operations, in units as specified by the asynchronous operations, to be tracked by the current phase. Upon completion of each of the asynchronous operations, the [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation will be performed on the _mbarrier object_ and thus progress the mbarrier towards the completion of the current phase.

######  9.7.13.15.5.1. [expect-tx operation](<#parallel-synchronization-and-communication-instructions-mbarrier-expect-tx-operation>)

The _expect-tx_ operation, with an `expectCount` argument, increases the _tx-count_ of an _mbarrier object_ by the value specified by `expectCount`. This sets the current phase of the _mbarrier object_ to expect and track the completion of additional asynchronous transactions.

######  9.7.13.15.5.2. [complete-tx operation](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>)

The _complete-tx_ operation, with an `completeCount` argument, on an _mbarrier object_ consists of the following:

mbarrier signaling
    

Signals the completion of asynchronous transactions that were tracked by the current phase. As a result of this, _tx-count_ is decremented by `completeCount`.

mbarrier potentially completing the current phase
    

If the current phase has been completed then the mbarrier transitions to the next phase. Refer to [Phase Completion of the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-phase-completion>) for details on phase completion requirements and phase transition process.

#####  9.7.13.15.6. [Phase Completion of the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-phase-completion>)

The requirements for completion of the current phase are described below. Upon completion of the current phase, the phase transitions to the subsequent phase as described below.

Current phase completion requirements
    

An _mbarrier object_ completes the current phase when all of the following conditions are met:

  * The count of the pending arrivals has reached zero.

  * The _tx-count_ has reached zero.


Phase transition
    

When an _mbarrier_ object completes the current phase, the following actions are performed atomically:

  * The _mbarrier object_ transitions to the next phase.

  * The pending arrival count is reinitialized to the expected arrival count.

#####  9.7.13.15.7. [Arrive-on operation on mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>)

An _arrive-on_ operation, with an optional _count_ argument, on an _mbarrier object_ consists of the following 2 steps :

  * mbarrier signalling:

Signals the arrival of the executing thread OR completion of the asynchronous instruction which signals the arrive-on operation initiated by the executing thread on the _mbarrier object_. As a result of this, the pending arrival count is decremented by _count_. If the _count_ argument is not specified, then it defaults to 1.

  * mbarrier potentially completing the current phase:

If the current phase has been completed then the mbarrier transitions to the next phase. Refer to [Phase Completion of the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-phase-completion>) for details on phase completion requirements and phase transition process.

#####  9.7.13.15.8. [mbarrier support with shared memory](<#parallel-synchronization-and-communication-instructions-mbarrier-smem>)

The following table summarizes the support of various mbarrier operations on _mbarrier objects_ located at different shared memory locations:

mbarrier operations | `.shared::cta` | `.shared::cluster`  
---|---|---  
`mbarrier.arrive` | Supported | Supported, cannot return result  
`mbarrier.expect_tx` | Supported | Supported  
`mbarrier.complete_tx` | Supported | Supported  
Other mbarrier operations | Supported | Not supported

#####  9.7.13.15.9. [Parallel Synchronization and Communication Instructions: `mbarrier.init`](<#parallel-synchronization-and-communication-instructions-mbarrier-init>)  
  
`mbarrier.init`

Initialize the _mbarrier object_.

Syntax
    
    
    mbarrier.init{.shared{::cta}}.b64 [addr], count;
    

Description

`mbarrier.init` initializes the _mbarrier object_ at the location specified by the address operand `addr` with the unsigned 32-bit integer `count`. The value of operand count must be in the range as specified in [Contents of the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-contents>).

Initialization of the _mbarrier object_ involves :

  * Initializing the current phase to 0.

  * Initializing the expected arrival count to `count`.

  * Initializing the pending arrival count to `count`.

  * Initializing the _tx-count_ to 0.


The valid range of values for the operand `count` is [1, …, 220 \- 1]. Refer [Contents of the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-contents>) for the valid range of values for the various constituents of the mbarrier.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the address specified by `addr` does not fall within the address window of `.shared::cta` state space then the behavior is undefined.

Supported addressing modes for operand `addr` is as described in [Addresses as Operands](<#addresses-as-operands>). Alignment for operand `addr` is as described in the [Size and alignment of mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-size-alignment>).

The behavior of performing an `mbarrier.init` operation on a memory location containing a valid _mbarrier object_ is undefined; invalidate the _mbarrier object_ using `mbarrier.inval` first, before repurposing the memory location for any other purpose, including another _mbarrier object_.

PTX ISA Notes

Introduced in PTX ISA version 7.0.

Support for sub-qualifier `::cta` on `.shared` introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_80` or higher.

Examples
    
    
    .shared .b64 shMem, shMem2;
    .reg    .b64 addr;
    .reg    .b32 %r1;
    
    cvta.shared.u64          addr, shMem2;
    mbarrier.init.b64        [addr],   %r1;
    bar.cta.sync             0;
    // ... other mbarrier operations on addr
    
    mbarrier.init.shared::cta.b64 [shMem], 12;
    bar.sync                 0;
    // ... other mbarrier operations on shMem

#####  9.7.13.15.10. [Parallel Synchronization and Communication Instructions: `mbarrier.inval`](<#parallel-synchronization-and-communication-instructions-mbarrier-inval>)

`mbarrier.inval`

Invalidates the _mbarrier object_.

Syntax
    
    
    mbarrier.inval{.shared{::cta}}.b64 [addr];
    

Description

`mbarrier.inval` invalidates the _mbarrier object_ at the location specified by the address operand `addr`.

An _mbarrier object_ must be invalidated before using its memory location for any other purpose.

Performing any _mbarrier_ operation except `mbarrier.init` on a memory location that does not contain a valid _mbarrier object_ , results in undefined behaviour.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the address specified by `addr` does not fall within the address window of `.shared::cta` state space then the behavior is undefined.

Supported addressing modes for operand `addr` is as described in [Addresses as Operands](<#addresses-as-operands>). Alignment for operand `addr` is as described in the [Size and alignment of mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-size-alignment>).

PTX ISA Notes

Introduced in PTX ISA version 7.0.

Support for sub-qualifier `::cta` on `.shared` introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_80` or higher.

Examples
    
    
    .shared .b64 shmem;
    .reg    .b64 addr;
    .reg    .b32 %r1;
    .reg    .pred t0;
    
    // Example 1 :
    bar.sync                      0;
    @t0 mbarrier.init.b64     [addr], %r1;
    // ... other mbarrier operations on addr
    bar.sync                      0;
    @t0 mbarrier.inval.b64    [addr];
    
    
    // Example 2 :
    bar.cta.sync                  0;
    mbarrier.init.shared.b64           [shmem], 12;
    // ... other mbarrier operations on shmem
    bar.cta.sync                  0;
    @t0 mbarrier.inval.shared.b64      [shmem];
    
    // shmem can be reused here for unrelated use :
    bar.cta.sync                  0;
    st.shared.b64                      [shmem], ...;
    
    // shmem can be re-initialized as mbarrier object :
    bar.cta.sync                  0;
    @t0 mbarrier.init.shared.b64       [shmem], 24;
    // ... other mbarrier operations on shmem
    bar.cta.sync                  0;
    @t0 mbarrier.inval.shared::cta.b64 [shmem];

#####  9.7.13.15.11. [Parallel Synchronization and Communication Instructions: `mbarrier.expect_tx`](<#parallel-synchronization-and-communication-instructions-mbarrier-expect-tx>)

`mbarrier.expect_tx`

Perfoms [expect-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-expect-tx-operation>) operation on the _mbarrier object_.

Syntax
    
    
    mbarrier.expect_tx{.sem.scope}{.space}.b64 [addr], txCount;
    
    .sem   = { .relaxed }
    .scope = { .cta, .cluster }
    .space = { .shared{::cta}, .shared::cluster }
    

Description

A thread executing `mbarrier.expect_tx` performs an [expect-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-expect-tx-operation>) operation on the _mbarrier object_ at the location specified by the address operand `addr`. The 32-bit unsigned integer operand `txCount` specifies the `expectCount` argument to the _expect-tx_ operation.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the address specified by `addr` does not fall within the address window of `.shared::cta` or `.shared::cluster` state space then the behavior is undefined.

Supported addressing modes for operand `addr` are as described in [Addresses as Operands](<#addresses-as-operands>). Alignment for operand `addr` is as described in the [Size and alignment of mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-size-alignment>).

The optional `.sem` qualifier specifies a memory synchronizing effect as described in the [Memory Consistency Model](<#memory-consistency-model>). The `.relaxed` qualifier does not provide any memory ordering semantics and visibility guarantees.

The optional `.scope` qualifier indicates the set of threads that directly observe the memory synchronizing effect of this operation, as described in the [Memory Consistency Model](<#memory-consistency-model>).

Qualifiers `.sem` and `.scope` must be specified together.

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90` or higher.

Examples
    
    
    mbarrier.expect_tx.b64                       [addr], 32;
    mbarrier.expect_tx.relaxed.cta.shared.b64    [mbarObj1], 512;
    mbarrier.expect_tx.relaxed.cta.shared.b64    [mbarObj2], 512;

#####  9.7.13.15.12. [Parallel Synchronization and Communication Instructions: `mbarrier.complete_tx`](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx>)

`mbarrier.complete_tx`

Perfoms [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation on the _mbarrier object_.

Syntax
    
    
    mbarrier.complete_tx{.sem.scope}{.space}.b64 [addr], txCount;
    
    .sem   = { .relaxed }
    .scope = { .cta, .cluster }
    .space = { .shared{::cta}, .shared::cluster }
    

Description

A thread executing `mbarrier.complete_tx` performs a [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation on the _mbarrier object_ at the location specified by the address operand `addr`. The 32-bit unsigned integer operand `txCount` specifies the `completeCount` argument to the _complete-tx_ operation.

`mbarrier.complete_tx` does not involve any asynchronous memory operations and only simulates the completion of an asynchronous memory operation and its side effect of signaling to the _mbarrier object_.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the address specified by `addr` does not fall within the address window of `.shared::cta` or `.shared::cluster` state space then the behavior is undefined.

Supported addressing modes for operand `addr` are as described in [Addresses as Operands](<#addresses-as-operands>). Alignment for operand `addr` is as described in the [Size and alignment of mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-size-alignment>).

The optional `.sem` qualifier specifies a memory synchronizing effect as described in the [Memory Consistency Model](<#memory-consistency-model>). The `.relaxed` qualifier does not provide any memory ordering semantics and visibility guarantees.

The optional `.scope` qualifier indicates the set of threads that directly observe the memory synchronizing effect of this operation, as described in the [Memory Consistency Model](<#memory-consistency-model>).

Qualifiers `.sem` and `.scope` must be specified together.

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90` or higher.

Examples
    
    
    mbarrier.complete_tx.b64             [addr],     32;
    mbarrier.complete_tx.shared.b64      [mbarObj1], 512;
    mbarrier.complete_tx.relaxed.cta.b64 [addr2],    32;

#####  9.7.13.15.13. [Parallel Synchronization and Communication Instructions: `mbarrier.arrive`](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive>)

`mbarrier.arrive`

Performs [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) on the _mbarrier object_.

Syntax
    
    
    mbarrier.arrive{.sem.scope}{.shared{::cta}}.b64           state, [addr]{, count};
    mbarrier.arrive{.sem.scope}{.shared::cluster}.b64         _, [addr] {,count}
    mbarrier.arrive.expect_tx{.sem.scope}{.shared{::cta}}.b64 state, [addr], txCount;
    mbarrier.arrive.expect_tx{.sem.scope}{.shared::cluster}.b64   _, [addr], txCount;
    mbarrier.arrive.noComplete{.release.cta}{.shared{::cta}}.b64  state, [addr], count;
    
    .sem   = { .release, .relaxed }
    .scope = { .cta, .cluster }
    

Description

A thread executing `mbarrier.arrive` performs an [arrive-on](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) operation on the _mbarrier object_ at the location specified by the address operand `addr`. The 32-bit unsigned integer operand `count` specifies the _count_ argument to the [arrive-on](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) operation.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the address specified by `addr` does not fall within the address window of `.shared::cta` state space then the behavior is undefined.

Supported addressing modes for operand `addr` is as described in [Addresses as Operands](<#addresses-as-operands>). Alignment for operand `addr` is as described in the [Size and alignment of mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-size-alignment>).

The optional qualifier `.expect_tx` specifies that an [expect-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-expect-tx-operation>) operation is performed prior to the [arrive-on](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) operation. The 32-bit unsigned integer operand `txCount` specifies the _expectCount_ argument to the _expect-tx_ operation. When both qualifiers `.arrive` and `.expect_tx` are specified, then the count argument of the _arrive-on_ operation is assumed to be 1.

A `mbarrier.arrive` operation with `.noComplete` qualifier must not cause the `mbarrier` to complete its current phase, otherwise the behavior is undefined.

The value of the operand `count` must be in the range as specified in [Contents of the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-contents>).

Note: for `sm_8x`, when the argument `count` is specified, the modifier `.noComplete` is required.

`mbarrier.arrive` operation on an _mbarrier object_ located in `.shared::cta` returns an opaque 64-bit register capturing the phase of the _mbarrier object_ prior to the [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) in the destination operand `state.` Contents of the `state` operand are implementation specific. Optionally, sink symbol `'_'` can be used for the `state` argument.

`mbarrier.arrive` operation on an _mbarrier object_ located in `.shared::cluster` but not in `.shared::cta` cannot return a value. Sink symbol ‘_’ is mandatory for the destination operand for such cases.

The optional `.sem` qualifier specifies a memory synchronizing effect as described in the [Memory Consistency Model](<#memory-consistency-model>). If the `.sem` qualifier is absent, `.release` is assumed by default.

The `.relaxed` qualifier does not provide any memory ordering semantics and visibility guarantees.

The optional `.scope` qualifier indicates the set of threads that directly observe the memory synchronizing effect of this operation, as described in the [Memory Consistency Model](<#memory-consistency-model>). If the `.scope` qualifier is not specified then it defaults to `.cta`. In contrast, the `.shared::<scope>` indicates the state space where the mbarrier resides.

Qualifiers `.sem` and `.scope` must be specified together.

PTX ISA Notes

Introduced in PTX ISA version 7.0.

Support for sink symbol ‘_’ as the destination operand is introduced in PTX ISA version 7.1.

Support for sub-qualifier `::cta` on `.shared` introduced in PTX ISA version 7.8.

Support for `count` argument without the modifier `.noComplete` introduced in PTX ISA version 7.8.

Support for sub-qualifier `::cluster` introduced in PTX ISA version 8.0.

Support for qualifier `.expect_tx` is introduced in PTX ISA version 8.0.

Support for `.scope` and `.sem` qualifiers introduced in PTX ISA version 8.0

Support for `.relaxed` qualifier introduced in PTX ISA version 8.6.

Target ISA Notes

Requires `sm_80` or higher.

Support for `count` argument without the modifier `.noComplete` requires `sm_90` or higher.

Qualifier `.expect_tx` requires `sm_90` or higher.

Sub-qualifier `::cluster` requires `sm_90` or higher.

Support for `.cluster` scope requires `sm_90` or higher.

Support for `.relaxed` qualifier requires `sm_90` or higher.

Examples
    
    
    .reg .b32 cnt, remoteAddr32, remoteCTAId, addr32;
    .reg .b64 %r<5>, addr, remoteAddr64;
    .shared .b64 shMem, shMem2;
    
    cvta.shared.u64            addr, shMem2;
    mov.b32                    addr32, shMem2;
    mapa.shared::cluster.u32   remoteAddr32, addr32, remoteCTAId;
    mapa.u64                   remoteAddr64, addr,   remoteCTAId;
    
    cvta.shared.u64          addr, shMem2;
    
    mbarrier.arrive.shared.b64                       %r0, [shMem];
    mbarrier.arrive.shared::cta.b64                  %r0, [shMem2];
    mbarrier.arrive.release.cta.shared::cluster.b64  _, [remoteAddr32];
    mbarrier.arrive.release.cluster.b64              _, [remoteAddr64], cnt;
    mbarrier.arrive.expect_tx.release.cluster.b64    _, [remoteAddr64], tx_count;
    mbarrier.arrive.noComplete.b64                   %r1, [addr], 2;
    mbarrier.arrive.relaxed.cta.b64                  %r2, [addr], 4;
    mbarrier.arrive.b64                              %r2, [addr], cnt;

#####  9.7.13.15.14. [Parallel Synchronization and Communication Instructions: `mbarrier.arrive_drop`](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-drop>)

`mbarrier.arrive_drop`

Decrements the expected count of the _mbarrier object_ and performs [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>).

Syntax
    
    
    mbarrier.arrive_drop{.sem.scope}{.shared{::cta}}.b64 state,           [addr]{, count};
    mbarrier.arrive_drop{.sem.scope}{.shared::cluster}.b64           _,   [addr] {,count};
    mbarrier.arrive_drop.expect_tx{.sem.scope}{.shared{::cta}}.b64 state, [addr], tx_count;
    mbarrier.arrive_drop.expect_tx{.sem.scope}{.shared::cluster}.b64   _, [addr], tx_count;
    mbarrier.arrive_drop.noComplete{.release.cta}{.shared{::cta}}.b64 state,  [addr], count;
    
    .sem   = { .release, .relaxed }
    .scope = { .cta, .cluster }
    

Description

A thread executing `mbarrier.arrive_drop` on the _mbarrier object_ at the location specified by the address operand `addr` performs the following steps:

  * Decrements the expected arrival count of the _mbarrier object_ by the value specified by the 32-bit integer operand `count`. If `count` operand is not specified, it defaults to 1.

  * Performs an [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) on the _mbarrier object_. The operand `count` specifies the _count_ argument to the [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>).


The decrement done in the expected arrivals count of the _mbarrier object_ will be for all the subsequent phases of the _mbarrier object_.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the address specified by `addr` does not fall within the address window of `.shared::cta` or `.shared::cluster` state space then the behavior is undefined.

Supported addressing modes for operand `addr` is as described in [Addresses as Operands](<#addresses-as-operands>). Alignment for operand `addr` is as described in the [Size and alignment of mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-size-alignment>).

The optional qualifier `.expect_tx` specifies that an [expect-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-expect-tx-operation>) operation is performed prior to the `arrive_drop` operation, i.e. the decrement of arrival count and [arrive-on](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) operation. The 32-bit unsigned integer operand `txCount` specifies the _expectCount_ argument to the _expect-tx_ operation. When both qualifiers `.arrive_drop` and `.expect_tx` are specified, then the count argument of the _arrive-on_ operation is assumed to be 1.

`mbarrier.arrive_drop` operation with `.release` qualifier forms the _release_ pattern as described in the Memory Consistency Model and synchronizes with the _acquire_ patterns.

The optional `.sem` qualifier specifies a memory synchronizing effect as described in the [Memory Consistency Model](<#memory-consistency-model>). If the `.sem` qualifier is absent, `.release` is assumed by default. The `.relaxed` qualifier does not provide any memory ordering semantics and visibility guarantees.

The optional `.scope` qualifier indicates the set of threads that an `mbarrier.arrive_drop` instruction can directly synchronize. If the `.scope` qualifier is not specified then it defaults to `.cta`. In contrast, the `.shared::<scope>` indicates the state space where the mbarrier resides.

A `mbarrier.arrive_drop` with `.noComplete` qualifier must not complete the `mbarrier,` otherwise the behavior is undefined.

The value of the operand `count` must be in the range as specified in [Contents of the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-contents>).

Note: for `sm_8x`, when the argument `count` is specified, the modifier `.noComplete` is required.

A thread that wants to either exit or opt out of participating in the [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) can use `mbarrier.arrive_drop` to drop itself from the `mbarrier`.

`mbarrier.arrive_drop` operation on an _mbarrier object_ located in `.shared::cta` returns an opaque 64-bit register capturing the phase of the _mbarrier object_ prior to the [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) in the destination operand `state`. Contents of the returned state are implementation specific. Optionally, sink symbol `'_'` can be used for the `state` argument.

`mbarrier.arrive_drop` operation on an _mbarrier_ object located in `.shared::cluster` but not in `.shared::cta` cannot return a value. Sink symbol ‘_’ is mandatory for the destination operand for such cases.

Qualifiers `.sem` and `.scope` must be specified together.

PTX ISA Notes

Introduced in PTX ISA version 7.0.

Support for sub-qualifier `::cta` on `.shared` introduced in PTX ISA version 7.8.

Support for `count` argument without the modifier `.noComplete` introduced in PTX ISA version 7.8.

Support for qualifier `.expect_tx` is introduced in PTX ISA version 8.0.

Support for sub-qualifier `::cluster` introduced in PTX ISA version 8.0.

Support for `.scope` and `.sem` qualifiers introduced in PTX ISA version 8.0

Support for `.relaxed` qualifier introduced in PTX ISA version 8.6.

Target ISA Notes

Requires `sm_80` or higher.

Support for `count` argument without the modifier `.noComplete` requires `sm_90` or higher.

Qualifier `.expect_tx` requires `sm_90` or higher.

Sub-qualifier `::cluster` requires `sm_90` or higher.

Support for `.cluster` scope requires `sm_90` or higher.

Support for `.relaxed` qualifier requires `sm_90` or higher.

Examples
    
    
    .reg .b32 cnt;
    .reg .b64 %r1;
    .shared .b64 shMem;
    
    // Example 1
    @p mbarrier.arrive_drop.shared.b64 _, [shMem];
    @p exit;
    @p2 mbarrier.arrive_drop.noComplete.shared.b64 _, [shMem], %a;
    @p2 exit;
    ..
    @!p mbarrier.arrive.shared.b64   %r1, [shMem];
    @!p mbarrier.test_wait.shared.b64  q, [shMem], %r1;
    
    // Example 2
    mbarrier.arrive_drop.shared::cluster.b64 _, [addr];
    mbarrier.arrive_drop.shared::cta.release.cluster.b64     _, [addr], cnt;
    
    // Example 3
    mbarrier.arrive_drop.expect_tx.shared::cta.relaxed.cluster.b64 state, [addr], tx_count;

#####  9.7.13.15.15. [Parallel Synchronization and Communication Instructions: `cp.async.mbarrier.arrive`](<#parallel-synchronization-and-communication-instructions-cp-async-mbarrier-arrive>)

`cp.async.mbarrier.arrive`

Makes the _mbarrier object_ track all prior [cp.async](<#data-movement-and-conversion-instructions-cp-async>) operations initiated by the executing thread.

Syntax
    
    
    cp.async.mbarrier.arrive{.noinc}{.shared{::cta}}.b64 [addr];
    

Description

Causes an [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) to be triggered by the system on the _mbarrier object_ upon the completion of all prior [cp.async](<#data-movement-and-conversion-instructions-cp-async>) operations initiated by the executing thread. The _mbarrier object_ is at the location specified by the operand `addr`. The [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) is asynchronous to execution of `cp.async.mbarrier.arrive`.

When `.noinc` modifier is not specified, the pending count of the mbarrier object is incremented by 1 prior to the asynchronous [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>). This results in a zero-net change for the pending count from the asynchronous [arrive-on](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) operation during the current phase. The pending count of the _mbarrier object_ after the increment should not exceed the limit as mentioned in [Contents of the mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-contents>). Otherwise, the behavior is undefined.

When the `.noinc` modifier is specified, the increment to the pending count of the _mbarrier object_ is not performed. Hence the decrement of the pending count done by the asynchronous [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) must be accounted for in the initialization of the _mbarrier object_.

If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the address specified by `addr` does not fall within the address window of `.shared::cta` state space then the behavior is undefined.

Supported addressing modes for operand `addr` is as described in [Addresses as Operands](<#addresses-as-operands>). Alignment for operand `addr` is as described in the [Size and alignment of mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-size-alignment>).

PTX ISA Notes

Introduced in PTX ISA version 7.0.

Support for sub-qualifier `::cta` on `.shared` introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_80` or higher.

Examples
    
    
    // Example 1: no .noinc
    mbarrier.init.shared.b64 [shMem], threadCount;
    ....
    cp.async.ca.shared.global [shard1], [gbl1], 4;
    cp.async.cg.shared.global [shard2], [gbl2], 16;
    ....
    // Absence of .noinc accounts for arrive-on from completion of prior cp.async operations.
    // So mbarrier.init must only account for arrive-on from mbarrier.arrive.
    cp.async.mbarrier.arrive.shared.b64 [shMem];
    ....
    mbarrier.arrive.shared.b64 state, [shMem];
    
    waitLoop:
    mbarrier.test_wait.shared.b64 p, [shMem], state;
    @!p bra waitLoop;
    
    
    
    // Example 2: with .noinc
    
    // Tracks arrive-on from mbarrier.arrive and cp.async.mbarrier.arrive.
    
    // All threads participating in the mbarrier perform cp.async
    mov.b32 copyOperationCnt, threadCount;
    
    // 3 arrive-on operations will be triggered per-thread
    mul.lo.u32 copyArrivalCnt, copyOperationCnt, 3;
    
    add.u32 totalCount, threadCount, copyArrivalCnt;
    
    mbarrier.init.shared.b64 [shMem], totalCount;
    ....
    cp.async.ca.shared.global [shard1], [gbl1], 4;
    cp.async.cg.shared.global [shard2], [gbl2], 16;
    ...
    // Presence of .noinc requires mbarrier initalization to have accounted for arrive-on from cp.async
    cp.async.mbarrier.arrive.noinc.shared.b64 [shMem]; // 1st instance
    ....
    cp.async.ca.shared.global [shard3], [gbl3], 4;
    cp.async.ca.shared.global [shard4], [gbl4], 16;
    cp.async.mbarrier.arrive.noinc.shared::cta.b64 [shMem]; // 2nd instance
    ....
    cp.async.ca.shared.global [shard5], [gbl5], 4;
    cp.async.cg.shared.global [shard6], [gbl6], 16;
    cp.async.mbarrier.arrive.noinc.shared.b64 [shMem]; // 3rd and last instance
    ....
    mbarrier.arrive.shared.b64 state, [shMem];
    
    waitLoop:
    mbarrier.test_wait.shared.b64 p, [shMem], state;
    @!p bra waitLoop;

#####  9.7.13.15.16. [Parallel Synchronization and Communication Instructions: `mbarrier.test_wait` / `mbarrier.try_wait`](<#parallel-synchronization-and-communication-instructions-mbarrier-test-wait-try-wait>)

`mbarrier.test_wait`, `mbarrier.try_wait`

Checks whether the _mbarrier object_ has completed the phase.

Syntax
    
    
    mbarrier.test_wait{.sem.scope}{.shared{::cta}}.b64        waitComplete, [addr], state;
    mbarrier.test_wait.parity{.sem.scope}{.shared{::cta}}.b64 waitComplete, [addr], phaseParity;
    
    mbarrier.try_wait{.sem.scope}{.shared{::cta}}.b64         waitComplete, [addr], state
                                                                {, suspendTimeHint};
    
    mbarrier.try_wait.parity{.sem.scope}{.shared{::cta}}.b64  waitComplete, [addr], phaseParity
                                                                {, suspendTimeHint};
    
    .sem   = { .acquire, .relaxed }
    .scope = { .cta, .cluster }
    

Description

The _test_wait_ and _try_wait_ operations test for the completion of the current or the immediately preceding phase of an _mbarrier object_ at the location specified by the operand `addr`.

`mbarrier.test_wait` is a non-blocking instruction which tests for the completion of the phase.

`mbarrier.try_wait` is a potentially blocking instruction which tests for the completion of the phase. If the phase is not complete, the executing thread may be suspended. Suspended thread resumes execution when the specified phase completes OR before the phase completes following a system-dependent time limit. The optional 32-bit unsigned integer operand `suspendTimeHint` specifies the time limit, in nanoseconds, that may be used for the time limit instead of the system-dependent limit.

`mbarrier.test_wait` and `mbarrier.try_wait` test for completion of the phase :

  * Specified by the 64-bit unsigned integer operand `state`, which was returned by an `mbarrier.arrive` instruction on the same _mbarrier object_ during the current or the immediately preceding phase. Or

  * Indicated by the 32-bit unsigned integer operand `phaseParity`, which is the integer parity of either the current phase or the immediately preceding phase of the _mbarrier object_.


The `.parity` variant of the instructions test for the completion of the phase indicated by the operand `phaseParity`, which is the integer parity of either the current phase or the immediately preceding phase of the _mbarrier object_. An even phase has integer parity 0 and an odd phase has integer parity of 1. So the valid values of `phaseParity` operand are 0 and 1.

Note: the use of the `.parity` variants of the instructions requires tracking the phase of an _mbarrier object_ throughout its lifetime.

The _test_wait_ and _try_wait_ operations are valid only for :

  * the current incomplete phase, for which `waitComplete` returns `False`.

  * the immediately preceding phase, for which `waitComplete` returns `True`.


If no state space is specified then [Generic Addressing](<#generic-addressing>) is used. If the address specified by `addr` does not fall within the address window of `.shared::cta` state space then the behavior is undefined.

Supported addressing modes for operand `addr` is as described in [Addresses as Operands](<#addresses-as-operands>). Alignment for operand `addr` is as described in the [Size and alignment of mbarrier object](<#parallel-synchronization-and-communication-instructions-mbarrier-size-alignment>).

When `mbarrier.test_wait` and `mbarrier.try_wait` operations with `.acquire` qualifier returns `True`, they form the _acquire_ pattern as described in the [Memory Consistency Model](<#memory-consistency-model>).

The optional `.sem` qualifier specifies a memory synchronizing effect as described in the [Memory Consistency Model](<#memory-consistency-model>). If the `.sem` qualifier is absent, `.acquire` is assumed by default. The `.relaxed` qualifier does not provide any memory ordering semantics and visibility guarantees.

The optional `.scope` qualifier indicates the set of threads that the `mbarrier.test_wait` and `mbarrier.try_wait` instructions can directly synchronize. If the `.scope` qualifier is not specified then it defaults to `.cta`. In contrast, the `.shared::<scope>` indicates the state space where the mbarrier resides.

Qualifiers `.sem` and `.scope` must be specified together.

The following ordering of memory operations hold for the executing thread when `mbarrier.test_wait` or `mbarrier.try_wait` having acquire semantics returns `True` :

  1. All memory accesses (except [async operations](<#data-movement-and-conversion-instructions-cp-async>)) requested prior, in program order, to `mbarrier.arrive` having release semantics during the completed phase by the participating threads of the CTA are performed and are visible to the executing thread.

  2. All [cp.async](<#data-movement-and-conversion-instructions-cp-async>) operations requested prior, in program order, to `cp.async.mbarrier.arrive` during the completed phase by the participating threads of the CTA are performed and made visible to the executing thread.

  3. All `cp.async.bulk` asynchronous operations using the same _mbarrier object_ requested prior, in program order, to `mbarrier.arrive` having release semantics during the completed phase by the participating threads of the CTA are performed and made visible to the executing thread.

  4. All memory accesses requested after the `mbarrier.test_wait` or `mbarrier.try_wait`, in program order, are not performed and not visible to memory accesses performed prior to `mbarrier.arrive` having release semantics, in program order, by other threads participating in the `mbarrier`.

  5. There is no ordering and visibility guarantee for memory accesses requested by the thread after `mbarrier.arrive` having release semantics and prior to `mbarrier.test_wait`, in program order.


PTX ISA Notes

`mbarrier.test_wait` introduced in PTX ISA version 7.0.

Modifier `.parity` is introduced in PTX ISA version 7.1.

`mbarrier.try_wait` introduced in PTX ISA version 7.8.

Support for sub-qualifier `::cta` on `.shared` introduced in PTX ISA version 7.8.

Support for `.scope` and `.sem` qualifiers introduced in PTX ISA version 8.0

Support for `.relaxed` qualifier introduced in PTX ISA version 8.6.

Target ISA Notes

`mbarrier.test_wait` requires `sm_80` or higher.

`mbarrier.try_wait` requires `sm_90` or higher.

Support for `.cluster` scope requires `sm_90` or higher.

Support for `.relaxed` qualifier requires `sm_90` or higher.

Examples
    
    
    // Example 1a, thread synchronization with test_wait:
    
    .reg .b64 %r1;
    .shared .b64 shMem;
    
    mbarrier.init.shared.b64 [shMem], N;  // N threads participating in the mbarrier.
    ...
    mbarrier.arrive.shared.b64  %r1, [shMem]; // N threads executing mbarrier.arrive
    
    // computation not requiring mbarrier synchronization...
    
    waitLoop:
    mbarrier.test_wait.shared.b64    complete, [shMem], %r1;
    @!complete nanosleep.u32 20;
    @!complete bra waitLoop;
    
    // Example 1b, thread synchronization with try_wait :
    
    .reg .b64 %r1;
    .shared .b64 shMem;
    
    mbarrier.init.shared.b64 [shMem], N;  // N threads participating in the mbarrier.
    ...
    mbarrier.arrive.shared.b64  %r1, [shMem]; // N threads executing mbarrier.arrive
    
    // computation not requiring mbarrier synchronization...
    
    waitLoop:
    mbarrier.try_wait.relaxed.cluster.shared.b64    complete, [shMem], %r1;
    @!complete bra waitLoop;
    
    
    // Example 2, thread synchronization using phase parity :
    
    .reg .b32 i, parArg;
    .reg .b64 %r1;
    .shared .b64 shMem;
    
    mov.b32 i, 0;
    mbarrier.init.shared.b64 [shMem], N;  // N threads participating in the mbarrier.
    ...
    loopStart :                           // One phase per loop iteration
        ...
        mbarrier.arrive.shared.b64  %r1, [shMem]; // N threads
        ...
        and.b32 parArg, i, 1;
        waitLoop:
        mbarrier.test_wait.parity.shared.b64  complete, [shMem], parArg;
        @!complete nanosleep.u32 20;
        @!complete bra waitLoop;
        ...
        add.u32 i, i, 1;
        setp.lt.u32 p, i, IterMax;
    @p bra loopStart;
    
    
    // Example 3, Asynchronous copy completion waiting :
    
    .reg .b64 state;
    .shared .b64 shMem2;
    .shared .b64 shard1, shard2;
    .global .b64 gbl1, gbl2;
    
    mbarrier.init.shared.b64 [shMem2], threadCount;
    ...
    cp.async.ca.shared.global [shard1], [gbl1], 4;
    cp.async.cg.shared.global [shard2], [gbl2], 16;
    
    // Absence of .noinc accounts for arrive-on from prior cp.async operation
    cp.async.mbarrier.arrive.shared.b64 [shMem2];
    ...
    mbarrier.arrive.shared.b64 state, [shMem2];
    
    waitLoop:
    mbarrier.test_wait.shared::cta.b64 p, [shMem2], state;
    @!p bra waitLoop;
    
    // Example 4, Synchronizing the CTA0 threads with cluster threads
    .reg .b64 %r1, addr, remAddr;
    .shared .b64 shMem;
    
    cvta.shared.u64          addr, shMem;
    mapa.u64                 remAddr, addr, 0;     // CTA0's shMem instance
    
    // One thread from CTA0 executing the below initialization operation
    @p0 mbarrier.init.shared::cta.b64 [shMem], N;  // N = no of cluster threads
    
    barrier.cluster.arrive;
    barrier.cluster.wait;
    
    // Entire cluster executing the below arrive operation
    mbarrier.arrive.release.cluster.b64              _, [remAddr];
    
    // computation not requiring mbarrier synchronization ...
    
    // Only CTA0 threads executing the below wait operation
    waitLoop:
    mbarrier.try_wait.parity.acquire.cluster.shared::cta.b64  complete, [shMem], 0;
    @!complete bra waitLoop;

#####  9.7.13.15.17. [Parallel Synchronization and Communication Instructions: `mbarrier.pending_count`](<#parallel-synchronization-and-communication-instructions-mbarrier-pending-count>)

`mbarrier.pending_count`

Query the pending arrival count from the opaque mbarrier state.

Syntax
    
    
    mbarrier.pending_count.b64 count, state;
    

Description

The pending count can be queried from the opaque mbarrier state using `mbarrier.pending_count`.

The `state` operand is a 64-bit register that must be the result of a prior `mbarrier.arrive.noComplete` or `mbarrier.arrive_drop.noComplete` instruction. Otherwise, the behavior is undefined.

The destination register `count` is a 32-bit unsigned integer representing the pending count of the _mbarrier object_ prior to the [arrive-on operation](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) from which the `state` register was obtained.

PTX ISA Notes

Introduced in PTX ISA version 7.0.

Target ISA Notes

Requires `sm_80` or higher.

Examples
    
    
    .reg .b32 %r1;
    .reg .b64 state;
    .shared .b64 shMem;
    
    mbarrier.arrive.noComplete.b64 state, [shMem], 1;
    mbarrier.pending_count.b64 %r1, state;