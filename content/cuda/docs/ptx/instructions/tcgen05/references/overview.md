# tcgen05 Overview

tcgen05 is the entry point chapter for TensorCore 5th Generation in PTX 9.2, covering capabilities and constraints related to new-generation matrix computations.

## Core Capability Axes

- Which data types, MMA kinds, and qualifiers are legal on the target architecture.
- Which capability subsets are gated by `sm_100*` and `sm_120*` families.
- Which async protocols are mandatory when composed with WGMMA/TMA paths.

## Usage Notes

- Treat tcgen05 as a capability map, then bind concrete instruction templates after gating.
- Keep architecture, type, and protocol checks in one validation layer to avoid drift.

## Common Failure Modes

- Selecting a legal MMA shape with an illegal type/scale combination.
- Assuming support transfers across architecture variants without checking target notes.
- Reusing async synchronization recipes that are valid for WGMMA but incomplete for tcgen05 composition.

## Quick Start Checklist

- Confirm architecture capability before selecting instruction templates.
- Validate `kind`/type/scale combinations before code generation.
- Verify async protocol completion before accumulator consumption.

## Official Source Links (Fact Check)

- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- WGMMA MMA Async: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-mma-async

Last cross-check date: 2026-03-19
