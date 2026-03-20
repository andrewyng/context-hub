# PTX Instruction Topic: wgmma.mma_async

`wgmma.mma_async` is a warpgroup-level asynchronous matrix multiply-accumulate instruction that runs on the async proxy.

## Official Syntax (Excerpt)

```ptx
wgmma.mma_async.sync.aligned.shape.dtype.f16.f16  d, a-desc, b-desc, scale-d, imm-scale-a, imm-scale-b, imm-trans-a, imm-trans-b;
wgmma.mma_async.sync.aligned.shape.dtype.tf32.tf32 d, a-desc, b-desc, scale-d, imm-scale-a, imm-scale-b;
```

## Key Semantics

- The instruction executes on the async proxy, and an implicit generic-async proxy fence occurs upon completion.
- You must use mechanisms such as `wgmma.commit_group` + `wgmma.wait_group` to wait for completion.
- The documentation emphasizes: `wgmma.fence` must be used to isolate the related register accesses; otherwise behavior is undefined.

## Parameter Constraints (High-Risk)

- `imm-trans-a` / `imm-trans-b` only allow 0 or 1.
- For floating-point variants, `imm-scale-a` / `imm-scale-b` only allow -1 or 1.
- The `shape` / `dtype` / descriptor layout must match the official matrix fragment definitions.

## Official Source Links (Fact Check)

- wgmma.mma_async: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-mma-async
- Asynchronous warpgroup matrix instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions
- Async proxy notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

Last cross-check date: 2026-03-19
