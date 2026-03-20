# PTX Instruction Topic: selp

`selp` selects between two operands based on a predicate and is commonly used for branchless conditional assignment.

## Official Description

- Documentation section: Comparison and Selection Instructions: `selp`
- Commonly used as an alternative to simple if/else to reduce branch divergence

## Key Constraints

- The predicate operand must be a valid predicate.
- The source/destination types must match the `selp` suffix.
- When strict numeric semantics are required, ensure that the value types are fully consistent.

## Example (PTX Style)

```ptx
selp.s32 d, a, b, p;
```

## Official Source Links (Fact Check)

- selp: https://docs.nvidia.com/cuda/parallel-thread-execution/#comparison-and-selection-instructions-selp
- Comparison and Selection instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#comparison-and-selection-instructions

Last cross-check date: 2026-03-19
