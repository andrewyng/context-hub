---
name: runtime-struct-cudadevworkqueueconfigresource
description: '**Source:** structcudaDevWorkqueueConfigResource.html#structcudaDevWorkqueueConfigResource'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.13. cudaDevWorkqueueConfigResource

**Source:** structcudaDevWorkqueueConfigResource.html#structcudaDevWorkqueueConfigResource


### Public Variables

int device

enumcudaDevWorkqueueConfigScope sharingScope

unsigned int wqConcurrencyLimit


### Variables

int cudaDevWorkqueueConfigResource::device


The device on which the workqueue resources are available

enumcudaDevWorkqueueConfigScopecudaDevWorkqueueConfigResource::sharingScope


The sharing scope for the workqueue resources

unsigned int cudaDevWorkqueueConfigResource::wqConcurrencyLimit


The expected maximum number of concurrent stream-ordered workloads

* * *

!


Copyright © 2025 NVIDIA Corporation