---
name: ptx-fence-sc
description: _Fence-SC_ order cannot contradict _causality order_. For a pair of _morally
  strong_ _fence.sc_ operations F1 and F2, if F1 precedes F2 in _causality order_
  , then F1 must precede F2 in _Fence-SC_ ord...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.10.2. Fence-SC

---
title: "8.10.2. Fence-SC"
section: 8.10.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.10.2. Fence-SC


_Fence-SC_ order cannot contradict _causality order_. For a pair of _morally strong_ _fence.sc_ operations F1 and F2, if F1 precedes F2 in _causality order_ , then F1 must precede F2 in _Fence-SC_ order.