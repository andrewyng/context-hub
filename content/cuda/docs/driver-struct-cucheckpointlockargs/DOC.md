---
name: driver-struct-cucheckpointlockargs
description: '**Source:** structCUcheckpointLockArgs.html#structCUcheckpointLockArgs'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,struct
---

# 7.7. CUcheckpointLockArgs

**Source:** structCUcheckpointLockArgs.html#structCUcheckpointLockArgs


### Public Variables

unsigned int reserved0

cuuint64_t reserved1[7]

unsigned int timeoutMs


### Variables

unsigned int CUcheckpointLockArgs::reserved0


Reserved for future use, must be zero

cuuint64_t CUcheckpointLockArgs::reserved1[7]


Reserved for future use, must be zeroed

unsigned int CUcheckpointLockArgs::timeoutMs


Timeout in milliseconds to attempt to lock the process, 0 indicates no timeout

