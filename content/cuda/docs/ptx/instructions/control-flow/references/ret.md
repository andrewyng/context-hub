# PTX Instruction Topic: ret

`ret` is used for function return, ending the current function call path.

## Official Description

- Documentation section: Control Flow Instructions: `ret`
- Matches the call boundary of `call`

## Key Constraints

- The return path must be consistent with the function definition and calling convention.
- In complex control flow, ensure that all paths can reach a valid return point.

## Usage Notes

- Keep return conventions explicit when mixing `.func` helpers and inlined call sites.
- Validate that predicate-driven paths still preserve a legal return sequence.

## Example (PTX Style)

```ptx
ret;
```

## Official Source Links (Fact Check)

- ret: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions-ret
- Control flow instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions

Last cross-check date: 2026-03-19
