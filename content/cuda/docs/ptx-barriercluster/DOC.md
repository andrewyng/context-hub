---
name: ptx-barriercluster
description: Barrier synchronization within a cluster.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.3. Parallel Synchronization and Communication Instructions:barrier.cluster

---
title: "9.7.13.3. Parallel Synchronization and Communication Instructions:barrier.cluster"
section: 9.7.13.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.3. Parallel Synchronization and Communication Instructions:barrier.cluster


`barrier.cluster`

Barrier synchronization within a cluster.

Syntax

barrier.cluster.arrive{.sem}{.aligned};
    barrier.cluster.wait{.acquire}{.aligned};
    
    .sem = {.release, .relaxed}

Description

Performs barrier synchronization and communication within a cluster.

`barrier.cluster` instructions can be used by the threads within the cluster for synchronization and communication.

`barrier.cluster.arrive` instruction marks warps’ arrival at barrier without causing executing thread to wait for threads of other participating warps.

`barrier.cluster.wait` instruction causes the executing thread to wait for all non-exited threads of the cluster to perform `barrier.cluster.arrive`.

In addition, `barrier.cluster` instructions cause the executing thread to wait for all non-exited threads from its warp.

When all non-exited threads in the cluster have executed `barrier.cluster.arrive`, the barrier completes and is automatically reinitialized. After using `barrier.cluster.wait` to detect completion of the barrier, a thread may immediately arrive at the barrier once again. Each thread must arrive at the barrier only once before the barrier completes.

The `barrier.cluster.wait` instruction guarantees that when it completes the execution, memory accesses (except asynchronous operations) requested, in program order, prior to the preceding `barrier.cluster.arrive` by all threads in the cluster are complete and visible to the executing thread.

There is no memory ordering and visibility guarantee for memory accesses requested by the executing thread, in program order, after `barrier.cluster.arrive` and prior to `barrier.cluster.wait`.

The optional `.relaxed` qualifier on `barrier.cluster.arrive` specifies that there are no memory ordering and visibility guarantees provided for the memory accesses performed prior to `barrier.cluster.arrive`.

The optional `.sem` and `.acquire` qualifiers on instructions `barrier.cluster.arrive` and `barrier.cluster.wait` specify the memory synchronization as described in the [Memory Consistency Model](<#memory-consistency-model>). If the optional `.sem` qualifier is absent for `barrier.cluster.arrive`, `.release` is assumed by default. If the optional `.acquire` qualifier is absent for `barrier.cluster.wait`, `.acquire` is assumed by default.

The optional `.aligned` qualifier indicates that all threads in the warp must execute the same `barrier.cluster` instruction. In conditionally executed code, an aligned `barrier.cluster` instruction should only be used if it is known that all threads in the warp evaluate the condition identically, otherwise behavior is undefined.

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Support for `.acquire`, `.relaxed`, `.release` qualifiers introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_90` or higher.

Examples

// use of arrive followed by wait
    ld.shared::cluster.u32 r0, [addr];
    barrier.cluster.arrive.aligned;
    ...
    barrier.cluster.wait.aligned;
    st.shared::cluster.u32 [addr], r1;
    
    // use memory fence prior to arrive for relaxed barrier
    @cta0 ld.shared::cluster.u32 r0, [addr];
    fence.cluster.acq_rel;
    barrier.cluster.arrive.relaxed.aligned;
    ...
    barrier.cluster.wait.aligned;
    @cta1 st.shared::cluster.u32 [addr], r1;