---
name: ptx-comments
description: Comments in PTX follow C/C++ syntax, using non-nested `/*` and `*/` for
  comments that may span multiple lines, and using `//` to begin a comment that extends
  up to the next newline character, which te...
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 4.2. Comments

---
title: "4.2. Comments"
section: 4.2
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

## 4.2. Comments


Comments in PTX follow C/C++ syntax, using non-nested `/*` and `*/` for comments that may span multiple lines, and using `//` to begin a comment that extends up to the next newline character, which terminates the current line. Comments cannot occur within character constants, string literals, or within other comments.

Comments in PTX are treated as whitespace.