---
name: runtime-struct-cudagraphinstantiateparams
description: '**Source:** structcudaGraphInstantiateParams.html#structcudaGraphInstantiateParams'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.33. cudaGraphInstantiateParams

**Source:** structcudaGraphInstantiateParams.html#structcudaGraphInstantiateParams


### Public Variables

cudaGraphNode_t errNode_out

unsigned long long flags

cudaGraphInstantiateResult result_out

cudaStream_t uploadStream


### Variables

cudaGraphNode_tcudaGraphInstantiateParams::errNode_out


The node which caused instantiation to fail, if any

unsigned long long cudaGraphInstantiateParams::flags


Instantiation flags

cudaGraphInstantiateResultcudaGraphInstantiateParams::result_out


Whether instantiation was successful. If it failed, the reason why

cudaStream_tcudaGraphInstantiateParams::uploadStream


Upload stream

* * *

!


Copyright © 2025 NVIDIA Corporation