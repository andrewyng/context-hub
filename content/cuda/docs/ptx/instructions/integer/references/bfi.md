# PTX Instruction Topic: bfi

`bfi` (bit-field insert) writes a field into a target bit range.

## Official Description

- Documentation section: Logic and Shift Instructions: `bfi`
- Often used together with `bfe` for packed data encoding

## Key Constraints

- The insert-range parameters must be within the target bit-width range.
- The combination of source field width and position must satisfy the variant definition.

## Example (PTX Style, Illustrative)

```ptx
bfi.b32 d, a, b, pos, len;
```

## Official Source Links (Fact Check)

- bfi: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-bfi
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
