---
name: metal-reduction-patterns
description: "Apple Metal reduction patterns: threadgroup accumulation, staged reductions, and synchronization rules for sum/max-like kernels."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,reduction,sum,max,min,threadgroup,accumulation,parallel-reduction,barrier,compute"
---

# Metal Reduction Patterns

Use this page when implementing parallel reductions such as sum, max, min, norm accumulation, or partial aggregation in Metal.

## Reduction Structure

Most Metal reductions follow a staged pattern:

1. each thread loads one or more input elements
2. partial values are stored in `threadgroup` memory
3. the threadgroup synchronizes
4. the threadgroup reduces partial values locally
5. one thread writes a block result or final result

Large reductions usually require multiple passes or hierarchical aggregation.

## Good Baseline Strategy

- start with one-threadgroup local reduction
- validate correctness on non-power-of-two sizes
- then extend to hierarchical reduction across multiple threadgroups

This prevents mixing local-synchronization bugs with global-aggregation bugs.

## Important Design Choices

- how many input elements each thread loads
- where partial sums live (`threadgroup` memory)
- when barriers are required
- whether the kernel emits one final value or many partial block values

## Common Failure Modes

- reduction assumes a power-of-two threadgroup size but the wrapper dispatches another value
- barriers are missing between reduction stages
- edge elements past the logical input length are not masked correctly
- one-pass logic is used on a workload that actually requires hierarchical aggregation

## Performance Notes

- reduction kernels are often memory-sensitive first, not math-sensitive first
- threadgroup size and per-thread load count should be tuned together
- correctness for odd sizes is a stronger baseline check than large synthetic powers of two

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
