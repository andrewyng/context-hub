---
name: ptx-pmevent
description: Trigger one or more Performance Monitor events.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.19.3. Miscellaneous Instructions:pmevent

---
title: "9.7.19.3. Miscellaneous Instructions:pmevent"
section: 9.7.19.3
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.19.3. Miscellaneous Instructions:pmevent


`pmevent`

Trigger one or more Performance Monitor events.

Syntax

pmevent       a;    // trigger a single performance monitor event
    pmevent.mask  a;    // trigger one or more performance monitor events

Description

Triggers one or more of a fixed number of performance monitor events, with event index or mask specified by immediate operand `a`.

`pmevent` (without modifier `.mask`) triggers a single performance monitor event indexed by immediate operand `a`, in the range `0..15`.

`pmevent.mask` triggers one or more of the performance monitor events. Each bit in the 16-bit immediate operand `a` controls an event.

Programmatic performance moniter events may be combined with other hardware events using Boolean functions to increment one of the four performance counters. The relationship between events and counters is programmed via API calls from the host.

Notes

Currently, there are sixteen performance monitor events, numbered 0 through 15.

PTX ISA Notes

`pmevent` introduced in PTX ISA version 1.4.

`pmevent.mask` introduced in PTX ISA version 3.0.

Target ISA Notes

pmevent supported on all target architectures.

`pmevent.mask` requires `sm_20` or higher.

Examples

pmevent      1;
    @p  pmevent      7;
    @q  pmevent.mask 0xff;