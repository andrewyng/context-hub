---
name: weight-only-quantization-patterns
description: "Weight-only quantization (W4A16, W8A16) kernel patterns: bit-packing, fast dequantization with lop3/prmt, and SM90 sub-byte loads."
metadata:
  languages: "cpp"
  versions: "12.9"
  revision: 1
  updated-on: "2026-03-22"
  source: official
  tags: "cuda,gpu,kernel,w4a16,w8a16,awq,gptq,int4,int8,quantization,weight-only,memory-bound,dequantization"
---

# Weight-Only Quantization Patterns (W4A16 / AWQ / GPTQ)

Use this page when writing memory-bound inference kernels (like LLM decoding GEMV) that rely on extremely compressed weights while holding activations in floating point.

## The Memory vs Compute Imbalance

In decoding (batch size = 1), computing $O = q \cdot W_{fp16}$ requires reading $W$ from memory. Because the ALU is so fast, the GPU will stall waiting for bytes. 

By aggressively quantifying weights to INT4 (4-bits) or INT8 (8-bits) but keeping activations in FP16/BF16 (termed W4A16 or W8A16):
- We drastically reduce memory bandwidth pressure.
- We utilize the idle ALUs to do on-the-fly "unpacking and dequantizing" in registers.

## The Bit-Packing Layout (W4A16)

NVIDIA hardware does not have a native 4-bit load instruction from global/shared memory.
- You must load packed 32-bit registers (e.g., eight 4-bit elements packed into one `int32_t`).
- **Memory Format:** Weights must be physically transposed/interleaved at the block level prior to runtime so that when they are loaded via `LDG.128` (float4), the unpacking phase produces data that seamlessly feeds into Tensor Cores or dot products.

## Unpacking and Dequantization in PTX

De-quantizing W4A16 back to FP16 in registers is the critical inner loop. Using native C++ bitwise shifts (`w >> 4`) is far too slow and compiles to suboptimal SASS.

**Best Practice PTX Instructions:**
- **`lop3.b32`:** A versatile logic operation that evaluates arbitrary boolean equations on 3 registers in a single cycle. Excellent for masking out integer fragments.
- **`prmt.b32` (Byte Permute):** Extremely fast for extracting sub-bytes from a register into different lanes without shifting.
- **`cvt` / `fma`:** Convert the isolated integers into floats and multiply by the group `Scale` and subtract the group `ZeroPoint`.

## The Group Size Paradigm

Linear quantization over an entire layer destroys accuracy. Methods like AWQ and GPTQ apply quantization over small "groups" (typically $G=64$ or $G=128$).
- For every 128 INT4 weights, memory must also store exactly one FP16 `Scale` and one FP16 (or INT4) `ZeroPoint`.
- **Kernel Design Impact:** Your warp loop must issue a separate load to fetch the Scale/ZeroPoint matrix interleaved with the packed weight fetches to prevent register clobbering.

## Hardware Support (SM90/SM100)

While Ampere/Ada require manual extraction, Hopper (SM90) and Blackwell Tensor Cores provide increasing native support for fused unpacking matrix multiplications (e.g., executing W4A16 MMA natively without explicitly de-quantizing to FP16 in the register file first).
- Check `tcgen05` and `wgmma` documentation for native mixed-precision MMA paths before manually coding a `lop3` unroll.

## Related Topics

- LLM Decoding GEMV Optimization: `../llm-decoding-gemv-optimization/DOC.md`
- Blackwell MX numerical formats: `../blackwell-mx-numerical-formats/DOC.md`

## Official Source Links (Fact Check)

- AWQ: Activation-aware Weight Quantization for LLM Compression: https://arxiv.org/abs/2306.00978
- GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers: https://arxiv.org/abs/2210.17323
- PTX ISA Logic and Byte instructions: https://docs.nvidia.com/cuda/parallel-thread-execution/#logic-and-shift-instructions

Last cross-check date: 2026-03-22
