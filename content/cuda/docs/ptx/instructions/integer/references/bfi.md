# PTX Instruction Topic: bfi

`bfi` (bit-field insert) writes a field into a target bit range.

## Official Description

- Documentation section: Logic and Shift Instructions: `bfi`
- Often used together with `bfe` for packed data encoding

## Key Constraints

- The insert-range parameters must be within the target bit-width range.
- The combination of source field width and position must satisfy the variant definition.

## Usage Notes

- Use `bfi` to update packed headers/flags without disturbing unaffected bit fields.
- Pair with `bfe` in encode/decode pipelines to keep bit-layout contracts symmetric.

## Example (PTX Style, Illustrative)

```ptx
bfi.b32 d, a, b, pos, len;
```

## Official Source Links (Fact Check)

- bfi: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-bfi
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
