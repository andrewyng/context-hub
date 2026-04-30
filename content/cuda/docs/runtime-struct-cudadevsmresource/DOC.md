---
name: runtime-struct-cudadevsmresource
description: '**Source:** structcudaDevSmResource.html#structcudaDevSmResource'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.11. cudaDevSmResource

**Source:** structcudaDevSmResource.html#structcudaDevSmResource


### Public Variables

unsigned int flags

unsigned int minSmPartitionSize

unsigned int smCoscheduledAlignment

unsigned int smCount


### Variables

unsigned int cudaDevSmResource::flags


The flags set on this SM resource. For available flags see cudaDevSmResourceGroup_flags.

unsigned int cudaDevSmResource::minSmPartitionSize


The minimum number of streaming multiprocessors required to partition this resource.

unsigned int cudaDevSmResource::smCoscheduledAlignment


The number of streaming multiprocessors in this resource that are guaranteed to be co-scheduled on the same GPU processing cluster. smCount will be a multiple of this value, unless the backfill flag is set.

unsigned int cudaDevSmResource::smCount


The amount of streaming multiprocessors available in this resource.

* * *

!


Copyright © 2025 NVIDIA Corporation