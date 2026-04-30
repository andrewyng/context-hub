---
name: ptx-goals-of-ptx
description: _PTX_ provides a stable programming model and instruction set for general
  purpose parallel programming. It is designed to be efficient on NVIDIA GPUs supporting
  the computation features defined by the...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 1.2. Goals of PTX

---
title: "1.2. Goals of PTX"
section: 1.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 1.2. Goals of PTX


_PTX_ provides a stable programming model and instruction set for general purpose parallel programming. It is designed to be efficient on NVIDIA GPUs supporting the computation features defined by the NVIDIA Tesla architecture. High level language compilers for languages such as CUDA and C/C++ generate PTX instructions, which are optimized for and translated to native target-architecture instructions.

The goals for PTX include the following:

* Provide a stable ISA that spans multiple GPU generations.

  * Achieve performance in compiled applications comparable to native GPU performance.

  * Provide a machine-independent ISA for C/C++ and other compilers to target.

  * Provide a code distribution ISA for application and middleware developers.

  * Provide a common source-level ISA for optimizing code generators and translators, which map PTX to specific target machines.

  * Facilitate hand-coding of libraries, performance kernels, and architecture tests.

  * Provide a scalable programming model that spans GPU sizes from a single unit to many parallel units.