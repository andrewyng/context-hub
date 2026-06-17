---
name: ptx-atomicity
description: Single-Copy Atomicity
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.10.3. Atomicity

---
title: "8.10.3. Atomicity"
section: 8.10.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.10.3. Atomicity


Single-Copy Atomicity

Conflicting _morally strong_ operations are performed with _single-copy atomicity_. When a read R and a write W are _morally strong_ , then the following two communications cannot both exist in the same execution, for the set of bytes accessed by both R and W:

1. R reads any byte from W.

  2. R reads any byte from any write W’ which precedes W in _coherence order_.

Atomicity of read-modify-write (RMW) operations

When an _atomic_ operation A and a write W _overlap_ and are _morally strong_ , then the following two communications cannot both exist in the same execution, for the set of bytes accessed by both A and W:

1. A reads any byte from a write W’ that precedes W in _coherence order_.

  2. A follows W in _coherence order_.

Litmus Test 1

.global .u32 x = 0;
      
  
---  
T1 | T2  
      
    
    A1: atom.sys.inc.u32 %r0, [x];
    

| 
    
    
    A2: atom.sys.inc.u32 %r0, [x];
      
      
    
    FINAL STATE: x == 2

Atomicity is guaranteed when the operations are _morally strong_.

Litmus Test 2

.global .u32 x = 0;
      
  
---  
T1 | T2 (In a different CTA)  
      
    
    A1: atom.cta.inc.u32 %r0, [x];
    

| 
    
    
    A2: atom.gpu.inc.u32 %r0, [x];
      
      
    
    FINAL STATE: x == 1 OR x == 2

Atomicity is not guaranteed if the operations are not _morally strong_.