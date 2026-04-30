# B-Series Delta Index vs. Hopper

This page records the key PTX differences to focus on when migrating from Hopper (e.g., the `sm_90a` path) to the B-Series (`sm_100`/`sm_120`).

## Observed Difference Directions

- More instructions/modifiers are marked as available only under `sm_100+` in the documentation.
- `sm_120a` vs. `sm_120f` includes extra notes on certain types and qualifiers.
- TensorCore 5th Generation and related mixed/alternate-precision conditions are more common on the new-architecture paths.
- Asynchronous tensor movement and reduction paths (TMA / async bulk) include more architecture/type restriction entries.

## Migration Checklist

1. Check that `target` and compilation options match the intended target architecture.
2. Check whether any `sm_100+` threshold features are used (e.g., some cache/eviction/async proxy variants).
3. Check whether restricted types on `sm_120a` are triggered.
4. Perform minimal runnable regression tests for WGMMA / tcgen05 / TMA paths.

## Common Failure Modes

- Porting instruction syntax while leaving Hopper-specific gating assumptions unchanged.
- Validating only dense compute paths and missing sparse/alternate-FP restrictions.
- Applying one fallback policy across `sm_100*` and `sm_120*` without feature-level checks.

## Official Source Links (Fact Check)

- PTX ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-isa-notes
- Target ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations
- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions

Last cross-check date: 2026-03-19
