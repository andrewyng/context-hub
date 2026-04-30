---
name: ptx-cache-operators
description: PTX ISA version 2.0 introduced optional cache operators on load and store
  instructions. The cache operators require a target architecture of `sm_20` or higher.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.1. Cache Operators

---
title: "9.7.9.1. Cache Operators"
section: 9.7.9.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.1. Cache Operators


PTX ISA version 2.0 introduced optional cache operators on load and store instructions. The cache operators require a target architecture of `sm_20` or higher.

Cache operators on load or store instructions are treated as performance hints only. The use of a cache operator on an `ld` or `st` instruction does not change the memory consistency behavior of the program.

For `sm_20` and higher, the cache operators have the following definitions and behavior.

Table 30 Cache Operators for Memory Load Instructions Operator | Meaning  
---|---  
`.ca` |  Cache at all levels, likely to be accessed again. The default load instruction cache operation is ld.ca, which allocates cache lines in all levels (L1 and L2) with normal eviction policy. Global data is coherent at the L2 level, but multiple L1 caches are not coherent for global data. If one thread stores to global memory via one L1 cache, and a second thread loads that address via a second L1 cache with `ld.ca`, the second thread may get stale L1 cache data, rather than the data stored by the first thread. The driver must invalidate global L1 cache lines between dependent grids of parallel threads. Stores by the first grid program are then correctly fetched by the second grid program issuing default `ld.ca` loads cached in L1.  
`.cg` |  Cache at global level (cache in L2 and below, not L1). Use `ld.cg` to cache loads only globally, bypassing the L1 cache, and cache only in the L2 cache.  
`.cs` |  Cache streaming, likely to be accessed once. The `ld.cs` load cached streaming operation allocates global lines with evict-first policy in L1 and L2 to limit cache pollution by temporary streaming data that may be accessed once or twice. When `ld.cs` is applied to a Local window address, it performs the `ld.lu` operation.  
`.lu` |  Last use. The compiler/programmer may use `ld.lu` when restoring spilled registers and popping function stack frames to avoid needless write-backs of lines that will not be used again. The `ld.lu` instruction performs a load cached streaming operation (`ld.cs`) on global addresses.  
`.cv` |  Don’t cache and fetch again (consider cached system memory lines stale, fetch again). The ld.cv load operation applied to a global System Memory address invalidates (discards) a matching L2 line and re-fetches the line on each new load.

Table 31 Cache Operators for Memory Store Instructions Operator | Meaning  
---|---  
`.wb` |  Cache write-back all coherent levels. The default store instruction cache operation is `st.wb`, which writes back cache lines of coherent cache levels with normal eviction policy. If one thread stores to global memory, bypassing its L1 cache, and a second thread in a different SM later loads from that address via a different L1 cache with `ld.ca`, the second thread may get a hit on stale L1 cache data, rather than get the data from L2 or memory stored by the first thread. The driver must invalidate global L1 cache lines between dependent grids of thread arrays. Stores by the first grid program are then correctly missed in L1 and fetched by the second grid program issuing default `ld.ca` loads.  
`.cg` |  Cache at global level (cache in L2 and below, not L1). Use `st.cg` to cache global store data only globally, bypassing the L1 cache, and cache only in the L2 cache.  
`.cs` |  Cache streaming, likely to be accessed once. The `st.cs` store cached-streaming operation allocates cache lines with evict-first policy to limit cache pollution by streaming output data.  
`.wt` |  Cache write-through (to system memory). The `st.wt` store write-through operation applied to a global System Memory address writes through the L2 cache.