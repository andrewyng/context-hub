---
name: driver-struct-cuda--ext--sem--signal--node--params--v1
description: '**Source:** structCUDA__EXT__SEM__SIGNAL__NODE__PARAMS__v1.html#structCUDA__EXT__SEM__SIGNAL__NODE__PARAMS__v1'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,struct
---

# 7.22. CUDA_EXT_SEM_SIGNAL_NODE_PARAMS_v1

**Source:** structCUDA__EXT__SEM__SIGNAL__NODE__PARAMS__v1.html#structCUDA__EXT__SEM__SIGNAL__NODE__PARAMS__v1


### Public Variables

CUexternalSemaphore* * extSemArray

unsigned int numExtSems

const CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS * paramsArray


### Variables

CUexternalSemaphore* * CUDA_EXT_SEM_SIGNAL_NODE_PARAMS_v1::extSemArray


Array of external semaphore handles.

unsigned int CUDA_EXT_SEM_SIGNAL_NODE_PARAMS_v1::numExtSems


Number of handles and parameters supplied in extSemArray and paramsArray.

const CUDA_EXTERNAL_SEMAPHORE_SIGNAL_PARAMS * CUDA_EXT_SEM_SIGNAL_NODE_PARAMS_v1::paramsArray


Array of external semaphore signal parameters.

