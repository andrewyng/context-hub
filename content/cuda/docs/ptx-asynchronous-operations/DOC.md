---
name: ptx-asynchronous-operations
description: Some PTX instructions (all variants of `cp.async`, `cp.async.bulk`, `cp.reduce.async.bulk`,
  `wgmma.mma_async`) perform operations that are asynchronous to the thread that executed
  the instruction. The...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.9.1.1. Asynchronous Operations

---
title: "8.9.1.1. Asynchronous Operations"
section: 8.9.1.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 8.9.1.1. Asynchronous Operations


Some PTX instructions (all variants of `cp.async`, `cp.async.bulk`, `cp.reduce.async.bulk`, `wgmma.mma_async`) perform operations that are asynchronous to the thread that executed the instruction. These asynchronous operations are ordered after prior instructions in the same thread (except in the case of `wgmma.mma_async`), but they are not part of the program order for that thread. Instead, they provide weaker ordering guarantees as documented in the instruction description.

For example, the loads and stores performed as part of a `cp.async` are ordered with respect to each other, but not to those of any other `cp.async` instructions initiated by the same thread, nor any other instruction subsequently issued by the thread with the exception of `cp.async.commit_group` or `cp.async.mbarrier.arrive`. The asynchronous mbarrier [arrive-on](<#parallel-synchronization-and-communication-instructions-mbarrier-arrive-on>) operation performed by a `cp.async.mbarrier.arrive` instruction is ordered with respect to the memory operations performed by all prior `cp.async` operations initiated by the same thread, but not to those of any other instruction issued by the thread. The implicit mbarrier [complete-tx](<#parallel-synchronization-and-communication-instructions-mbarrier-complete-tx-operation>) operation that is part of all variants of `cp.async.bulk` and `cp.reduce.async.bulk` instructions is ordered only with respect to the memory operations performed by the same asynchronous instruction, and in particular it does not transitively establish ordering with respect to prior instructions from the issuing thread.