# PTX Instruction Topic: shf

`shf` provides shift/concatenation semantics that combine left and right operands (see the specific variants in the official section).

## Official Description

- Documentation section: Logic and Shift Instructions: `shf`

## Key Constraints

- The shift amount and mode must follow the variant definition.
- Commonly used for wide-data rearrangement and efficient shift sequences.

## Example (PTX Style, Illustrative)

```ptx
shf.l.wrap.b32 d, a, b, c;
```

## Official Source Links (Fact Check)

- shf: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-shf
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
