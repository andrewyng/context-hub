# PTX 指令专题：cp.async.bulk.tensor（TMA）

`cp.async.bulk.tensor` 是 PTX Tensor Memory Accelerator 的核心异步张量搬运指令。

## 官方语法（节选）

方向与完成机制不同，操作数模板也不同（以下与 ISA 表格一致，仅列骨架）：

**Global → shared::cta（mbarrier 完成）**

```ptx
cp.async.bulk.tensor.dim.dst.src{.load_mode}.completion_mechanism{.cta_group}{.level::cache_hint}
    [dstMem], [tensorMap, tensorCoords], [mbar]{, im2colInfo}{, cache-policy}
```

**Global → shared::cluster（可 multicast；仍为 mbarrier 完成）**

```ptx
cp.async.bulk.tensor.dim.dst.src{.load_mode}.completion_mechanism{.multicast}{.cta_group}{.level::cache_hint}
    [dstMem], [tensorMap, tensorCoords], [mbar]{, im2colInfo}{, ctaMask}{, cache-policy}
```

**Shared::cta → global（仅 `.bulk_group` 完成，无 `[mbar]` 操作数）**

```ptx
cp.async.bulk.tensor.dim.dst.src{.load_mode}.completion_mechanism{.level::cache_hint}
    [tensorMap, tensorCoords], [srcMem]{, cache-policy}
```

## 关键语义

- non-blocking 异步张量拷贝，源/目的状态空间由 `dst.src` 组合决定。
- `.mbarrier::complete_tx::bytes`：完成时在指定 mbarrier 上执行 complete-tx；官方在内存模型中说明该 complete-tx 具备 `.cluster` 范围的 `.release` 语义。
- `.bulk_group`：仅出现在 **shared::cta → global** 变体上，用 bulk async-group 等待完成，**操作数列表不含 mbarrier**。

## 典型约束

- `tensorMap` 与坐标 `tensorCoords` 必须匹配维度与 `.load_mode` 所要求的向量格式。
- `.cta_group` **只能**与 **mbarrier 完成机制** 同时使用（文档原句：`can only be specified with the mbarrier based completion mechanism`）。
- `.multicast::cluster` 变体需正确提供 `ctaMask`（每位对应目的 CTA 的 `%cluster_ctarank`）。
- 不同目标架构/数据类型存在限制（详见章节 restrictions）。

## 示例（官方风格）

```ptx
cp.async.bulk.tensor.1d.shared::cta.global.mbarrier::complete_tx::bytes.tile  [sMem0], [tensorMap0, {tc0}], [mbar0];
```

## 官方来源链接（事实核验）

- cp.async.bulk.tensor: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cp-async-bulk-tensor
- Tensor Map: https://docs.nvidia.com/cuda/parallel-thread-execution/#tensor-map
- Asynchronous operations: https://docs.nvidia.com/cuda/parallel-thread-execution/#asynchronous-operations
- mbarrier: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier

最后核对日期：2026-03-19
