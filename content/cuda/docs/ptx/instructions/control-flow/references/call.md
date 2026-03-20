# PTX Instruction Topic: call

`call` is used for device function calls, involving parameter passing and calling conventions.

## Official Description

- Documentation section: Control Flow Instructions: `call`
- Related to `.func` declarations, the `.param` parameter space, and ABI constraints

## Key Constraints

- The parameter list must match the callee function signature.
- Register/return value semantics along the calling path must be consistent.
- Under conditional execution, avoid control-flow inconsistencies that could lead to undefined behavior.

## Example (PTX Style)

```ptx
call.uni (retval), my_func, (arg0, arg1);
```

## Official Source Links (Fact Check)

- call: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions-call
- Function declarations and definitions: https://docs.nvidia.com/cuda/parallel-thread-execution/#function-declarations-and-definitions
- Abstracting the ABI: https://docs.nvidia.com/cuda/parallel-thread-execution/#abstracting-the-abi

Last cross-check date: 2026-03-19
