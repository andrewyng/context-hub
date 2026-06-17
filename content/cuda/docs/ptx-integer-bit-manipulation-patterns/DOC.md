---
name: ptx-integer-bit-manipulation-patterns
description: "PTX integer and bit-manipulation patterns: logic/shift/select primitives, packing/unpacking strategies, and common correctness traps."
metadata:
  languages: "cpp"
  versions: "9.2"
  revision: 1
  updated-on: "2026-03-20"
  source: official
  tags: "cuda,ptx,integer,bit-manipulation,logic,shift,selp,lop3,bfe,bfi,popc,brev,prmt"
---

# PTX Integer and Bit-Manipulation Patterns

Use this page for practical composition of PTX integer/logic instructions in performance-sensitive kernels.

## Core Primitive Groups

- Logic: `and`, `or`, `xor`, `not`, `lop3`
- Shift and funnel-shift: `shl`, `shr`, `shf`
- Bitfield extraction/insert: `bfe`, `bfi`
- Bit counting/permutation: `clz`, `popc`, `brev`, `prmt`
- Predicate-style selection: `selp`, `setp`

## Common Composition Patterns

- Use `setp + selp` for branchless integer clamps and conditional assignment.
- Use `bfe/bfi` for packed-field decode/encode instead of long mask chains.
- Use `lop3` to fuse multi-step boolean logic into fewer instructions.
- Use `popc` and `clz` for bitset analytics and index derivation.

## Correctness Traps

- Signed vs unsigned shift semantics (`shr.s*` vs `shr.u*`) change high-bit fill behavior.
- Type width mismatches silently change mask and overflow behavior.
- Packing/unpacking code must define bit positions and endianness assumptions explicitly.

## Performance Heuristics

- Prefer fewer dependent bit-ops in hot loops to reduce scoreboard pressure.
- Validate whether `lop3` or `prmt` reduces instruction count on target architecture.
- Recheck register pressure after replacing arithmetic with heavy bit-manipulation sequences.

## Related Topics

- PTX integer instruction index: `../ptx/instructions/integer/DOC.md`
- PTX control flow: `../ptx/instructions/control-flow/DOC.md`
- PTX synchronization and communication: `../ptx/instructions/sync-comm/DOC.md`

## Official Source Links (Fact Check)

- PTX Integer Arithmetic Instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions
- PTX Logic and Shift Instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions
- PTX Comparison and Selection Instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#comparison-and-selection-instructions

Last cross-check date: 2026-03-20

