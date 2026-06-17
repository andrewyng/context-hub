---
name: metal-silent-nan-inf-debugging-checklist
description: "Apple Metal silent NaN and Inf debugging checklist: isolate the first bad intermediate, validate boundary conditions, and separate arithmetic overflow from data corruption."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,nan,inf,debugging,overflow,intermediate-values,numerics,shader-debugger,compute"
---

# Metal Silent NaN And Inf Debugging Checklist

Use this page when a Metal kernel runs to completion but outputs contain `NaN` or `Inf` values without an obvious crash or validation error.

## First Principle

Find the first bad intermediate, not just the final bad output.

`NaN` and `Inf` propagation often turns one earlier mistake into a later explosion, so the useful question is:

"Which intermediate value became invalid first?"

## Common Root Causes

- exponentials or divisions overflow
- a denominator becomes zero or near zero
- uninitialized threadgroup data participates in arithmetic
- an out-of-range read introduces garbage that later becomes `NaN`

## Safe Debugging Order

1. compare against a tiny deterministic reference input
2. inspect stage outputs or intermediate buffers
3. add finite-value checks around suspicious steps
4. test whether the first invalid value appears before or after synchronization points
5. re-run with simplified inputs that remove extreme magnitudes

## What To Verify

- denominators cannot become zero unless the algorithm defines that case
- exponentials, reciprocals, and normalization steps use the intended stable form
- all staged data is initialized before use
- invalid values are not caused by layout or indexing bugs upstream

## Common Failure Modes

- a numerical overflow is blamed on tolerance alone while the kernel is actually unstable
- `NaN` appears only on edge tiles, but debugging focuses on the main interior path
- the first invalid intermediate is never captured because only final output is checked
- a managed or synchronized resource issue is mistaken for arithmetic instability

## Official Source Links (Fact Check)

- Metal developer tools: https://developer.apple.com/metal/tools/
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Synchronizing a managed resource in macOS: https://developer.apple.com/documentation/metal/synchronizing-a-managed-resource-in-macos

Last cross-check date: 2026-03-21
