# PTX Instruction Topic: bfe

`bfe` (bit-field extract) extracts a specified bit-field from a source value.

## Official Description

- Documentation section: Logic and Shift Instructions: `bfe`
- Commonly used for packed data decoding and field extraction

## Key Constraints

- The start bit and length parameters must satisfy the bit-width range.
- The signed/unsigned extraction semantics are determined by the variant suffix.

## Usage Notes

- Prefer `bfe` over ad hoc mask/shift chains when decoding packed metadata fields.
- Keep `pos/len` constants explicit and centralized to avoid layout drift bugs.

## Example (PTX Style, Illustrative)

```ptx
bfe.u32 d, a, pos, len;
```

## Official Source Links (Fact Check)

- bfe: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-bfe
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
