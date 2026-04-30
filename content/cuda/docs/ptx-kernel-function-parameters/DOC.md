---
name: ptx-kernel-function-parameters
description: Each kernel function definition includes an optional list of parameters.
  These parameters are addressable, read-only variables declared in the `.param` state
  space. Values passed from the host to the ...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 5.1.6.1. Kernel Function Parameters

---
title: "5.1.6.1. Kernel Function Parameters"
section: 5.1.6.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 5.1.6.1. Kernel Function Parameters


Each kernel function definition includes an optional list of parameters. These parameters are addressable, read-only variables declared in the `.param` state space. Values passed from the host to the kernel are accessed through these parameter variables using `ld.param` instructions. The kernel parameter variables are shared across all CTAs from all clusters within a grid.

The address of a kernel parameter may be moved into a register using the `mov` instruction. The resulting address is in the `.param` state space and is accessed using `ld.param` instructions.

Example

.entry foo ( .param .b32 N, .param .align 8 .b8 buffer[64] )
    {
        .reg .u32 %n;
        .reg .f64 %d;
    
        ld.param.u32 %n, [N];
        ld.param.f64 %d, [buffer];
        ...

Example

.entry bar ( .param .b32 len )
    {
        .reg .u32 %ptr, %n;
    
        mov.u32      %ptr, len;
        ld.param.u32 %n, [%ptr];
        ...

Kernel function parameters may represent normal data values, or they may hold addresses to objects in constant, global, local, or shared state spaces. In the case of pointers, the compiler and runtime system need information about which parameters are pointers, and to which state space they point. Kernel parameter attribute directives are used to provide this information at the PTX level. See [Kernel Function Parameter Attributes](<#kernel-function-parameter-attributes>) for a description of kernel parameter attribute directives.

Note  
  
The current implementation does not allow creation of generic pointers to constant variables (`cvta.const`) in programs that have pointers to constant buffers passed as kernel parameters.