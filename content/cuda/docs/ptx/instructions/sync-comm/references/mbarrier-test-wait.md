# PTX Instruction Topic: mbarrier.test_wait / mbarrier.try_wait

`mbarrier.test_wait` / `mbarrier.try_wait` are used to test whether an mbarrier phase has completed and are commonly used wait primitives on the consumer side for asynchronous transfers.

## Official Syntax (Excerpt)

```ptx
mbarrier.test_wait{.sem.scope}{.shared{::cta}}.b64        waitComplete, [addr], state;
mbarrier.test_wait.parity{.sem.scope}{.shared{::cta}}.b64 waitComplete, [addr], phaseParity;
```

## Key Semantics

- `test_wait` is a non-blocking test.
- When used with `.acquire` and returning `True`, it forms an acquire mode (see the memory model section).
- `.scope` defaults to `.cta` when not explicitly specified.

## Version and Target

- Documentation indicates `mbarrier.test_wait` was introduced in PTX ISA 7.0.
- Documentation indicates it requires `sm_80` or higher.

## Minimal Mode

```ptx
mbarrier.test_wait.shared::cta.b64 p, [mbar_addr], state;
@!p bra retry;
```

## Official Source Links (Fact Check)

- mbarrier.test_wait / try_wait: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier-test-wait-mbarrier-try-wait
- mbarrier family: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last cross-check date: 2026-03-19
