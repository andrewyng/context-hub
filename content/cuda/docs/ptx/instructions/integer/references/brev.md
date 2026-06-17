# PTX Instruction Topic: brev

`brev` performs a bit reverse and is commonly used for bit-manipulation rearrangement and index transformations.

## Official Description

- Documentation section: Logic and Shift Instructions: `brev`
- Commonly used in scenarios that require bit-level reversed mappings

## Key Constraints

- The input/output bit widths must match the instruction variant.
- It only changes bit ordering; it does not extend arithmetic semantics.

## Usage Notes

- Useful for bit-reversed indexing patterns and bitstream transformations.
- Keep post-transform masking explicit when only subsets of bits are semantically valid.

## Example (PTX Style)

```ptx
brev.b32 d, a;
```

## Official Source Links (Fact Check)

- brev: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-brev
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
