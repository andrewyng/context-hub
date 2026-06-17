# PTX Instruction Topic: shfl.sync

`shfl.sync` exchanges register data within a warp and is commonly used for warp-level communication and reductions.

## Official Description

- Documentation section: Parallel Synchronization and Communication Instructions: `shfl.sync`
- Commonly used for warp-level broadcast, down-scan, up-scan, and cross-lane exchange

## Key Constraints

- `membermask` must correctly describe the participating threads.
- lane indices and width parameters must follow the variant definition.
- Confirm that the target architecture supports this synchronized shuffle semantic before use.

## Usage Notes

- Use `shfl.sync` for warp-local broadcast and tree reductions to reduce shared-memory traffic.
- Keep lane mapping logic explicit when mixing `bfly`, `up`, `down`, and indexed shuffle forms.

## Example (PTX Style, Illustrative)

```ptx
shfl.sync.bfly.b32 r_out, r_in, laneMask, clamp, membermask;
```

## Official Source Links (Fact Check)

- shfl.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-shfl-sync
- Parallel synchronization instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions

Last cross-check date: 2026-03-19
