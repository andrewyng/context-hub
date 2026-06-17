# PTX Instruction Note: rsqrt

`rsqrt` computes reciprocal square root for the selected floating-point variant.

## Official Positioning

- Documentation section: Floating Point Instructions: `rsqrt`
- Related extension: `rsqrt.approx.ftz.f64`

## Key Constraints

- Approximate forms are common and should be validated against error budgets.
- Negative and exceptional inputs follow ISA-defined semantics.
- Choose variant precision to match normalization or solver stability needs.

## Usage Notes

- Use `rsqrt` in normalization-heavy kernels to reduce divide and square-root pressure.
- Pair approximate forms with one refinement step when tighter relative error is required.

## Example (PTX style)

```ptx
rsqrt.approx.f32 d, a;
```

## Official Source Links (fact check)

- rsqrt: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-rsqrt
- rsqrt.approx.ftz.f64: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-rsqrt-approx-ftz-f64

Last verified date: 2026-03-19
