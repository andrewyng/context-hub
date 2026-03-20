# PTX 指令专题：ld.global.nc

`ld.global.nc` 是全局内存加载的 non-coherent/特殊缓存路径变体（按官方章节定义）。

## 官方定位

- 文档章节：Data Movement and Conversion Instructions: `ld.global.nc`
- 适用于特定缓存策略与读取模式

## 核心约束

- 仅在满足目标架构与语义需求时使用。
- 与普通 `ld.global` 的可见性/缓存行为不能混淆。
- 需结合官方章节说明选择正确修饰符。

## 示例（PTX 风格，示意）

```ptx
ld.global.nc.u32 r1, [addr];
```

## 官方来源链接（事实核验）

- ld.global.nc: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld-global-nc
- ld: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld

最后核对日期：2026-03-19
