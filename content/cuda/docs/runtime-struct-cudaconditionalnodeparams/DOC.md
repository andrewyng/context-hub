---
name: runtime-struct-cudaconditionalnodeparams
description: '**Source:** structcudaConditionalNodeParams.html#structcudaConditionalNodeParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.8. cudaConditionalNodeParams

**Source:** structcudaConditionalNodeParams.html#structcudaConditionalNodeParams


### Public Variables

cudaExecutionContext_t ctx

cudaGraphConditionalHandle handle

cudaGraph_t* * phGraph_out

unsigned int size

enumcudaGraphConditionalNodeType type


### Variables

cudaExecutionContext_tcudaConditionalNodeParams::ctx


CUDA Execution Context

cudaGraphConditionalHandlecudaConditionalNodeParams::handle


Conditional node handle. Handles must be created in advance of creating the node using cudaGraphConditionalHandleCreate.

cudaGraph_t* * cudaConditionalNodeParams::phGraph_out


CUDA-owned array populated with conditional node child graphs during creation of the node. Valid for the lifetime of the conditional node. The contents of the graph(s) are subject to the following constraints:

  * Allowed node types are kernel nodes, empty nodes, child graphs, memsets, memcopies, and conditionals. This applies recursively to child graphs and conditional bodies.

  * All kernels, including kernels in nested conditionals or child graphs at any level, must belong to the same CUDA context.


These graphs may be populated using graph node creation APIs or cudaStreamBeginCaptureToGraph. cudaGraphCondTypeIf: phGraph_out[0] is executed when the condition is non-zero. If `size` == 2, phGraph_out[1] will be executed when the condition is zero. cudaGraphCondTypeWhile: phGraph_out[0] is executed as long as the condition is non-zero. cudaGraphCondTypeSwitch: phGraph_out[n] is executed when the condition is equal to n. If the condition >= `size`, no body graph is executed.

unsigned int cudaConditionalNodeParams::size


Size of graph output array. Allowed values are 1 for cudaGraphCondTypeWhile, 1 or 2 for cudaGraphCondTypeIf, or any value greater than zero for cudaGraphCondTypeSwitch.

enumcudaGraphConditionalNodeTypecudaConditionalNodeParams::type


Type of conditional node.

* * *

!


Copyright © 2025 NVIDIA Corporation