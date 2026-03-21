# tcgen05 Architecture Gating (B-Series)

tcgen05-related capabilities are highly coupled in the official documentation with `sm_100`/`sm_120` and the `a/f` family conditions.

## Architecture Gating Recommendations

- Abstract “availability” as capabilities (e.g., `has_tcgen05`, `has_alt_fp`, `has_cp_mask`).
- Filter instruction templates by capabilities before generating kernels.
- Explicitly avoid or degrade restricted types on `sm_120a` (especially sub-byte / alternate fp).

## Usage Notes

- Gate at kernel-generation time, not only at runtime dispatch, to avoid generating illegal templates.
- Keep capability probing and fallback policy versioned with PTX/CUDA upgrade milestones.

## Common Failure Modes

- Capability flags are defined but not enforced during code emission.
- `sm_120a` restrictions are checked for compute path but missed for data-movement path.
- Fallback kernels compile but violate numerical contract due to dtype drift.

## Minimal Test Matrix

- `sm_100*` dense path with baseline type combinations.
- `sm_120a` restricted-type path with fallback validation.
- `sm_120f` extended-support path with regression parity checks.

## Official Source Links (Fact Check)

- Target ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes
- PTX ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-isa-notes
- cp.async.bulk.tensor restrictions context: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk-tensor

Last cross-check date: 2026-03-19
