---
name: fp8-training-and-inference-playbook
description: "FP8 full stack usage playbook: E4M3 vs E5M2 formats, precision scaling factors, and accumulation hazards."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,gpu,kernel,fp8,e4m3,e5m2,training,inference,tensor-cores,llm,precision"
---

# FP8 Training and Inference Playbook

Use this page to navigate the complexities of using 8-bit floating point formats (FP8) effectively on Hopper (SM90) and Blackwell (SM100/120) architectures.

## The Two Sub-Formats

FP8 isn't a single format; it consists of two distinct encodings defined by IEEE / OCP:

- **E4M3:** (4 exponent bits, 3 mantissa bits). Smaller dynamic range, higher precision. Exclusively used for forward-pass activations and weights during inference.
- **E5M2:** (5 exponent bits, 2 mantissa bits). Larger dynamic range, lower precision. Mirrors the exponent structure of FP16. Used primarily for gradients in the backward pass during training.

## Tensor Cores and Formats

Tensor Core instructions (`mma` / `wgmma`) on architectures supporting FP8 support distinct rules:
- Inputs can be typed as either E4M3 or E5M2.
- The output (accumulator) is always a higher precision format (FP32 or FP16).
- FP8 Tensor Cores provide exactly 2x the throughput of FP16/BF16 Tensor Cores on Hopper/Blackwell.

## Dynamic Scaling Mechanics

FP8 requires an external scaling factor per tensor to avoid underflow or overflow.
When executing an FP8 GEMM ($D = \alpha \cdot A \cdot B + \beta \cdot C$):
1. **Host/Pre-pass Tracking:** Compute the absolute maximum of the upstream tensor.
2. **Quantization:** Scale the values so the maximum fits just under the maximum representable value of the FP8 format (e.g., 448 for E4M3).
3. **GEMM:** Perform the multiplied accumulating in FP32.
4. **Rescaling:** De-quantize the FP32 accumulator using the scale factors before writing back, or fuse with the next quantization step.

CUDA APIs (like `cublasLt`) often accept the scaling factors as independent parameters. If writing custom kernels, you must multiply the factors explicitly before output.

## Storage Types in C++

CUDA C++ provides intrinsic types for FP8.
- Include `<cuda_fp8.h>`
- Types: `__nv_fp8_e4m3` and `__nv_fp8_e5m2`

*Warning:* Arithmetic operations (like `+`, `*`) are not defined natively on these types by the compiler. They are strictly storage types. You must cast to `half` or `float` to do math outside of Tensor Core instructions.

## The Delayed Scaling Strategy

Calculating the max value of a tensor blocks the pipeline. A common strategy in FP8 training is "Delayed Scaling":
- Use the scale factor derived from the maximum of step $t-1$ to quantize step $t$.
- The history proves sufficient for stabilization in most LLM training regimens, avoiding synchronous reduction bottlenecks in the critical path.

## Related Topics

- Blackwell MX numeric formats: `../blackwell-mx-numerical-formats/DOC.md`
- Numerics and precision: `../numerics-and-precision/DOC.md`
- Performance debugging: `../performance-debugging/DOC.md`

## Official Source Links (Fact Check)

- Transformer Engine Documentation (NVIDIA): https://docs.nvidia.com/deeplearning/transformer-engine/user-guide/index.html
- CUDA Math API - FP8: https://docs.nvidia.com/cuda/cuda-math-api/cuda_math_api/group__CUDA__MATH__FP8.html

Last cross-check date: 2026-03-22
