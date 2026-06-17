# PTX Instruction Topic: %tid and %ctaid

`%tid` and `%ctaid` are the most commonly used index registers. They represent a thread's position within a CTA and the CTA's position within the grid, respectively.

## Typical Usage

```ptx
mov.u32 r_tid, %tid.x;
mov.u32 r_cta, %ctaid.x;
```

## Usage Notes

- `%tid` / `%ctaid` are read-only special registers.
- The dimension components (`.x/.y/.z`) must match how the kernel is organized.

## Common Failure Modes

- Assuming 1D launch indexing while kernels are configured as 2D/3D.
- Mixing CTA-level and global index formulas across helper functions.
- Recomputing indices with mismatched integer width when problem size exceeds 32-bit ranges.

## Indexing Reminder

- Build global index formulas with explicit dimension strides (`blockDim` and `gridDim`) to avoid shape-dependent bugs.

## Official Source Links (Fact Check)

- Special Registers: https://docs.nvidia.com/cuda/parallel-thread-execution/#special-registers
- %tid: https://docs.nvidia.com/cuda/parallel-thread-execution/#special-registers-tid
- %ctaid: https://docs.nvidia.com/cuda/parallel-thread-execution/#special-registers-ctaid

Last cross-check date: 2026-03-19
