---
name: ptx-independent-thread-scheduling
description: On architectures prior to Volta, warps used a single program counter
  shared amongst all 32 threads in the warp together with an active mask specifying
  the active threads of the warp. As a result, thre...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 3.2. Independent Thread Scheduling

---
title: "3.2. Independent Thread Scheduling"
section: 3.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 3.2. Independent Thread Scheduling


On architectures prior to Volta, warps used a single program counter shared amongst all 32 threads in the warp together with an active mask specifying the active threads of the warp. As a result, threads from the same warp in divergent regions or different states of execution cannot signal each other or exchange data, and algorithms requiring fine-grained sharing of data guarded by locks or mutexes can easily lead to deadlock, depending on which warp the contending threads come from.

Starting with the Volta architecture, _Independent Thread Scheduling_ allows full concurrency between threads, regardless of warp. With _Independent Thread Scheduling_ , the GPU maintains execution state per thread, including a program counter and call stack, and can yield execution at a per-thread granularity, either to make better use of execution resources or to allow one thread to wait for data to be produced by another. A schedule optimizer determines how to group active threads from the same warp together into SIMT units. This retains the high throughput of SIMT execution as in prior NVIDIA GPUs, but with much more flexibility: threads can now diverge and reconverge at sub-warp granularity.

_Independent Thread Scheduling_ can lead to a rather different set of threads participating in the executed code than intended if the developer made assumptions about warp-synchronicity of previous hardware architectures. In particular, any warp-synchronous code (such as synchronization-free, intra-warp reductions) should be revisited to ensure compatibility with Volta and beyond. See the section on Compute Capability 7.x in the _Cuda Programming Guide_ for further details.