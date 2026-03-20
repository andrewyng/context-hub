# PTX Instruction Topic: trap

`trap` is used to trigger exceptions/debug traps and is commonly used on error paths or as a debugging breakpoint.

## Official Description

- Documentation section: Control Flow Instructions: `trap`
- Mainly used for diagnostics and fail-fast scenarios

## Usage Notes

- Trigger it only under clearly defined error conditions.
- Use it cautiously on production paths to avoid impacting throughput.

## Example (PTX Style)

```ptx
@p trap;
```

## Official Source Links (Fact Check)

- trap: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions-trap
- Control flow instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions

Last cross-check date: 2026-03-19
