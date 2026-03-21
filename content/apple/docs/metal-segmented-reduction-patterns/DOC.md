---
name: metal-segmented-reduction-patterns
description: "Apple Metal segmented reduction patterns: segment boundaries, local aggregation, carry handling, and validation for irregular grouped reductions."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,segmented-reduction,reduction,grouped,irregular,scan,threadgroup,aggregation,compute"
---

# Metal Segmented Reduction Patterns

Use this page when reducing values within logical groups, where segment boundaries are part of the input instead of one fixed contiguous range.

## Why Segmented Reduction Is Harder

A segmented reduction is not just "many reductions at once."

The kernel must preserve segment boundaries while still parallelizing work. This usually means:

- segment starts or segment IDs are part of the input
- local threadgroup aggregation may cross segment boundaries if indexing is careless
- large segments may span multiple threadgroups and need carry logic

## Safe Decomposition

Start with three concerns separated:

1. local aggregation inside one threadgroup
2. representation of segment boundaries or segment IDs
3. merge logic when one segment spans multiple blocks

This avoids mixing local correctness bugs with cross-block carry bugs.

## What To Verify First

- segment boundaries are reproduced exactly from the reference path
- empty or single-element segments behave correctly
- segments spanning more than one threadgroup are handled explicitly
- output layout is unambiguous: one value per segment or one partial per block

## Common Failure Modes

- reduction logic silently merges adjacent segments
- local shared state is reused without rechecking segment boundaries
- cross-block carry logic is missing for long segments
- the test set contains only evenly sized segments, hiding edge cases

## Validation Strategy

- test highly irregular segment lengths
- test single-element and empty-edge cases if the API allows them
- compare against a CPU grouped reduction on tiny inputs
- separately test "one long segment" and "many tiny segments"

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/

Last cross-check date: 2026-03-21
