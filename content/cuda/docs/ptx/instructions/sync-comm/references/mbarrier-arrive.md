# PTX Instruction Topic: mbarrier.arrive

`mbarrier.arrive` performs an arrive-on operation on a specified mbarrier and is a commonly used producer-side primitive for asynchronous workflows.

## Official Syntax (Excerpt)

```ptx
mbarrier.arrive{.sem.scope}{.shared{::cta}}.b64 state, [addr]{, count};
mbarrier.arrive.expect_tx{.sem.scope}{.shared{::cta}}.b64 state, [addr], txCount;
mbarrier.arrive.noComplete{.release.cta}{.shared{::cta}}.b64 state, [addr], count;
```

## Key Semantics

- For a `.shared::cta` mbarrier, an opaque `state` value can be returned to represent the phase.
- For scenarios that use only `.shared::cluster` (not the current CTA), the target operand must be the sink `_`.
- The `.noComplete` variant must not cause the current phase to complete; otherwise, behavior is undefined.
- The `.release` semantics can synchronize with a consumer-side acquire mode.

## Usage Notes

- Use `state` together with `mbarrier.test_wait/try_wait` to avoid phase-mixing confusion.
- For remote cluster barrier scenarios, strictly follow the sink rules.

## Official Source Links (Fact Check)

- mbarrier.arrive: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier-arrive
- mbarrier.test_wait / try_wait: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier-test-wait-mbarrier-try-wait
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last cross-check date: 2026-03-19
