---
name: ptx-cooperative-thread-arrays
description: 'The _Parallel Thread Execution (PTX)_ programming model is explicitly
  parallel: a PTX program specifies the execution of a given thread of a parallel
  thread array. A _cooperative thread array_ , or CT...'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 2.2.1. Cooperative Thread Arrays

---
title: "2.2.1. Cooperative Thread Arrays"
section: 2.2.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 2.2.1. Cooperative Thread Arrays


The _Parallel Thread Execution (PTX)_ programming model is explicitly parallel: a PTX program specifies the execution of a given thread of a parallel thread array. A _cooperative thread array_ , or CTA, is an array of threads that execute a kernel concurrently or in parallel.

Threads within a CTA can communicate with each other. To coordinate the communication of the threads within the CTA, one can specify synchronization points where threads wait until all threads in the CTA have arrived.

Each thread has a unique thread identifier within the CTA. Programs use a data parallel decomposition to partition inputs, work, and results across the threads of the CTA. Each CTA thread uses its thread identifier to determine its assigned role, assign specific input and output positions, compute addresses, and select work to perform. The thread identifier is a three-element vector `tid`, (with elements `tid.x`, `tid.y`, and `tid.z`) that specifies the thread’s position within a 1D, 2D, or 3D CTA. Each thread identifier component ranges from zero up to the number of thread ids in that CTA dimension.

Each CTA has a 1D, 2D, or 3D shape specified by a three-element vector `ntid` (with elements `ntid.x`, `ntid.y`, and `ntid.z`). The vector `ntid` specifies the number of threads in each CTA dimension.

Threads within a CTA execute in SIMT (single-instruction, multiple-thread) fashion in groups called _warps_. A _warp_ is a maximal subset of threads from a single CTA, such that the threads execute the same instructions at the same time. Threads within a warp are sequentially numbered. The warp size is a machine-dependent constant. Typically, a warp has 32 threads. Some applications may be able to maximize performance with knowledge of the warp size, so PTX includes a run-time immediate constant, `WARP_SZ`, which may be used in any instruction where an immediate operand is allowed.