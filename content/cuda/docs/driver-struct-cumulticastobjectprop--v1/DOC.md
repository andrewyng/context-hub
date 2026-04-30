---
name: driver-struct-cumulticastobjectprop--v1
description: '**Source:** structCUmulticastObjectProp__v1.html#structCUmulticastObjectProp__v1'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,driver-api,struct
---

# 7.79. CUmulticastObjectProp_v1

**Source:** structCUmulticastObjectProp__v1.html#structCUmulticastObjectProp__v1


### Public Variables

unsigned long long flags

unsigned long long handleTypes

unsigned int numDevices

size_t size


### Variables

unsigned long long CUmulticastObjectProp_v1::flags


Flags for future use, must be zero now

unsigned long long CUmulticastObjectProp_v1::handleTypes


Bitmask of exportable handle types (see CUmemAllocationHandleType) for this object

unsigned int CUmulticastObjectProp_v1::numDevices


The number of devices in the multicast team that will bind memory to this object

size_t CUmulticastObjectProp_v1::size


The maximum amount of memory that can be bound to this multicast object per device

