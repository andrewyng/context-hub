# PTX Instruction Note: ldu

`ldu` provides a uniform load path for addresses that are expected to be uniform across threads.

## Official Positioning

- Documentation section: Data Movement and Conversion Instructions: `ldu`

## Key Constraints

- Use only with legal `ldu` state-space/type combinations documented by ISA.
- Intended uniform-access assumptions should match actual access behavior for best results.
- Do not treat `ldu` as a generic replacement for all `ld` forms.

## Usage Recommendations

- Prefer `ldu` when operand addresses are naturally uniform within the execution group.
- Validate performance impact with profiling because benefit is pattern-dependent.

## Example (PTX style)

```ptx
ldu.global.u32 r1, [addr];
```

## Official Source Links (fact check)

- ldu: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ldu
- ld: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld
- ld.global.nc: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld-global-nc

Last verified date: 2026-03-19
