# PTX Instruction Note: ld.global.nc

`ld.global.nc` performs non-coherent global-memory loads with cache-policy controls defined by ISA variants.

## Official Positioning

- Documentation section: Data Movement and Conversion Instructions: `ld.global.nc`

## Key Constraints

- Applicable only to legal global-memory address forms and supported type variants.
- Cache/modifier combinations must match the documented variant constraints.
- Ordering/visibility guarantees differ from coherent paths; combine with appropriate synchronization when required.

## Usage Notes

- Use `ld.global.nc` for read-mostly streams where non-coherent cache behavior is intentional.
- Validate cache-policy choices with profiler counters instead of assuming lower latency.

## Example (PTX style)

```ptx
ld.global.nc.u32 r1, [addr];
```

## Official Source Links (fact check)

- ld.global.nc: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld-global-nc
- ld: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld

Last verified date: 2026-03-19
