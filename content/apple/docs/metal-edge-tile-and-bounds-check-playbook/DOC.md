---
name: metal-edge-tile-and-bounds-check-playbook
description: "Apple Metal edge-tile and bounds-check playbook: rounded dispatches, partial tiles, and safe handling of non-divisible problem sizes."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,bounds-check,edge-tile,partial-tile,dispatchthreads,thread_position_in_grid,rounded-dispatch,2d-kernel"
---

# Metal Edge-Tile And Bounds-Check Playbook

Use this page when a Metal kernel is correct on neat shapes but fails on odd sizes, edge tiles, or rounded-up dispatches.

## Why This Matters

Metal dispatches are often rounded up so that threadgroup sizing remains simple.

That means:

- some launched threads correspond to no real output element
- edge tiles may only partially overlap valid input and output ranges
- a kernel must separate "dispatched thread exists" from "logical element exists"

## Baseline Rule

Every kernel that can be launched on rounded or tiled problem sizes should make its validity checks explicit.

Typical checks include:

- global index < logical extent
- row < height and col < width
- tile-local reads are masked if source coverage is partial

## Edge-Tile Strategy

For tiled kernels:

1. compute global coordinates
2. test whether each source or destination coordinate is logically valid
3. stage only valid data or substitute neutral values where appropriate
4. guard final writes with output bounds checks

This avoids out-of-range reads and writes without requiring perfectly divisible problem dimensions.

## Common Failure Modes

- bounds checks guard writes but not staged reads
- elementwise kernels are protected, but tiled kernels still read invalid neighbor data
- 2D kernels use width bounds correctly but forget height bounds
- host dispatch changes after resize, but kernel checks still assume old extents

## Good Validation Set

Always test:

- one exact multiple of the threadgroup shape
- one size smaller than the shape
- one off-by-one larger than the shape
- non-square 2D shapes

If a kernel only works on clean multiples, the bounds logic is not finished.

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu
- Processing a texture in a compute function: https://developer.apple.com/documentation/metal/processing-a-texture-in-a-compute-function

Last cross-check date: 2026-03-21
