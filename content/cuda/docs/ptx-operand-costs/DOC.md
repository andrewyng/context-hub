---
name: ptx-operand-costs
description: Operands from different state spaces affect the speed of an operation.
  Registers are fastest, while global memory is slowest. Much of the delay to memory
  can be hidden in a number of ways. The first i...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 6.6. Operand Costs

---
title: "6.6. Operand Costs"
section: 6.6
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 6.6. Operand Costs


Operands from different state spaces affect the speed of an operation. Registers are fastest, while global memory is slowest. Much of the delay to memory can be hidden in a number of ways. The first is to have multiple threads of execution so that the hardware can issue a memory operation and then switch to other execution. Another way to hide latency is to issue the load instructions as early as possible, as execution is not blocked until the desired result is used in a subsequent (in time) instruction. The register in a store operation is available much more quickly. [Table 19](<#operand-costs-cost-estimates-for-sccessing-state-spaces>) gives estimates of the costs of using different kinds of memory.

Table 19 Cost Estimates for Accessing State-Spaces Space | Time | Notes  
---|---|---  
Register | 0 |   
Shared | 0 |   
Constant | 0 | Amortized cost is low, first access is high  
Local | > 100 clocks |   
Parameter | 0 |   
Immediate | 0 |   
Global | > 100 clocks |   
Texture | > 100 clocks |   
Surface | > 100 clocks |