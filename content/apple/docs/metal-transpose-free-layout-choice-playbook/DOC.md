---
name: metal-transpose-free-layout-choice-playbook
description: "Apple Metal transpose-free layout choice playbook: selecting data layout early to avoid extra layout-conversion kernels and preserve downstream locality."
metadata:
  languages: "cpp"
  versions: "4.0"
  revision: 1
  updated-on: "2026-03-21"
  source: official
  tags: "apple,metal,layout-choice,transpose-free,data-layout,locality,packing,reorder,compute"
---

# Metal Transpose-Free Layout Choice Playbook

Use this page when a workload repeatedly inserts transpose or reorder kernels only because earlier layout decisions made later stages awkward.

## The Main Idea

Sometimes the best transpose kernel is no transpose kernel.

If several downstream stages naturally prefer one layout, it is often better to:

- choose that layout earlier
- keep data in that layout longer
- avoid repeated pack, transpose, unpack cycles

## When To Reconsider Layout

Revisit layout choice when:

- the pipeline spends noticeable time in layout-conversion kernels
- one stage prefers row-major while most later stages prefer another view
- a tensor is repeatedly packed and unpacked around the same hotspot

## Safe Decision Process

- identify which stages dominate time or bandwidth
- choose the layout that helps the dominant downstream path
- validate that the new layout reduces, rather than relocates, conversion cost
- keep one explicit fallback path until the new layout is stable

## Common Failure Modes

- a transpose is optimized heavily instead of removing the need for it
- each stage chooses its own preferred layout, causing repeated conversions
- a new layout helps one kernel but makes several later kernels worse
- the wrapper and kernel disagree on which layout is now canonical

## Official Source Links (Fact Check)

- Compute passes: https://developer.apple.com/documentation/metal/compute-passes
- Performing calculations on a GPU: https://developer.apple.com/documentation/metal/performing-calculations-on-a-gpu
- Metal developer tools: https://developer.apple.com/metal/tools/

Last cross-check date: 2026-03-21
