# PTX Instruction Note: sqrt

`sqrt` computes square root for the selected floating-point variant.

## Official Positioning

- Documentation section: Floating Point Instructions: `sqrt`

## Key Constraints

- Use variant-specific rounding and type suffixes where required.
- Negative and exceptional input behavior follows ISA-defined semantics.
- Evaluate precision/performance tradeoffs between exact and approximate forms.

## Usage Notes

- Prefer `rsqrt` plus refinement when reciprocal-root throughput is the primary goal.
- Validate corner cases (very small, very large, and subnormal inputs) when switching variants.

## Example (PTX style)

```ptx
sqrt.rn.f32 d, a;
```

## Official Source Links (fact check)

- sqrt: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-sqrt
- Floating point instruction set: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions

Last verified date: 2026-03-19
