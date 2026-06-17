---
name: ptx-causality
description: 'Relations in _communication order_ cannot contradict _causality order_.
  This constrains the set of candidate write operations that a read operation may
  read from:'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.10.6. Causality

---
title: "8.10.6. Causality"
section: 8.10.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.10.6. Causality


Relations in _communication order_ cannot contradict _causality order_. This constrains the set of candidate write operations that a read operation may read from:

1. If a read R precedes an _overlapping_ write W in _causality order_ , then R cannot read from W.  
  
  2. If a write W precedes an _overlapping_ read R in _causality order_ , then for any byte accessed by both R and W, R cannot read from any write W’ that precedes W in _coherence order_.

Litmus Test: Message Passing

.global .u32 data = 0;
    .global .u32 flag = 0;
      
  
---  
T1 | T2  
      
    
    W1: st.global.u32 [data], 1;
    F1: fence.sys;
    W2: st.global.relaxed.sys.u32 [flag], 1;
    

| 
    
    
    R1: ld.global.relaxed.sys.u32 %r0, [flag];
    F2: fence.sys;
    R2: ld.global.u32 %r1, [data];
      
      
    
    IF %r0 == 1 THEN %r1 == 1

The litmus test known as “MP” (Message Passing) represents the essence of typical synchronization algorithms. A vast majority of useful programs can be reduced to sequenced applications of this pattern.

Thread T1 first writes to a data variable and then to a flag variable while a second thread T2 first reads from the flag variable and then from the data variable. The operations on the flag are _morally strong_ and the memory operations in each thread are separated by a _fence_ , and these _fences_ are _morally strong_.

If R1 observes W2, then the release pattern “F1; W2” _synchronizes_ with the _acquire pattern_ “R1; F2”. This establishes the _causality order_ W1 -> F1 -> W2 -> R1 -> F2 -> R2. Then axiom _causality_ guarantees that R2 cannot read from any write that precedes W1 in _coherence order_. In the absence of any other writes in this example, R2 must read from W1.

Litmus Test: CoWR

// These addresses are aliases
    .global .u32 data_alias_1;
    .global .u32 data_alias_2;
      
  
---  
T1  
      
    
    W1: st.global.u32 [data_alias_1], 1;
    F1: fence.proxy.alias;
    R1: ld.global.u32 %r1, [data_alias_2];
      
      
    
    %r1 == 1

Virtual aliases require an alias _proxy fence_ along the synchronization path.

Litmus Test: Store Buffering

The litmus test known as “SB” (Store Buffering) demonstrates the _sequential consistency_ enforced by the `fence.sc`. A thread T1 writes to a first variable, and then reads the value of a second variable, while a second thread T2 writes to the second variable and then reads the value of the first variable. The memory operations in each thread are separated by `fence.`sc instructions, and these _fences_ are _morally strong_.

.global .u32 x = 0;
    .global .u32 y = 0;
      
  
---  
T1 | T2  
      
    
    W1: st.global.u32 [x], 1;
    F1: fence.sc.sys;
    R1: ld.global.u32 %r0, [y];
    

| 
    
    
    W2: st.global.u32 [y], 1;
    F2: fence.sc.sys;
    R2: ld.global.u32 %r1, [x];
      
      
    
    %r0 == 1 OR %r1 == 1

In any execution, either F1 precedes F2 in _Fence-SC_ order, or vice versa. If F1 precedes F2 in _Fence-SC_ order, then F1 _synchronizes_ with F2. This establishes the _causality order_ in W1 -> F1 -> F2 -> R2. Axiom _causality_ ensures that R2 cannot read from any write that precedes W1 in _coherence order_. In the absence of any other write to that variable, R2 must read from W1. Similarly, in the case where F2 precedes F1 in _Fence-SC_ order, R1 must read from W2. If each `fence.sc` in this example were replaced by a `fence.acq_rel` instruction, then this outcome is not guaranteed. There may be an execution where the write from each thread remains unobserved from the other thread, i.e., an execution is possible, where both R1 and R2 return the initial value “0” for variables y and x respectively.