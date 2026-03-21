# PTX Instruction Topic: and

`and` performs a bitwise AND and is a fundamental operation in the Logic and Shift instruction family.

## Official Description

- Documentation section: Logic and Shift Instructions: `and`

## Key Constraints

- Operand width/type suffixes must match (`.b16/.b32/.b64` forms as applicable).
- Inputs must already be normalized to the intended bit-width domain.
- Mask constants should use explicit width to avoid unintended sign/width propagation.

## Usage Notes

- Use `and` for deterministic mask extraction before shifts or comparisons.
- In packed-field code, pair with `shl/shr/bfe` to keep bit positions explicit.

## Example (PTX Style)

```ptx
and.b32 d, a, b;
```

## Official Source Links (Fact Check)

- and: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-and
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
