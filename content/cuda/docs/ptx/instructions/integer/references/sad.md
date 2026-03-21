# PTX Instruction Topic: sad

`sad` (sum of absolute differences) computes the sum of absolute differences and is commonly used in image processing and distance-related operators.

## Official Description

- Documentation section: Integer Arithmetic Instructions: `sad`

## Key Constraints

- Operand types and bit widths must match the variant suffix.
- The accumulation width must be able to hold the sum result across multiple elements.

## Usage Notes

- Use `sad` for low-overhead distance accumulation in matching and scoring loops.
- Validate accumulation range early when chaining multiple `sad` stages.

## Common Failure Modes

- Accumulation width is too narrow for multi-stage reductions and overflows silently.
- Input packing assumptions differ between producer and `sad` consumer paths.

## Example (PTX Style, Illustrative)

```ptx
sad.u32 d, a, b;
```

## Official Source Links (Fact Check)

- sad: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-sad
- Integer arithmetic instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions

Last cross-check date: 2026-03-19
