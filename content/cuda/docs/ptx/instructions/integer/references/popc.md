# PTX Instruction Topic: popc

`popc` (population count) counts the number of set bits in a binary value.

## Official Description

- Documentation section: Integer Arithmetic Instructions: `popc`
- Common uses include mask counting, bitset operations, and compact encoding

## Key Constraints

- The input bit width determines the counting range.
- The result type must be able to hold the maximum count.

## Example (PTX Style)

```ptx
popc.b32 d, a;
```

## Official Source Links (Fact Check)

- popc: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-popc
- Integer arithmetic instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions

Last cross-check date: 2026-03-19
