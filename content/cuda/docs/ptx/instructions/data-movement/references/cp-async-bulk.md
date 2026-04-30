# PTX Instruction Note: cp.async.bulk

`cp.async.bulk` is a bulk async copy instruction with mbarrier-based completion, suitable for larger transfers.

## Official Syntax (Representative Form)

```ptx
cp.async.bulk.shared::cta.global.mbarrier::complete_tx::bytes [dstMem], [srcMem], size, [mbar];
cp.async.bulk.shared::cluster.global.mbarrier::complete_tx::bytes [dstMem], [srcMem], size, [mbar];
```

## Key Semantics

- The instruction executes on the async proxy and is a weak memory operation.
- Completion can be configured via `.mbarrier::complete_tx::bytes`.
- complete-tx carries `completeCount=bytes` on the mbarrier.
- The documentation states completion is followed by an implicit generic-async proxy fence.
- You still need async-group or mbarrier waits before consuming the data.

## Key Constraints

- Source/destination state spaces must match the selected bulk variant form.
- `size` and operand alignment must satisfy ISA requirements for the target architecture.
- Completion tracking must be explicit before downstream consumers read results.

## Official Source Links (fact check)

- cp.async.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk
- Asynchronous data movement: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-data-movement-and-conversion-instructions
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last verified date: 2026-03-19
