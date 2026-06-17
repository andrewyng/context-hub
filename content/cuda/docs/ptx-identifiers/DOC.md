---
name: ptx-identifiers
description: 'User-defined identifiers follow extended C++ rules: they either start
  with a letter followed by zero or more letters, digits, underscore, or dollar characters;
  or they start with an underscore, dollar...'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 4.4. Identifiers

---
title: "4.4. Identifiers"
section: 4.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 4.4. Identifiers


User-defined identifiers follow extended C++ rules: they either start with a letter followed by zero or more letters, digits, underscore, or dollar characters; or they start with an underscore, dollar, or percentage character followed by one or more letters, digits, underscore, or dollar characters:

followsym:   [a-zA-Z0-9_$]
    identifier:  [a-zA-Z]{followsym}* | {[_$%]{followsym}+

PTX does not specify a maximum length for identifiers and suggests that all implementations support a minimum length of at least 1024 characters.

Many high-level languages such as C and C++ follow similar rules for identifier names, except that the percentage sign is not allowed. PTX allows the percentage sign as the first character of an identifier. The percentage sign can be used to avoid name conflicts, e.g., between user-defined variable names and compiler-generated names.

PTX predefines one constant and a small number of special registers that begin with the percentage sign, listed in [Table 3](<#identifiers-predefined-identifiers>).

Table 3 Predefined Identifiers `%aggr_smem_size` | `%dynamic_smem_size` | `%lanemask_gt` | `%reserved_smem_offset_begin`  
---|---|---|---  
`%clock` | `%envreg<32>` | `%lanemask_le` | `%reserved_smem_offset_cap`  
`%clock64` | `%globaltimer` | `%lanemask_lt` | `%reserved_smem_offset_end`  
`%cluster_ctaid` | `%globaltimer_hi` | `%nclusterid` | `%smid`  
`%cluster_ctarank` | `%globaltimer_lo` | `%nctaid` | `%tid`  
`%cluster_nctaid` | `%gridid` | `%nsmid` | `%total_smem_size`  
`%cluster_nctarank` | `%is_explicit_cluster` | `%ntid` | `%warpid`  
`%clusterid` | `%laneid` | `%nwarpid` | `WARP_SZ`  
`%ctaid` | `%lanemask_eq` | `%pm0, ..., %pm7` |   
`%current_graph_exec` | `%lanemask_ge` | `%reserved_smem_offset_<2>` |