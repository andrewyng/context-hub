# createAnimation

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/interface/animation/createanimation
Updated: 2025-01-21

# createAnimation

调用 createAnimation(Object object) 创建一个动画实例 `animation`。你可通过链式调用实例方法，来描述动画，最后通过 `step` 和 `export` 方法导出动画数据，并传递给组件的 `animation` 属性。

## 注意事项
该接口实现的是一个 CSS 动画，具体效果依赖于浏览器的实现。

## 支持说明

该接口仅支持小程序调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | /

## 输入

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
duration | number | 否 | 400 | 动画持续时间。单位：ms
timingFunction | string | 否 | linear | 动画的效果。可选值：<br>- `linear`：动画从头到尾的速度是相同的。<br>- `ease`：动画以低速开始，然后加快，在结束前变慢。<br>- `ease-in`：动画以低速开始。<br>- `ease-in-out`：动画以低速开始和结束。<br>- `ease-out`：动画以低速结束。<br>- `step-start`：动画第一帧便跳至结束状态，并直到结束。<br>- `step-end`：动画一直保持开始状态，最后一帧跳到结束状态。
delay | number | 否 | 0 | 动画延迟时间。单位：ms
transformOrigin | string | 否 | 50% 50% 0 | 元素变形的原点。

## 输出

返回一个 `animation` 对象，该对象具有如下方法。
在下表中点击方法名，可查看对应 API 的支持说明、调用方法。

方法 | 介绍
---|---
[Animation.backgroundColor](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_backgroundcolor) | 设置背景色。
[Animation.bottom](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_bottom) | 设置 bottom 值。
[Animation.export](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_export) | 导出动画队列。export 方法每次调用后会清掉之前的动画操作。
[Animation.height](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_height) | 设置高度。
[Animation.left](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_left) | 设置 left 值。
[Animation.matrix](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_matrix) | 指定了一个由指定的 6 个值组成的 2D 变换矩阵。
[Animation.matrix3d](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_matrix3d) | 4x4 齐次矩阵的形式定义一个3D转换。
[Animation.opacity](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_opacity) | 设置透明度。
[Animation.right](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_right) | 设置 right 值。
[Animation.rotate](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_rotate) | 从原点顺时针旋转一个角度。
[Animation.rotate3d](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_rotate3d) | 从 固定 轴顺时针旋转一个角度。
[Animation.rotateX](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_rotatex) | 从 X 轴顺时针旋转一个角度。
[Animation.rotateY](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_rotatey) | 从 Y 轴顺时针旋转一个角度。
[Animation.rotateZ](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_rotatez) | 从 Z 轴顺时针旋转一个角度。
[Animation.scale](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_scale) | 缩放。
[Animation.scale3d](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_scale3d) | 缩放。
[Animation.scaleX](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_scalex) | 缩放 X 轴。
[Animation.scaleY](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_scaley) | 缩放 Y 轴。
[Animation.scaleZ](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_scalez) | 缩放 Z 轴。
[Animation.skew](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_skew) | 对 X、Y 轴坐标进行倾斜。
[Animation.skewX](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_skewx) | 对 X 轴坐标进行倾斜。
[Animation.skewY](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_skewy) | 对 Y 轴坐标进行倾斜。
[Animation.step](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_step) | 表示一组动画完成。你可以在一组动画中调用任意多个动画方法，该组动画中的所有动画会同时开始，该组动画完成后才会进行下一组动画。
[Animation.top](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_top) | 设置 top 值。
[Animation.translate](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_translate) | 平移变换。
[Animation.translate3d](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_translate3d) | 对 XYZ 坐标进行平移变换。
[Animation.translateX](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_translatex) | 对 X 轴平移。
[Animation.translateY](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_translatey) | 对 Y 轴平移。
[Animation.translateZ](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_translatez) | 对 Z 轴平移。
[Animation.width](https://open.feishu.cn/document/uYjL24iN/ucjMy4yNyIjL3IjM/animation/animation_width) | 设置宽度。

## 示例代码

```js
const animation = tt.createAnimation();
```
