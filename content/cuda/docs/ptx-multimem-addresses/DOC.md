---
name: ptx-multimem-addresses
description: A multimem address is a virtual address which points to multiple distinct
  memory locations across devices.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.2.3. Multimem Addresses

---
title: "8.2.3. Multimem Addresses"
section: 8.2.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.2.3. Multimem Addresses


A multimem address is a virtual address which points to multiple distinct memory locations across devices.

Only _multimem._ * operations are valid on multimem addresses. That is, the behavior of accessing a multimem address in any other memory operation is undefined.