---
name: ptx-document-structure
description: 'The information in this document is organized into the following Chapters:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 1.4. Document Structure

---
title: "1.4. Document Structure"
section: 1.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 1.4. Document Structure


The information in this document is organized into the following Chapters:

* [Programming Model](<#programming-model>) outlines the programming model.

  * [PTX Machine Model](<#ptx-machine-model>) gives an overview of the PTX virtual machine model.

  * [Syntax](<#syntax>) describes the basic syntax of the PTX language.

  * [State Spaces, Types, and Variables](<#state-spaces-types-and-variables>) describes state spaces, types, and variable declarations.

  * [Instruction Operands](<#instruction-operands>) describes instruction operands.

  * [Abstracting the ABI](<#abstracting-abi>) describes the function and call syntax, calling convention, and PTX support for abstracting the _Application Binary Interface (ABI)_.

  * [Instruction Set](<#instruction-set>) describes the instruction set.

  * [Special Registers](<#special-registers>) lists special registers.

  * [Directives](<#directives>) lists the assembly directives supported in PTX.

  * [Release Notes](<#release-notes>) provides release notes for PTX ISA versions 2.x and beyond.

References

* 754-2008 IEEE Standard for Floating-Point Arithmetic. ISBN 978-0-7381-5752-8, 2008.

[http://ieeexplore.ieee.org/servlet/opac?punumber=4610933](<http://ieeexplore.ieee.org/servlet/opac?punumber=4610933>)

  * The OpenCL Specification, Version: 1.1, Document Revision: 44, June 1, 2011.

[http://www.khronos.org/registry/cl/specs/opencl-1.1.pdf](<http://www.khronos.org/registry/cl/specs/opencl-1.1.pdf>)

  * CUDA Programming Guide.

[https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html](<https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html>)

  * CUDA Dynamic Parallelism Programming Guide.

[https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#cuda-dynamic-parallelism](<https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#cuda-dynamic-parallelism>)

  * CUDA Atomicity Requirements.

[https://nvidia.github.io/cccl/libcudacxx/extended_api/memory_model.html#atomicity](<https://nvidia.github.io/cccl/libcudacxx/extended_api/memory_model.html#atomicity>)

  * PTX Writers Guide to Interoperability.

[https://docs.nvidia.com/cuda/ptx-writers-guide-to-interoperability/index.html](<https://docs.nvidia.com/cuda/ptx-writers-guide-to-interoperability/index.html>)