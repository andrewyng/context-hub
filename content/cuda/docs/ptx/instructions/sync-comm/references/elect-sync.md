# PTX Instruction Topic: elect.sync

`elect.sync` elects a representative thread within a synchronization mask scope and is commonly used for role assignment within a warp.

## Official Description

- Documentation section: Parallel Synchronization and Communication Instructions: `elect.sync`
- Produces a consistent “elected thread” result across the participating thread set

## Usage Notes

- Use when you need a single thread to execute management logic (e.g., writing shared metadata).
- Combine with synchronization primitives such as `bar` / `mbarrier` to ensure phase consistency.

## Example (PTX Style, Illustrative)

```ptx
elect.sync %p, membermask;
@%p // elected thread path
```

## Official Source Links (Fact Check)

- elect.sync: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-elect-sync
- Parallel synchronization instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions

Last cross-check date: 2026-03-19
