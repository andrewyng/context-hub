---
name: ptx-kernel-and-function-directivesentry
description: Kernel entry point and body, with optional parameters.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.2.1. Kernel and Function Directives:.entry

---
title: "11.2.1. Kernel and Function Directives:.entry"
section: 11.2.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.2.1. Kernel and Function Directives:.entry


`.entry`

Kernel entry point and body, with optional parameters.

Syntax

.entry kernel-name ( param-list )  kernel-body
    .entry kernel-name  kernel-body

Description

Defines a kernel entry point name, parameters, and body for the kernel function.

Parameters are passed via `.param` space memory and are listed within an optional parenthesized parameter list. Parameters may be referenced by name within the kernel body and loaded into registers using `ld.param{::entry}` instructions.

In addition to normal parameters, opaque `.texref`, `.samplerref`, and `.surfref` variables may be passed as parameters. These parameters can only be referenced by name within texture and surface load, store, and query instructions and cannot be accessed via `ld.param` instructions.

The shape and size of the CTA executing the kernel are available in special registers.

Semantics

Specify the entry point for a kernel program.

At kernel launch, the kernel dimensions and properties are established and made available via special registers, e.g., `%ntid`, `%nctaid`, etc.

PTX ISA Notes

For PTX ISA version 1.4 and later, parameter variables are declared in the kernel parameter list. For PTX ISA versions 1.0 through 1.3, parameter variables are declared in the kernel body.

The maximum memory size supported by PTX for normal (non-opaque type) parameters is 32764 bytes. Depending upon the PTX ISA version, the parameter size limit varies. The following table shows the allowed parameter size for a PTX ISA version:

PTX ISA Version | Maximum parameter size (In bytes)  
---|---  
PTX ISA version 8.1 and above | 32764  
PTX ISA version 1.5 and above | 4352  
PTX ISA version 1.4 and above | 256

The CUDA and OpenCL drivers support the following limits for parameter memory:

Driver | Parameter memory size  
---|---  
CUDA | 256 bytes for `sm_1x`, 4096 bytes for `sm_2x and higher`, 32764 bytes fo `sm_70` and higher  
OpenCL | 32764 bytes for `sm_70` and higher, 4352 bytes on `sm_6x` and lower

Target ISA Notes

Supported on all target architectures.

Examples

.entry cta_fft
    .entry filter ( .param .b32 x, .param .b32 y, .param .b32 z )
    {
        .reg .b32 %r<99>;
        ld.param.b32  %r1, [x];
        ld.param.b32  %r2, [y];
        ld.param.b32  %r3, [z];
        ...
    }
    
    .entry prefix_sum ( .param .align 4 .s32 pitch[8000] )
    {
        .reg .s32 %t;
        ld.param::entry.s32  %t, [pitch];
        ...
    }