---
name: driver-error
description: '**Source:** group__CUDA__ERROR.html#group__CUDA__ERROR'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,api
---

# 6.2. Error Handling

**Source:** group__CUDA__ERROR.html#group__CUDA__ERROR


### Functions

CUresult cuGetErrorName ( CUresult error, const char** pStr )


Gets the string representation of an error code enum name.

######  Parameters

`error`
    \- Error code to convert to string
`pStr`
    \- Address of the string pointer.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Sets `*pStr` to the address of a NULL-terminated string representation of the name of the enum error code `error`. If the error code is not recognized, CUDA_ERROR_INVALID_VALUE will be returned and `*pStr` will be set to the NULL address.

CUresult, cudaGetErrorName

CUresult cuGetErrorString ( CUresult error, const char** pStr )


Gets the string description of an error code.

######  Parameters

`error`
    \- Error code to convert to string
`pStr`
    \- Address of the string pointer.

###### Returns

CUDA_SUCCESS, CUDA_ERROR_INVALID_VALUE

###### Description

Sets `*pStr` to the address of a NULL-terminated string description of the error code `error`. If the error code is not recognized, CUDA_ERROR_INVALID_VALUE will be returned and `*pStr` will be set to the NULL address.

CUresult, cudaGetErrorString

