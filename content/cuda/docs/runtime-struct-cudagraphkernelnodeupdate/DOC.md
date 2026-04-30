---
name: runtime-struct-cudagraphkernelnodeupdate
description: '**Source:** structcudaGraphKernelNodeUpdate.html#structcudaGraphKernelNodeUpdate'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.34. cudaGraphKernelNodeUpdate

**Source:** structcudaGraphKernelNodeUpdate.html#structcudaGraphKernelNodeUpdate


### Public Variables

enumcudaGraphKernelNodeField field

uint3 gridDim

unsigned int isEnabled

cudaGraphDeviceNode_t node

size_t offset

const void * pValue

cudaGraphKernelNodeUpdate::@27::@28 param

size_t size

cudaGraphKernelNodeUpdate::@27 updateData


### Variables

enumcudaGraphKernelNodeFieldcudaGraphKernelNodeUpdate::field


Which type of update to apply. Determines how updateData is interpreted

uint3 cudaGraphKernelNodeUpdate::gridDim


Grid dimensions

unsigned int cudaGraphKernelNodeUpdate::isEnabled


Node enable/disable data. Nonzero if the node should be enabled, 0 if it should be disabled

cudaGraphDeviceNode_tcudaGraphKernelNodeUpdate::node


Node to update

size_t cudaGraphKernelNodeUpdate::offset


Offset into the parameter buffer at which to apply the update

const void * cudaGraphKernelNodeUpdate::pValue


Kernel parameter data to write in

cudaGraphKernelNodeUpdate::@27::@28 cudaGraphKernelNodeUpdate::param


Kernel parameter data

size_t cudaGraphKernelNodeUpdate::size


Number of bytes to update

cudaGraphKernelNodeUpdate::@27 cudaGraphKernelNodeUpdate::updateData


Update data to apply. Which field is used depends on field's value

* * *

!


Copyright © 2025 NVIDIA Corporation