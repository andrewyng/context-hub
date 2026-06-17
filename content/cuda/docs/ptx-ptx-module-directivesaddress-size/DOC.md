---
name: ptx-ptx-module-directivesaddress-size
description: Address size used throughout PTX module.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.1.3. PTX Module Directives:.address_size

---
title: "11.1.3. PTX Module Directives:.address_size"
section: 11.1.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.1.3. PTX Module Directives:.address_size


`.address_size`

Address size used throughout PTX module.

Syntax

.address_size  address-size
    address-size = { 32, 64 };

Description

Specifies the address size assumed throughout the module by the PTX code and the binary DWARF information in PTX.

Redefinition of this directive within a module is not allowed. In the presence of separate compilation all modules must specify (or default to) the same address size.

The `.address_size` directive is optional, but it must immediately follow the `.target`directive if present within a module.

Semantics

If the `.address_size` directive is omitted, the address size defaults to 32.

PTX ISA Notes

Introduced in PTX ISA version 2.3.

Target ISA Notes

Supported on all target architectures.

Examples

// example directives
       .address_size 32       // addresses are 32 bit
       .address_size 64       // addresses are 64 bit
    
    // example of directive placement within a module
       .version 2.3
       .target sm_20
       .address_size 64
    ...
    .entry foo () {
    ...
    }