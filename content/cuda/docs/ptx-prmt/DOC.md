---
name: ptx-prmt
description: Permute bytes from register pair.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.9.7. Data Movement and Conversion Instructions:prmt

---
title: "9.7.9.7. Data Movement and Conversion Instructions:prmt"
section: 9.7.9.7
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.9.7. Data Movement and Conversion Instructions:prmt


`prmt`

Permute bytes from register pair.

Syntax

prmt.b32{.mode}  d, a, b, c;
    
    .mode = { .f4e, .b4e, .rc8, .ecl, .ecr, .rc16 };

Description

Pick four arbitrary bytes from two 32-bit registers, and reassemble them into a 32-bit destination register.

In the generic form (no mode specified), the permute control consists of four 4-bit selection values. The bytes in the two source registers are numbered from 0 to 7: `{b, a} = {{b7, b6, b5, b4}, {b3, b2, b1, b0}}`. For each byte in the target register, a 4-bit selection value is defined.

The 3 lsbs of the selection value specify which of the 8 source bytes should be moved into the target position. The msb defines if the byte value should be copied, or if the sign (msb of the byte) should be replicated over all 8 bits of the target position (sign extend of the byte value); `msb=0` means copy the literal value; `msb=1` means replicate the sign. Note that the sign extension is only performed as part of generic form.

Thus, the four 4-bit values fully specify an arbitrary byte permute, as a `16b` permute code.

default mode |  `d.b3` source select |  `d.b2` source select |  `d.b1` source select |  `d.b0` source select  
---|---|---|---|---  
index | `c[15:12]` | `c[11:8]` | `c[7:4]` | `c[3:0]`

The more specialized form of the permute control uses the two lsb’s of operand `c` (which is typically an address pointer) to control the byte extraction.

mode |  selector `c[1:0]` |  `d.b3` source |  `d.b2` source |  `d.b1` source |  `d.b0` source  
---|---|---|---|---|---  
`f4e` (forward 4 extract) | 0 | 3 | 2 | 1 | 0  
| 1 | 4 | 3 | 2 | 1  
| 2 | 5 | 4 | 3 | 2  
| 3 | 6 | 5 | 4 | 3  
`b4e` (backward 4 extract) | 0 | 5 | 6 | 7 | 0  
| 1 | 6 | 7 | 0 | 1  
| 2 | 7 | 0 | 1 | 2  
| 3 | 0 | 1 | 2 | 3  
`rc8` (replicate 8) | 0 | 0 | 0 | 0 | 0  
| 1 | 1 | 1 | 1 | 1  
| 2 | 2 | 2 | 2 | 2  
| 3 | 3 | 3 | 3 | 3  
`ecl` (edge clamp left) | 0 | 3 | 2 | 1 | 0  
| 1 | 3 | 2 | 1 | 1  
| 2 | 3 | 2 | 2 | 2  
| 3 | 3 | 3 | 3 | 3  
`ecr` (edge clamp right) | 0 | 0 | 0 | 0 | 0  
| 1 | 1 | 1 | 1 | 0  
| 2 | 2 | 2 | 1 | 0  
| 3 | 3 | 2 | 1 | 0  
`rc16` (replicate 16) | 0 | 1 | 0 | 1 | 0  
| 1 | 3 | 2 | 3 | 2  
| 2 | 1 | 0 | 1 | 0  
| 3 | 3 | 2 | 3 | 2

Semantics

tmp64 = (b<<32) | a;  // create 8 byte source
    
    if ( ! mode ) {
       ctl[0] = (c >>  0) & 0xf;
       ctl[1] = (c >>  4) & 0xf;
       ctl[2] = (c >>  8) & 0xf;
       ctl[3] = (c >> 12) & 0xf;
    } else {
       ctl[0] = ctl[1] = ctl[2] = ctl[3] = (c >>  0) & 0x3;
    }
    
    tmp[07:00] = ReadByte( mode, ctl[0], tmp64 );
    tmp[15:08] = ReadByte( mode, ctl[1], tmp64 );
    tmp[23:16] = ReadByte( mode, ctl[2], tmp64 );
    tmp[31:24] = ReadByte( mode, ctl[3], tmp64 );

PTX ISA Notes

Introduced in PTX ISA version 2.0.

Target ISA Notes

`prmt` requires `sm_20` or higher.

Examples

prmt.b32      r1, r2, r3, r4;
    prmt.b32.f4e  r1, r2, r3, r4;