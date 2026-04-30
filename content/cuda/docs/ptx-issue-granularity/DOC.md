---
name: ptx-issue-granularity
description: Each of the `tcgen05` operation has different requirements for the number
  of threads/warps that needs to issue them.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.16.5. Issue Granularity

---
title: "9.7.16.5. Issue Granularity"
section: 9.7.16.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.16.5. Issue Granularity


Each of the `tcgen05` operation has different requirements for the number of threads/warps that needs to issue them.

The following table lists the execution granularity requirements of each of the `tcgen05` operation:

Table 46 Execution granularity requirements for tcgen05 operations tcgen05 operation | .cta_group | Issue Granularity  
---|---|---  
      
    
    .mma,
    .cp,
    .shift,
    .commit
    

| ::1 | An issue from a single thread in the current CTA would initiate the base operation.  
::2 | Issue from a single thread from the [CTA-Pair](<#tcgen05-cta-pair>) would initiate the base operation. When the current CTA issues the operation, the peer CTA should be active and should not have exited.  
      
    
    .alloc,
    .dealloc,
    .relinquish_alloc_permit
    

| ::1 | Issue from a single warp in the current CTA would initiate the allocation management instruction.  
::2 | Issue from two warps, one in each of the current CTA and its [Peer CTA](<#tcgen05-peer-cta>), in order to collectively perform the operation, i.e., the first warp to perform the operation could block until the the second warp in the [Peer CTA](<#tcgen05-peer-cta>) also performs the operation (see examples below).  
      
    
    .ld,
    .st,
    .wait::{ld, st}
    

| N/A | Issue from a warp in the current CTA can access only 1/4 of the Tensor Memory of the current CTA. So, a warpgroup is needed to access the entire Tensor Memory of the current CTA.  
      
    
    .fence::*
    

| N/A | A thread needs to fence all its accesses to the tensor memory that it wants to order with other accesses to the tensor memory from other threads.

The following example shows that:

* Before attempting to deallocate Tensor Memory, it suffices to ensure that there are no concurrent Tensor Memory accesses from the [Peer CTA](<#tcgen05-peer-cta>).  
  
  * Warps can immediately exit after deallocating Tensor Memory; no extra synchronization required.

Table 47 Example of deallocating Tensor Memory before CTA exit. CTA0 Warp | CTA1 Warp  
---|---  
barrier.cluster.arrive; barrier.cluster.wait; tcgen05.dealloc.2cta.sync.aligned; exit; | barrier.cluster.arrive; barrier.cluster.wait; tcgen05.dealloc.2cta.sync.aligned; exit;

This example uses a cluster barrier for illustration purposes but in practice other synchronization mechanisms are often used.

The following example illustrates a scenario in which the program exhibits non-deterministic behavior due to incorrect synchronizaton because `.dealloc` may or may not block:

Table 48 Example of non-determinstic hang due to incorrect synchronization CTA0 Warp | CTA1 Warp  
---|---  
barrier.cluster.arrive; barrier.cluster.wait; tcgen05.dealloc.2cta.sync.aligned; exit; | tcgen05.dealloc.2cta.sync.aligned; barrier.cluster.arrive; barrier.cluster.wait; exit;

#####  9.7.16.5.1. [CTA Pair](<#tcgen05-cta-pair>)  
  
Any 2 CTAs within the cluster whose `%cluster_ctarank` differs by the last bit only is said to form a CTA pair.

Within a CTA pair, the CTA whose last bit in the `%cluster_ctarank` is:

  * 0 is termed the even numbered CTA within the CTA pair.

  * 1 is termed as the odd numbered CTA within the CTA pair.


Most of the `tcgen05` operations can either execute at a single CTA level granularity OR at a CTA pair level granularity. When a `tcgen05` operation is performed at CTA pair granularity, the Tensor Memory of both the CTAs within the CTA pair are accessed. The set of threads that need to issue the `tcgen05` operation is listed in the [Issue Granularity](<#tcgen05-issue-granularity>).

#####  9.7.16.5.2. [Peer CTA](<#tcgen05-peer-cta>)

The peer CTA of the odd CTA within the CTA pair is the even CTA in the same pair. Similarly, the peer CTA of the even CTA within the CTA pair is the odd CTA in the same pair.