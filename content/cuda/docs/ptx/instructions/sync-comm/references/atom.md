# PTX Instruction Topic: atom

`atom` provides atomic read-modify-write operations for concurrently updating shared/global state.

## Official Description

- Documentation section: Parallel Synchronization and Communication Instructions: `atom`
- Common operations include add/min/max/cas/exch, etc. (depending on the type and state space)

## Key Constraints

- The combination of operand type and state space must match the specified variant.
- The memory semantics (e.g., acquire/release/relaxed) and the scope must satisfy synchronization requirements.
- Choosing the wrong scope can lead to results that look correct but are concurrency-unstable.

## Usage Notes

- Use the narrowest valid scope (`cta` before `gpu`/`sys`) to reduce coherence traffic.
- Prefer warp/block local aggregation before global atomics under high contention.

## Example (PTX Style)

```ptx
atom.global.add.u32 r_old, [addr], r_val;
```

## Official Source Links (Fact Check)

- atom: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-atom
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model
- Scope and applicability: https://docs.nvidia.com/cuda/parallel-thread-execution/#scope-and-applicability-of-the-model

Last cross-check date: 2026-03-19
