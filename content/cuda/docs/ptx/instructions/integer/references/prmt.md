# PTX Instruction Topic: prmt

`prmt` (permute) reorders bytes/nibbles under selection control and is suitable for bit-level data rearrangement.

## Official Description

- Documentation section: Logic and Shift Instructions: `prmt`
- Common in encoding/decoding and data-layout adjustments

## Key Constraints

- The control mask determines the reorder sources and order.
- Ensure the permute mode matches the input data layout.

## Example (PTX Style, Illustrative)

```ptx
prmt.b32 d, a, b, c;
```

## Official Source Links (Fact Check)

- prmt: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-prmt
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
