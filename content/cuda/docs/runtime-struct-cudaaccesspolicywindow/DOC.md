---
name: runtime-struct-cudaaccesspolicywindow
description: '**Source:** structcudaAccessPolicyWindow.html#structcudaAccessPolicyWindow'
metadata:
  languages: cuda
  versions: '13.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,runtime-api,struct
---

# 7.2. cudaAccessPolicyWindow

**Source:** structcudaAccessPolicyWindow.html#structcudaAccessPolicyWindow


### Public Variables

void * base_ptr

enumcudaAccessProperty hitProp

float hitRatio

enumcudaAccessProperty missProp

size_t num_bytes


### Variables

void * cudaAccessPolicyWindow::base_ptr


Starting address of the access policy window. CUDA driver may align it.

enumcudaAccessPropertycudaAccessPolicyWindow::hitProp


CUaccessProperty set for hit.

float cudaAccessPolicyWindow::hitRatio


hitRatio specifies percentage of lines assigned hitProp, rest are assigned missProp.

enumcudaAccessPropertycudaAccessPolicyWindow::missProp


CUaccessProperty set for miss. Must be either NORMAL or STREAMING.

size_t cudaAccessPolicyWindow::num_bytes


Size in bytes of the window policy. CUDA driver may restrict the maximum size and alignment.

* * *

!


Copyright © 2025 NVIDIA Corporation