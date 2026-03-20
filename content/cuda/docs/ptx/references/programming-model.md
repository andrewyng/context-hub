# PTX Programming Model (9.2)

The PTX programming model describes thread organization, execution hierarchy, state spaces, and function boundaries, and it is a prerequisite for understanding instruction semantics and synchronization scopes.

## Structured Takeaways

- Thread execution is organized at the CTA / cluster / grid hierarchy levels.
- Synchronization and visibility depend on the scope; you cannot assume visibility across scopes.
- Kernels (`.entry`) and functions (`.func`) differ in parameter and call boundaries.
- Asynchronous instructions (e.g., `cp.async`, `cp.async.bulk`, `wgmma.mma_async`) do not fully follow ordinary program order.

## Practical Interpretation

- Before choosing synchronization primitives, first determine which scope the data is shared within.
- When writing asynchronous copies or asynchronous MMA, you must explicitly wait for completion mechanisms (group or mbarrier).
- Do not infer cross-thread visibility from the apparent sequential execution behavior in a single thread.

## Official Source Links (Fact Check)

- Programming Model: https://docs.nvidia.com/cuda/parallel-thread-execution/#programming-model
- Machine Model: https://docs.nvidia.com/cuda/parallel-thread-execution/#machine-model
- State Spaces: https://docs.nvidia.com/cuda/parallel-thread-execution/#state-spaces
- Asynchronous operations notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

Last cross-check date: 2026-03-19
