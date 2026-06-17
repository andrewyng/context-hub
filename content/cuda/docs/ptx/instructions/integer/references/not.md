# PTX Instruction Topic: not

`not` performs a bitwise inversion and is a fundamental instruction for mask construction and logical complement operations.

## Official Description

- Documentation section: Logic and Shift Instructions: `not`

## Key Constraints

- Destination width must match the intended inversion domain.
- Inversion of packed fields should be followed by masking when only partial bits are valid.
- Do not treat `not` as arithmetic negation; semantics are bitwise inversion.

## Usage Notes

- Use `not` for complement masks and branchless bit-condition rewrites.
- Pair with `and` to isolate relevant inverted ranges in packed representations.

## Example (PTX Style)

```ptx
not.b32 d, a;
```

## Official Source Links (Fact Check)

- not: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-not
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
