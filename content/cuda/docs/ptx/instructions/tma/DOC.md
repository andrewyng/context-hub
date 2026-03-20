---
name: ptx-tma-instructions
description: "PTX Tensor Memory Accelerator related instructions and usage constraints in ISA 9.2."
metadata:
  languages: "ptx"
  versions: "9.2"
  revision: 2
  updated-on: "2026-03-19"
  source: official
  tags: "cuda,ptx,tma,async,memory"
---

# PTX TMA

TMA（Tensor Memory Accelerator）路径主要通过 `cp.async.bulk.tensor` 族指令完成张量搬运。

## 官方语法摘录（关键）

```ptx
cp.async.bulk.tensor.1d.shared::cta.global.mbarrier::complete_tx::bytes.tile [dstMem], [tensorMap, {tc}], [mbar];
```

> 说明：上面是官方章节中的代表性形式，实际可选维度/修饰符很多，需按具体子节匹配。

## 官方语义要点

- `cp.async.bulk.tensor` 使用 mbarrier-based completion 机制。
- 完成时会在指定 mbarrier 上执行 complete-tx（字节数为 completeCount）。
- 该路径按文档属于 weak memory operation，并在相关说明中给出 release/cluster 语义。

## 常见约束

- `tensorMap` 描述符和坐标参数必须合法。
- `.cta_group` 行为与 mbarrier 所在 CTA 关系有关。
- cluster multicast 变体要求正确 `ctaMask`。

## 使用建议

- 先验证“功能正确”（边界、对齐、维度映射），再优化带宽。
- 与 WGMMA 联动时，明确“搬运完成 -> 计算可读”的同步边界。

## 官方来源链接（事实核验）

- cp.async.bulk.tensor: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk-tensor
- Tensor Map: https://docs.nvidia.com/cuda/parallel-thread-execution/#tensor-map
- mbarrier: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations

最后核对日期：2026-03-19

## 单指令专题

- `references/cp-async-bulk-tensor.md`
- `references/cp-reduce-async-bulk.md`
- `references/multimem-cp-reduce-async-bulk.md`
