# PTX Instruction Note: add (floating-point)

`add` performs floating-point addition with PTX-defined type and rounding variants.

## Official Positioning

- Documentation section: Floating Point Instructions: `add`
- Related sections: Half precision and mixed precision `add` variants

## Key Constraints

- Use a type/rounding suffix combination that is valid for the selected variant.
- Source and destination operand types must match the instruction form.
- NaN/Inf and exceptional cases follow ISA-defined floating-point semantics.

## Usage Notes

- Use explicit rounding suffixes in numerically audited kernels to avoid implicit behavior drift.
- Validate mixed-precision accumulation paths when `add` consumes converted inputs.

## Example (PTX style)

```ptx
add.rn.f32 d, a, b;
```

## Official Source Links (fact check)

- add: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-add
- Half precision add: https://docs.nvidia.com/cuda/parallel-thread-execution/#half-precision-floating-point-instructions-add
- Mixed precision add: https://docs.nvidia.com/cuda/parallel-thread-execution/#mixed-precision-floating-point-instructions-add

Last verified date: 2026-03-19
