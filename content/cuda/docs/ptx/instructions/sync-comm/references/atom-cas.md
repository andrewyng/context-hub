# PTX Instruction Topic: atom.cas

`atom.cas` provides compare-and-swap atomic semantics and is a commonly used foundation instruction for lock-free data structures.

## Official Notes

- As part of the `atom` family, it has variants distinguished by address space and type.
- The documentation lists version and architecture requirements for some low-bit-width variants (e.g., `atom.cas.b16`).

## Usage Notes

- Build a lock-free update path by combining CAS with retry loops.
- Clearly specify scope and semantic modifiers to avoid cross-thread visibility issues.

## Official Source Links (Fact Check)

- atom: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-atom
- atom.cas notes in atom section: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-atom
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

Last cross-check date: 2026-03-19
