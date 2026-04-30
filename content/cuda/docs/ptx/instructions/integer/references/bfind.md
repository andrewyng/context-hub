# PTX Instruction Topic: bfind

`bfind` finds the position of a bit (the most/least significant bit position, depending on the variant semantics).

## Official Description

- Documentation section: Logic and Shift Instructions: `bfind`
- Suitable for bit scanning, normalization, and encoding optimization paths

## Key Constraints

- For empty input (e.g., all zeros), the result semantics follow the variant definition.
- The type/bit-width must match the suffix and the destination register.

## Usage Notes

- Use `bfind` for fast position lookup in sparse-bit masks and encoding routines.
- Guard zero-input handling explicitly when downstream logic assumes a valid bit index.

## Example (PTX Style, Illustrative)

```ptx
bfind.u32 d, a;
```

## Official Source Links (Fact Check)

- bfind: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-bfind
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
