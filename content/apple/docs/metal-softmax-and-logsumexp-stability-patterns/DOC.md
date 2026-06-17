---
name: metal-softmax-and-logsumexp-stability-patterns
description: "Apple Metal softmax and logsumexp stability patterns: max-subtraction, staged reductions, accumulation precision, and validation for numerically sensitive kernels."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,softmax,logsumexp,numerical-stability,max-subtraction,reduction,precision,compute"
---

# Metal Softmax And Logsumexp Stability Patterns

Use this page when implementing softmax, logsumexp, or related normalization kernels that are numerically sensitive even when the indexing logic is correct.

## The Main Stability Rule

Do not exponentiate raw values directly when they may have large magnitude.

For softmax-style kernels, the stable baseline is:

1. reduce to find the maximum value over the logical reduction axis
2. subtract that maximum before exponentiation
3. accumulate exponentials in stable precision
4. divide by the accumulated total or take the log as needed

## Why This Matters

Without max-subtraction:

- large positive inputs can overflow exponentials
- large negative inputs can underflow to zero
- the final normalized output can become `NaN`, `Inf`, or silently wrong

## What To Verify

- the reduction axis for the maximum matches the intended softmax axis
- accumulation precision is high enough for the workload
- masked or ragged elements do not participate incorrectly in the max or sum
- the kernel handles tiny and very large logits consistently with the reference path

## Common Failure Modes

- max is reduced over the wrong extent or wrong stride
- one optimization keeps max-subtraction but lowers accumulation precision too aggressively
- masked elements are included in the denominator
- only moderate-value test cases are used, hiding overflow behavior

## Validation Strategy

- compare against a stable CPU reference
- test extremely large and extremely negative values
- test all-equal inputs and one-dominant-value inputs
- test long reduction axes where accumulation error is more visible

## Official Source Links (Fact Check)

- Metal Shading Language Specification: https://developer.apple.com/metal/resources/
- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Metal developer tools: https://developer.apple.com/metal/tools/

Last cross-check date: 2026-03-21
