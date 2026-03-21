# PTX Instruction Topic: shl

`shl` is a left-shift instruction, used for bit extension and constructing high-bit alignment.

## Official Description

- Documentation section: Logic and Shift Instructions: `shl`

## Key Constraints

- The shift amount should be within the legal range for the bit width.
- For computations related to signed semantics, carefully verify overflow behavior.

## Usage Notes

- Treat `shl` as a bit operation, not a safe arithmetic multiply substitute under overflow-sensitive logic.
- Keep shift-count provenance explicit when inputs may exceed legal ranges.

## Common Failure Modes

- Shift counts exceed legal bit width assumptions and produce unexpected masked behavior.
- Arithmetic intent is encoded with `shl` where overflow handling is actually required.

## Example (PTX Style)

```ptx
shl.b32 d, a, b;
```

## Official Source Links (Fact Check)

- shl: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-shl
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
