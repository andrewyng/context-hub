# tcgen05 Topic: block_scale and scale_vec_size

This page covers `scale_vec_size` constraints in tcgen05-related `block_scale` paths.

## Official Notes

- `.block_scale` indicates that A/B matrices are scaled by `scale_A/scale_B` before multiply-add.
- `scale_vec_size` determines the shape of the scale matrix and how the selector is interpreted.
- Different `.kind` entries allow different values of `scale_vec_size` (the document tables define legal combinations).

## B-Series Guidance

- Do static validation using the triplet “kind + stype + scale_vec_size”.
- Check legal combinations before compilation to avoid runtime undefined behavior.

## Official Source Links (Fact Check)

- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- MMA instructions (block scale context): https://docs.nvidia.com/cuda/parallel-thread-execution/#warp-level-matrix-instructions-mma

Last cross-check date: 2026-03-19
