---
name: ptx-directive-statements
description: Directive keywords begin with a dot, so no conflict is possible with
  user-defined identifiers. The directives in PTX are listed in [Table 1](<#directive-statements-ptx-directives>)
  and described in [S...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 4.3.1. Directive Statements

---
title: "4.3.1. Directive Statements"
section: 4.3.1
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 4.3.1. Directive Statements


Directive keywords begin with a dot, so no conflict is possible with user-defined identifiers. The directives in PTX are listed in [Table 1](<#directive-statements-ptx-directives>) and described in [State Spaces, Types, and Variables](<#state-spaces-types-and-variables>) and [Directives](<#directives>).

Table 1 PTX Directives `.address_size` | `.explicitcluster` | `.maxnreg` | `.section`  
---|---|---|---  
`.alias` | `.extern` | `.maxntid` | `.shared`  
`.align` | `.file` | `.minnctapersm` | `.sreg`  
`.branchtargets` | `.func` | `.noreturn` | `.target`  
`.callprototype` | `.global` | `.param` | `.tex`  
`.calltargets` | `.loc` | `.pragma` | `.version`  
`.common` | `.local` | `.reg` | `.visible`  
`.const` | `.maxclusterrank` | `.reqnctapercluster` | `.weak`  
`.entry` | `.maxnctapersm` | `.reqntid` |