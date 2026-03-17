# createCanvasContext

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/interface/canvas-drawing/canvas-drawing
Updated: 2025-01-21

# createCanvasContext

createCanvasContext(string canvasId) 用于创建并返回对应 canvasId 的绘图上下文。

## 支持说明

该接口仅支持小程序调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | /

## 输入

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
canvasId | string | 是 | \- | 需要操纵的 Canvas 组件上，对应的 canvas-id 值。

## 输出

返回值 `CanvasContext`，该对象的属性与方法列表参见以下表格。
在以下表格中，点击方法名，可查看对应 API 的支持说明、调用方法。

### 绘制

名称 | 数据类型 | 描述
---|---|---
[draw](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-draw) | function | 将之前在绘图上下文中的描述（路径、变形、样式）画到 canvas 中。

### Canvas 状态

名称 | 数据类型 | 描述
---|---|---
[save](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-save) | function | 保存绘图上下文。
[restore](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-restore) | function | 恢复之前保存的绘图上下文。

### 线样式

名称 | 数据类型 | 描述
---|---|---
[setLineWidth](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setLineWidth) | function | 设置线条的宽度。
lineWidth | number | 线条的宽度。用法与 [CanvasContext.setLineWidth()](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setLineWidth) 相同。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
[setLineCap](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setLineCap) | function | 设置线条的端点样式。
lineCap | number | 线条的端点样式。用法与 [CanvasContext.setLineCap()](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setLineCap) 相同。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
[setLineJoin](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setLineJoin) | function | 设置线条的交点样式。
lineJoin | string | 设置线条的交点样式。用法与 [CanvasContext.setLineJoin()](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setLineJoin)相同。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
[setMiterLimit](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setMiterLimit) | function | 设置最大斜接长度。斜接长度是指在两条线交汇处内角和外角之间的距离。<br>- 当 [CanvasContext.setLineJoin()](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setLineJoin) 为 `miter` 时，该方法才有效。<br>- 超过最大倾斜长度的，连接处将以 `lineJoin` 为 `bevel` 显示。
miterLimit | number | 最大斜接长度。用法与 [CanvasContext.setMiterLimit()](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setMiterLimit) 相同。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
[setLineDash](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setLineDash) | function | 设置虚线样式。
lineDashOffset | number | 虚线偏移量，初始值为 0。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。

### 文本样式

