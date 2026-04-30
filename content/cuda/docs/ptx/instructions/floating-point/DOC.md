---
name: ptx-floating-point-instructions
description: "PTX floating-point instructions, rounding behavior, and type constraints in ISA 9.2."
metadata:
  languages: "cpp"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,floating-point,math"
---

# PTX Floating-Point

This page focuses on PTX floating-point paths, rounding semantics, and common pitfalls.

## Common Instructions

- `add` / `sub` / `mul`
- `fma`
- `div`
- `sqrt`

## Syntax Example (PTX style)

```ptx
fma.rn.f32 d, a, b, c;
sqrt.rn.f32 d, a;
```

## Constraints and Pitfalls

- Rounding suffixes and type suffixes must match legal ISA forms.
- Approximate transcendental forms can differ from high-precision library references.
- NaN/Inf and exceptional-value behavior should be treated according to ISA semantics.

## Usage Recommendations

- Validate precision-sensitive kernels against a reference implementation.
- Distinguish approximate and exact variants when setting numerical tolerances.
- Keep mixed-precision policies explicit (input type, compute type, accumulation type).

## Official Source Links (fact check)

- Floating Point Instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions
- fma: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-fma
- sqrt: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-sqrt
- Half Precision instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions

Last verified date: 2026-03-19

## Single-Instruction References

- `references/add.md`
- `references/sub.md`
- `references/mul.md`
- `references/fma.md`
- `references/sqrt.md`
- `references/rcp.md`
- `references/rsqrt.md`
- `references/sin.md`
- `references/cos.md`
- `references/lg2.md`
- `references/ex2.md`
- `references/tanh.md`
- `references/copysign.md`
- `references/testp.md`
