# PTX 指令专题：prefetch / prefetchu

`prefetch` / `prefetchu` 用于提前拉取数据到缓存层级，减少后续访问延迟。

## 官方定位

- 文档章节：Data Movement and Conversion Instructions: `prefetch, prefetchu`
- 常用于访存热点和规则访问模式优化

## 使用建议

- 仅在访存模式可预测时收益明显。
- 预取距离需要结合内核计算/访存比调优。
- 与异步搬运（如 `cp.async`）不要混淆：二者语义不同。

## 官方来源链接（事实核验）

- prefetch, prefetchu: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-prefetch-prefetchu
- Data movement instruction set: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions

最后核对日期：2026-03-19
