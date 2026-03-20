# tcgen05 Topic: Alternate Floating-Point Types

This page focuses on usage constraints for common alternate FP types on the tcgen05 paths (e.g., `.e2m1/.e3m2/.e2m3`).

## Official Notes

- The documentation provides legal combinations of these types with `.kind`, shape, and `scale_vec_size`.
- Multiple entries explicitly tie support conditions to `sm_120a` / `sm_120f`.

## Engineering Guidance

- Build a separate numerical regression baseline for alternate FP paths.
- Bind the type-support matrix and architecture thresholds to the same configuration source.

## Official Source Links (Fact Check)

- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- Warp-level MMA instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#warp-level-matrix-instructions-mma

Last cross-check date: 2026-03-19
