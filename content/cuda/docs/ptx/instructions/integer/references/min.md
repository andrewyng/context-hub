# PTX Instruction Topic: min

`min` returns the smaller of two operands and supports integer/float variants (as defined in the official section).

## Official Description

- Documentation section: Integer Arithmetic Instructions: `min`

## Key Constraints

- Result semantics are determined by the type and suffix.
- For floating-point comparison paths, pay attention to NaN handling (see the corresponding section notes).

## Usage Notes

- Pick variant suffixes to match the intended numeric ordering (`.s*` vs `.u*`).
- Use together with `max` to build branchless bound enforcement.

## Common Failure Modes

- Bound-check logic reverses `min`/`max` order and silently changes clamp behavior.
- Integer and floating-point minima are mixed in shared helper paths without variant-specific handling.

## Example (PTX Style)

```ptx
min.s32 d, a, b;
```

## Official Source Links (Fact Check)

- min: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-min
- Integer arithmetic instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions

Last cross-check date: 2026-03-19
