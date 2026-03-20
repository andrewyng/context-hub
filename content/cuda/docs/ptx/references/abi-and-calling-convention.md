# PTX ABI and Calling Convention (9.2)

PTX abstracts the ABI and calling convention at the `.entry` and `.func` levels; the parameter space and symbol declarations affect call correctness.

## Key Points

- `.entry`: kernel entry point, typically launched from the host side.
- `.func`: device function callable within PTX.
- Parameters are typically passed through the `.param` space.
- Function declarations and definitions must be consistent in symbols and parameters.

## Common Mistakes

- Mixing `.entry` and `.func` parameter rules.
- Inline PTX that ignores calling conventions can violate register constraints.
- Inconsistent symbol definitions across multiple files during linking.

## Official Source Links (Fact Check)

- Abstracting the ABI: https://docs.nvidia.com/cuda/parallel-thread-execution/#abstracting-the-abi
- Function Declarations and Definitions: https://docs.nvidia.com/cuda/parallel-thread-execution/#function-declarations-and-definitions
- Parameter State Space: https://docs.nvidia.com/cuda/parallel-thread-execution/#parameter-state-space
- Linking directives: https://docs.nvidia.com/cuda/parallel-thread-execution/#linking-directives

Last cross-check date: 2026-03-19
