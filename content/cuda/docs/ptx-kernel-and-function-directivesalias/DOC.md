---
name: ptx-kernel-and-function-directivesalias
description: Define an alias to existing function symbol.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.2.3. Kernel and Function Directives:.alias

---
title: "11.2.3. Kernel and Function Directives:.alias"
section: 11.2.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.2.3. Kernel and Function Directives:.alias


`.alias`

Define an alias to existing function symbol.

Syntax

.alias fAlias, fAliasee;

Description

`.alias` is a module scope directive that defines identifier `fAlias` to be an alias to function specified by `fAliasee`.

Both `fAlias` and `fAliasee` are non-entry function symbols.

Identifier `fAlias` is a function declaration without body.

Identifier `fAliasee` is a function symbol which must be defined in the same module as `.alias` declaration. Function `fAliasee` cannot have `.weak` linkage.

Prototype of `fAlias` and `fAliasee` must match.

Program can use either `fAlias` or `fAlisee` identifiers to reference function defined with `fAliasee`.

PTX ISA Notes

`.alias` directive introduced in PTX ISA 6.3.

Target ISA Notes

`.alias` directive requires `sm_30` or higher.

Examples

.visible .func foo(.param .u32 p) {
       ...
    }
    .visible .func bar(.param .u32 p);
    .alias bar, foo;
    .entry test()
    {
          .param .u32 p;
          ...
          call foo, (p);       // call foo directly
           ...
           .param .u32 p;
           call bar, (p);        // call foo through alias
    }
    .entry filter ( .param .b32 x, .param .b32 y, .param .b32 z )
    {
        .reg .b32 %r1, %r2, %r3;
        ld.param.b32  %r1, [x];
        ld.param.b32  %r2, [y];
        ld.param.b32  %r3, [z];
        ...
    }