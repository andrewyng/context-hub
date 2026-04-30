---
name: metal-host-wrapper-patterns
description: "Apple Metal host wrapper patterns: library loading, pipeline caching, buffer binding, command-buffer lifecycle, and reusable launch structure."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,host-wrapper,objective-c++,cpp,mtldevice,mtlcommandqueue,mtlcommandbuffer,mtlcomputecommandencoder,pipeline-cache"
---

# Metal Host Wrapper Patterns

Use this page when you need the host-side structure around a Metal kernel, not just the kernel itself.

## Wrapper Responsibilities

A practical host wrapper usually owns:

- device and queue initialization
- library and function loading
- compute pipeline creation and reuse
- input/output buffer allocation
- encoder setup and resource binding
- dispatch geometry selection
- command-buffer submission and optional synchronization

This is the layer that decides whether a correct kernel is actually runnable.

## Recommended Object Lifetime

Create once and reuse:

- `MTLDevice`
- `MTLCommandQueue`
- `MTLComputePipelineState`
- long-lived reusable buffers when shapes are stable

Create per launch:

- command buffers
- compute encoders
- temporary shape-specific resources when required

## Minimal Wrapper Shape

```cpp
class MetalKernelRunner {
 public:
  void init();
  void run(const void* in0, const void* in1, void* out, size_t n);

 private:
  id<MTLDevice> device_ = nil;
  id<MTLCommandQueue> queue_ = nil;
  id<MTLComputePipelineState> pso_ = nil;
};
```

The key engineering point is separation:

- initialization path prepares durable GPU objects
- run path binds data and dispatches work only

## Binding Discipline

- keep wrapper-side buffer indices aligned with kernel `[[buffer(i)]]`
- centralize binding order instead of scattering `setBuffer` calls
- keep threadgroup size logic next to dispatch logic, not buried in kernel-selection code

## Synchronization Strategy

- do not block on every command buffer unless the caller truly needs immediate CPU visibility
- expose synchronous and asynchronous wrapper modes only if the caller actually needs both
- document when output memory is safe to read on the host

## Common Failure Modes

- pipeline creation is accidentally repeated inside the steady-state run path
- wrapper binds buffers in a different order than the kernel expects
- shape-dependent dispatch logic is duplicated in multiple call sites
- command buffer completion is used as a substitute for correct resource and indexing logic

## Good Wrapper Design

- one wrapper owns one kernel family or one coherent fused op
- shape and dispatch calculations are explicit
- pipeline and resource reuse are intentional
- correctness checks happen before performance tuning

## Official Source Links (Fact Check)

- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Metal Programming Guide (archive): https://developer.apple.com/library/archive/documentation/Miscellaneous/Conceptual/MetalProgrammingGuide/Compute-Ctx/Compute-Ctx.html

Last cross-check date: 2026-03-21
