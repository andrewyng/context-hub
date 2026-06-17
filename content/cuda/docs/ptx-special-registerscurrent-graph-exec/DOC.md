---
name: ptx-special-registerscurrent-graph-exec
description: '`%current_graph_exec`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 10.33. Special Registers:%current_graph_exec

---
title: "10.33. Special Registers:%current_graph_exec"
section: 10.33
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 10.33. Special Registers:%current_graph_exec


`%current_graph_exec`

An Identifier for currently executing CUDA device graph.

Syntax (predefined)

.sreg .u64 %current_graph_exec;

Description

A predefined, read-only special register initialized with the identifier referring to the CUDA device graph being currently executed. This register is 0 if the executing kernel is not part of a CUDA device graph.

Refer to the _CUDA Programming Guide_ for more details on CUDA device graphs.

PTX ISA Notes

Introduced in PTX ISA version 8.0.

Target ISA Notes

Requires `sm_50` or higher.

Examples

mov.u64  r1, %current_graph_exec;