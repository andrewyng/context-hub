---
name: runtime-struct-cudagraphexecupdateresultinfo
description: '**Source:** structcudaGraphExecUpdateResultInfo.html#structcudaGraphExecUpdateResultInfo'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.32. cudaGraphExecUpdateResultInfo

**Source:** structcudaGraphExecUpdateResultInfo.html#structcudaGraphExecUpdateResultInfo


### Public Variables

cudaGraphNode_t errorFromNode

cudaGraphNode_t errorNode

enumcudaGraphExecUpdateResult result


### Variables

cudaGraphNode_tcudaGraphExecUpdateResultInfo::errorFromNode


The from node of error edge when the topologies do not match. Otherwise NULL.

cudaGraphNode_tcudaGraphExecUpdateResultInfo::errorNode


The "to node" of the error edge when the topologies do not match. The error node when the error is associated with a specific node. NULL when the error is generic.

enumcudaGraphExecUpdateResultcudaGraphExecUpdateResultInfo::result


Gives more specific detail when a cuda graph update fails.

* * *

!


Copyright © 2025 NVIDIA Corporation