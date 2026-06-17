---
name: ptx-clusterlaunchcontrolquery-cancel
description: '`clusterlaunchcontrol.query_cancel`'
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.18. Parallel Synchronization and Communication Instructions:clusterlaunchcontrol.query_cancel

---
title: "9.7.13.18. Parallel Synchronization and Communication Instructions:clusterlaunchcontrol.query_cancel"
section: 9.7.13.18
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.18. Parallel Synchronization and Communication Instructions:clusterlaunchcontrol.query_cancel


`clusterlaunchcontrol.query_cancel`

Queries response of `clusterlaunchcontrol.try_cancel` operation.

Syntax

clusterlaunchcontrol.query_cancel.is_canceled.pred.b128 pred, try_cancel_response;
    
    clusterlaunchcontrol.query_cancel.get_first_ctaid.v4.b32.b128 {xdim, ydim, zdim, _},  try_cancel_response;
    
    clusterlaunchcontrol.query_cancel.get_first_ctaid{::dimension}.b32.b128 reg, try_cancel_response;
    
    ::dimension = { ::x, ::y, ::z };

Description

Instruction `clusterlaunchcontrol.query_cancel` can be used to decode opaque response written by instruction `clusterlaunchcontrol.try_cancel`.

After loading response from `clusterlaunchcontrol.try_cancel` instruction into 16-byte register it can be further queried using `clusterlaunchcontrol.query_cancel` instruction as follows:

`clusterlaunchcontrol.query_cancel.is_canceled.pred.b128`: If the cluster is canceled successfully, predicate `p` is set to `true`; otherwise, it is set to `false`.

If the request succeeded, the instruction `clusterlaunchcontrol.query_cancel.get_first_ctaid` extracts the CTA id of the first CTA in the canceled cluster. By default, the instruction returns a `.v4` vector whose first three elements are the `x`, `y` and `z` coordinate of first CTA in canceled cluster. The contents of the 4th element are unspecified. The explicit `.get_first_ctaid::x`, `.get_first_ctaid::y`, or `.get_first_ctaid::z` qualifiers can be used to extract individual `x`, `y` or `z` coordinates into a 32-bit register.

If the request fails the behavior of `clusterlaunchcontrol.query_cancel.get_first_ctaid` is undefined.

PTX ISA Notes

Introduced in PTX ISA version 8.6.

Target ISA Notes

Requires `sm_100` or higher.

Examples

clusterlaunchcontrol.query_cancel.is_canceled pred.b128 p, handle;
    
    @p clusterlaunchcontrol.query_cancel.get_first_ctaid.v4.b32.b128 {xdim, ydim, zdim, ignr}  handle;
    
    clusterlaunchcontrol.query_cancel.get_first_ctaid::x.b32.b128 reg0, handle;
    
    clusterlaunchcontrol.query_cancel.get_first_ctaid::y.b32.b128 reg1, handle;
    
    clusterlaunchcontrol.query_cancel.get_first_ctaid::z.b32.b128 reg2, handle;