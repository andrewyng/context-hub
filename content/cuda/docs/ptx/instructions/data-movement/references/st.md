# PTX Instruction Note: st

`st` stores register values to memory in the specified state space and type form.

## Official Positioning

- Documentation section: Data Movement and Conversion Instructions: `st`

## Key Constraints

- Destination address state space must match the selected `st` variant.
- Source register type must match stored element type.
- For concurrent shared-data read/write, establish ordering with fence/atom/barrier.

## Usage Notes

- Keep alignment and element-size choices consistent with consumer load patterns.
- Use the narrowest valid state-space form and pair with explicit synchronization when required.

## Example (PTX style)

```ptx
st.global.u32 [addr], r1;
st.shared.f32 [saddr], f1;
```

## Official Source Links (fact check)

- st: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st
- st.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st-async
- st.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st-bulk

Last verified date: 2026-03-19
