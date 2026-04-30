---
name: driver-profiler--deprecated
description: '**Source:** group__CUDA__PROFILER__DEPRECATED.html#group__CUDA__PROFILER__DEPRECATED'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.38. Profiler Control [DEPRECATED]

**Source:** group__CUDA__PROFILER__DEPRECATED.html#group__CUDA__PROFILER__DEPRECATED


### Functions

CUresult cuProfilerInitialize ( const char* configFile, const char* outputFile, CUoutput_mode outputMode )


Initialize the profiling.

######  Parameters

`configFile`
    \- Name of the config file that lists the counters/options for profiling.
`outputFile`
    \- Name of the outputFile where the profiling results will be stored.
`outputMode`
    \- outputMode, can be CU_OUT_KEY_VALUE_PAIR or CU_OUT_CSV.

###### Returns

CUDA_ERROR_NOT_SUPPORTED

###### Deprecated

Note that this function is deprecated and should not be used. Starting with CUDA 12.0, it always returns error code CUDA_ERROR_NOT_SUPPORTED.

###### Description

Using this API user can initialize the CUDA profiler by specifying the configuration file, output file and output file format. This API is generally used to profile different set of counters by looping the kernel launch. The `configFile` parameter can be used to select profiling options including profiler counters. Refer to the "Compute Command Line Profiler User Guide" for supported profiler options and counters.

Limitation: The CUDA profiler cannot be initialized with this API if another profiling tool is already active, as indicated by the CUDA_ERROR_PROFILER_DISABLED return code.

Typical usage of the profiling APIs is as follows:

for each set of counters/options { cuProfilerInitialize(); //Initialize profiling, set the counters or options in the config file ... cuProfilerStart(); // code to be profiled cuProfilerStop(); ... cuProfilerStart(); // code to be profiled cuProfilerStop(); ... }


