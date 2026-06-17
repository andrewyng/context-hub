# PTX Instruction Note: copysign

`copysign` returns the magnitude of the first operand with the sign bit of the second operand.

## Official Positioning

- Documentation section: Floating Point Instructions: `copysign`

## Key Constraints

- Operand and destination types must match the selected variant.
- This is a sign-bit transform, not a fused arithmetic operation.
- Special-value behavior follows ISA-defined floating-point semantics.

## Usage Notes

- Use `copysign` for branchless sign injection while preserving magnitude.
- Keep NaN and signed-zero behavior aligned with your numerical policy.

## Example (PTX style)

```ptx
copysign.f32 d, a, b;
```

## Official Source Links (fact check)

- copysign: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-copysign
- Floating point instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions

Last verified date: 2026-03-19
