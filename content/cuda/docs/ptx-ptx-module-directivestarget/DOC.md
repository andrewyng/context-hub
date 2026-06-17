---
name: ptx-ptx-module-directivestarget
description: Architecture and Platform target.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.1.2. PTX Module Directives:.target

---
title: "11.1.2. PTX Module Directives:.target"
section: 11.1.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.1.2. PTX Module Directives:.target


`.target`

Architecture and Platform target.

Syntax

.target stringlist         // comma separated list of target specifiers
    string = { sm_120a, sm_120f, sm_120,          // sm_12x target architectures
               sm_121a, sm_121f, sm_121,          // sm_12x target architectures
               sm_110a, sm_110f, sm_110,          // sm_11x target architectures
               sm_100a, sm_100f, sm_100,          // sm_10x target architectures
               sm_101a, sm_101f, sm_101,          // sm_10x target architectures
               sm_103a, sm_103f, sm_103           // sm_10x target architectures
               sm_90a, sm_90,                     // sm_9x target architectures
               sm_80, sm_86, sm_87, sm_88, sm_89, // sm_8x target architectures
               sm_70, sm_72, sm_75,               // sm_7x target architectures
               sm_60, sm_61, sm_62,               // sm_6x target architectures
               sm_50, sm_52, sm_53,               // sm_5x target architectures
               sm_30, sm_32, sm_35, sm_37,        // sm_3x target architectures
               sm_20,                             // sm_2x target architectures
               sm_10, sm_11, sm_12, sm_13,        // sm_1x target architectures
               texmode_unified, texmode_independent,   // texturing mode
               debug,                                  // platform option
               map_f64_to_f32 };                       // platform option

Description

Specifies the set of features in the target architecture for which the current PTX code was generated. In general, generations of SM architectures follow an _onion layer_ model, where each generation adds new features and retains all features of previous generations. The onion layer model allows the PTX code generated for a given target to be run on later generation devices.

Target architectures with suffix “`a`”, such as `sm_90a`, include architecture-specific features that are supported on the specified architecture only, hence such targets do not follow the onion layer model. Therefore, PTX code generated for such targets cannot be run on later generation devices. Architecture-specific features can only be used with targets that support these features.

Target architectures with suffix “`f`”, such as `sm_100f`, include family-specific features that are supported only within the same architecture family. Therefore, PTX code generated for such targets can run only on later generation devices in the same family. Family-specific features can be used with f-targets as well as a-targets of later generation devices in the same family.

