---
name: blackwell-mx-numerical-formats
description: "Blackwell microscaling (MX) numeric formats essentials: MXFP8, MXFP4, MXINT8 layout requirements, scale factor management, and precision trade-offs."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,gpu,kernel,blackwell,mx,mx-formats,mxfp8,mxfp4,mxint8,microscaling,scale-factor,tcgen05"
---

# Blackwell MX Numerical Formats (C++)

Use this page when designing kernels that leverage Blackwell's Microscaling (MX) formats for extreme memory bandwidth efficiency and high-throughput inference/training.

## The Microscaling (MX) Paradigm

Standard floating-point formats use one exponent per element. Microscaling formats group multiple elements (typically a vector of 32 values) under a shared scale factor (often an E8M0 representation).

- **Benefit:** Drastically reduces memory footprint and increases effective memory bandwidth.
- **Cost:** Requires careful dynamic range analysis and block-level quantization awareness.

## Supported MX Formats

Blackwell Tensor Cores (`tcgen05`) introduce robust support for several block-scaled formats:

- **MXFP8:** Microscaled 8-bit floating point (E4M3 or E5M2 underlying data)
- **MXFP4:** Microscaled 4-bit floating point (E2M1 underlying data)
- **MXINT8:** Microscaled 8-bit integer
- **MXFP6:** (Where applicable in specialized paths)

## Memory Layout and Scale Factors

The layout of MX tensors is highly constrained by the hardware matrix instruction interfaces:

- Elements are stored contiguously in memory.
- The shared scale factor is typically laid out alongside or explicitly interleaved depending on the PTX instruction (`wgmma` or `tma` paths) requirements.
- Standard sizes: a 1-byte scale factor usually applies to a block of 32 individual elements.

## Scale Factor Management

Scale factors must be computed prior to the MMA operation, usually during the quantization phase of a previous operator (e.g., inside an activation fusion kernel).

**Anti-Pattern:** Computing the scale factor dynamically within the inner loop of the GEMM. This introduces massive dependency stalls.

**Best Practice:**
- Fuse the max-reduction and scale-factor extraction into the preceding LayerNorm/RMSNorm, saving the scale factors to a separate tensor.
- Use TMA to load both the quantized data and the scale factors into shared memory concurrently.

## Accuracy vs Throughput

MXFP4 provides the highest throughput but risks underflow/overflow if outlier values dominate the scale factor for a block of 32. MXFP8 provides a safer dynamic range for early training phases or activation tensors with higher variance.

## Related Topics

- PTX tcgen05 instructions: `../ptx/instructions/tcgen05/DOC.md`
- Numerics and precision: `../numerics-and-precision/DOC.md`
- Tensor Core pipeline patterns: `../tensor-core-pipeline-patterns/DOC.md`
- FP8 training and inference: `../fp8-training-and-inference-playbook/DOC.md`

## Official Source Links (Fact Check)

- Compute Data Formats (NVIDIA): https://docs.nvidia.com/deeplearning/tensorrt/developer-guide/index.html#compute-data-formats
- PTX ISA, tcgen05 mma instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-mma

Last cross-check date: 2026-03-22
