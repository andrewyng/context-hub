---
name: metal-histogram-and-binning-patterns
description: "Apple Metal histogram and binning patterns: local accumulation, conflict management, multi-pass merge structure, and validation strategy for bucketed kernels."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,histogram,binning,bucket,counting,atomic,threadgroup,aggregation,compute"
---

# Metal Histogram And Binning Patterns

Use this page when implementing histograms, bucket counting, or coarse binning passes in Metal.

## Why Histograms Need Their Own Pattern

Histogram kernels are usually dominated by update conflicts, not arithmetic cost.

Many threads may try to update the same bin at nearly the same time, so the design question is not only "how many bins exist?" but also "where does each accumulation happen first?"

## Safe Structure

A practical approach is:

1. each thread reads input elements
2. the threadgroup accumulates into local temporary bins when possible
3. local bins are merged into global output bins

This reduces direct contention on the final destination.

## Design Questions

- how many bins exist?
- can the threadgroup hold a local partial histogram?
- are updates sparse, uniform, or highly skewed?
- does the final output need only counts, or also offsets for later scattering?

## Validation Strategy

- test highly skewed inputs where nearly all values map to one bin
- test uniform distributions
- test bin counts that are not powers of two
- compare against a CPU reference on small arrays

Skewed inputs are the fastest way to expose contention-sensitive logic errors.

## Common Failure Modes

- every input directly updates global bins and contention dominates
- local bin initialization is incomplete across the threadgroup
- merge logic drops bins on edge cases or partial workgroups
- the kernel writes counts correctly but later stages assume prefix offsets instead of raw counts

## Performance Notes

- threadgroup-local accumulation is often the first optimization step
- the best binning strategy depends on contention shape, not just total input size
- if the next stage needs stable positions, histogram alone is not enough; it usually pairs with a scan or prefix-sum stage

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
