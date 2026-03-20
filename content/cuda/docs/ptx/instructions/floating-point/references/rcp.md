# PTX 指令专题：rcp

`rcp` 计算倒数，支持标准与近似变体。

## 官方定位

- 文档章节：Floating Point Instructions: `rcp`
- 相关扩展：`rcp.approx.ftz.f64`

## 核心约束

- 近似变体精度与 flush-to-zero 行为需按章节确认。
- 对数值敏感路径建议结合参考实现验证误差。

## 示例（PTX 风格）

```ptx
rcp.rn.f32 d, a;
```

## 官方来源链接（事实核验）

- rcp: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-rcp
- rcp.approx.ftz.f64: https://docs.nvidia.com/cuda/parallel-thread-execution/#floating-point-instructions-rcp-approx-ftz-f64

最后核对日期：2026-03-19
