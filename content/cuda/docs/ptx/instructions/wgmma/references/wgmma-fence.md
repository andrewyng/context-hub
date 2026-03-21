# PTX Instruction Topic: wgmma.fence

`wgmma.fence` is used to constrain the ordering boundary of register accesses related to `wgmma.mma_async`.

## Official Key Semantics

- The documentation explicitly states that you must use `wgmma.fence` before `wgmma.mma_async` to isolate the related register accesses; otherwise behavior is undefined.
- It is typically combined with `wgmma.commit_group` / `wgmma.wait_group` to form a complete execution protocol.

## Usage Notes

- Insert `wgmma.fence` at stage boundaries where operand register ownership changes.
- Keep fence placement identical across participating warpgroup threads.

## Common Failure Modes

- Omitting fence on one path in a conditionally structured pipeline.
- Assuming `commit_group` alone is sufficient for register-handoff correctness.

## Usage Patterns (Illustrative)

```ptx
wgmma.fence.sync.aligned;
wgmma.mma_async.sync.aligned ...;
wgmma.commit_group.sync.aligned;
wgmma.wait_group.sync.aligned 0;
```

## Official Source Links (Fact Check)

- wgmma.fence: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-fence
- wgmma.mma_async: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-mma-async
- wgmma.commit_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-commit-group
- wgmma.wait_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-wait-group

Last cross-check date: 2026-03-19
