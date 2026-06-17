# PTX Instruction Topic: membar.proxy

`membar.proxy` is a cross-proxy ordering primitive, historically tied to `fence.proxy` via semantic mapping.

## Official Description

- Defined in the `membar/fence` section as the relationship between `membar.proxy` and `fence.proxy`.
- The documentation notes that on `sm_70+`, `membar.proxy` and `fence.proxy` are synonymous.

## Version and Target

- `membar.proxy` / `fence.proxy`: introduced in PTX ISA 7.5
- `membar.proxy`: requires `sm_60+`
- `fence.proxy`: requires `sm_70+`

## Usage Notes

- Use proxy fences only when data crosses proxy domains (for example, async-proxy to generic-proxy handoff).
- Do not substitute proxy fences for full protocol synchronization (`mbarrier`/barrier) when completion must also be tracked.

## Example (PTX style)

```ptx
membar.proxy.alias;
```

## Official Source Links (Fact Check)

- membar / fence: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-membar-fence
- PTX ISA notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-isa-notes
- Target ISA notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes

Last cross-check date: 2026-03-19
