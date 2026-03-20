# PTX Instruction Topic: lop3

`lop3` is a three-input lookup-table logical operation that can express any three-input boolean function.

## Official Description

- Documentation section: Logic and Shift Instructions: `lop3`
- Commonly used to fuse multiple boolean instructions into a single logical operation

## Key Constraints

- The 8-bit immediate truth table defines the boolean function.
- The type suffix must match the input bit widths.

## Example (PTX Style, Illustrative)

```ptx
lop3.b32 d, a, b, c, immLut;
```

## Official Source Links (Fact Check)

- lop3: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-lop3
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
