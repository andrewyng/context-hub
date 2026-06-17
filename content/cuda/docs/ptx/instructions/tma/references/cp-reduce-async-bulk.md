# PTX Instruction Note: cp.reduce.async.bulk

`cp.reduce.async.bulk` is an async bulk reduction-copy instruction that performs element-wise reduction during transfer.

## Official Syntax (Excerpt)

```ptx
cp.reduce.async.bulk.dst.src.completion_mechanism.redOp.type [dstMem], [srcMem], size, [mbar];
cp.reduce.async.bulk.dst.src.completion_mechanism.add.noftz.type [dstMem], [srcMem], size, [mbar];
```

## Key Semantics

- The instruction is non-blocking and issues asynchronous reduction work.
- `.mbarrier::complete_tx::bytes`: executes complete-tx on mbarrier at completion.
- `.bulk_group`: uses bulk async-group completion.
- The docs classify this path as a weak memory operation; reduction has `.relaxed.gpu` semantics.

## Detailed Constraints (Official Highlights)

- `size` specifies equal source/destination array length.
- `add.f16/add.bf16` requires `.noftz`.
- Some sub-byte types are unsupported (see restrictions section).

## Official Source Links (fact check)

- cp.reduce.async.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-reduce-async-bulk
- Async data movement instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-data-movement-and-conversion-instructions
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last verified date: 2026-03-19
