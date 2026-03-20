# Relationship Between WGMMA and tcgen05

In the current PTX structure, WGMMA is a high-frequency entry point at the implementation level, while tcgen05 provides the generational capability and constraint framework.

## Practical Relationship

- First check the capability boundaries of tcgen05, then choose the specific WGMMA variant.
- WGMMA depends on the `wgmma.fence` + `commit_group` + `wait_group` protocol.
- Async paths involve async proxies and require matching fence/wait semantics.

## Official Source Links (Fact Check)

- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- wgmma.fence: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-fence
- wgmma.commit_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-commit-group
- wgmma.wait_group: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-wait-group

Last cross-check date: 2026-03-19
