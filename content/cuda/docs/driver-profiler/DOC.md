---
name: driver-profiler
description: '**Source:** group__CUDA__PROFILER.html#group__CUDA__PROFILER'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.39. Profiler Control

**Source:** group__CUDA__PROFILER.html#group__CUDA__PROFILER


### Functions

CUresult cuProfilerStart ( void )


Enable profiling.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_CONTEXT

###### Description

Enables profile collection by the active profiling tool for the current context. If profiling is already enabled, then cuProfilerStart() has no effect.

cuProfilerStart and cuProfilerStop APIs are used to programmatically control the profiling granularity by allowing profiling to be done only on selective pieces of code.

CUresult cuProfilerStop ( void )


Disable profiling.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_CONTEXT

###### Description

Disables profile collection by the active profiling tool for the current context. If profiling is already disabled, then cuProfilerStop() has no effect.

cuProfilerStart and cuProfilerStop APIs are used to programmatically control the profiling granularity by allowing profiling to be done only on selective pieces of code.


