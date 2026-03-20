# PTX Instruction Topic: max

`max` returns the larger of two operands and is commonly used for threshold clamping and range constraints.

## Official Description

- Documentation section: Integer Arithmetic Instructions: `max`

## Key Constraints

- Semantics depend on the data type and the variant suffix.
- For floating-point variants, refer to the official NaN semantics.

## Example (PTX Style)

```ptx
max.s32 d, a, b;
```

## Official Source Links (Fact Check)

- max: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-max
- Integer arithmetic instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions

Last cross-check date: 2026-03-19
