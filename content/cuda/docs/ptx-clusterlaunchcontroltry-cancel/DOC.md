---
name: ptx-clusterlaunchcontroltry-cancel
description: '`clusterlaunchcontrol.try_cancel`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.17. Parallel Synchronization and Communication Instructions:clusterlaunchcontrol.try_cancel

---
title: "9.7.13.17. Parallel Synchronization and Communication Instructions:clusterlaunchcontrol.try_cancel"
section: 9.7.13.17
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.17. Parallel Synchronization and Communication Instructions:clusterlaunchcontrol.try_cancel


`clusterlaunchcontrol.try_cancel`

Requests cancellation of cluster which is not launched yet.

Syntax

clusterlaunchcontrol.try_cancel.async{.space}.completion_mechanism{.multicast::cluster::all}.b128 [addr], [mbar];
    
    .completion_mechanism = { .mbarrier::complete_tx::bytes };
    .space = { .shared::cta };

Description

The `clusterlaunchcontrol.try_cancel` instruction requests atomically cancelling the launch of a cluster that has not started running yet. It asynchronously writes an opaque response to shared memory indicating whether the operation succeeded or failed. The completion of the asynchronous operation is tracked using the mbarrier completion mechanism at `.cluster` scope. This instruction accesses its `mbarrier` operand using generic-proxy.

On success, the opaque response contains the `ctaid` of the first CTA of the canceled cluster; no other successful response from other `clusterlaunchcontrol.try_cancel` operations from the same grid will contain that id.

The mandatory `.async` qualifier indicates that the instruction will initiate the cancellation operation asynchronously and control will return to the executing thread before the requested operation is complete.

The `.space` qualifier is specified, both operands `addr` and `mbar` must be in the `.shared::cta` state space. Otherwise, generic addressing will be assumed for both. The result is undefined if any of address operands do not fall within the address window of `.shared::cta`.

The qualifier `.completion_mechanism` specifies that upon completion of the asynchronous operation, [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation, with `completeCount` argument equal to amount of data stored in bytes, will be performed on the mbarrier object specified by the operand `mbar`.

The executing thread can then use [mbarrier instructions](<#parallel-synchronization-and-communication-instructions-mbarrier>) to wait for completion of the asynchronous operation. No other synchronization mechanisms described in [Memory Consistency Model](<#memory-consistency-model>) can be used to guarantee the completion of the asynchronous copy operations.

The `.multicast::cluster::all` qualifier indicates that the response is asynchronously written using weak async-proxy writes to the corresponding local shared memory `addr` of each CTA in the requesting cluster. The completion of the writes to `addr` of a particular CTA is signaled via a complete-tx operation to the mbarrier object on the shared memory of that CTA.

The behavior of instruction with `.multicast::cluster::all` qualifier is undefined if any CTA in the cluster is exited.

Operand `addr` specifies the naturally aligned address of the 16-byte wide shared memory location where the request’s response is written.

The response of `clusterlaunchcontrol.try_cancel` instruction will be 16-byte opaque value and will be it available at location specified by operand `addr`. After loading this response into 16-byte register, instruction `clusterlaunchcontrol.query_cancel` can be used to check if request was successful and to retrieve `ctaid` of the first CTA of the canceled cluster.

If the executing CTA has already observed the completion of a `clusterlaunchcontrol.try_cancel` instruction as failed, then the behavior of issuing a subsequent `clusterlaunchcontrol.try_cancel` instruction is undefined.

PTX ISA Notes

Introduced in PTX ISA version 8.6.

Target ISA Notes

Requires `sm_100` or higher.

Qualifier `.multicast::cluster::all` is supported on following architectures:

* `sm_100a`

  * `sm_101a` (Renamed to `sm_110a` from PTX ISA version 9.0)

  * `sm_120a`

  * And is supported on following family-specific architectures from PTX ISA version 8.8:

    * `sm_100f` or higher in the same family

    * `sm_101f` or higher in the same family (Renamed to `sm_110f` from PTX ISA version 9.0)

    * `sm_120f` or higher in the same family

  * `sm_110f` or higher in the same family

Examples

// Assumption: 1D cluster (cluster_ctaid.y/.z == 1) with 1 thread per CTA.
    
    // Current Cluster to be processed: initially the launched cluster:
    mov.b32 xctaid, %ctaid.x;
    
    // Establish full synchronization across all CTAs of the cluster for the first iteration.
    // Weaker synchronization may suffice depending on initialization sequence.
    barrier.cluster.arrive;
    barrier.cluster.wait;
    
    // Iteration loop over all cluster CTAs
    processCluster:
      mov.u32  %r0, %tid.x;
      setp.u32.eq p0, %r0, 0x0;
      // Elect a leader thread (thread idx 0) for each CTA to arrive and expect_tx at
      // each CTA local shared memory barrier:
      mov.u32  %r0, %tid.x;
      setp.u32.eq p0, %r0, 0x0;
      // All other threads skip to processing the work of the current cluster:
      @!p0 bra processCurrentCluster;
    
      // All CTAs in the cluster arrive at their local SMEM barrier and set 16B handle tx count:
      mbarrier.arrive.expect_tx.cluster.relaxed.shared::cta.b64 state, [mbar], 16;
    
      // First CTA in Cluster attempts to cancel a not-yet-started cluster:
      mov.u32  %r0, %cluster_ctaid.x;
      setp.u32.eq p0, %r0, 0x0;
      @p0 clusterlaunchcontrol.try_cancel.async.mbarrier::complete_tx::bytes.multicast::cluster::all.b128 [addr], [mbar];
    
      processCurrentCluster:
        // ...process current cluster ("xctaid") while cancellation request for next cluster runs asynchronously...
    
      // After processing current cluster, wait on cancellation request response for next cluster via specified mbarrier:
      waitLoop:
        // .acquire prevents weak handle read ("ld.shared handle, [addr]") from overtaking this mbarrier.try_wait:
        mbarrier.try_wait.cluster.acquire.shared::cta.b64   complete, [mbar], state;
        @!complete bra waitLoop;
       // Cancellation request has completed.
    
      // Generic-proxy weak read of cancellation request into 16-byte wide register:
      ld.shared.b128 handle, [addr];
    
      // Check whether cancellation succeeded:
      clusterlaunchcontrol.query_cancel.is_canceled.pred.b128 p, handle;
      // If cancellation request failed, we couldn't cancel any other cluster, so all current cluster CTAs exit.
      @!p ret;
    
      // Otherwise, cancellation request succeeded.
      // Extract "ctaid" of first cancelled-cluster CTA which we'll process in next "processCluster" loop iteration:
      @p clusterlaunchcontrol.query_cancel.get_first_ctaid.v4.b32.b128 {xctaid, _, _, _},  handle;
    
      // Release current iteration generic-proxy weak read of handle ("ld.shared handle, [addr]")
      // before next iteration async-proxy write to handle ("clusterlaunchcontrol.try_cancel [addr]")
      fence.proxy.async::generic.release.sync_restrict::shared::cta.cluster;
    
      // Arrive and wait at the next iteration cluster barrier with relaxed semantics.
      barrier.cluster.arrive.relaxed;
      barrier.cluster.wait;
    
      // Acquire prior iteration generic-proxy weak read of handle ("ld.shared handle, [addr]")
      // before current iteration async-proxy write to handle ("clusterlaunchcontrol.try_cancel [addr]")
      fence.proxy.async::generic.acquire.sync_restrict::shared::cluster.cluster;
    
      bra processCluster;