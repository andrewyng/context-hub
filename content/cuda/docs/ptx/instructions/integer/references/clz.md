# PTX Instruction Topic: clz

`clz` (count leading zeros) counts the number of consecutive zero bits starting from the most significant bit.

## Official Description

- Documentation section: Integer Arithmetic Instructions: `clz`

## Key Constraints

- When the input is 0, result is the operand bit width for the corresponding variant.
- The bit-width suffix must match the register type.

## Usage Notes

- Use `clz` as a primitive for normalization, integer `log2` approximations, and bit-scan helpers.
- Keep input width explicit (`.b32` vs `.b64`) when results are consumed by index arithmetic.

## Common Failure Modes

- Assuming zero input returns a sentinel other than operand bit width.
- Mixing 32-bit and 64-bit `clz` outputs in shared index math without conversion.

## Example (PTX Style)

```ptx
clz.b32 d, a;
```

## Official Source Links (Fact Check)

- clz: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-clz
- Integer arithmetic instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions

Last cross-check date: 2026-03-19
