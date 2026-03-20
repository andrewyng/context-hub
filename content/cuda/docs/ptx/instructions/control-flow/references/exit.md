# PTX Instruction Topic: exit

`exit` terminates the current thread’s execution and is a thread-level exit primitive inside a kernel.

## Official Description

- Documentation section: Control Flow Instructions: `exit`
- Commonly used for early-exit paths and boundary-condition handling

## Key Constraints

- Before exiting, ensure that shared-state updates and synchronization requirements are satisfied.
- Avoid issuing `exit` early at points that require all participants in a synchronization, otherwise the protocol may be mismatched.

## Example (PTX Style)

```ptx
@p exit;
```

## Official Source Links (Fact Check)

- exit: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions-exit
- Control flow instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions

Last cross-check date: 2026-03-19
