# PTX Instruction Topic: shf

`shf` provides shift/concatenation semantics that combine left and right operands (see the specific variants in the official section).

## Official Description

- Documentation section: Logic and Shift Instructions: `shf`

## Key Constraints

- The shift amount and mode must follow the variant definition.
- Commonly used for wide-data rearrangement and efficient shift sequences.

## Usage Notes

- Use `wrap` forms for rotate-like behavior and `clamp` forms for bounded lane extraction behavior.
- Prefer `shf` over manual shift/or sequences when modeling cross-word shifts.

## Common Failure Modes

- `wrap` and `clamp` semantics are confused, causing incorrect bit propagation.
- Shift-count origin is not normalized and produces architecture-dependent behavior in edge cases.

## Example (PTX Style, Illustrative)

```ptx
shf.l.wrap.b32 d, a, b, c;
```

## Official Source Links (Fact Check)

- shf: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-shf
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
