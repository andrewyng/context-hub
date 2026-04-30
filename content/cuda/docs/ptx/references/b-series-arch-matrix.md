# B-Series Architecture Capability Matrix (PTX 9.2)

This page summarizes the target-architecture constraints in the PTX 9.2 documentation that are related to the B-Series, with a focus on `sm_100`/`sm_120` and their `a/f` family conditions.

## Key Observations (from Official Sections)

- Multiple instruction variants are explicitly marked as “requires `sm_100` or higher”.
- Some advanced variants use `sm_100a` / `sm_120a` as first-launch requirements, while also noting that `sm_100f` / `sm_120f` in the same family provide support in higher versions.
- `cp.async.bulk.tensor` and `cp.reduce.async.bulk.tensor` have type restriction entries for `sm_120a`.
- Certain modifiers related to `.multicast::cluster` and `.cp_mask` provide performance/availability notes on `sm_100+` paths.

## Capability Matrix (Current Document View)

| Capability Direction | Key Instructions/Features | Architecture Signals (Official Docs) |
|---|---|---|
| Asynchronous tensor movement | `cp.async.bulk.tensor` | `sm_100`/`sm_100a`/`sm_100f` and `sm_120a` restriction entries |
| Asynchronous reduction movement | `cp.reduce.async.bulk(.tensor)` | `sm_100+` paths + type restriction entries |
| Proxy synchronization enhancements | `fence.proxy.async` | Documented higher architecture thresholds (`sm_90`/`sm_100+` related) |
| Advanced MMA/TensorCore | `wgmma` + `tcgen05` family entry points | Documented new types and qualifier conditions on `sm_120`/`sm_120a` |

## Usage Suggestions

- For B-Series-specific paths, perform “target-architecture threshold checks” before generating code.
- Implement `a`/`f` family differences as explicit capability flags in the engineering codebase, rather than scattering them in kernel code.
- Validate all “new types/new qualifiers” via compilation and runtime checks on both `sm_100` and `sm_120` platforms.

## Official Source Links (Fact Check)

- PTX main document: https://docs.nvidia.com/cuda/parallel-thread-execution/
- PTX ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-isa-notes
- Target ISA Notes: https://docs.nvidia.com/cuda/parallel-thread-execution/#target-isa-notes
- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- cp.async.bulk.tensor: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk-tensor

Last cross-check date: 2026-03-19
