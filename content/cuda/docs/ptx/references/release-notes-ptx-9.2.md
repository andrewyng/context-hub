# PTX 9.2 Release Notes Index

This page tracks PTX 9.2 newly added features, behavior changes, compatibility limitations, and target-architecture requirements.

## Suggested Review Process

1. First review the release notes to identify newly added/changed instructions.
2. Then consult the corresponding instruction section’s PTX ISA notes.
3. Finally review the Target ISA notes to determine availability under `.target sm_xx`.

## Change Categories to Track

- New instruction families and qualifiers.
- Semantic changes that alter ordering, completion, or undefined-behavior boundaries.
- Target gating updates that change legal deployment architectures.

## Common Failure Modes

- Applying syntax updates while missing semantic changes in the same release.
- Updating PTX templates without synchronizing architecture-gating logic.
- Treating release notes as optional and relying on historical behavior assumptions.

## Verification Checklist

- Re-run architecture-gating tests after release-note-driven template updates.
- Re-run numerical and protocol regression on kernels touched by updated instruction families.
- Revalidate fallback behavior on the oldest supported architecture target.

## Official Source Links (Fact Check)

- Release Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#release-notes
- PTX ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-isa-notes
- Target ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes

Last cross-check date: 2026-03-19
