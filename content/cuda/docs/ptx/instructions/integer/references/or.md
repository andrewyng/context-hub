# PTX Instruction Topic: or

`or` is a bitwise OR instruction and belongs to the Logic and Shift instruction family.

## Official Description

- Documentation section: Logic and Shift Instructions: `or`

## Key Constraints

- Operand widths and type suffixes must match the selected variant.
- Bit-layout assumptions should be documented before combining packed fields.
- Use explicit constants with matching width to avoid implicit truncation confusion.

## Usage Notes

- Use `or` to compose flags and packed-bit fields after proper masking/shift steps.
- Prefer readable staged composition over opaque one-line bit merges in critical code.

## Example (PTX Style)

```ptx
or.b32 d, a, b;
```

## Official Source Links (Fact Check)

- or: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-or
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
