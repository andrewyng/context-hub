# PTX Instruction Note: ld

`ld` is the base PTX load instruction family across global/shared/local/constant state spaces.

## Official Positioning

- Documentation section: Data Movement and Conversion Instructions: `ld`

## Key Constraints

- Address state space and instruction variant must match.
- Destination register type/width must match the loaded element format.
- Variant modifiers (cache, scope, vector width) must satisfy ISA-specific constraints.

## Usage Notes

- Use coherent `ld` forms by default; switch to specialized variants only with measured justification.
- Align load width and vectorization with producer layout to preserve coalescing efficiency.
- Keep cache modifiers consistent across hot paths to reduce unpredictable locality behavior.

## Example (PTX style)

```ptx
ld.global.u32 r1, [addr];
ld.shared.f32 f1, [saddr];
```

## Official Source Links (fact check)

- ld: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld
- ld.global.nc: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld-global-nc
- ldu: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ldu

Last verified date: 2026-03-19
