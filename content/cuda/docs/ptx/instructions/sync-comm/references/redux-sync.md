# PTX Instruction Topic: redux.sync

`redux.sync` provides a synchronized reduction operation used for mask-based reduction computations within a thread group.

## Official Description

- Documentation section: Parallel Synchronization and Communication Instructions: `redux.sync`
- Applicable to reduction scenarios that require a synchronized participation set

## Key Constraints

- `membermask` must correctly cover participating threads.
- The data type and reduction operator must match the instruction variant.
- The overall synchronization protocol must still be satisfied with subsequent consumer paths.

## Example (PTX Style, Illustrative)

```ptx
redux.sync.add.s32 r_out, r_in, membermask;
```

## Official Source Links (Fact Check)

- redux.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-redux-sync
- Parallel synchronization instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions

Last cross-check date: 2026-03-19
