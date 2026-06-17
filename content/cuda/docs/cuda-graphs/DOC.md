---
name: cuda-graphs
description: "CUDA Graphs essentials: definition, instantiation, execution, stream capture, cross-stream event capture, and update rules."
metadata:
  languages: "cpp"
  versions: "12.6"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,gpu,kernel,cuda-graphs,graph,stream-capture,cudaStreamBeginCapture,cudaGraphLaunch,cudaGraphInstantiate"
---

# CUDA Graphs (C++)

Use this page when the same workflow launches repeatedly and CPU launch overhead from streams becomes significant.

## Why Graphs Exist

CUDA Graphs separate work submission into:

1. definition
2. instantiation
3. execution

This amortizes setup work and can reduce CPU launch overhead compared with issuing many short kernels one by one into streams.

## Two Creation Paths

Graphs can be created by:

- explicit graph APIs
- stream capture

Stream capture is often the easiest migration path for existing stream-based code.

## Stream Capture

Typical pattern:

```cpp
cudaGraph_t graph;

cudaStreamBeginCapture(stream);
kernelA<<<grid, block, 0, stream>>>(...);
kernelB<<<grid, block, 0, stream>>>(...);
cudaStreamEndCapture(stream, &graph);
```

During capture, work is appended to a graph instead of being immediately enqueued for execution.

## Event-Based Cross-Stream Capture

CUDA documents that stream capture can preserve cross-stream dependencies expressed with:

- `cudaEventRecord()`
- `cudaStreamWaitEvent()`

provided the waited-on event belongs to the same capture graph.

## Execution Lifecycle

After a graph is defined:

- instantiate it into an executable graph
- launch the executable graph into a stream
- reuse it many times if the workflow is stable

Graphs help most when the structure is repeated often enough to amortize instantiation.

## Common Capture Hazards

- using unsupported APIs during capture
- mixing captured and non-captured dependencies incorrectly
- synchronizing captured streams or captured events in invalid ways
- relying on legacy default stream behavior during capture

When a capture is invalidated, the graph becomes unusable and capture must be ended.

## When Graphs Help

Graphs are especially useful when:

- kernels are short and launch overhead is material
- the workflow topology repeats
- stream orchestration logic is otherwise host-heavy

They are less useful when:

- the workload shape changes every iteration
- the overhead is dominated by kernel execution, not launch

## Related Topics

- Streams and events: `../streams-and-events/DOC.md`
- Runtime API overview: `../runtime/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`

## Official Source Links (Fact Check)

- CUDA C++ Programming Guide, CUDA Graphs overview: https://docs.nvidia.com/cuda/archive/12.6.1/cuda-c-programming-guide/index.html
- CUDA C++ Programming Guide, stream capture and cross-stream events: https://docs.nvidia.com/cuda/archive/11.7.0/cuda-c-programming-guide/index.html
- CUDA Programming Guide, earlier graph API examples: https://docs.nvidia.com/cuda/archive/12.2.0/cuda-c-programming-guide/index.html

Last cross-check date: 2026-03-20
