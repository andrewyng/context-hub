---
name: ptx-pragma-stringsused-bytes-mask
description: Mask for indicating used bytes in data of ld operation.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 12.2. Pragma Strings:

---
title: "12.2. Pragma Strings:"used_bytes_mask""
section: 12.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 12.2. Pragma Strings:"used_bytes_mask"


`"used_bytes_mask"`

Mask for indicating used bytes in data of ld operation.

Syntax

.pragma "used_bytes_mask mask";

Description

The `"used_bytes_mask" pragma` is a directive that specifies used bytes in a load operation based on the mask provided.

`"used_bytes_mask" pragma` needs to be specified prior to a load instruction for which information about bytes used from the load operation is needed. Pragma is ignored if instruction following it is not a load instruction.

For a load instruction without this pragma, all bytes from the load operation are assumed to be used.

Operand `mask` is a 32-bit integer with set bits indicating the used bytes in data of load operation.

Semantics

Each bit in mask operand corresponds to a byte data where each set bit represents the used byte.
    Most-significant bit corresponds to most-significant byte of data.
    
    // For 4 bytes load with only lower 3 bytes used
    .pragma "used_bytes_mask 0x7";
    ld.global.u32 %r0, [gbl];     // Higher 1 byte from %r0 is unused
    
    // For vector load of 16 bytes with lower 12 bytes used
    .pragma "used_bytes_mask 0xfff";
    ld.global.v4.u32 {%r0, %r1, %r2, %r3}, [gbl];  // %r3 unused

PTX ISA Notes

Introduced in PTX ISA version 8.3.

Target ISA Notes

Requires `sm_50` or higher.

Examples

.pragma "used_bytes_mask 0xfff";
    ld.global.v4.u32 {%r0, %r1, %r2, %r3}, [gbl]; // Only lower 12 bytes used