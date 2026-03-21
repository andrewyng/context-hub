# tcgen05 Topic: MMA kind Family (f8f6f4 / mxf4 / mxf4nvf4 / mxf8f6f4)

This page focuses on the `.kind` families for tcgen05-related MMA and their engineering meaning.

## Official Notes

- The documentation lists families such as `.kind::f8f6f4`, `.kind::mxf4`, `.kind::mxf4nvf4`, and `.kind::mxf8f6f4`.
- Different `.kind` entries impose different restrictions on data packing, optional `scale_vec_size`, and available type combinations.

## B-Series Guidance

- Treat `.kind` as a first-class capability parameter at the code-generation level.
- Enforce an explicit `scale_vec_size` for `mxf4nvf4` (per the official rules).

## Usage Notes

- Carry `.kind` through scheduling, metadata generation, and validation stages as one parameter.
- Keep fallback templates keyed by `.kind` to avoid silent conversion to unsupported combinations.

## Common Failure Modes

- Selecting `.kind` by benchmark speed only, without validating legal type combinations.
- Forgetting to propagate `.kind` choice into sparse/scale metadata generation.
- Using shared fallback code paths that silently change `.kind`-dependent numerics.

## Official Source Links (Fact Check)

- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- MMA block-scale/kind context: https://docs.nvidia.com/cuda/parallel-thread-execution/#warp-level-matrix-instructions-mma

Last cross-check date: 2026-03-19
