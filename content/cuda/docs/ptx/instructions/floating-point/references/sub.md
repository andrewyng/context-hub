# PTX Instruction Note: sub (floating-point)

`sub` performs floating-point subtraction with PTX-defined type and rounding variants.

## Official Positioning

- Documentation section: Floating Point Instructions: `sub`
- Related sections: Half precision and mixed precision `sub` variants

## Key Constraints

- Use valid type/rounding suffix combinations for the selected variant.
- Operand types must match the instruction form.
- Special-value behavior follows ISA-defined floating-point semantics.

## Usage Notes

- Keep subtract order explicit in refactors because `a - b` vs `b - a` can alter cancellation behavior.
- Re-evaluate tolerance thresholds when replacing `sub` with fused alternatives.

## Example (PTX style)

```ptx
sub.rn.f32 d, a, b;
```

## Official Source Links (fact check)

- sub: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-sub
- Half precision sub: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-sub
- Mixed precision sub: https://docs.nvidia.com/cuda/parallel-thread-execution/#mixed-precision-floating-point-instructions-sub

Last verified date: 2026-03-19
