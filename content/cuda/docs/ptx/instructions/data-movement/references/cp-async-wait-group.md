# PTX Instruction Note: cp.async.wait_group / cp.async.wait_all

`cp.async.wait_group` / `cp.async.wait_all` is used to wait for `cp.async` groups to complete.

## Official Syntax

```ptx
cp.async.wait_group N;
cp.async.wait_all;
```

## Key Semantics

- `wait_group N`: waits until at most N recent pending groups remain, and all earlier groups complete.
- When `N=0`, waits for all prior `cp.async` groups to complete.
- This wait only applies to `cp.async` completion; it does not provide ordering/visibility for other memory operations.

## Usage Recommendations

- Execute the wait before consuming destination shared-memory data.
- Do not treat this as a general fence; it only applies to `cp.async` completion semantics.

## Common Failure Modes

- Waiting on the wrong stage depth (`N`) and reading tiles that are not yet complete.
- Mixing unrelated async pipelines into one wait protocol and causing phase confusion.
- Assuming `wait_group` replaces other synchronization steps needed by the overall algorithm.

## Official Source Links (fact check)

- cp.async.wait_group / wait_all: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-wait-group-cp-async-wait-all
- cp.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

Last verified date: 2026-03-19
