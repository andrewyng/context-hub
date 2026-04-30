---
name: ptx-integer-instructions
description: "PTX integer arithmetic instructions and constraints for ISA 9.2."
metadata:
  languages: "cpp"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,integer,arithmetic"
---

# PTX Integer Arithmetic

This page covers the core semantics and practical constraints of PTX integer arithmetic instruction families.

## Common Instructions

- `add` / `sub` / `mul`
- `mad` (multiply-add)
- `div` / `rem`
- `abs` / `neg`

## Syntax Example (PTX Style)

```ptx
add.s32 d, a, b;
mad.lo.s32 d, a, b, c;
```

## Constraints and Pitfalls

- `.s*` / `.u*` must match both the register types and the operation semantics.
- Variants such as `mad` should be checked for high/low-part selection and rounding behavior.
- Different bit-widths and variants may be restricted by PTX ISA / Target ISA requirements.

## Usage Recommendations

- Prefer keeping clearly defined signed/unsigned semantics within the same code region.
- When dealing with overflow semantics, do not rely on the compiler to automatically infer behavior.

## Official Source Links (Fact Check)

- Integer Arithmetic Instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions
- add: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-add
- mad: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-mad
- mul: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-mul

Last cross-check date: 2026-03-19

## Single-instruction Topics
- `references/setp.md`
- `references/selp.md`
- `references/brev.md`
- `references/bfind.md`
- `references/bfe.md`
- `references/bfi.md`
- `references/prmt.md`
- `references/lop3.md`
- `references/popc.md`
- `references/sad.md`
- `references/mul24.md`
- `references/mad24.md`
- `references/clz.md`
- `references/and.md`
- `references/xor.md`
- `references/shf.md`
- `references/or.md`
- `references/not.md`
- `references/shl.md`
- `references/shr.md`
- `references/min.md`
- `references/max.md`
- `references/div.md`
