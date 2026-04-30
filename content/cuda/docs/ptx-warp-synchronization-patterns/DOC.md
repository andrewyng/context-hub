---
name: ptx-warp-synchronization-patterns
description: "PTX warp synchronization patterns: vote/shfl/match/elect/bar.warp.sync composition for warp-cooperative algorithms."
metadata:
  languages: "cpp"
  versions: "9.2"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,ptx,warp,synchronization,shfl.sync,vote.sync,match.sync,elect.sync,bar.warp.sync,membermask"
---

# PTX Warp Synchronization Patterns

Use this page for warp-cooperative control/data exchange patterns without escalating to CTA-wide barriers.

## Key Warp-Level Primitives

- `bar.warp.sync`
- `vote.sync`
- `shfl.sync`
- `match.sync`
- `elect.sync`

## Practical Compositions

- Warp reduction:
  `shfl.sync` plus lane-conditional accumulation.
- Warp agreement checks:
  `vote.sync` for any/all consensus.
- Key-based grouping:
  `match.sync` for same-value subgrouping.
- Single-lane leadership:
  `elect.sync` for representative-thread control logic.

## Membermask Discipline

Correctness depends on accurate `membermask` usage:

- mask must match actual participating lanes on that control path
- mismatched masks can cause undefined or misleading results
- keep mask derivation stable across phases of the same protocol

## Common Failure Modes

- Divergent lanes use different masks for the same warp primitive.
- Lane index assumptions are invalid after control-flow divergence.
- Warp-level protocol accidentally used for cross-warp coordination.

## Related Topics

- PTX synchronization instructions: `../ptx/instructions/sync-comm/DOC.md`
- PTX control flow: `../ptx/instructions/control-flow/DOC.md`
- CUDA warp primitives (C++ view): `../warp-primitives/DOC.md`

## Official Source Links (Fact Check)

- PTX shfl.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-shfl-sync
- PTX vote.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-vote-sync
- PTX match.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-match-sync
- PTX elect.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-elect-sync
- PTX bar.warp.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-bar-warp-sync

Last cross-check date: 2026-03-20

