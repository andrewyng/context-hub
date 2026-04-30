# PTX Instruction Topic: brx.idx

`brx.idx` is an index-based branch control flow instruction, commonly used for jump-table-style dispatch.

## Official Description

- Documentation section: Control Flow Instructions: `brx.idx`
- Used to select the branch target based on an index value

## Key Constraints

- The index range must match the number of valid table entries.
- The strategy for handling invalid indices should be clearly defined in higher-level logic.
- Conditional paths must keep warp-level control-flow consistency manageable.

## Usage Notes

- Use `brx.idx` for dense dispatch tables where branch targets are static and well-audited.
- Include a default-safe path for out-of-range indices before deployment on variable inputs.

## Example (PTX Style, Illustrative)

```ptx
brx.idx idx, table;
```

## Official Source Links (Fact Check)

- brx.idx: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions-brx-idx
- Control flow instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#control-flow-instructions

Last cross-check date: 2026-03-19
