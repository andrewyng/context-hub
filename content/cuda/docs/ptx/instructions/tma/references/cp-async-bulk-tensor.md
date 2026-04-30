# PTX Instruction Note: cp.async.bulk.tensor (TMA)

`cp.async.bulk.tensor` is the core PTX TMA instruction family for asynchronous tensor movement between selected state spaces.

## Official Syntax (Excerpt)

```ptx
cp.async.bulk.tensor.dim.dst.src{.load_mode}.completion_mechanism{.cta_group}{.level::cache_hint}
    [dstMem], [tensorMap, tensorCoords], [mbar]{, im2colInfo}{, cache-policy}
```

```ptx
cp.async.bulk.tensor.dim.dst.src{.load_mode}.completion_mechanism{.multicast}{.cta_group}{.level::cache_hint}
    [dstMem], [tensorMap, tensorCoords], [mbar]{, im2colInfo}{, ctaMask}{, cache-policy}
```

```ptx
cp.async.bulk.tensor.dim.dst.src{.load_mode}.completion_mechanism{.level::cache_hint}
    [tensorMap, tensorCoords], [srcMem]{, cache-policy}
```

## Key Semantics

- The instruction is asynchronous and requires an explicit completion protocol before consumer use.
- Completion mechanism is variant-dependent (`.mbarrier::complete_tx::bytes` or `.bulk_group` in eligible forms).
- Source/destination state-space and modifier choices determine valid operand templates.
- Memory ordering and visibility follow PTX asynchronous-operation and proxy rules.

## Common Constraints

- `tensorMap` and coordinate operands must match dimension, load mode, and layout requirements.
- Multicast and CTA-group modifiers require correct target-mask or grouping operands.
- Architecture/type restrictions apply to specific variants; verify against the ISA restrictions section.

## Example (PTX style)

```ptx
cp.async.bulk.tensor.1d.shared::cta.global.mbarrier::complete_tx::bytes.tile [sMem0], [tensorMap0, {tc0}], [mbar0];
```

## Official Source Links (fact check)

- cp.async.bulk.tensor: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk-tensor
- Tensor Map: https://docs.nvidia.com/cuda/parallel-thread-execution/#tensor-map
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations
- mbarrier: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier

Last verified date: 2026-03-19
