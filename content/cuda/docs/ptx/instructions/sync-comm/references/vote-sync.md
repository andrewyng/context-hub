# PTX Instruction Topic: vote.sync

`vote.sync` performs a boolean reduction vote within the participating threads mask and is commonly used for warp-level conditional aggregation.

## Official Description

- Documentation section: Parallel Synchronization and Communication Instructions: `vote.sync`
- Common uses: determine whether any thread/all threads satisfy a condition

## Key Constraints

- The participating mask must match the actual set of active threads.
- When the vote result drives control flow, avoid mask mismatches that can cause semantic deviations.

## Example (PTX Style, Illustrative)

```ptx
vote.sync.any.pred p_out, p_in, membermask;
```

## Official Source Links (Fact Check)

- vote.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-vote-sync
- Parallel synchronization instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions

Last cross-check date: 2026-03-19
