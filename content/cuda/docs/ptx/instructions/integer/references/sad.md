# PTX Instruction Topic: sad

`sad` (sum of absolute differences) computes the sum of absolute differences and is commonly used in image processing and distance-related operators.

## Official Description

- Documentation section: Integer Arithmetic Instructions: `sad`

## Key Constraints

- Operand types and bit widths must match the variant suffix.
- The accumulation width must be able to hold the sum result across multiple elements.

## Example (PTX Style, Illustrative)

```ptx
sad.u32 d, a, b;
```

## Official Source Links (Fact Check)

- sad: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-sad
- Integer arithmetic instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions

Last cross-check date: 2026-03-19
