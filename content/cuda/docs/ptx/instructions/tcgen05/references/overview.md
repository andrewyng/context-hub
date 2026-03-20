# tcgen05 Overview

tcgen05 is the entry point chapter for TensorCore 5th Generation in PTX 9.2, covering capabilities and constraints related to new-generation matrix computations.

## What You Need to Pay Attention To

- Which types/shape/qualifiers are available on the new architecture.
- Which capabilities are enabled only on `sm_100` and `sm_120`.
- When working together with WGMMA/TMA, which synchronization protocols are mandatory.

## Official Source Links (Fact Check)

- TensorCore 5th Generation: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-instructions
- WGMMA MMA Async: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-warpgroup-level-matrix-instructions-wgmma-mma-async

Last cross-check date: 2026-03-19
