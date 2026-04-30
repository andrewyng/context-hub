# PTX Instruction Note: fma (floating-point)

`fma` performs fused multiply-add with single-rounding semantics for the selected variant.

## Official Positioning

- Documentation section: Floating Point Instructions: `fma`
- Related extensions: Half precision and mixed precision `fma`

## Key Constraints

- `fma` is not equivalent to separate `mul` then `add` in rounding behavior.
- Type and rounding suffixes must match variant requirements.
- Validate precision-sensitive kernels when switching between fused and split forms.

## Usage Notes

- Prefer `fma` in compute-bound loops to reduce instruction count and intermediate rounding error.
- Compare against non-fused baselines when strict bitwise reproducibility is required.

## Example (PTX style)

```ptx
fma.rn.f32 d, a, b, c;
```

## Official Source Links (fact check)

- fma: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-fma
- Half precision fma: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-fma
- Mixed precision fma: https://docs.nvidia.com/cuda/parallel-thread-execution/#mixed-precision-floating-point-instructions-fma

Last verified date: 2026-03-19
