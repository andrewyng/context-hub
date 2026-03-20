# PTX 指令专题：st.bulk

`st.bulk` 用于 bulk 存储路径，适合批量数据写入场景。

## 官方定位

- 文档章节：Data Movement and Conversion Instructions: `st.bulk`
- 与常规 `st` 相比更偏向批量/吞吐优化路径

## 使用建议

- 仅在访问模式与目标架构适配时使用。
- 与同步/可见性要求配套设计，避免读写阶段重叠。

## 官方来源链接（事实核验）

- st.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st-bulk
- st: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st

最后核对日期：2026-03-19
