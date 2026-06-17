# PTX Instruction Note: mul (floating-point)

`mul` performs floating-point multiplication with PTX-defined type and rounding variants.

## Official Positioning

- Documentation section: Floating Point Instructions: `mul`
- Related extension: Half precision `mul`

## Key Constraints

- Use valid type/rounding suffix combinations for the target variant.
- Operand types must match the chosen instruction form.
- Verify precision behavior when combining with mixed-precision accumulation.

## Usage Notes

- Prefer fused forms (`fma`) when multiply-add is immediately chained and numerical policy allows it.
- Track denormal and FTZ behavior when reproducing CPU reference results.

## Example (PTX style)

```ptx
mul.rn.f32 d, a, b;
```

## Official Source Links (fact check)

- mul: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-mul
- Half precision mul: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-mul

Last verified date: 2026-03-19
