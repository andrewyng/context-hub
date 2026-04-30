---
name: ptx-limitations-on-mixed-size-data-races
description: A _data-race_ between operations that _overlap_ completely is called
  a _uniform-size data-race_ , while a _data-race_ between operations that _overlap_
  partially is called a _mixed-size data-race_.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 8.7.2. Limitations on Mixed-size Data-races

---
title: "8.7.2. Limitations on Mixed-size Data-races"
section: 8.7.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 8.7.2. Limitations on Mixed-size Data-races


A _data-race_ between operations that _overlap_ completely is called a _uniform-size data-race_ , while a _data-race_ between operations that _overlap_ partially is called a _mixed-size data-race_.

The axioms in the memory consistency model do not apply if a PTX program contains one or more _mixed-size data-races_. But these axioms are sufficient to describe the behavior of a PTX program with only _uniform-size data-races_.

Atomicity of mixed-size RMW operations

In any program with or without _mixed-size data-races_ , the following property holds for every pair of _overlapping atomic_ operations A1 and A2 such that each specifies a _scope_ that includes the other: Either the _read-modify-write_ operation specified by A1 is performed completely before A2 is initiated, or vice versa. This property holds irrespective of whether the two operations A1 and A2 overlap partially or completely.