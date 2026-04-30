# PTX Instruction Topic: setp

`setp` is a core instruction that compares and writes a predicate register, used to build conditional branching and predicated (masked) execution.

## Official Description

- Documentation section: Comparison and Selection Instructions: `setp`
- Generates a predicate result based on the comparison relation; commonly used with `@p bra` and `selp`

## Key Constraints

- The comparison operand types must match the variant suffix.
- The result is written to a predicate register and can be used later as a predication condition.
- For floating-point comparisons, pay attention to NaN-related comparison semantics.

## Usage Notes

- Use `setp + selp` for branchless value selection in divergence-sensitive paths.
- Keep predicate lifetimes short and explicit to avoid accidental predicate reuse bugs.

## Example (PTX Style)

```ptx
setp.lt.s32 p, a, b;
@p bra L_true;
```

## Official Source Links (Fact Check)

- setp: https://docs.nvidia.com/cuda/parallel-thread-execution/#comparison-and-selection-instructions-setp
- Comparison and Selection instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#comparison-and-selection-instructions

Last cross-check date: 2026-03-19
