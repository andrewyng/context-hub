---
name: ptx-async-proxy
description: The `wgmma.mma_async` operations are performed in the asynchronous proxy
  (or async proxy).
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.15.4. Async Proxy

---
title: "9.7.15.4. Async Proxy"
section: 9.7.15.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.15.4. Async Proxy


The `wgmma.mma_async` operations are performed in the asynchronous proxy (or async proxy).

Accessing the same memory location across multiple proxies needs a cross-proxy fence. For the async proxy, `fence.proxy.async` should be used to synchronize memory between generic proxy and the async proxy.

The completion of a `wgmma.mma_async` operation is followed by an implicit generic-async proxy fence. So the result of the asynchronous operation is made visible to the generic proxy as soon as its completion is observed. `wgmma.commit_group` and `wgmma.wait_group` operations must be used to wait for the completion of the `wgmma.mma_async` instructions.