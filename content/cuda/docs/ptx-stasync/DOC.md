---
name: ptx-stasync
description: Asynchronous store operation.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.12. Data Movement and Conversion Instructions:st.async

---
title: "9.7.9.12. Data Movement and Conversion Instructions:st.async"
section: 9.7.9.12
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.12. Data Movement and Conversion Instructions:st.async


`st.async`

Asynchronous store operation.

Syntax

st.async{.weak}{.ss}.completion_mechanism{.vec}.type [a], b, [mbar];
    st.async{.scope}{.ss}.completion_mechanism{.vec}.type [a], b, [mbar];
    
    .scope =                { .cluster };
    .ss   =                 { .shared::cluster };
    .type =                 { .b32, .b64,
                              .u32, .u64,
                              .s32, .s64,
                              .f32, .f64 };
    .vec  =                 { .v2, .v4 };
    .completion_mechanism = { .mbarrier::complete_tx::bytes };
    
    st.async{.mmio}.sem.scope{.ss}.type [a], b;
    
    .sem =                  { .release };
    .scope =                { .gpu, .sys };
    .ss =                   { .global };
    .type =                 { .b8, .b16, .b32, .b64,
                              .u8, .u16, .u32, .u64,
                              .s8, .s16, .s32, .s64,
                                         .f32, .f64 };

Description

`st.async` is a non-blocking instruction which initiates an asynchronous store operation that stores the value specified by source operand `b` to the destination memory location specified by operand `a`.

Operands

* `a` is a destination address, and must be either a register, or of the form `register + immOff`, as described in [Addresses as Operands](<#addresses-as-operands>).

  * `b` is a source value, of the type indicated by qualifier `.type`.

  * `mbar` is an mbarrier object address.

Qualifiers

* `.mmio` indicates whether this is an [mmio Operation](<#mmio-operation>).

  * `.sem` specifies the memory ordering semantics as described in the [Memory Consistency Model](<#memory-consistency-model>).

    * If `.sem` is not specified, it defaults to `.weak`.

  * `.scope` specifies the set of threads with which this instruction can directly synchronize.

  * `.ss` specifies the state space of the destination operand `a` and the mbarrier operand `mbar`.

    * If `.ss` is not specified, [Generic Addressing](<#generic-addressing>) is used.

  * `.completion_mechanism` specifies the mechanism for observing the completion of the asynchronous operation.

    * When `.completion_mechanism` is `.mbarrier::complete_tx::bytes`: upon completion of the asynchronous operation, a [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation will be performed on the mbarrier object specified by the operand `mbar`, with `completeCount` argument equal to the amount of data stored in bytes. This instruction accesses its `mbarrier` operand using generic-proxy.

  * `.type` specifies the type of the source operand `b`.

Conditions

When `.sem` is `.weak`:

* This is a weak store to shared memory, which signals its completion through an mbarrier object.

  * The store operation is treated as a weak memory operation.

  * The complete-tx operation on the mbarrier has `.release` semantics at `.cluster` scope.

  * Requires:

    * The shared memory addresses of destination operand `a` and the _mbarrier object_ `mbar` belong to the same CTA within the same cluster as the executing thread.

    * The number of CTAs within the cluster is strictly greater than one; `%cluster_nctarank > 1` is true.

Otherwise, the behavior is undefined.

  * `.mmio` must not be specified.

  * If `.ss` is specified, it must be `.shared::cluster`.

  * If `.ss` is not specified, generic addressing is used for operands `a` and `mbar`. If the generic addresses specified do not fall within the address window of `.shared::cluster` state space, the behavior is undefined.

  * `.completion_mechanism` must be specified and must be `.mbarrier::complete_tx::bytes`.

When `.sem` is `.release`:

* This is a release store to global memory.

  * The store operation is a strong memory operation with `.release` semantics at the scope specified by `.scope`.

  * If `.mmio` is specified, `.scope` must be `.sys`.

  * If `.ss` is specified, it must be `.global`.

  * If `.ss` is not specified, generic addressing is used for operand `a`. If the generic address specified does not fall within the address window of `.global` state space, the behavior is undefined.

PTX ISA Notes

Introduced in PTX ISA version 8.1.

Support for `.mmio` qualifier, `.release` semantics, `.global` state space, and `.scope` qualifier introduced in PTX ISA version 8.7.

Target ISA Notes

Requires `sm_90` or higher.

`.mmio` qualifier, `.release` semantics, `.global` state space, and `.scope` qualifier require `sm_100` or higher.

Examples

st.async.shared::cluster.mbarrier::complete_tx::bytes.u32 [addr], b, [mbar_addr];
    
    st.async.sys.release.global.u32 [addr], b;