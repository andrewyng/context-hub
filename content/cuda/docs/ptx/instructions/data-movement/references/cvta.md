# PTX Instruction Note: cvta

`cvta` is used for address conversion/normalization (`convert address`) and is critical for cross-address-space pointer handling.

## Official Positioning

- Documentation section: Data Movement and Conversion Instructions: `cvta`

## Key Constraints

- Target state space and input address must match an allowed conversion direction.
- Result register bit width must accommodate the target address representation.

## Usage Notes

- Use `cvta` at ABI boundaries where generic pointers must be normalized to explicit state spaces.
- Keep pointer width explicit (`u32` vs `u64`) to avoid truncation on mixed-address workflows.

## Common Failure Modes

- Converting to an incorrect target state space and then reusing the pointer in unrelated load/store paths.
- Address-width truncation when 64-bit addresses are forced into 32-bit intermediates.

## Example (PTX style)

```ptx
cvta.to.global.u64 rd, ra;
```

## Official Source Links (fact check)

- cvta: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cvta
- State spaces: https://docs.nvidia.com/cuda/parallel-thread-execution/#state-spaces

Last verified date: 2026-03-19
