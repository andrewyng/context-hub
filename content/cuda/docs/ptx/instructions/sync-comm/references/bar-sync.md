# PTX Instruction Topic: bar.sync

`bar.sync` is a commonly used barrier synchronization form that waits for the participating threads to rendezvous before continuing.

## Official Notes

- Supports variants with no thread count as well as variants with a thread count (see the section examples).
- Commonly used for phase transitions within a CTA and as boundaries for shared-memory reads/writes.

## Example (PTX Style)

```ptx
bar.sync 0;
bar.sync 1, 64;
```

## Usage Notes

- Synchronize only the set of threads that participate in the same barrier protocol.
- Cannot replace specialized completion-wait mechanisms for `cp.async` / `wgmma`.
- Keep barrier identifier usage deterministic across all participating threads.
- Prefer full-CTA barriers unless a subset barrier protocol is explicitly designed and verified.

## Common Failure Modes

- Barrier id is reused by overlapping protocols in the same kernel phase.
- Some participant threads bypass the barrier due to conditional control flow.
- Barrier placement is correct for compute but misses shared-memory producer-consumer boundaries.

## Official Source Links (Fact Check)

- barrier: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-barrier
- bar.sync examples context: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions

Last cross-check date: 2026-03-19
