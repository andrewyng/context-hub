---
name: ptx-ptx-module-directivesversion
description: PTX ISA version number.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.1.1. PTX Module Directives:.version

---
title: "11.1.1. PTX Module Directives:.version"
section: 11.1.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.1.1. PTX Module Directives:.version


`.version`

PTX ISA version number.

Syntax

.version  major.minor    // major, minor are integers

Description

Specifies the PTX language version number.

The _major_ number is incremented when there are incompatible changes to the PTX language, such as changes to the syntax or semantics. The version major number is used by the PTX compiler to ensure correct execution of legacy PTX code.

The _minor_ number is incremented when new features are added to PTX.

Semantics

Indicates that this module must be compiled with tools that support an equal or greater version number.

Each PTX module must begin with a `.version` directive, and no other `.version` directive is allowed anywhere else within the module.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target ISA Notes

Supported on all target architectures.

Examples

.version 3.1
    .version 3.0
    .version 2.3