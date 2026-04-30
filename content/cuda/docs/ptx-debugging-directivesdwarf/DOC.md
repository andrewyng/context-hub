---
name: ptx-debugging-directivesdwarf
description: DWARF-format information.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.5.1. Debugging Directives:@@dwarf

---
title: "11.5.1. Debugging Directives:@@dwarf"
section: 11.5.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.5.1. Debugging Directives:@@dwarf


`@@dwarf`

DWARF-format information.

Syntax

@@DWARF dwarf-string
    
    dwarf-string may have one of the
    .byte   byte-list   // comma-separated hexadecimal byte values
    .4byte  int32-list  // comma-separated hexadecimal integers in range [0..2^32-1]
    .quad   int64-list  // comma-separated hexadecimal integers in range [0..2^64-1]
    .4byte  label
    .quad   label

PTX ISA Notes

Introduced in PTX ISA version 1.2. Deprecated as of PTX ISA version 2.0, replaced by `.section` directive.

Target ISA Notes

Supported on all target architectures.

Examples

@@DWARF .section .debug_pubnames, "", @progbits
    @@DWARF .byte   0x2b, 0x00, 0x00, 0x00, 0x02, 0x00
    @@DWARF .4byte  .debug_info
    @@DWARF .4byte  0x000006b5, 0x00000364, 0x61395a5f, 0x5f736f63
    @@DWARF .4byte  0x6e69616d, 0x63613031, 0x6150736f, 0x736d6172
    @@DWARF .byte   0x00, 0x00, 0x00, 0x00, 0x00