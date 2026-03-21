# PTX Instruction Topic: red

`red` is a parallel reduction-update instruction family: it performs an atomic reduction on a specified memory location and writes the result back to the same location (overwriting the original value).

## Official Description

- Documentation section: Parallel Synchronization and Communication Instructions: `red`
- Compared with `atom`/`atom.*`, the core semantic of `red` is reduction write-back; whether an additional destination register exists/ is used depends on the specific variant syntax (see the corresponding ISA subsection).

## Key Constraints

- The operation type and the target address space must match the specific `red` variant.
- Concurrency semantics depend on the specified memory semantics and scope.
- It must be used together with consumer-side synchronization primitives to ensure visibility.

## Usage Notes

- Use `red` when you only need in-place accumulation and do not require the previous value.
- Combine with hierarchical reduction (warp/block first) to reduce global contention.

## Example (PTX Style)

```ptx
red.global.add.u32 [addr], r1;
```

## Official Source Links (Fact Check)

- red: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-red
- red.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-red-async
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last cross-check date: 2026-03-19
