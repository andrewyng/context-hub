---
name: runtime-struct-cudachildgraphnodeparams
description: '**Source:** structcudaChildGraphNodeParams.html#structcudaChildGraphNodeParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.7. cudaChildGraphNodeParams

**Source:** structcudaChildGraphNodeParams.html#structcudaChildGraphNodeParams


### Public Variables

cudaGraph_t graph

enumcudaGraphChildGraphNodeOwnership ownership


### Variables

cudaGraph_tcudaChildGraphNodeParams::graph


The child graph to clone into the node for node creation, or a handle to the graph owned by the node for node query. The graph must not contain conditional nodes. Graphs containing memory allocation or memory free nodes must set the ownership to be moved to the parent.

enumcudaGraphChildGraphNodeOwnershipcudaChildGraphNodeParams::ownership


The ownership relationship of the child graph node.

* * *

!


Copyright © 2025 NVIDIA Corporation