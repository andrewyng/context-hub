# PTX Instruction Topic: div

`div` performs division and supports different types and variant semantics.

## Official Description

- Documentation section: Integer Arithmetic Instructions: `div`

## Key Constraints

- The behavior when the divisor is 0 is defined by the official specification; protect against it before use.
- Signed/unsigned division semantics differ.
- On performance-critical paths, evaluate `div` latency and consider alternative strategies.

## Usage Notes

- In tight loops, replace division by compile-time constants with multiply/shift transforms when valid.
- Keep explicit preconditions for divisor domain to avoid hidden exceptional-path costs.

## Example (PTX Style)

```ptx
div.s32 d, a, b;
```

## Official Source Links (Fact Check)

- div: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-div
- Integer arithmetic instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions

Last cross-check date: 2026-03-19
