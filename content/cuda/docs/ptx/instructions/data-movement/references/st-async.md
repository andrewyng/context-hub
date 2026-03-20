# PTX 指令专题：st.async

`st.async` 是异步存储路径指令，可与 mbarrier 完成机制联动。

## 官方定位

- 文档章节：Data Movement and Conversion Instructions: `st.async`
- 常见形式包含 `.mbarrier::complete_tx::bytes` 相关语法

## 关键语义

- 存储完成通过 mbarrier complete-tx 信号通知。
- `st.async` 的存储操作在 generic proxy 中执行；当使用 `.mbarrier::complete_tx::bytes` 时，mbarrier 的 complete-tx 在 `.cluster` 范围具备 `.release` 语义。

## 示例（PTX 风格，示意）

```ptx
st.async.shared::cluster.mbarrier::complete_tx::bytes.u32 [addr], b, [mbar_addr];
```

## 官方来源链接（事实核验）

- st.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st-async
- mbarrier: https://docs.nvidia.com/cuda/parallel-thread-execution/#parallel-synchronization-and-communication-instructions-mbarrier
- Memory consistency model: https://docs.nvidia.com/cuda/parallel-thread-execution/#memory-consistency-model

最后核对日期：2026-03-19
