# PTX Instruction Topic: match.sync

`match.sync` performs value matching within a synchronization mask scope and is used for warp-level grouping and consistency checks.

## Official Description

- Documentation section: Parallel Synchronization and Communication Instructions: `match.sync`
- Can be used to build warp-level cooperative logic grouped by key

## Key Constraints

- The comparison value types must match the requirements of the specific variant.
- The participation mask must match the execution path to avoid distorted results.

## Example (PTX Style, Illustrative)

```ptx
match.any.sync.b32 mask_out, value, membermask;
```

## Official Source Links (Fact Check)

- match.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-match-sync
- Parallel synchronization instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions

Last cross-check date: 2026-03-19
