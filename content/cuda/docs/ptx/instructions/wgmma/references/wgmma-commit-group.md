# PTX Instruction Topic: wgmma.commit_group

`wgmma.commit_group` commits the currently uncommitted batch of `wgmma.mma_async` as one wgmma-group.

## Official Syntax

```ptx
wgmma.commit_group.sync.aligned;
```

## Key Semantics

- Each warpgroup creates a new wgmma-group and collects previously uncommitted `wgmma.mma_async`.
- If there are no uncommitted operations, it creates an empty group.
- `.sync` requires threads within the warp to rendezvous at the same instruction point.
- `.aligned` requires all threads in the warpgroup to execute the same `commit_group`; inconsistencies under conditional branches lead to undefined behavior.

## Official Source Links (Fact Check)

- wgmma.commit_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-commit-group
- wgmma.mma_async: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-mma-async
- Async warpgroup matrix instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions

Last cross-check date: 2026-03-19
