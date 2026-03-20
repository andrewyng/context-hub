# PTX Instruction Topic: clz

`clz` (count leading zeros) counts the number of consecutive zero bits starting from the most significant bit.

## Official Description

- Documentation section: Integer Arithmetic Instructions: `clz`

## Key Constraints

- When the input is 0, result semantics follow the official variant definition.
- The bit-width suffix must match the register type.

## Example (PTX Style)

```ptx
clz.b32 d, a;
```

## Official Source Links (Fact Check)

- clz: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-clz
- Integer arithmetic instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions

Last cross-check date: 2026-03-19
