---
name: ptx-instruction-statements
description: Instructions are formed from an instruction opcode followed by a comma-separated
  list of zero or more operands, and terminated with a semicolon. Operands may be
  register variables, constant expression...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 4.3.2. Instruction Statements

---
title: "4.3.2. Instruction Statements"
section: 4.3.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 4.3.2. Instruction Statements


Instructions are formed from an instruction opcode followed by a comma-separated list of zero or more operands, and terminated with a semicolon. Operands may be register variables, constant expressions, address expressions, or label names. Instructions have an optional guard predicate which controls conditional execution. The guard predicate follows the optional label and precedes the opcode, and is written as `@p`, where `p` is a predicate register. The guard predicate may be optionally negated, written as `@!p`.

The destination operand is first, followed by source operands.

Instruction keywords are listed in [Table 2](<#instruction-statements-reserved-instruction-keywords-new>). All instruction keywords are reserved tokens in PTX.

Table 2 Reserved Instruction Keywords `abs` | `cvta` | `membar` | `setp` | `vabsdiff`  
---|---|---|---|---  
`activemask` | `discard` | `min` | `shf` | `vabsdiff2`  
`add` | `div` | `mma` | `shfl` | `vabsdiff4`  
`addc` | `dp2a` | `mov` | `shl` | `vadd`  
`alloca` | `dp4a` | `movmatrix` | `shr` | `vadd2`  
`and` | `elect` | `mul` | `sin` | `vadd4`  
`applypriority` | `ex2` | `mul24` | `slct` | `vavrg2`  
`atom` | `exit` | `multimem` | `sqrt` | `vavrg4`  
`bar` | `fence` | `nanosleep` | `st` | `vmad`  
`barrier` | `fma` | `neg` | `stackrestore` | `vmax`  
`bfe` | `fns` | `not` | `stacksave` | `vmax2`  
`bfi` | `getctarank` | `or` | `stmatrix` | `vmax4`  
`bfind` | `griddepcontrol` | `pmevent` | `sub` | `vmin`  
`bmsk` | `isspacep` | `popc` | `subc` | `vmin2`  
`bra` | `istypep` | `prefetch` | `suld` | `vmin4`  
`brev` | `ld` | `prefetchu` | `suq` | `vote`  
`brkpt` | `ldmatrix` | `prmt` | `sured` | `vset`  
`brx` | `ldu` | `rcp` | `sust` | `vset2`  
`call` | `lg2` | `red` | `szext` | `vset4`  
`clz` | `lop3` | `redux` | `tanh` | `vshl`  
`cnot` | `mad` | `rem` | `tcgen05` | `vshr`  
`copysign` | `mad24` | `ret` | `tensormap` | `vsub`  
`cos` | `madc` | `rsqrt` | `testp` | `vsub2`  
`clusterlaunchcontrol` | `mapa` | `sad` | `tex` | `vsub4`  
`cp` | `match` | `selp` | `tld4` | `wgmma`  
`createpolicy` | `max` | `set` | `trap` | `wmma`  
`cvt` | `mbarrier` | `setmaxnreg` | `txq` | `xor`