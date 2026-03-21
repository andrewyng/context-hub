# tcgen05 Topic: sm_100 to sm_120 Mapping

This page describes a mapping approach for tcgen05-related capabilities across the `sm_100*` and `sm_120*` families.

## Mapping Approach

- `sm_100a/sm_120a`: typically indicates earlier availability or more strict gating paths.
- `sm_100f/sm_120f`: the documentation frequently notes “higher targets within the same family provide support.”
- Specific functionality should follow the Target ISA notes in the corresponding section; do not infer across sections.

## Implementation Guidance

- Encode architecture checks as a `supports(feature, sm)` function.
- Let the generator degrade along the feature dimension instead of scattering many `#if` in kernel source.

## Usage Notes

- Centralize mapping rules in one table consumed by codegen, runtime dispatch, and tests.
- Keep mapping updates synchronized with CUDA/PTX version bumps.

## Common Failure Modes

- Hard-coding architecture assumptions per kernel instead of using shared mapping logic.
- Conflating "supported on family" with "supported on every family variant."

## Official Source Links (Fact Check)

- Target ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes
- PTX ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-isa-notes

Last cross-check date: 2026-03-19
