---
name: ptx-miscellaneous-directivesblocksareclusters
description: '`.blocksareclusters`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.8.1. Miscellaneous Directives:.blocksareclusters

---
title: "11.8.1. Miscellaneous Directives:.blocksareclusters"
section: 11.8.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.8.1. Miscellaneous Directives:.blocksareclusters


`.blocksareclusters`

Specify that CUDA thread blocks are mapped to clusters.

Syntax

.blocksareclusters

Description

Default behavior of CUDA API is to specify the grid launch configuration by specifying the number of thread blocks and the number of threads per block.

When `.blocksareclusters` directive is specified, it implies that the grid launch configuration for the corresponding `.entry` function is specifying the number of clusters, i.e. the launch configuration is specifying number of clusters instead of the number of thread blocks. In this case, the number of thread blocks per cluster is specified by `.reqnctapercluster` directive and the thread block size is specified with the `.reqntid` directive.

`.blocksareclusters` directive is only allowed for `.entry` functions and also needs `.reqntid` and `.reqnctapercluster` directives to be specified.

Refer to _CUDA Programming Guide_ for more details.

PTX ISA Notes

Introduced in PTX ISA version 9.0.

Target ISA Notes

Requires `sm_90` or higher.

Examples

.entry foo .reqntid 32, 32, 1 .reqnctapercluster 32, 32, 1 .blocksareclusters { ... }