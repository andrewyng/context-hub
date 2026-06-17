# PTX Instruction Note: mov

`mov` transfers values between registers and selected special-register/constant forms.

## Official Positioning

- Documentation section: Data Movement and Conversion Instructions: `mov`

## Key Constraints

- Source and destination operand classes must match a legal `mov` variant.
- Width/type suffixes must preserve valid bit-width semantics.
- Special-register movement forms require supported register names and target ISA.

## Usage Notes

- Use `mov` for explicit register/value handoff when clarity is more important than implicit compiler rewrites.
- Keep special-register reads localized to reduce accidental architectural coupling.

## Example (PTX style)

```ptx
mov.u32 r1, r2;
mov.u32 r_tid, %tid.x;
```

## Official Source Links (fact check)

- mov: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-mov
- Special registers: https://docs.nvidia.com/cuda/parallel-thread-execution/#special-registers

Last verified date: 2026-03-19
