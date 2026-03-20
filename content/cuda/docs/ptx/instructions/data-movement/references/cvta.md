# PTX 指令专题：cvta

`cvta` 用于地址转换/标准化（convert address），在不同地址空间指针处理时非常关键。

## 官方定位

- 文档章节：Data Movement and Conversion Instructions: `cvta`
- 常见于 generic pointer 与具体状态空间地址间的转换路径

## 核心约束

- 目标地址空间与输入地址必须匹配允许的转换方向。
- 结果寄存器位宽需容纳目标地址表示。

## 示例（PTX 风格）

```ptx
cvta.to.global.u64 rd, ra;
```

## 官方来源链接（事实核验）

- cvta: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-cvta
- State spaces: https://docs.nvidia.com/cuda/parallel-thread-execution/#state-spaces

最后核对日期：2026-03-19
