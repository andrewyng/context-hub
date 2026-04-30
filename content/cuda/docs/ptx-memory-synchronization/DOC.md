---
name: ptx-memory-synchronization
description: Synchronizing operations performed by different threads synchronize with
  each other at runtime as described here. The effect of such synchronization is to
  establish _causality order_ across threads.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.9.4. Memory synchronization

---
title: "8.9.4. Memory synchronization"
section: 8.9.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.9.4. Memory synchronization


Synchronizing operations performed by different threads synchronize with each other at runtime as described here. The effect of such synchronization is to establish _causality order_ across threads.

1. A `fence.sc` operation X _synchronizes_ with a `fence.sc` operation Y if X precedes Y in the _Fence-SC_ order.

  2. A `bar{.cta}.sync` or `bar{.cta}.red` or `bar{.cta}.arrive` operation _synchronizes_ with a `bar{.cta}.sync` or `bar{.cta}.red` operation executed on the same barrier.

  3. A `barrier.cluster.arrive` operation synchronizes with a `barrier.cluster.wait` operation.

  4. A _release_ pattern X _synchronizes_ with an _acquire_ pattern Y, if a _write_ operation in X precedes a _read_ operation in Y in _observation order_ , and the first operation in X and the last operation in Y are _morally strong_.

API synchronization

A _synchronizes_ relation can also be established by certain CUDA APIs.

1. Completion of a task enqueued in a CUDA stream _synchronizes_ with the start of the following task in the same stream, if any.

  2. For purposes of the above, recording or waiting on a CUDA event in a stream, or causing a cross-stream barrier to be inserted due to `cudaStreamLegacy`, enqueues tasks in the associated streams even if there are no direct side effects. An event record task _synchronizes_ with matching event wait tasks, and a barrier arrival task _synchronizes_ with matching barrier wait tasks.

  3. Start of a CUDA kernel _synchronizes_ with start of all threads in the kernel. End of all threads in a kernel _synchronize_ with end of the kernel.

  4. Start of a CUDA graph _synchronizes_ with start of all source nodes in the graph. Completion of all sink nodes in a CUDA graph _synchronizes_ with completion of the graph. Completion of a graph node _synchronizes_ with start of all nodes with a direct dependency.

  5. Start of a CUDA API call to enqueue a task _synchronizes_ with start of the task.

  6. Completion of the last task queued to a stream, if any, _synchronizes_ with return from `cudaStreamSynchronize`. Completion of the most recently queued matching event record task, if any, _synchronizes_ with return from `cudaEventSynchronize`. Synchronizing a CUDA device or context behaves as if synchronizing all streams in the context, including ones that have been destroyed.

  7. Returning `cudaSuccess` from an API to query a CUDA handle, such as a stream or event, behaves the same as return from the matching synchronization API.

In addition to establishing a _synchronizes_ relation, the CUDA API synchronization mechanisms above also participate in _proxy-preserved base causality order_.