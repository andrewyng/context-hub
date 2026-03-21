# PTX Instruction Note: cos

`cos` computes cosine using PTX-defined floating-point variants.

## Official Positioning

- Documentation section: Floating Point Instructions: `cos`

## Key Constraints

- Common forms are approximate variants; check precision requirements before use.
- Input domain handling and internal range behavior are ISA-defined.
- Use reference checks for numerically sensitive kernels.

## Usage Notes

- Use transcendental intrinsics selectively in hot loops because throughput is typically lower than basic arithmetic.
- Pre-normalize input range where possible to improve numerical stability of approximate forms.

## Example (PTX style)

```ptx
cos.approx.f32 d, a;
```

## Official Source Links (fact check)

- cos: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-cos
- Floating point instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions

Last verified date: 2026-03-19
