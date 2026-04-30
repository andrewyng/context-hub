# PTX Instruction Note: st.async

`st.async` issues asynchronous store operations with completion signaling in supported variants.

## Official Positioning

- Documentation section: Data Movement and Conversion Instructions: `st.async`

## Key Semantics

- Operation is asynchronous; consumer visibility must follow explicit completion/synchronization rules.
- mbarrier-based completion variants publish transfer completion through documented mechanisms.
- Ordering and visibility follow PTX async-operation and memory-consistency semantics.

## Usage Notes

- Keep each asynchronous store pipeline tied to a clear barrier/phase protocol.
- Avoid mixing unrelated producer paths into the same completion channel.

## Example (PTX style)

```ptx
st.async.shared::cluster.mbarrier::complete_tx::bytes.u32 [addr], b, [mbar_addr];
```

## Official Source Links (fact check)

- st.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st-async
- mbarrier: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last verified date: 2026-03-19
