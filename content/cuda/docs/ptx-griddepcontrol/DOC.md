---
name: ptx-griddepcontrol
description: Control execution of dependent grids.
metadata:
  languages: cuda
  versions: '9.1'
  revision: 1
  updated-on: '2026-03-28'
  source: official
  tags: cuda,gpu,ptx,isa
---

# 9.7.13.13. Parallel Synchronization and Communication Instructions:griddepcontrol

---
title: "9.7.13.13. Parallel Synchronization and Communication Instructions:griddepcontrol"
section: 9.7.13.13
url: https://docs.nvidia.com/cuda/parallel-thread-execution/
---

#### 9.7.13.13. Parallel Synchronization and Communication Instructions:griddepcontrol


`griddepcontrol`

Control execution of dependent grids.

Syntax

griddepcontrol.action;
    
    .action   = { .launch_dependents, .wait }

Description

The `griddepcontrol` instruction allows the dependent grids and prerequisite grids as defined by the runtime, to control execution in the following way:

`.launch_dependents` modifier signals that specific dependents the runtime system designated to react to this instruction can be scheduled as soon as all other CTAs in the grid issue the same instruction or have completed. The dependent may launch before the completion of the current grid. There is no guarantee that the dependent will launch before the completion of the current grid. Repeated invocations of this instruction by threads in the current CTA will have no additional side effects past that of the first invocation.

`.wait` modifier causes the executing thread to wait until all prerequisite grids in flight have completed and all the memory operations from the prerequisite grids are performed and made visible to the current grid.

Note

If the prerequisite grid is using `griddepcontrol.launch_dependents`, then the dependent grid must use `griddepcontrol.wait` to ensure correct functional execution.

PTX ISA Notes

Introduced in PTX ISA version 7.8.

Target ISA Notes

Requires `sm_90` or higher.

Examples

griddepcontrol.launch_dependents;
    griddepcontrol.wait;