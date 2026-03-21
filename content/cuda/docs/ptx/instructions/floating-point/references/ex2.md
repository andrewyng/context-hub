# PTX Instruction Note: ex2

`ex2` computes `2^x` for PTX floating-point variants.

## Official Positioning

- Documentation section: Floating Point Instructions: `ex2`
- Related extension: Half precision `ex2`

## Key Constraints

- Common forms are approximate and may differ from high-precision library output.
- Select type suffixes that match downstream numeric requirements.
- Validate error behavior on representative production ranges.

## Usage Notes

- Use `ex2` for base-2 exponentiation paths to avoid extra base conversion overhead.
- Recheck stability when `ex2` output is immediately fed into normalization or softmax-like pipelines.

## Example (PTX style)

```ptx
ex2.approx.f32 d, a;
```

## Official Source Links (fact check)

- ex2: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-ex2
- Half precision ex2: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-ex2

Last verified date: 2026-03-19
