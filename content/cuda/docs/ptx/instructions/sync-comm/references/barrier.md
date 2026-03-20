# PTX Instruction Topic: barrier

The `barrier` family is used for thread-cooperative synchronization and is commonly used for phase transitions at the CTA/cluster level.

## Official Description

- Use `barrier` when you need threads to rendezvous before continuing.
- When you need to track completion of an asynchronous transfer, prefer the async-group / mbarrier mechanism specified in the documentation; do not use `barrier` as a substitute.

## Official Source Links (Fact Check)

- barrier: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-barrier
- Parallel synchronization instruction set: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

Last cross-check date: 2026-03-19
