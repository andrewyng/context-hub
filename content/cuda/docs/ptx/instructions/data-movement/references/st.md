# PTX 指令专题：st

`st` 用于将寄存器数据写回到目标状态空间，是 PTX 基础写入指令。

## 官方定位

- 文档章节：Data Movement and Conversion Instructions: `st`
- 存在与状态空间/类型/修饰符相关的多个变体

## 核心约束

- 写地址状态空间必须与指令变体一致。
- 源寄存器类型必须匹配存储元素类型。
- 与并发读写共享数据时需配合 fence/atom/barrier 建立顺序关系。

## 示例（PTX 风格）

```ptx
st.global.u32 [addr], r1;
st.shared.f32 [saddr], f1;
```

## 官方来源链接（事实核验）

- st: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st
- st.async: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st-async
- st.bulk: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-st-bulk

最后核对日期：2026-03-19
