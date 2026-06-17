---
name: metal-numerical-drift-debugging-checklist
description: "Apple Metal numerical drift debugging checklist: isolate precision changes, compare reference paths, inspect intermediates, and separate math drift from synchronization bugs."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,numerics,precision,half,float,debugging,drift,intermediate-values,shader-debugger,compute"
---

# Metal Numerical Drift Debugging Checklist

Use this page when a Metal kernel runs and produces plausible values, but the results drift from a CPU or reference implementation.

## First Separate Math Drift From Logic Bugs

Do not assume every mismatch is a floating-point issue.

Check first whether the error comes from:

- incorrect indexing
- uninitialized threadgroup data
- missing synchronization
- different border or reduction semantics

Only after those are ruled out should you treat the problem as pure numeric drift.

## Practical Debugging Order

1. compare against a small deterministic reference input
2. inspect intermediate tensors or buffers, not only final output
3. compare one precision change at a time
4. test whether accumulation order changed
5. use Xcode shader debugging tools to inspect suspicious intermediates

## Typical Sources Of Drift

- `half` versus `float` accumulation
- reordered reductions or fused stages
- transcendental function precision differences
- changed evaluation order in a tiled or vectorized kernel

## Good Review Questions

- Was accumulation precision reduced during optimization?
- Does the reference path use the same border and reduction semantics?
- Did stage fusion change evaluation order?
- Is the mismatch bounded and systematic, or does it indicate broken synchronization?

## Common Failure Modes

- a synchronization bug is misdiagnosed as harmless floating-point noise
- an optimization changes accumulation order and the allowed tolerance is never revisited
- only final output is compared, so the first bad intermediate is never identified
- different precision modes are combined with data-layout changes, hiding the real source of drift

## Official Source Links (Fact Check)

- Metal Shading Language Specification: https://developer.apple.com/metal/resources/
- Metal developer tools: https://developer.apple.com/metal/tools/
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Metal shader converter precision and debugging notes: https://developer.apple.com/metal/shader-converter/

Last cross-check date: 2026-03-21
