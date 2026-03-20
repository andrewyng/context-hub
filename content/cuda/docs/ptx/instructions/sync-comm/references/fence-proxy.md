# PTX Instruction Topic: fence.proxy

`fence.proxy` establishes ordering relationships across proxies, especially for synchronization between proxies such as generic/async/tensormap.

## Official Syntax (Excerpt)

```ptx
fence.proxy.proxykind;
fence.proxy.to_proxykind::from_proxykind.release.scope;
fence.proxy.to_proxykind::from_proxykind.acquire.scope [addr], size;
```

## Key Semantics

- Addresses ordering issues when the same memory location is accessed through different proxies.
- `fence.proxy.async` is used to synchronize between generic proxy and async proxy.
- The documentation provides the version and target-architecture requirements for `fence.proxy.async`.

## Official Source Links (Fact Check)

- membar / fence (including fence.proxy): https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-membar-fence
- Asynchronous operations notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last cross-check date: 2026-03-19
