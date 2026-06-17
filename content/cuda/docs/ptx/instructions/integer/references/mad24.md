# PTX Instruction Topic: mad24

`mad24` adds a third operand on top of the `mul24` result and supports variants such as `.hi`/`.lo` and saturated modes.

## Official Description

- Documentation section: Integer Arithmetic Instructions: `mad24`

## Official Syntax (Excerpt)

```ptx
mad24.mode.type d, a, b, c;
mad24.hi.sat.s32 d, a, b, c;
```

## Key Semantics

- `.lo`: adds `c` to the low 32 bits of a 24x24 product.
- `.hi`: adds `c` to the high 32 bits of a 24x24 product.
- `.hi` may be slower when there is no dedicated 24-bit multiplication hardware.

## Example (PTX Style)

```ptx
mad24.lo.s32 d, a, b, c;
```

## Official Source Links (Fact Check)

- mad24: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions-mad24
- Integer arithmetic instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#integer-arithmetic-instructions

Last cross-check date: 2026-03-19
