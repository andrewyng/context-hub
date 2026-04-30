---
name: ptx-no-thin-air
description: "Values may not appear \u201Cout of thin air\u201D: an execution cannot\
  \ speculatively produce a value in such a way that the speculation becomes self-satisfying\
  \ through chains of instruction dependencies and int..."
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.10.4. No Thin Air

---
title: "8.10.4. No Thin Air"
section: 8.10.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.10.4. No Thin Air


Values may not appear “out of thin air”: an execution cannot speculatively produce a value in such a way that the speculation becomes self-satisfying through chains of instruction dependencies and inter-thread communication. This matches both programmer intuition and hardware reality, but is necessary to state explicitly when performing formal analysis.

Litmus Test: Load Buffering

.global .u32 x = 0;
    .global .u32 y = 0;
      
  
---  
T1 | T2  
      
    
    A1: ld.global.u32 %r0, [x];
    B1: st.global.u32 [y], %r0;
    

| 
    
    
    A2: ld.global.u32 %r1, [y];
    B2: st.global.u32 [x], %r1;
      
      
    
    FINAL STATE: x == 0 AND y == 0

The litmus test known as “LB” (Load Buffering) checks such forbidden values that may arise out of thin air. Two threads T1 and T2 each read from a first variable and copy the observed result into a second variable, with the first and second variable exchanged between the threads. If each variable is initially zero, the final result shall also be zero. If A1 reads from B2 and A2 reads from B1, then values passing through the memory operations in this example form a cycle: A1->B1->A2->B2->A1. Only the values x == 0 and y == 0 are allowed to satisfy this cycle. If any of the memory operations in this example were to speculatively associate a different value with the corresponding memory location, then such a speculation would become self-fulfilling, and hence forbidden.