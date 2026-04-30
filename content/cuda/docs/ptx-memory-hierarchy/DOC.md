---
name: ptx-memory-hierarchy
description: PTX threads may access data from multiple state spaces during their execution
  as illustrated by [Figure 3](<#memory-hierarchy-memory-hierarchy-with-clusters>)
  where cluster level is introduced from ta...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 2.3. Memory Hierarchy

---
title: "2.3. Memory Hierarchy"
section: 2.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 2.3. Memory Hierarchy


PTX threads may access data from multiple state spaces during their execution as illustrated by [Figure 3](<#memory-hierarchy-memory-hierarchy-with-clusters>) where cluster level is introduced from target architecture `sm_90` onwards. Each thread has a private local memory. Each thread block (CTA) has a shared memory visible to all threads of the block and to all active blocks in the cluster and with the same lifetime as the block. Finally, all threads have access to the same global memory.

There are additional state spaces accessible by all threads: the constant, param, texture, and surface state spaces. Constant and texture memory are read-only; surface memory is readable and writable. The global, constant, param, texture, and surface state spaces are optimized for different memory usages. For example, texture memory offers different addressing modes as well as data filtering for specific data formats. Note that texture and surface memory is cached, and within the same kernel call, the cache is not kept coherent with respect to global memory writes and surface memory writes, so any texture fetch or surface read to an address that has been written to via a global or a surface write in the same kernel call returns undefined data. In other words, a thread can safely read some texture or surface memory location only if this memory location has been updated by a previous kernel call or memory copy, but not if it has been previously updated by the same thread or another thread from the same kernel call.

The global, constant, and texture state spaces are persistent across kernel launches by the same application.

Both the host and the device maintain their own local memory, referred to as _host memory_ and _device memory_ , respectively. The device memory may be mapped and read or written by the host, or, for more efficient transfer, copied from the host memory through optimized API calls that utilize the device’s high-performance _Direct Memory Access (DMA)_ engine.

![Memory Hierarchy](https://docs.nvidia.com/cuda/parallel-thread-execution/_images/memory-hierarchy-with-clusters.png)

Figure 3 Memory Hierarchy