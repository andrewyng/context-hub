---
name: ptx-cache-eviction-priority-hints
description: PTX ISA version 7.4 adds optional cache eviction priority hints on load
  and store instructions. Cache eviction priority requires target architecture `sm_70`
  or higher.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.2. Cache Eviction Priority Hints

---
title: "9.7.9.2. Cache Eviction Priority Hints"
section: 9.7.9.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.2. Cache Eviction Priority Hints


PTX ISA version 7.4 adds optional cache eviction priority hints on load and store instructions. Cache eviction priority requires target architecture `sm_70` or higher.

Cache eviction priority on load or store instructions is treated as a performance hint. It is supported for `.global` state space and generic addresses where the address points to `.global` state space.

Table 32 Cache Eviction Priority Hints for Memory Load and Store Instructions Cache Eviction Priority | Meaning  
---|---  
`evict_normal` | Cache data with normal eviction priority. This is the default eviction priority.  
`evict_first` | Data cached with this priority will be first in the eviction priority order and will likely be evicted when cache eviction is required. This priority is suitable for streaming data.  
`evict_last` | Data cached with this priority will be last in the eviction priority order and will likely be evicted only after other data with `evict_normal` or `evict_first` eviction priotity is already evicted. This priority is suitable for data that should remain persistent in cache.  
`evict_unchanged` | Do not change eviction priority order as part of this operation.  
`no_allocate` | Do not allocate data to cache. This priority is suitable for streaming data.