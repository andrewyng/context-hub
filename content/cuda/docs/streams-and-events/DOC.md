---
name: streams-and-events
description: "CUDA streams and events essentials: ordering, overlap, cudaStreamWaitEvent, timing, and default-stream caveats."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,streams,events,cudaStreamWaitEvent,cudaEventRecord,cudaEventElapsedTime,default-stream,overlap"
---

# CUDA Streams And Events (C++)

Use this page for CUDA work orchestration on the host side: stream ordering, event dependencies, and timing.

## Streams

A stream is an ordered sequence of operations on the device.

- operations in the same stream execute in issue order
- operations in different streams may overlap when dependencies allow
- stream-level concurrency is the basic CUDA mechanism for overlapping copy and compute

## Events

Events are lightweight synchronization markers.

Common uses:

- record progress in a stream with `cudaEventRecord`
- make another stream wait with `cudaStreamWaitEvent`
- measure elapsed time with `cudaEventElapsedTime`

Events are the standard tool for cross-stream dependencies.

## Basic Cross-Stream Dependency

```cpp
cudaEvent_t done;
cudaEventCreate(&done);

kernelA<<<grid, block, 0, streamA>>>(...);
cudaEventRecord(done, streamA);
cudaStreamWaitEvent(streamB, done, 0);
kernelB<<<grid, block, 0, streamB>>>(...);
```

This keeps the dependency local and avoids device-wide synchronization.

## Default Stream Caveat

The default stream has special behavior.

- legacy default stream semantics can introduce implicit synchronization
- per-thread default stream semantics behave differently

Do not assume the default stream behaves like an ordinary user-created stream unless you know which mode your application uses.

## Timing Rule

For coarse kernel timing:

1. create start/end events
2. record them in the target stream
3. synchronize on the end event
4. call `cudaEventElapsedTime`

This is the standard CUDA timing pattern when you want stream-local measurements.

## Common Mistakes

- using `cudaDeviceSynchronize()` when a stream or event sync is enough
- assuming different streams imply overlap without checking dependencies or resources
- forgetting that synchronous APIs can force serialization
- timing a stream with events but synchronizing the whole device

## Related Topics

- CUDA Graphs: `../cuda-graphs/DOC.md`
- Async copy pipelines: `../async-copy/DOC.md`
- Runtime API overview: `../runtime/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, streams and concurrency: https://docs.nvidia.com/cuda/archive/12.9.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, events and cross-stream dependencies: https://docs.nvidia.com/cuda/archive/11.7.0/cuda-c-programming-guide/index.html
- CUDA Runtime API, stream and event functions: https://docs.nvidia.com/cuda/cuda-runtime-api/index.html

Last cross-check date: 2026-03-20
