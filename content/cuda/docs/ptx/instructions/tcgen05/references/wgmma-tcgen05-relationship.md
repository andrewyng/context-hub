# Relationship Between WGMMA and tcgen05

In the current PTX structure, WGMMA is a high-frequency entry point at the implementation level, while tcgen05 provides the generational capability and constraint framework.

## Practical Relationship

- First check the capability boundaries of tcgen05, then choose the specific WGMMA variant.
- WGMMA depends on the `wgmma.fence` + `commit_group` + `wait_group` protocol.
- Async paths involve async proxies and require matching fence/wait semantics.

## Usage Notes

- Use tcgen05 gating to decide whether WGMMA templates are eligible before launch configuration tuning.
- Keep one protocol contract per pipeline stage to avoid mixing WGMMA and non-WGMMA completion logic.

## Common Failure Modes

- Choosing a WGMMA template first and discovering tcgen05 incompatibility late in the pipeline.
- Reusing wait-group thresholds across kernels with different stage depth and tile size.
- Assuming fence semantics are interchangeable across all async producer-consumer chains.

## Integration Checklist

- Gate tcgen05 capability before WGMMA template selection.
- Validate fence/commit/wait sequencing under representative stage depth.
- Confirm accumulator-read boundaries are protected by matching wait semantics.

## Official Source Links (Fact Check)

- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- wgmma.fence: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-fence
- wgmma.commit_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-commit-group
- wgmma.wait_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-wait-group

Last cross-check date: 2026-03-19
