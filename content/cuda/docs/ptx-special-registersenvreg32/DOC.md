---
name: ptx-special-registersenvreg32
description: Driver-defined read-only registers.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.27. Special Registers:%envreg<32>

---
title: "10.27. Special Registers:%envreg<32>"
section: 10.27
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.27. Special Registers:%envreg<32>


`%envreg<32>`

Driver-defined read-only registers.

Syntax (predefined)

.sreg .b32 %envreg<32>;

Description

A set of 32 pre-defined read-only registers used to capture execution environment of PTX program outside of PTX virtual machine. These registers are initialized by the driver prior to kernel launch and can contain cta-wide or grid-wide values.

Precise semantics of these registers is defined in the driver documentation.

PTX ISA Notes

Introduced in PTX ISA version 2.1.

Target ISA Notes

Supported on all target architectures.

Examples

mov.b32      %r1,%envreg0;  // move envreg0 to %r1