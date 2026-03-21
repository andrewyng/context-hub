# PTX Instruction Note: cvt

`cvt` is used for numeric type conversion (integer/float/bit-width changes), a key instruction for mixed precision and interface adaptation.

## Official Positioning

- Documentation section: Data Movement and Conversion Instructions: `cvt`
- Related extension section: `cvt.pack`

## Key Constraints

- Target type suffix determines rounding/truncation behavior.
- Float-to-integer conversion requires overflow and rounding handling.
- Packed variants must satisfy element-type and packing-format requirements.

## Usage Notes

- Use explicit rounding modes (`rn`, `rz`, `rm`, `rp`) to make conversion policy reviewable.
- Validate saturation and overflow handling before deploying quantization paths.

## Example (PTX style)

```ptx
cvt.rn.f32.f16 f1, h1;
cvt.rzi.s32.f32 r1, f1;
```

## Official Source Links (fact check)

- cvt: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cvt
- cvt.pack: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cvt-pack

Last verified date: 2026-03-19