[Table 58](<#architecture-family-definition>) defines the architecture families.

Table 58 Architecture Families Family | Target SM architectures included  
---|---  
sm_10x family | sm_100f, sm_103f, future targets in sm_10x family  
sm_11x family | sm_110f, sm_101f, future targets in sm_11x family  
sm_12x family | sm_120f, sm_121f, future targets in sm_12x family

Semantics

Each PTX module must begin with a `.version` directive, immediately followed by a `.target` directive containing a target architecture and optional platform options. A `.target` directive specifies a single target architecture, but subsequent `.target` directives can be used to change the set of target features allowed during parsing. A program with multiple `.target` directives will compile and run only on devices that support all features of the highest-numbered architecture listed in the program.

PTX features are checked against the specified target architecture, and an error is generated if an unsupported feature is used. The following table summarizes the features in PTX that vary according to target architecture.

Target | Description  
---|---  
`sm_120` | Baseline feature set for `sm_120` architecture.  
`sm_120f` | Adds support for `sm_120f` family specific features.  
`sm_120a` | Adds support for `sm_120a` architecture-specific features.  
`sm_121` | Baseline feature set for `sm_121` architecture.  
`sm_121f` | Adds support for `sm_121f` family specific features.  
`sm_121a` | Adds support for `sm_121a` architecture-specific features.

Target | Description  
---|---  
`sm_110` | Baseline feature set for `sm_110` architecture.  
`sm_110f` | Adds support for `sm_110f` family specific features.  
`sm_110a` | Adds support for `sm_110a` architecture-specific features.

Target | Description  
---|---  
`sm_100` | Baseline feature set for `sm_100` architecture.  
`sm_100f` | Adds support for `sm_100f` family specific features.  
`sm_100a` | Adds support for `sm_100a` architecture-specific features.  
`sm_101` | Baseline feature set for `sm_101` architecture. (Renamed to `sm_110`)  
`sm_101f` | Adds support for `sm_101f` family specific features. (Renamed to `sm_110f`)  
`sm_101a` | Adds support for `sm_101a` architecture-specific features. (Renamed to `sm_110a`)  
`sm_103` | Baseline feature set for `sm_103` architecture.  
`sm_103f` | Adds support for `sm_103f` family specific features.  
`sm_103a` | Adds support for `sm_103a` architecture-specific features.

Target | Description  
---|---  
`sm_90` | Baseline feature set for `sm_90` architecture.  
`sm_90a` | Adds support for `sm_90a` architecture-specific features.

Target | Description  
---|---  
`sm_80` | Baseline feature set for `sm_80` architecture.  
`sm_86` | Adds support for `.xorsign` modifier on `min` and `max` instructions.  
`sm_87` | Baseline feature set for `sm_87` architecture.  
`sm_88` | Baseline feature set for `sm_88` architecture.  
`sm_89` | Baseline feature set for `sm_89` architecture.

Target | Description  
---|---  
`sm_70` | Baseline feature set for `sm_70` architecture.  
`sm_72` |  Adds support for integer multiplicand and accumulator matrices in `wmma` instructions. Adds support for `cvt.pack` instruction.  
`sm_75` |  Adds support for sub-byte integer and single-bit multiplicant matrices in `wmma` instructions. Adds support for `ldmatrix` instruction. Adds support for `movmatrix` instruction. Adds support for `tanh` instruction.

Target | Description  
---|---  
`sm_60` | Baseline feature set for `sm_60` architecture.  
`sm_61` | Adds support for `dp2a` and `dp4a` instructions.  
`sm_62` | Baseline feature set for `sm_61` architecture.

Target | Description  
---|---  
`sm_50` | Baseline feature set for `sm_50` architecture.  
`sm_52` | Baseline feature set for `sm_50` architecture.  
`sm_53` | Adds support for arithmetic, comparsion and texture instructions for `.f16` and `.f16x2` types.

Target | Description  
---|---  
`sm_30` | Baseline feature set for `sm_30` architecture.  
`sm_32` |  Adds 64-bit `{atom,red}.{and,or,xor,min,max}` instructions. Adds `shf` instruction. Adds `ld.global.nc` instruction.  
`sm_35` | Adds support for CUDA Dynamic Parallelism.  
`sm_37` | Baseline feature set for `sm_35` architecture.

Target | Description  
---|---  
`sm_20` | Baseline feature set for `sm_20` architecture.

Target | Description  
---|---  
`sm_10` |  Baseline feature set for `sm_10` architecture. Requires `map_f64_to_f32` if any `.f64` instructions used.  
`sm_11` |  Adds 64-bit `{atom,red}.{and,or,xor,min,max}` instructions. Requires `map_f64_to_f32` if any `.f64` instructions used.  
`sm_12` |  Adds `{atom,red}.shared`, 64-bit `{atom,red}.global`, `vote` instructions. Requires `map_f64_to_f32` if any `.f64` instructions used.  
`sm_13` |  Adds double-precision support, including expanded rounding modifiers. Disallows use of `map_f64_to_f32`.

The texturing mode is specified for an entire module and cannot be changed within the module.

The `.target` debug option declares that the PTX file contains DWARF debug information, and subsequent compilation of PTX will retain information needed for source-level debugging. If the debug option is declared, an error message is generated if no DWARF information is found in the file. The debug option requires PTX ISA version 3.0 or later.

`map_f64_to_f32` indicates that all double-precision instructions map to single-precision regardless of the target architecture. This enables high-level language compilers to compile programs containing type double to target device that do not support double-precision operations. Note that `.f64` storage remains as 64-bits, with only half being used by instructions converted from `.f64` to `.f32`.

Notes

Targets of the form `compute_xx` are also accepted as synonyms for `sm_xx` targets.

Targets `sm_{101,101f,101a}` are renamed to targets `sm_{110,110f,110a}` from PTX ISA version 9.0.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Target strings `sm_10` and `sm_11` introduced in PTX ISA version 1.0.

Target strings `sm_12` and `sm_13` introduced in PTX ISA version 1.2.

Texturing mode introduced in PTX ISA version 1.5.

Target string `sm_20` introduced in PTX ISA version 2.0.

Target string `sm_30` introduced in PTX ISA version 3.0.

Platform option `debug` introduced in PTX ISA version 3.0.

Target string `sm_35` introduced in PTX ISA version 3.1.

Target strings `sm_32` and `sm_50` introduced in PTX ISA version 4.0.

Target strings `sm_37` and `sm_52` introduced in PTX ISA version 4.1.

Target string `sm_53` introduced in PTX ISA version 4.2.

Target string `sm_60`, `sm_61`, `sm_62` introduced in PTX ISA version 5.0.

Target string `sm_70` introduced in PTX ISA version 6.0.

Target string `sm_72` introduced in PTX ISA version 6.1.

Target string `sm_75` introduced in PTX ISA version 6.3.

Target string `sm_80` introduced in PTX ISA version 7.0.

Target string `sm_86` introduced in PTX ISA version 7.1.

Target string `sm_87` introduced in PTX ISA version 7.4.

Target string `sm_88` introduced in PTX ISA version 9.0.

Target string `sm_89` introduced in PTX ISA version 7.8.

Target string `sm_90` introduced in PTX ISA version 7.8.

Target string `sm_90a` introduced in PTX ISA version 8.0.

Target string `sm_100` introduced in PTX ISA version 8.6.

Target string `sm_100f` introduced in PTX ISA version 8.8.

Target string `sm_100a` introduced in PTX ISA version 8.6.

Target string `sm_101` introduced in PTX ISA version 8.6. (Renamed to `sm_110`)

Target string `sm_101f` introduced in PTX ISA version 8.8. (Renamed to `sm_110f`)

Target string `sm_101a` introduced in PTX ISA version 8.6. (Renamed to `sm_110a`)

Target string `sm_103` introduced in PTX ISA version 8.8.

Target string `sm_103f` introduced in PTX ISA version 8.8.

Target string `sm_103a` introduced in PTX ISA version 8.8.

Target string `sm_110` introduced in PTX ISA version 9.0.

Target string `sm_110f` introduced in PTX ISA version 9.0.

Target string `sm_110a` introduced in PTX ISA version 9.0.

Target string `sm_120` introduced in PTX ISA version 8.7.

Target string `sm_120f` introduced in PTX ISA version 8.8.

Target string `sm_120a` introduced in PTX ISA version 8.7.

Target string `sm_121` introduced in PTX ISA version 8.8.

Target string `sm_121f` introduced in PTX ISA version 8.8.

Target string `sm_121a` introduced in PTX ISA version 8.8.

Target ISA Notes

The `.target` directive is supported on all target architectures.

Examples

.target sm_10       // baseline target architecture
    .target sm_13       // supports double-precision
    .target sm_20, texmode_independent
    .target sm_90       // baseline target architecture
    .target sm_90a      // PTX using architecture-specific features
    .target sm_100f     // PTX using family-specific features