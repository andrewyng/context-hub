# PTX Instruction Note: prefetch / prefetchu

`prefetch` and `prefetchu` provide advisory cache prefetch behavior for eligible memory access patterns.

## Official Positioning

- Documentation section: Data Movement and Conversion Instructions: `prefetch, prefetchu`

## Key Constraints

- Prefetch instructions are hints; they do not guarantee residency or strict ordering semantics.
- Address form and state-space usage must match legal variants.
- Overuse can add overhead without gain when locality is weak.

## Usage Recommendations

- Use for predictable forward-access streams where cache warmup is beneficial.
- Confirm benefit with profiler metrics rather than assuming speedup.
- Combine with coalesced access patterns; prefetch does not fix poor memory layout.

## Example (PTX style, Illustrative)

```ptx
prefetch.global.L2 [addr];
```

## Official Source Links (fact check)

- prefetch, prefetchu: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-prefetch-prefetchu
- Data movement instruction set: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions

Last verified date: 2026-03-19