名称 | 数据类型 | 描述
---|---|---
font | string | 当前字体样式的属性。传入符合 [CSS font](https://developer.mozilla.org/zh-CN/docs/Web/CSS/font) 语法的 DOMString 字符串，至少需要提供字体大小和字体族名。默认值为 `10px sans-serif`。
[setTextAlign](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setTextAlign) | function | 设置文字对齐方式。
textAlign | string | 设置文字对齐方式，用法与 [CanvasContext.setTextAlign()](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setTextAlign) 相同。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
[setTextBaseline](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setTextBaseline) | function | 设置文字对齐基线。
textBaseline | string | 设置文字对齐基线。用法与 [CanvasContext.setTextBaseline()](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setTextBaseline) 相同。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
[setFontSize](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/block/api/canvas/canvascontext/canvascontext-setFontSize) | function | 设置字体的字号。

### 创建路径

名称 | 数据类型 | 描述
---|---|---
[moveTo](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-moveTo) | function | 把路径移动到画布中的指定点，不创建线条。画线条需使用 [stroke](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-stroke) 方法。
[closePath](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-closePath) | function | 关闭一个路径。会连接起点和终点。如果关闭路径后没有调用 [fill](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-fill) 或者 [stroke](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-stroke) 开启新的路径，则之前的路径将不会被渲染。
[lineTo](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-lineTo) | function | 增加一个新点，然后创建一条从上次指定点到目标点的线。画线条需使用 [stroke](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-stroke) 方法。
[quadraticCurveTo](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-quadraticCurveTo) | function | 创建二次贝塞尔曲线路径。曲线的起始点为路径中前一个点。
[bezierCurveTo](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-bezierCurveTo) | function | 创建三次方贝塞尔曲线路径。曲线的起始点为路径中前一个点。
[arcTo](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-arcTo) | function | 根据控制点和半径绘制圆弧路径。
[arc](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-arc) | function | 创建一条弧线。<br>* 创建一个圆可以指定起始弧度为 0，终止弧度为 2 * Math.PI。<br>* 在 canvas 中画弧线需使用 [stroke](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-stroke) 或者 [fill](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-fill) 方法。
[rect](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-rect) | function | 创建一个矩形路径。需使用 [fill](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-fill) 或者 [stroke](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-stroke) 方法将矩形真正的画到 canvas 中。

### 转换

名称 | 数据类型 | 描述
---|---|---
[scale](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-scale) | function | 在调用后，之后创建的路径其横纵坐标会被缩放。多次调用时，被缩放的倍数会相乘计算。
[rotate](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-rotate) | function | 以原点为中心顺时针旋转当前坐标轴。多次调用时，旋转的角度会叠加。原点可以用 `translate` 方法修改。
[translate](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-translate) | function | 对当前坐标系的原点 (0, 0) 进行变换。默认的坐标系原点为页面左上角。
[transform](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-transform) | function | 使用矩阵多次叠加当前变换的方法。
[setTransform](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setTransform) | function | 使用矩阵重新设置（覆盖）当前变换的方法。

### 填充和描边样式

名称 | 数据类型 | 描述
---|---|---
[setFillStyle](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setFillStyle) | function | 设置填充色。
fillStyle | string | 填充色。用法与 [CanvasContext.setFillStyle()](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setFillStyle) 相同。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
[setStrokeStyle](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setStrokeStyle) | function | 设置边框颜色。
strokeStyle | string | 边框颜色。用法与 [CanvasContext.setStrokeStyle()](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setStrokeStyle) 相同。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
[createLinearGradient](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-createLinearGradient) | function | 创建一个线性的渐变颜色。<br>返回的 `CanvasGradient` 对象需要使用 `CanvasGradient.addColorStop()` 指定渐变点，至少指定两个。
createRadialGradient | string | 绘制一个矩形，并用放射状或圆形渐变进行填充。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
[createPattern](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-createPattern) | function | 管理图像的创建模式，支持设置图片重复模式。

### 在 Canvas 上绘制矩形

名称 | 数据类型 | 描述
---|---|---
[clearRect](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-clearRect) | function | 在画布上，清除该矩形区域的内容。
[fillRect](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-fillRect) | function | 填充一个矩形。填充色需使用 [setFillStyle](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setFillStyle) 设置，如果没有设置填充色，则默认使用黑色填充。
[strokeRect](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-strokeRect) | function | 画一个矩形（非填充）。 矩形线条的颜色需使用 [setStrokeStyle](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setStrokeStyle) 设置，如果没有设置线条颜色，则默认使用黑色。

### 在 Canvas 上绘制文字

名称 | 数据类型 | 描述
---|---|---
[fillText](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-fillText) | function | 在画布上绘制被填充的文本。
[strokeText](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-strokeText) | function | 指定 (x, y) 位置，并绘制文本与样式。
[measureText](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-measureText) | function | 测量文本尺寸信息，目前仅返回文本宽度。该接口为同步接口。

### 在 Canvas 上绘制路径

名称 | 数据类型 | 描述
---|---|---
[beginPath](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-beginPath) | function | 创建路径。<br>- 使用路径进行填充或描边，需要调用 [fill](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-fill) 或者 [stroke](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-stroke)。<br>- 在同一路径内的多次 setFillStyle、setStrokeStyle、setLineWidth 等设置，以最后一次设置为准。
[fill](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-fill) | function | 对当前路径中的内容进行填充。默认填充色为黑色。
[stroke](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-stroke) | function | 画出当前路径的边框。默认颜色为黑色。
[clip](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-clip) | function | 从原始画布中剪切当前路径。一旦剪切了某个区域，则后续所有的绘图都会被限制在该剪切区域内（不能访问画布上的其他区域）。<br>在使用 [clip](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-clip) 方法前可以通过 [save](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-save) 方法对当前画布区域进行保存，并在以后的任意时间通过 [restore](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-restore) 方法恢复当前画布区域。

### 在 Canvas 上绘制图片

名称 | 数据类型 | 描述
---|---|---
[drawImage](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-drawImage) | function | 绘制图像到画布。

### 合成

名称 | 数据类型 | 描述
---|---|---
[setGlobalAlpha](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setGlobalAlpha) | function | 设置全局画笔的透明度。
globalAlpha | number | 全局画笔的透明度。范围：0 ~ 1<br>- 0 表示完全透明。<br>- 1 表示完全不透明。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
globalCompositeOperation | string | 在绘制新形状时，应用合成操作的类型。目前 Android 版本只适用于 [fill](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-fill) 填充块的合成。用于 [stroke](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-stroke) 线段的合成效果都是 source-over。<br>目前支持的操作说明如下：<br>* 安卓：xor, source-over, source-atop, destination-out, lighter, overlay, darken, lighten, hard-light<br>* iOS：xor, source-over, source-atop, destination-over, destination-out, lighter, multiply, overlay, darken, lighten, color-dodge, color-burn, hard-light, soft-light, difference, exclusion, saturation, luminosity<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。

### 阴影

名称 | 数据类型 | 描述
---|---|---
[setShadow](https://open.feishu.cn/document/uYjL24iN/ukjMy4SOyIjL5IjM/canvascontext/canvascontext-setShadow) | function | 设定阴影样式。
shadowColor | number | 阴影的颜色。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
shadowOffsetX | number | 阴影相对于形状在水平方向的偏移。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
shadowOffsetY | number | 阴影相对于形状在竖直方向的偏移。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。
shadowBlur | number | 阴影的模糊级别。<br>**注意事项**：**注意**：飞书 [V3.45](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持该字段。

## 示例代码

```html
<view class="container">
  <view class="page-body">
    <view class="page-body-wrapper">
      <canvas canvas-id="canvas" class="canvas"></canvas>
    </view>
  </view>
</view>
```

```js
const canvas = i18n.canvas

Page({
  data :{
    ...canvas
  },
  onShow: function (res) {
    this.position = {
      x: 150,
      y: 150,
      vx: 2,
      vy: 2
    }
    this.interval = setInterval(this.drawBall, 17)
  },
  drawBall: function () {
    var p = this.position
    p.x += p.vx
    p.y += p.vy
    if (p.x >= 300) {
      p.vx = -2
    }
    if (p.x <= 7) {
      p.vx = 2
    }
    if (p.y >= 300) {
      p.vy = -2
    }
    if (p.y <= 7) {
      p.vy = 2
    }

    var context = tt.createCanvasContext('canvas')

    function ball(x, y) {
      context.beginPath(0)
      context.arc(x, y, 5, 0, Math.PI * 2)
      context.setFillStyle('#1aad19')
      context.fill()
      context.stroke()
    }

    ball(p.x, 150)
    ball(150, p.y)
    ball(300 - p.x, 150)
    ball(150, 300 - p.y)
    ball(p.x, p.y)
    ball(300 - p.x, 300 - p.y)
    ball(p.x, 300 - p.y)
    ball(300 - p.x, p.y)

    console.log('will call context.draw');
    context.draw();
  },
  onUnload: function () {
    clearInterval(this.interval)
  }, exportImage: function () {
    tt.canvasToTempFilePath({
      canvasId: 'canvas',
      fileType: "jpg",
      x: 100,
      y: 200,
      width: 100,
      height: 200,
      destWidth: 300,
      destHeight: 400,
      quality: 1,
      success: function (res) {
        console.log(" canvasToTempFilePath success")
        console.log(res.tempFilePath)
        tt.showToast({
          title: "success"
        })
      }, fail: function () {
        console.log(" canvasToTempFilePath fail")
      }

    })
  }
})

```

```css
.canvas {
  width: 305px;
  height: 305px;
  background-color: #fff;
}
```

```json
{
    "navigationBarTitleText": "canvas"
}
```

## 已知问题
* tt Canvas API 的调用需要放在 Page 中，否则可能产生系统异常。

* Canvas 的高度、宽度设置不能超过 Android、iOS 设备的限制，具体限制可参考[相关文档](https://developer.apple.com/library/archive/documentation/DeviceInformation/Reference/iOSDeviceCompatibility/Displays/Displays.html)。
