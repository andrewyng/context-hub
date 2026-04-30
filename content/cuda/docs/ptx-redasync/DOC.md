---
name: ptx-redasync
description: Asynchronous reduction operation.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.7. Parallel Synchronization and Communication Instructions:red.async

---
title: "9.7.13.7. Parallel Synchronization and Communication Instructions:red.async"
section: 9.7.13.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.7. Parallel Synchronization and Communication Instructions:red.async


`red.async`

Asynchronous reduction operation.

Syntax

// Increment and Decrement reductions
    red.async.sem.scope{.ss}.completion_mechanism.op.type [a], b, [mbar];
    
    .sem  =                 { .relaxed };
    .scope =                { .cluster };
    .ss   =                 { .shared::cluster };
    .op   =                 { .inc, .dec };
    .type =                 { .u32 };
    .completion_mechanism = { .mbarrier::complete_tx::bytes };
    
    
    // MIN and MAX reductions
    red.async.sem.scope{.ss}.completion_mechanism.op.type [a], b, [mbar];
    
    .sem  = { .relaxed };
    .scope = { .cluster };
    .ss   = { .shared::cluster };
    .op   = { .min, .max };
    .type = { .u32, .s32 };
    .completion_mechanism = { .mbarrier::complete_tx::bytes };
    
    // Bitwise AND, OR and XOR reductions
    red.async.sem.scope{.ss}.completion_mechanism.op.type [a], b, [mbar];
    
    .sem  = { .relaxed };
    .scope = { .cluster };
    .ss   = { .shared::cluster };
    .op   = { .and, .or, .xor };
    .type = { .b32 };
    .completion_mechanism = { .mbarrier::complete_tx::bytes };
    
    // ADD reductions
    red.async.sem.scope{.ss}.completion_mechanism.add.type [a], b, [mbar];
    
    .sem  = { .relaxed };
    .scope = { .cluster };
    .ss   = { .shared::cluster };
    .type = { .u32, .s32, .u64 };
    .completion_mechanism = { .mbarrier::complete_tx::bytes };
    
    red.async{.mmio}.sem.scope{.ss}.add.type [a], b;
    
    .sem  = { .release };
    .scope = { .gpu, .cluster };
    .ss   = { .global };
    .type = { .u32, .s32, .u64, .s64 };

Description

`red.async` is a non-blocking instruction which initiates an asynchronous reduction operation specified by `.op`, with the operand `b` and the value at destination shared memory location specified by operand `a`.

Operands

* `a` is a destination address, and must be either a register, or of the form `register + immOff`, as described in [Addresses as Operands](<#addresses-as-operands>).  
  
  * `b` is a source value, of the type indicated by qualifier `.type`.

  * `mbar` is an mbarrier object address.

Qualifiers

* `.mmio` indicates whether this is an [mmio Operation](<#mmio-operation>).

  * `.sem` specifies the memory ordering semantics as described in the [Memory Consistency Model](<#memory-consistency-model>).

  * `.scope` specifies the set of threads with which this instruction can directly synchronize.

  * `.ss` specifies the state space of the destination operand `a` and the mbarrier operand `mbar`.

    * If `.ss` is not specified, [Generic Addressing](<#generic-addressing>) is used.

  * `.completion_mechanism` specifies the mechanism for observing the completion of the asynchronous operation.

    * When `.completion_mechanism` is `.mbarrier::complete_tx::bytes`: upon completion of the asynchronous operation, a [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation will be performed on the mbarrier object specified by the operand `mbar`, with `completeCount` argument equal to the amount of data stored in bytes.

    * When `.completion_mechanism` is not specified: the completion of the store synchronizes with the end of the CTA. This instruction accesses its `mbarrier` operand using generic-proxy.

  * `.op` specifies the reduction operation.

    * The `.inc` and `.dec` operations return a result in the range `[0..b]`.

  * `.type` specifies the type of the source operand `b`.

Conditions

When `.sem` is `.relaxed`:

* The reduce operation is a relaxed memory operation.

  * The complete-tx operation on the mbarrier has `.release` semantics at `.cluster` scope.

  * The shared-memory addresses of the destination operand `a` and the mbarrier operand `mbar` must meet all of the following conditions:

    * They belong to the same CTA.

    * The CTA to which they belong is different from the CTA of the executing thread, but must be within the same cluster.

Otherwise, the behavior is undefined.

  * `.mmio` must not be specified.

  * If `.ss` is specified, it must be `.shared::cluster`.

  * If `.ss` is not specified, generic addressing is used for operands `a` and `mbar`. If the generic addresses specified do not fall within the address window of `.shared::cluster` state space, the behavior is undefined.

  * If `.completion_mechanism` is specified, it must be `.mbarrier::complete_tx::bytes`.

  * If `.completion_mechanism` is not specified, it defaults to `.mbarrier::complete_tx::bytes`.

When `.sem` is `.release`:

* The reduce operation is a strong memory operation with `.release` semantics at the scope specified by `.scope`.

  * If `.mmio` is specified, `.scope` must be `.sys`.

  * If `.ss` is specified, it must be `.global`.

  * If `.ss` is not specified, generic addressing is used for operand `a`. If the generic address specified does not fall within the address window of `.global` state space, the behavior is undefined.

  * `.completion_mechanism` must not be specified.

PTX ISA Notes

Introduced in PTX ISA version 8.1.

Support for `.mmio` qualifier, `.release` semantics, `.global` state space, and `.gpu` and `.sys` scopes introduced in PTX ISA version 8.7.

Target ISA Notes

Requires `sm_90` or higher.

`.mmio` qualifier, `.release` semantics, `.global` state space, and `.gpu` and `.sys` scopes require `sm_100` or higher.

Examples

red.async.relaxed.cluster.shared::cluster.mbarrier::complete_tx::bytes.min.u32 [addr], b, [mbar_addr];
    
    red.async.release.sys.global.add.u32 [addr], b;