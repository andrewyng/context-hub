# PTX 指令专题：ldu

`ldu` 是 PTX 文档定义的专用加载变体，用于特定读取语义场景。

## 官方定位

- 文档章节：Data Movement and Conversion Instructions: `ldu`
- 与 `ld`/`ld.global.nc` 在适用场景和缓存行为上有所区分

## 使用建议

- 仅在明确满足该变体语义时使用。
- 与目标架构支持、缓存路径和一致性要求联合评估。

## 官方来源链接（事实核验）

- ldu: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ldu
- ld: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld
- ld.global.nc: https://docs.nvidia.com/cuda/parallel-thread-execution/#data-movement-and-conversion-instructions-ld-global-nc

最后核对日期：2026-03-19
