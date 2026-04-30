# PTX Instruction Note: lg2

`lg2` computes logarithm base 2 for PTX floating-point variants.

## Official Positioning

- Documentation section: Floating Point Instructions: `lg2`

## Key Constraints

- Approximate forms are common; accuracy depends on the selected variant.
- Domain handling for zero, negative, and exceptional inputs follows ISA rules.
- Use reference validation when numerical stability is critical.

## Usage Notes

- Use `lg2` when your algorithm is naturally base-2 (for example entropy-like or bit-scale transforms).
- Check behavior near zero and denormal ranges when downstream code assumes finite outputs.

## Example (PTX style)

```ptx
lg2.approx.f32 d, a;
```

## Official Source Links (fact check)

- lg2: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-lg2
- Floating point instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions

Last verified date: 2026-03-19
