# PTX Instruction Topic: shr

`shr` is a right-shift instruction that supports logical/arithmetic right shifts (depending on the variant suffix).

## Official Description

- Documentation section: Logic and Shift Instructions: `shr`

## Key Constraints

- The signed/unsigned suffix affects the high-bit fill semantics.
- The shift amount must be within the allowed bit-width range.

## Example (PTX Style)

```ptx
shr.u32 d, a, b;
```

## Official Source Links (Fact Check)

- shr: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-shr
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
