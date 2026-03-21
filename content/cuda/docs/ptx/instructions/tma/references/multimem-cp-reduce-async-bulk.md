# PTX Instruction Note: multimem.cp.reduce.async.bulk

`multimem.cp.reduce.async.bulk` performs asynchronous bulk copy-reduction to multi-memory targets.

## Official Syntax (Excerpt)

```ptx
multimem.cp.reduce.async.bulk.dst.src.completion_mechanism.redOp.type [dstMem], [srcMem], size;
```

## Key Semantics

- The operation is asynchronous and reduction-enabled across multi-memory destinations.
- Completion semantics follow the selected completion mechanism for this variant family.
- Memory ordering and visibility behavior follow PTX memory-consistency and async-operation rules.

## Common Constraints

- Reduction operator and data type must be a legal ISA combination.
- `size` and address ranges must match source/destination requirements.
- Architecture restrictions apply; verify the target ISA and restrictions sections.

## Usage Notes

- Use this path when multi-memory reduction transport is required by system-level sharding design.
- Validate completion mechanism selection against downstream consumer synchronization points.

## Common Failure Modes

- Reduction operator is valid in isolation but illegal for the selected multimem variant.
- Completion mechanism is correct for copy but insufficient for consumer visibility requirements.

## Official Source Links (fact check)

- multimem.cp.reduce.async.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-multimem-cp-reduce-async-bulk
- cp.reduce.async.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-reduce-async-bulk
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last verified date: 2026-03-19
