---
name: ptx-debugging-directivessection
description: PTX section definition.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.5.2. Debugging Directives:.section

---
title: "11.5.2. Debugging Directives:.section"
section: 11.5.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.5.2. Debugging Directives:.section


`.section`

PTX section definition.

Syntax

.section section_name { dwarf-lines }
    
    dwarf-lines have the following formats:
      .b8    byte-list       // comma-separated list of integers
                             // in range [-128..255]
      .b16   int16-list      // comma-separated list of integers
                             // in range [-2^15..2^16-1]
      .b32   int32-list      // comma-separated list of integers
                             // in range [-2^31..2^32-1]
      label:                 // Define label inside the debug section
      .b64   int64-list      // comma-separated list of integers
                             // in range [-2^63..2^64-1]
      .b32   label
      .b64   label
      .b32   label+imm       // a sum of label address plus a constant integer byte
                             // offset(signed, 32bit)
      .b64   label+imm       // a sum of label address plus a constant integer byte
                             // offset(signed, 64bit)
      .b32   label1-label2   // a difference in label addresses between labels in
                             // the same dwarf section (32bit)
      .b64   label3-label4   // a difference in label addresses between labels in
                             // the same dwarf section (64bit)

PTX ISA Notes

Introduced in PTX ISA version 2.0, replaces `@@DWARF` syntax.

label+imm expression introduced in PTX ISA version 3.2.

Support for `.b16` integers in dwarf-lines introduced in PTX ISA version 6.0.

Support for defining `label` inside the DWARF section is introduced in PTX ISA version 7.2.

`label1-label2` expression introduced in PTX ISA version 7.5.

Negative numbers in dwarf lines introduced in PTX ISA version 7.5.

Target ISA Notes

Supported on all target architectures.

Examples

.section .debug_pubnames
    {
        .b32    LpubNames_end0-LpubNames_begin0
      LpubNames_begin0:
        .b8     0x2b, 0x00, 0x00, 0x00, 0x02, 0x00
        .b32    .debug_info
      info_label1:
        .b32    0x000006b5, 0x00000364, 0x61395a5f, 0x5f736f63
        .b32    0x6e69616d, 0x63613031, 0x6150736f, 0x736d6172
        .b8     0x00, 0x00, 0x00, 0x00, 0x00
      LpubNames_end0:
    }
    
    .section .debug_info
    {
        .b32 11430
        .b8 2, 0
        .b32 .debug_abbrev
        .b8 8, 1, 108, 103, 101, 110, 102, 101, 58, 32, 69, 68, 71, 32, 52, 46, 49
        .b8 0
        .b32 3, 37, 176, -99
        .b32 info_label1
        .b32 .debug_loc+0x4
        .b8 -11, 11, 112, 97
        .b32 info_label1+12
        .b64 -1
        .b16 -5, -65535
    }