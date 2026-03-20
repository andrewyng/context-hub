# PTX Instruction Topic: activemask

`activemask` is used to retrieve the current active thread mask and is commonly used in warp-level cooperative algorithms.

## Official Description

- Documentation section: Miscellaneous Instructions: `activemask`
- Commonly used together with warp primitives such as `shfl.sync` and `vote.sync`

## Key Constraints

- The mask value reflects the set of active threads at the current execution point.
- If used after branch divergence, ensure the mask semantics are well understood.

## Example (PTX Style, Illustrative)

```ptx
activemask.b32 r_mask;
```

## Official Source Links (Fact Check)

- activemask: https://docs.nvidia.com/cuda/parallel-thread-execution/#miscellaneous-instructions-activemask
- Miscellaneous instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#miscellaneous-instructions

Last cross-check date: 2026-03-19
