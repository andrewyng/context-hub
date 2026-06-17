# B-Series Implementation Checklist (tcgen05-related)

For quick verification before engineering rollout.

## Checklist

- [ ] `.target` matches the actual deployment architecture (`sm_100`/`sm_120`).
- [ ] All tcgen05/WGMMA variants have passed capability gating.
- [ ] Relevant async protocols (fence/commit/wait) are complete.
- [ ] `sm_120a` restricted types have been checked and have fallbacks.
- [ ] Linked scenarios with TMA paths have completed correctness regression testing.

## Release Notes for Reviewers

- Record the capability matrix used during generation and testing.
- Include sparse and alternate-FP coverage status explicitly in release notes.
- Document fallback behavior when tcgen05 constraints fail on target hardware.

## Minimum Evidence Package

- One correctness report per architecture family (`sm_100*`, `sm_120*`) with capability-gated variants.
- One protocol trace confirming async fence/commit/wait ordering on representative kernels.
- One numerical report covering dense, sparse, and alternate-FP routes.

## Official Source Links (Fact Check)

- Target ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes
- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- cp.async.bulk.tensor: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk-tensor
- wgmma.mma_async: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-mma-async

Last cross-check date: 2026-03-19
