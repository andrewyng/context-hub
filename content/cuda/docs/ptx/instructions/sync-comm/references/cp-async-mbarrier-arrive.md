# PTX Instruction Topic: cp.async.mbarrier.arrive

`cp.async.mbarrier.arrive` maps “completion of a prior `cp.async` operation” to an mbarrier arrive-on event.

## Official Syntax

```ptx
cp.async.mbarrier.arrive{.noinc}{.shared{::cta}}.b64 [addr];
```

## Key Semantics

- The system triggers the mbarrier arrive-on after the “`cp.async` completion that was initiated earlier by the current thread”.
- The arrive-on relative to the execution of `cp.async.mbarrier.arrive` itself is asynchronous.
- The documentation describes the ordering relationship with the prior `cp.async` and it is commonly used with `mbarrier.test_wait`.

## Usage Notes

- Use it to incorporate `cp.async` completion events into a unified mbarrier protocol.
- Keep it consistent with the participation count used by `mbarrier.init` to avoid count mismatches.

## Official Source Links (Fact Check)

- cp.async.mbarrier.arrive: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-cp-async-mbarrier-arrive
- cp.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async
- mbarrier.test_wait / try_wait: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier-test-wait-mbarrier-try-wait

Last cross-check date: 2026-03-19
