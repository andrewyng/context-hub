# tcgen05 Topic: sm_120a Restrictions and Notes

This page distills the restriction entries in the PTX documentation that are directly related to `sm_120a`.

## Official Signals

- Multiple sections explicitly state that `sm_120a` is the initial support point, while `sm_120f` provides later support within the same family.
- Some sub-byte / alternate floating-point types have restriction notes for `sm_120a`.
- Asynchronous tensor paths such as `cp.async.bulk.tensor` have dedicated restrictions entries for `sm_120a`.

## Engineering Guidance

- Maintain a separate “disabled types list” for `sm_120a`.
- First perform dedicated testing on `sm_120a` for a new kernel, then expand to `sm_120f`.

## Common Failure Modes

- Assuming `sm_120f` support implies `sm_120a` parity for all type paths.
- Missing fallback coverage for restricted alternate-FP and sub-byte routes.
- Validating only throughput and skipping correctness checks on restricted configurations.

## Verification Checklist

- Confirm restricted-type disables are active on `sm_120a`.
- Confirm fallback kernels preserve numerical contract and output layout.
- Re-run protocol validation for async tensor paths under restricted modes.

## Official Source Links (Fact Check)

- Target ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes
- cp.async.bulk.tensor restrictions: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk-tensor
- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions

Last cross-check date: 2026-03-19
