---
name: metal-simdgroup-patterns
description: "Apple Metal SIMD-group patterns: subgroup-level cooperation, lane-sensitive logic, and when not to assume CUDA warp behavior."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,simdgroup,simd-group,subgroup,warp-like,msl,threadgroup,shuffle,reduction"
---

# Metal SIMD-Group Patterns

Use this page when a Metal kernel depends on subgroup-level cooperation or lane-sensitive execution.

## What A SIMD Group Is

Metal exposes SIMD-group concepts for threads that execute together at a finer scope than a full threadgroup.

This is the closest Metal concept to a CUDA warp, but it should not be treated as a drop-in replacement.

## Practical Rule

- Use SIMD-group reasoning only when a kernel genuinely needs subgroup-local cooperation.
- Keep the default kernel design based on grid and threadgroup semantics unless subgroup behavior is the real performance or correctness bottleneck.
- If a kernel was originally designed around CUDA warp intrinsics, re-check every assumption before porting it to Metal.

## Where SIMD-Group Logic Shows Up

Common cases include:

- subgroup reductions
- lane-local exchange patterns
- ballot-like control decisions
- wave/warp-sensitive prefix patterns

These are performance-sensitive patterns, but they are also some of the easiest places to introduce incorrect CUDA-to-Metal translations.

## What Not To Assume

- Do not assume CUDA warp width rules or naming transfer directly to Metal.
- Do not assume a threadgroup barrier is a substitute for subgroup-local logic.
- Do not hard-code lane-sensitive algorithms unless the Metal-side subgroup contract is clear and tested.

## Safe Porting Strategy

1. Start with a threadgroup-correct version.
2. Validate numerics and synchronization first.
3. Introduce SIMD-group optimization only after the baseline is correct.
4. Re-profile and re-validate after each subgroup-specific change.

## Common Failure Modes

- Ported CUDA warp code relies on implicit warp invariants that are not documented the same way in Metal.
- A kernel mixes threadgroup-wide and subgroup-wide assumptions without clear boundaries.
- Performance tuning introduces subgroup-specific logic before the threadgroup baseline is correct.
- Lane-sensitive debugging is skipped because output "usually" looks correct on one machine.

## When To Stay At Threadgroup Scope

Stay at threadgroup scope when:

- the data-sharing pattern naturally spans the whole tile
- correctness depends on threadgroup memory and barriers anyway
- subgroup logic would make the kernel harder to reason about than it is worth

Use SIMD-group techniques when:

- the algorithm is genuinely subgroup-local
- shared-memory traffic can be reduced materially
- the optimization has a measurable benefit on target hardware

## Official Source Links (Fact Check)

- Metal resources hub: https://developer.apple.com/metal/resources/
- Metal Shading Language Specification: https://developer.apple.com/metal/resources/
- Metal developer tools: https://developer.apple.com/metal/tools/

Last cross-check date: 2026-03-21
