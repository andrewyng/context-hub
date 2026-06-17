# tcgen05 Topic: Sparse MMA Paths

This page covers key points for tcgen05-related sparse MMA (`mma.sp`) across the `kind` / `block-scale` dimensions.

## Official Notes

- The sparse path introduces additional metadata/selectors operands.
- When combined with block scale, you still must satisfy valid combinations of `kind`/`stype`/`scale_vec_size`.
- The documentation specifies architectural requirements for alternate FP sparse paths.

## Engineering Guidance

- Build separate templates for sparse and dense paths to avoid cross-contaminating parameters.
- Perform boundary and consistency checks for metadata and selector parameters on the host side.

## Common Failure Modes

- Reusing dense-path metadata assumptions in sparse kernels.
- Sparse selector tensors generated with mismatched shape/stride conventions.
- Shared regression suites miss sparse-only corner cases.

## Verification Checklist

- Validate sparse metadata shape/range before kernel launch.
- Compare sparse and dense numerical baselines under identical problem shapes.
- Confirm architecture gates for sparse alternate-FP combinations.

## Official Source Links (Fact Check)

- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- Warp-level MMA sparse context: https://docs.nvidia.com/cuda/parallel-thread-execution/#warp-level-matrix-instructions-mma-sp

Last cross-check date: 2026-03-19
