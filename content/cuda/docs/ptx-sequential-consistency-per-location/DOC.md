---
name: ptx-sequential-consistency-per-location
description: Within any set of _overlapping_ memory operations that are pairwise _morally
  strong_ , _communication order_ cannot contradict _program order_ , i.e., a concatenation
  of _program order_ between _overl...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.10.5. Sequential Consistency Per Location

---
title: "8.10.5. Sequential Consistency Per Location"
section: 8.10.5
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.10.5. Sequential Consistency Per Location


Within any set of _overlapping_ memory operations that are pairwise _morally strong_ , _communication order_ cannot contradict _program order_ , i.e., a concatenation of _program order_ between _overlapping_ operations and _morally strong_ relations in _communication order_ cannot result in a cycle. This ensures that each program slice of _overlapping_ pairwise morally _strong operations_ is strictly _sequentially-consistent_.

Litmus Test: CoRR

.global .u32 x = 0;
      
  
---  
T1 | T2  
      
    
    W1: st.global.relaxed.sys.u32 [x], 1;
    

| 
    
    
    R1: ld.global.relaxed.sys.u32 %r0, [x];
    R2: ld.global.relaxed.sys.u32 %r1, [x];
      
      
    
    IF %r0 == 1 THEN %r1 == 1

The litmus test “CoRR” (Coherent Read-Read), demonstrates one consequence of this guarantee. A thread T1 executes a write W1 on a location x, and a thread T2 executes two (or an infinite sequence of) reads R1 and R2 on the same location x. No other writes are executed on x, except the one modelling the initial value. The operations W1, R1 and R2 are pairwise _morally strong_. If R1 reads from W1, then the subsequent read R2 must also observe the same value. If R2 observed the initial value of x instead, then this would form a sequence of _morally-strong_ relations R2->W1->R1 in _communication order_ that contradicts the _program order_ R1->R2 in thread T2. Hence R2 cannot read the initial value of x in such an execution.