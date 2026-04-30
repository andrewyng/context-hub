# PTX Instruction Topic: mul24

`mul24` returns either the high 32 bits or the low 32 bits of a 48-bit result from a 24x24-bit multiplication (depending on the `.hi`/`.lo` mode).

## Official Description

- Documentation section: Integer Arithmetic Instructions: `mul24`

## Official Syntax (Excerpt)

```ptx
mul24.mode.type d, a, b;
```

## Key Semantics

- `.lo`: returns the low 32 bits of the 48-bit product.
- `.hi`: returns the high 32 bits of the 48-bit product.
- The documentation notes that on some hardware, `.hi` may be less efficient.

## Example (PTX Style)

```ptx
mul24.lo.s32 d, a, b;
```

## Official Source Links (Fact Check)

- mul24: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-mul24
- Integer arithmetic instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions

Last cross-check date: 2026-03-19
