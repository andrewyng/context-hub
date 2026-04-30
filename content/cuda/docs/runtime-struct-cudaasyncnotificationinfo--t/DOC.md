---
name: runtime-struct-cudaasyncnotificationinfo--t
description: '**Source:** structcudaAsyncNotificationInfo__t.html#structcudaAsyncNotificationInfo__t'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.5. cudaAsyncNotificationInfo_t

**Source:** structcudaAsyncNotificationInfo__t.html#structcudaAsyncNotificationInfo__t


### Public Variables

unsigned long long bytesOverBudget

cudaAsyncNotificationInfo_t::@34 info

cudaAsyncNotificationInfo_t::@34::@35 overBudget

cudaAsyncNotificationType type


### Variables

unsigned long long cudaAsyncNotificationInfo_t::bytesOverBudget


The number of bytes that the process has allocated above its device memory budget

cudaAsyncNotificationInfo_t::@34 cudaAsyncNotificationInfo_t::info


Information about the notification. `type` must be checked in order to interpret this field.

cudaAsyncNotificationInfo_t::@34::@35 cudaAsyncNotificationInfo_t::overBudget


Information about notifications of type `cudaAsyncNotificationTypeOverBudget`

cudaAsyncNotificationTypecudaAsyncNotificationInfo_t::type


The type of notification being sent

* * *

!


Copyright © 2025 NVIDIA Corporation