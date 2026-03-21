# PTX Instruction Note: testp

`testp` evaluates floating-point class/property predicates and writes a predicate result.

## Official Positioning

- Documentation section: Floating Point Instructions: `testp`

## Key Constraints

- Predicate selector (`nan`, `finite`, and related forms) controls the test semantics.
- Destination is a predicate register and is typically consumed by branch/selection instructions.
- Type suffix and selector must match a legal ISA form.

## Usage Notes

- Use `testp` to isolate exceptional-value handling into explicit predicate paths.
- Pair with `selp` for branchless fallback selection when divergence is undesirable.

## Example (PTX style)

```ptx
testp.nan.f32 p, a;
```

## Official Source Links (fact check)

- testp: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-testp
- Floating point instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions

Last verified date: 2026-03-19
