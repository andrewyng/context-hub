# PTX Instruction Note: st.bulk

`st.bulk` is the bulk-store instruction family for larger transfer paths in supported state-space combinations.

## Official Positioning

- Documentation section: Data Movement and Conversion Instructions: `st.bulk`

## Key Constraints

- Source data type, destination state space, and size operands must match legal forms.
- Bulk-store usage should respect architecture-specific restrictions and completion semantics.
- Use explicit synchronization where subsequent consumers depend on completion.

## Usage Recommendations

- Prefer `st.bulk` for structured large transfers where the ISA form is supported.
- Validate that store granularity and alignment match your buffer layout.

## Example (PTX style, Illustrative)

```ptx
st.bulk.shared::cluster.u32 [addr], r1, bytes;
```

## Official Source Links (fact check)

- st.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st-bulk
- st: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st

Last verified date: 2026-03-19
