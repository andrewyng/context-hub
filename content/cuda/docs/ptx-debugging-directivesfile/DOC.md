---
name: ptx-debugging-directivesfile
description: Source file name.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 11.5.3. Debugging Directives:.file

---
title: "11.5.3. Debugging Directives:.file"
section: 11.5.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

### 11.5.3. Debugging Directives:.file


`.file`

Source file name.

Syntax

.file file_index "filename" {, timestamp, file_size}

Description

Associates a source filename with an integer index. `.loc` directives reference source files by index.

`.file` directive allows optionally specifying an unsigned number representing time of last modification and an unsigned integer representing size in bytes of source file. `timestamp` and `file_size` value can be 0 to indicate this information is not available.

`timestamp` value is in format of C and C++ data type `time_t`.

`file_size` is an unsigned 64-bit integer.

The `.file` directive is allowed only in the outermost scope, i.e., at the same level as kernel and device function declarations.

Semantics

If timestamp and file size are not specified, they default to 0.

PTX ISA Notes

Introduced in PTX ISA version 1.0.

Timestamp and file size introduced in PTX ISA version 3.2.

Target ISA Notes

Supported on all target architectures.

Examples

.file 1 "example.cu"
    .file 2 "kernel.cu"
    .file 1 "kernel.cu", 1339013327, 64118