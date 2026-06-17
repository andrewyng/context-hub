---
name: ptx-matrix-shape
description: The matrix multiply and accumulate operations support a limited set of
  shapes for the operand matrices A, B and D. The shapes of all three matrix operands
  are collectively described by the tuple `MxNx...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.15.2. Matrix Shape

---
title: "9.7.15.2. Matrix Shape"
section: 9.7.15.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.15.2. Matrix Shape


The matrix multiply and accumulate operations support a limited set of shapes for the operand matrices A, B and D. The shapes of all three matrix operands are collectively described by the tuple `MxNxK`, where A is an `MxK` matrix, B is a `KxN` matrix, while D is a `MxN` matrix.

The following matrix shapes are supported for the specified types for the `wgmma.mma_async` operation:

Multiplicand Data type | Sparsity | Shape  
---|---|---  
Floating-point - `.f16` | Dense | `.m64n8k16`, `.m64n16k16`, `.m64n24k16`, `.m64n32k16`, `.m64n40k16`, `.m64n48k16`, `.m64n56k16`, `.m64n64k16`, `.m64n72k16`, `.m64n80k16`, `.m64n88k16`, `.m64n96k16`, `.m64n104k16`, `.m64n112k16`, `.m64n120k16`, `.m64n128k16`, `.m64n136k16`, `.m64n144k16`, `.m64n152k16`, `.m64n160k16`, `.m64n168k16`, `.m64n176k16`, `.m64n184k16`, `.m64n192k16`, `.m64n200k16`, `.m64n208k16`, `.m64n216k16`, `.m64n224k16`, `.m64n232k16`, `.m64n240k16`, `.m64n248k16`, `.m64n256k16`  
Alternate floating-point format - `.bf16`  
Alternate floating-point format - `.tf32` | Sparse  
Alternate floating-point format - `.tf32` | Dense | `.m64n8k8`, `.m64n16k8`, `.m64n24k8`, `.m64n32k8`, `.m64n40k8`, `.m64n48k8`, `.m64n56k8`, `.m64n64k8`, `.m64n72k8`, `.m64n80k8`, `.m64n88k8`, `.m64n96k8`, `.m64n104k8`, `.m64n112k8`, `.m64n120k8`, `.m64n128k8`, `.m64n136k8`, `.m64n144k8`, `.m64n152k8`, `.m64n160k8`, `.m64n168k8`, `.m64n176k8`, `.m64n184k8`, `.m64n192k8`, `.m64n200k8`, `.m64n208k8`, `.m64n216k8`, `.m64n224k8`, `.m64n232k8`, `.m64n240k8`, `.m64n248k8`, `.m64n256k8`  
Alternate floating-point format - `.e4m3`/ `.e5m2` | Dense | `.m64n8k32`, `.m64n16k32`, `.m64n24k32`, `.m64n32k32`, `.m64n40k32`, `.m64n48k32`, `.m64n56k32`, `.m64n64k32`, `.m64n72k32`, `.m64n80k32`, `.m64n88k32`, `.m64n96k32`, `.m64n104k32`, `.m64n112k32`, `.m64n120k32`, `.m64n128k32`, `.m64n136k32`, `.m64n144k32`, `.m64n152k32`, `.m64n160k32`, `.m64n168k32`, `.m64n176k32`, `.m64n184k32`, `.m64n192k32`, `.m64n200k32`, `.m64n208k32`, `.m64n216k32`, `.m64n224k32`, `.m64n232k32`, `.m64n240k32`, `.m64n248k32`, `.m64n256k32`  
Floating point - `.f16` | Sparse  
Altername floating-point format - `.bf16`  
Integer - `.u8`/`.s8` | Dense | `.m64n8k32`, `.m64n16k32`, `.m64n24k32`, `.m64n32k32`, `.m64n48k32`, `.m64n64k32`, `.m64n80k32`, `.m64n96k32`, `.m64n112k32`, `.m64n128k32`, `.m64n144k32`, `.m64n160k32`, `.m64n176k32`, `.m64n192k32`, `.m64n208k32`, `.m64n224k32`, `.m64n240k32`, `.m64n256k32`  
Alternate floating-point format - `.e4m3`/ `.e5m2` | Sparse | `.m64n8k64`, `.m64n16k64`, `.m64n24k64`, `.m64n32k64`, `.m64n40k64`, `.m64n48k64`, `.m64n56k64`, `.m64n64k64`, `.m64n72k64`, `.m64n80k64`, `.m64n88k64`, `.m64n96k64`, `.m64n104k64`, `.m64n112k64`, `.m64n120k64`, `.m64n128k64`, `.m64n136k64`, `.m64n144k64`, `.m64n152k64`, `.m64n160k64`, `.m64n168k64`, `.m64n176k64`, `.m64n184k64`, `.m64n192k64`, `.m64n200k64`, `.m64n208k64`, `.m64n216k64`, `.m64n224k64`, `.m64n232k64`, `.m64n240k64`, `.m64n248k64`, `.m64n256k64`  
Integer - `.u8`/`.s8` | Sparse | `.m64n8k64`, `.m64n16k64`, `.m64n24k64`, `.m64n32k64`, `.m64n48k64`, `.m64n64k64`, `.m64n80k64`, `.m64n96k64`, `.m64n112k64`, `.m64n128k64`, `.m64n144k64`, `.m64n160k64`, `.m64n176k64`, `.m64n192k64`, `.m64n208k64`, `.m64n224k64`, `.m64n240k64`, `.m64n256k64`  
Single-bit - `.b1` | Dense | `.m64n8k256`, `.m64n16k256`, `.m64n24k256`, `.m64n32k256`, `.m64n48k256`, `.m64n64k256`, `.m64n80k256`, `.m64n96k256`, `.m64n112k256`, `.m64n128k256`, `.m64n144k256`, `.m64n160k256`, `.m64n176k256`, `.m64n192k256`, `.m64n208k256`, `.m64n224k256`, `.m64n240k256`, `.m64n256k256`