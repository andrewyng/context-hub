---
name: ptx-debugging-directivesloc
description: Source file location.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.5.4. Debugging Directives:.loc

---
title: "11.5.4. Debugging Directives:.loc"
section: 11.5.4
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.5.4. Debugging Directives:.loc


`.loc`

Source file location.

Syntax

.loc file_index line_number column_position
    .loc file_index line_number column_position,function_name label {+ immediate }, inlined_at file_index2 line_number2 column_position2

Description

Declares the source file location (source file, line number, and column position) to be associated with lexically subsequent PTX instructions. `.loc` refers to `file_index` which is defined by a `.file` directive.

To indicate PTX instructions that are generated from a function that got inlined, additional attribute `.inlined_at` can be specified as part of the `.loc` directive. `.inlined_at` attribute specifies source location at which the specified function is inlined. `file_index2`, `line_number2`, and `column_position2` specify the location at which function is inlined. Source location specified as part of `.inlined_at` directive must lexically precede as source location in `.loc` directive.

The `function_name` attribute specifies an offset in the DWARF section named `.debug_str`. Offset is specified as `label` expression or `label + immediate` expression where `label` is defined in `.debug_str` section. DWARF section `.debug_str` contains ASCII null-terminated strings that specify the name of the function that is inlined.

Note that a PTX instruction may have a single associated source location, determined by the nearest lexically preceding .loc directive, or no associated source location if there is no preceding .loc directive. Labels in PTX inherit the location of the closest lexically following instruction. A label with no following PTX instruction has no associated source location.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

`function_name` and `inlined_at` attributes are introduced in PTX ISA version 7.2.

Target ISA Notes

Supported on all target architectures.

Examples

.loc 2 4237 0
    L1:                        // line 4237, col 0 of file #2,
                               // inherited from mov
        mov.u32  %r1,%r2;      // line 4237, col 0 of file #2
        add.u32  %r2,%r1,%r3;  // line 4237, col 0 of file #2
    ...
    L2:                        // line 4239, col 5 of file #2,
                               // inherited from sub
        .loc 2 4239 5
        sub.u32  %r2,%r1,%r3;  // line 4239, col 5 of file #2
        .loc 1 21 3
        .loc 1 9 3, function_name info_string0, inlined_at 1 21 3
        ld.global.u32   %r1, [gg]; // Function at line 9
        setp.lt.s32 %p1, %r1, 8;   // inlined at line 21
        .loc 1 27 3
        .loc 1 10 5, function_name info_string1, inlined_at 1 27 3
        .loc 1 15 3, function_name .debug_str+16, inlined_at 1 10 5
        setp.ne.s32 %p2, %r1, 18;
        @%p2 bra    BB2_3;
    
        .section .debug_str {
        info_string0:
         .b8 95  // _
         .b8 90  // z
         .b8 51  // 3
         .b8 102 // f
         .b8 111 // o
         .b8 111 // o
         .b8 118 // v
         .b8 0
    
        info_string1:
         .b8 95  // _
         .b8 90  // z
         .b8 51  // 3
         .b8 98  // b
         .b8 97  // a
         .b8 114 // r
         .b8 118 // v
         .b8 0
         .b8 95  // _
         .b8 90  // z
         .b8 51  // 3
         .b8 99  // c
         .b8 97  // a
         .b8 114 // r
         .b8 118 // v
         .b8 0
        }