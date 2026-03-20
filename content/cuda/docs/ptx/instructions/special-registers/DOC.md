---
name: ptx-special-registers
description: "PTX special registers reference for ISA 9.2 with common usage patterns."
metadata:
  languages: "ptx"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,special-registers,tid,ctaid"
---

# PTX Special Registers

Special registers provide execution context such as thread indices, grid information, and SM-related details.

## Common Registers

- `%tid`: thread index within the CTA
- `%ntid`: CTA dimensions
- `%ctaid`: CTA index within the thread grid
- `%nctaid`: total number of CTAs in the grid (per dimension)
- `%smid`: SM ID (target related)

## Usage Notes

- Rely on special registers directly only when low-level control is truly needed.
- When inferring scheduling/topology, first verify that the target ISA is supported and the semantics are stable.

## Example

```ptx
mov.u32 r0, %tid.x;
mov.u32 r1, %ctaid.x;
```

## Official Source Links (Fact Check)

- Special Registers: https://docs.nvidia.com/cuda/parallel-thread-execution/#special-registers
- %tid: https://docs.nvidia.com/cuda/parallel-thread-execution/#special-registers-tid
- %ctaid: https://docs.nvidia.com/cuda/parallel-thread-execution/#special-registers-ctaid
- %smid: https://docs.nvidia.com/cuda/parallel-thread-execution/#special-registers-smid

Last cross-check date: 2026-03-19

## Single-instruction Topics

- `references/tid-ctaid.md`
- `references/activemask.md`
