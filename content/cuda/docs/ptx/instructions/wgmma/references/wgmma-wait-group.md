# PTX Instruction Topic: wgmma.wait_group

`wgmma.wait_group` waits for the wgmma-group to complete and is a necessary step before reading the results of `wgmma.mma_async`.

## Official Syntax

```ptx
wgmma.wait_group.sync.aligned N;
```

## Key Semantics

- Wait until the number of the most recent pending groups does not exceed `N`, and earlier groups have completed.
- `N=0` means waiting for all previously submitted groups to complete.
- The documentation states that if you access the accumulator / related input registers without waiting for the group that contains the target `wgmma.mma_async`, the behavior is undefined.
- `.sync` and `.aligned` have the same execution-consistency requirements as `commit_group`.

## Usage Notes

- Tune `N` according to pipeline depth and register-pressure limits.
- Place `wait_group` immediately before accumulator consumption boundaries.

## Common Failure Modes

- Using `N` from a different kernel stage depth and reading incomplete accumulators.
- Waiting too early and collapsing overlap between async compute stages.

## Official Source Links (Fact Check)

- wgmma.wait_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-wait-group
- wgmma.commit_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-commit-group
- wgmma.mma_async: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-mma-async

Last cross-check date: 2026-03-19
