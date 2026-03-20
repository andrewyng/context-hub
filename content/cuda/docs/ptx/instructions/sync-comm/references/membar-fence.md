# PTX Instruction Topic: membar / fence

`membar`/`fence` establish ordering for memory accesses and are fundamental primitives for correctness in concurrent execution.

## Official Syntax (Excerpt)

```ptx
membar.gl;
membar.cta;
membar.sys;
fence.sc.cta;
fence.sc.cluster;
```

## Key Semantics

- `membar` ensures that prior memory accesses in the current thread are observed before subsequent accesses at the specified level.
- The documentation explains that `fence.sc` can restore sequential consistency at sufficient locations, but with a higher cost.
- On `sm_70+`, the semantic relationship between `membar` and `fence.sc` is clearly documented as being compatible (see the section notes).

## Version and Target

- `membar.{cta,gl}`: introduced in PTX ISA 1.4
- `membar.sys`: introduced in PTX ISA 2.0, requires `sm_20+`
- `membar.proxy` / `fence.proxy`: introduced in PTX ISA 7.5

## Official Source Links (Fact Check)

- membar / fence: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-membar-fence
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model
- Scope and applicability: https://docs.nvidia.com/cuda/parallel-thread-execution/#scope-and-applicability-of-the-model

Last cross-check date: 2026-03-19
