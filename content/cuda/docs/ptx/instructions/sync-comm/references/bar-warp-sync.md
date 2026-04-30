# PTX Instruction Topic: bar.warp.sync

`bar.warp.sync` provides a warp-level synchronization barrier and is used for phase synchronization within a warp.

## Official Description

- Documentation section: Parallel Synchronization and Communication Instructions: `bar.warp.sync`
- Finer-grained than CTA-level barriers

## Key Constraints

- The participation mask must match the threads that actually participate.
- Should not be used as a substitute for synchronization primitives across warps/CTAs.

## Usage Notes

- Prefer `bar.warp.sync` for intra-warp phase boundaries with explicit member masks.
- Recompute/propagate `membermask` carefully after divergent control flow.

## Example (PTX Style, Illustrative)

```ptx
bar.warp.sync membermask;
```

## Official Source Links (Fact Check)

- bar.warp.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-bar-warp-sync
- Parallel synchronization instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions

Last cross-check date: 2026-03-19
