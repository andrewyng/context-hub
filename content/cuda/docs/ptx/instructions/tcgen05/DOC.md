---
name: ptx-tcgen05-instructions
description: "PTX TensorCore 5th Generation (tcgen05) entry and B-series related constraints."
metadata:
  languages: "cpp"
  versions: "9.2"
  revision: 1
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,tcgen05,tensorcore,b-series,sm100,sm120"
---

# PTX tcgen05 (TensorCore 5th Generation)

This directory focuses on tcgen05 entry points and B-series architectural constraints, without duplicating the `wgmma` details already covered elsewhere.

## Core Positioning

- tcgen05 is the TensorCore 5th Generation entry point in the PTX documentation.
- It is tightly related to WGMMA, mixed/alternate precision, and new type qualifier constraints.
- Multiple capabilities in the documentation are bound to `sm_100`/`sm_120` family feature thresholds.

## Recommended Reading

- `references/overview.md`
- `references/arch-gating.md`
- `references/wgmma-tcgen05-relationship.md`
- `references/b-series-checklist.md`

## Further Reading

- `references/tcgen05-mma-kinds.md`
- `references/tcgen05-block-scale.md`
- `references/tcgen05-sm120a-restrictions.md`
- `references/tcgen05-sm100-sm120-mapping.md`
- `references/tcgen05-alt-fp-types.md`
- `references/tcgen05-sparse-path.md`
- `references/tcgen05-migration-playbook.md`

## Official Source Links (Fact Check)

- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- WGMMA: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions
- Target ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes

Last cross-check date: 2026-03-19
