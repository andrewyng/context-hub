---
name: driver-struct-cudevsmresource
description: '**Source:** structCUdevSmResource.html#structCUdevSmResource'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,struct
---

# 7.54. CUdevSmResource

**Source:** structCUdevSmResource.html#structCUdevSmResource


### Public Variables

unsigned int flags

unsigned int minSmPartitionSize

unsigned int smCoscheduledAlignment

unsigned int smCount


### Variables

unsigned int CUdevSmResource::flags


The flags set on this SM resource. For possible values see CUdevSmResourceGroup_flags.

unsigned int CUdevSmResource::minSmPartitionSize


The minimum number of streaming multiprocessors required to partition this resource.

unsigned int CUdevSmResource::smCoscheduledAlignment


The number of streaming multiprocessors in this resource that are guaranteed to be co-scheduled on the same GPU processing cluster. smCount will be a multiple of this value, unless the backfill flag is set.

unsigned int CUdevSmResource::smCount


The amount of streaming multiprocessors available in this resource.

