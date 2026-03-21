# Instruction Format and Operands (9.2)
PTX instructions typically consist of a predicate, opcode, suffix, modifiers, and an operand array. Operand rules are one of the most common sources of errors.

## Instruction Components

- Optional predicate: `@p` / `@!p`
- Opcode: e.g., `add`, `ld`, `cp.async`
- Type suffix: e.g., `.s32`, `.f32`
- Semantic modifiers: e.g., `.acquire`, `.release`, `.relaxed`
- Scope modifiers: e.g., `.cta`, `.cluster`, `.gpu`, `.sys`

## Operand Check List

- Whether the immediate ranges satisfy the definitions in the section
- Whether address operands come from valid state spaces
- Whether source/destination types permit implicit or explicit conversions
- Whether additional synchronization is required (e.g., waiting for an async copy)

## Key Facts Related to Asynchronous Instructions

The PTX documentation clearly states that `cp.async` operations do not provide completion-order guarantees by default; explicit synchronization is required using `cp.async.wait_all` / `cp.async.wait_group` or mbarrier.

## Common Failure Modes

- Modifier ordering is syntactically valid but semantically wrong for the intended memory model.
- Operand width and state-space assumptions diverge between template and instantiated code.
- Async instructions are emitted without matching wait or barrier completion paths.

## Official Source Links (Fact Check)

- Instruction Statements: https://docs.nvidia.com/cuda/parallel-thread-execution/#instruction-statements
- Instruction Operands: https://docs.nvidia.com/cuda/parallel-thread-execution/#instruction-operands
- Operand Costs: https://docs.nvidia.com/cuda/parallel-thread-execution/#operand-costs
- Asynchronous Data Movement semantics: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-data-movement-and-conversion-instructions

Last cross-check date: 2026-03-19
