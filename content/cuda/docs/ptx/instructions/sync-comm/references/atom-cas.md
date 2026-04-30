# PTX Instruction Topic: atom.cas

`atom.cas` provides compare-and-swap atomic semantics and is a commonly used foundation instruction for lock-free data structures.

## Official Notes

- As part of the `atom` family, it has variants distinguished by address space and type.
- The documentation lists version and architecture requirements for some low-bit-width variants (e.g., `atom.cas.b16`).

## Usage Notes

- Build a lock-free update path by combining CAS with retry loops.
- Clearly specify scope and semantic modifiers to avoid cross-thread visibility issues.
- Ensure the target address is naturally aligned for the selected data width.
- Keep producer/consumer memory-order assumptions consistent with the selected atom semantics.

## Common Failure Modes

- CAS retry loops omit backoff under heavy contention and stall forward progress.
- `expected` value reuse is incorrect after failed CAS attempts.
- Scope/semantic modifiers do not match producer-consumer visibility requirements.

## Example (PTX style)

```ptx
atom.cas.gpu.global.u32 old, [addr], expected, desired;
```

## Official Source Links (Fact Check)

- atom: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-atom
- atom.cas notes in atom section: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-atom
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last cross-check date: 2026-03-19
