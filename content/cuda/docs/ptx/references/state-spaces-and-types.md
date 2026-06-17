# PTX State Spaces and Types (9.2)

PTX validity is jointly constrained by “state spaces + the type system”. Being syntactically correct alone is not sufficient to guarantee semantic correctness.

## Common State Spaces

- `.reg`: registers
- `.local`: thread-private memory
- `.shared`: CTA/cluster shared memory (depending on modifiers)
- `.global`: global memory
- `.const`: constant memory
- `.param`: parameter space

## Common Type Families

- Bit types: `.b8/.b16/.b32/.b64`
- Integer types: `.s*` / `.u*`
- Floating-point types: `.f16/.bf16/.tf32/.f32/.f64`
- Vector and packed types: commonly used in load/store, mma, and tensor operations

## Practical Constraints

- The address space for `ld/st/cp` must match the instruction variant.
- Arithmetic type suffixes must be compatible with the register declarations.
- Mixed-precision and tensor instructions often have stricter type/tile combination constraints.

## Official Source Links (Fact Check)

- State Spaces: https://docs.nvidia.com/cuda/parallel-thread-execution/#state-spaces
- Types: https://docs.nvidia.com/cuda/parallel-thread-execution/#types
- Variables: https://docs.nvidia.com/cuda/parallel-thread-execution/#variables
- Parameter State Space: https://docs.nvidia.com/cuda/parallel-thread-execution/#parameter-state-space

Last cross-check date: 2026-03-19
