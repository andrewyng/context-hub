---
name: metal-kernel-debugging-checklist
description: "Apple Metal kernel debugging checklist: validation, binding mismatches, dispatch errors, and shader-level inspection."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,debugging,validation,shader-debugger,compute,resource-binding,dispatch,threadgroup,xcode"
---

# Metal Kernel Debugging Checklist

Use this page when a Metal compute kernel builds but behaves incorrectly, produces zeros, or performs far below expectation.

## First Checks

- confirm the expected kernel function is actually compiled into the loaded library
- confirm host buffer bindings match `[[buffer(i)]]` indices
- confirm dispatch shape matches kernel indexing assumptions
- confirm output buffers are large enough for the full access range

These catch a large fraction of real integration bugs.

## Validation Path

Apple's runtime validation and Metal debugging tools should be enabled early in debugging.

Use them to catch:

- invalid API usage
- resource binding mistakes
- synchronization mistakes
- shader execution issues

## Kernel-Side Checks

- verify bounds checks for rounded-up dispatches
- verify threadgroup barriers are present where shared local memory is reused
- verify local and global indices are not mixed accidentally
- verify any subgroup-sensitive logic is tested independently from the threadgroup baseline

## Host-Side Checks

- verify `dispatchThreads` / `threadsPerThreadgroup` or threadgroup counts are computed correctly
- verify pipeline state corresponds to the intended kernel entry point
- verify command-buffer ordering matches read/write dependencies between kernels

## Tooling Workflow

1. Reproduce with validation enabled.
2. Inspect resource bindings in the Metal debugger.
3. Inspect shader variable values at failing points.
4. Check whether the bug is indexing, synchronization, or data-layout related.
5. Only then start performance debugging.

## Common Failure Modes

- Wrong buffer index with otherwise valid kernel code.
- Bounds checks omitted on rounded dispatch sizes.
- Threadgroup memory is reused without a barrier.
- Host code writes CPU data but forgets resource synchronization requirements on relevant macOS paths.
- A performance issue is misdiagnosed as a correctness issue, or vice versa.

## Debugging Principle

Separate these questions:

- Is the kernel producing the right result?
- Is the launch path binding the right resources?
- Is the performance bottleneck in the shader, memory system, or host submission path?

Do not try to solve all three at once.

## Official Source Links (Fact Check)

- Metal developer tools: https://developer.apple.com/metal/tools/
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu

Last cross-check date: 2026-03-21
