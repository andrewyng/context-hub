# PTX 指令专题：ld

`ld` 用于从指定状态空间加载数据到寄存器，是 PTX 中最基础的数据读取指令。

## 官方定位

- 文档章节：Data Movement and Conversion Instructions: `ld`
- 存在多种状态空间与缓存修饰变体（如 `.global`、`.shared` 等）

## 核心约束

- 地址状态空间必须和 `ld` 变体匹配。
- 目的寄存器类型需要和加载数据类型兼容。
- 缓存修饰和一致性语义要与目标架构支持相符。

## 示例（PTX 风格）

```ptx
ld.global.u32 r1, [addr];
ld.shared.f32 f1, [saddr];
```

## 官方来源链接（事实核验）

- ld: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld
- ld.global.nc: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld-global-nc
- ldu: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ldu

最后核对日期：2026-03-19
