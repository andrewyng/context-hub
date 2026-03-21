# PTX Instruction Note: tanh

`tanh` computes hyperbolic tangent using PTX floating-point variants.

## Official Positioning

- Documentation section: Floating Point Instructions: `tanh`
- Related extension: Half precision `tanh`

## Key Constraints

- Typical forms are approximate and should be validated for model-specific tolerances.
- Saturation and exceptional input behavior follow ISA-defined semantics.
- Use reference comparisons for numerically sensitive paths.

## Usage Notes

- Use `tanh` where bounded output is required and approximation error is acceptable.
- Check gradient-sensitive training/inference paths separately from forward-only tolerance checks.

## Example (PTX style)

```ptx
tanh.approx.f32 d, a;
```

## Official Source Links (fact check)

- tanh: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-tanh
- Half precision tanh: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-tanh

Last verified date: 2026-03-19
