# PTX Instruction Topic: xor

`xor` performs a bitwise XOR and is commonly used for mask toggling and simple encryption/checksum paths.

## Official Description

- Documentation section: Logic and Shift Instructions: `xor`

## Key Constraints

- Operand width/type suffixes must match legal ISA variants.
- For parity/checksum style paths, define whether truncation at each stage is acceptable.
- Avoid mixing signed arithmetic assumptions with pure bitwise transformations.

## Usage Notes

- Use `xor` for parity checks, mask toggles, and cheap difference markers.
- In lock-free protocols, avoid overloading `xor` logic with unclear state encoding.

## Example (PTX Style)

```ptx
xor.b32 d, a, b;
```

## Official Source Links (Fact Check)

- xor: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions-xor
- Logic and Shift instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-19
