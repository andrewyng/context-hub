# tcgen05 Migration Playbook (From “Works” to “Stable”)

This page provides a minimal process for taking tcgen05 from “compiles” to “ready for stable production.”

## Four-Step Process

1. Architecture gate check: first determine whether `sm_100*`/`sm_120*` are available.
2. Combination validity check: verify `kind + stype + scale_vec_size`.
3. Protocol correctness check: ensure fences/commit/wait on the async path and full mbarrier participation.
4. Numerical and performance regression: establish baselines separately for alternate FP and sparse paths.

## Official Source Links (Fact Check)

- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- Target ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

Last cross-check date: 2026-03-19
