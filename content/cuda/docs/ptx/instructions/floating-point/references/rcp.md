# PTX Instruction Note: rcp

`rcp` computes reciprocal for the selected floating-point variant.

## Official Positioning

- Documentation section: Floating Point Instructions: `rcp`
- Related extension: `rcp.approx.ftz.f64`

## Key Constraints

- Distinguish exact/rounded vs approximate variants based on requirements.
- Zero and exceptional input behavior follows ISA-defined floating-point semantics.
- Validate error tolerance before using approximate forms in iterative kernels.

## Usage Notes

- Use `rcp` to replace scalar division hot paths when reciprocal error is acceptable.
- Reassess convergence/stability if approximate reciprocals feed iterative updates.

## Example (PTX style)

```ptx
rcp.rn.f32 d, a;
```

## Official Source Links (fact check)

- rcp: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-rcp
- rcp.approx.ftz.f64: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-rcp-approx-ftz-f64

Last verified date: 2026-03-19
