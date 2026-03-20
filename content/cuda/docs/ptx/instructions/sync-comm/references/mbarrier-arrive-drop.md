# PTX Instruction Topic: mbarrier.arrive_drop

`mbarrier.arrive_drop` removes the current thread from the set of subsequent participants while also performing the arrive-on action.

## Official Syntax (Excerpt)

```ptx
mbarrier.arrive_drop{.sem.scope}{.shared{::cta}}.b64 state, [addr]{, count};
mbarrier.arrive_drop{.sem.scope}{.shared::cluster}.b64 _, [addr]{, count};
mbarrier.arrive_drop.noComplete{.release.cta}{.shared{::cta}}.b64 state, [addr], count;
```

## Key Semantics

- Used by threads that “exit/not participate anymore” in the mbarrier protocol.
- The `.release` variant forms a release pattern and can synchronize with an acquire side.
- If the `.noComplete` variant leads to the phase completing, the behavior is undefined.
- In scenarios that use only `.shared::cluster` (not the current CTA), the destination operand must be `_`.

## Official Source Links (Fact Check)

- mbarrier.arrive_drop: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier-arrive-drop
- mbarrier.arrive: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier-arrive
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last cross-check date: 2026-03-19
