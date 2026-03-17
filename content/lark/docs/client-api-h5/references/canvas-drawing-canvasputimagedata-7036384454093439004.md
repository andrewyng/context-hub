# canvasPutImageData

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/interface/canvas-drawing/canvasputimagedata
Updated: 2025-01-21

# canvasPutImageData

调用 canvasPutImageData(Object object) 更新画布像素数据。

## 支持说明

该接口仅支持小程序调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.45.0+ | V3.45.0+ | V3.45.0+ | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | /

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性如下所示。

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
canvasId | string | 是 | \- | 需要操纵的 Canvas 组件上的 canvas-id 值。
data | Uint8ClampedArray | 是 | \- | RGBA 像素数据。
x | number | 是 | \- | x 坐标。
y | number | 是 | \- | y 坐标。
width | number | 是 | \- | 区域宽度。
height | number | 是 | \- | 区域高度。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性。

## 示例代码

```javascript
const data = new Uint8ClampedArray(40 * 40 * 4);

for (let i = 0; i < data.length; i += 4) {
  data[i] = 0;
  data[i + 1] = 0;
  data[i + 2] = 0;
  data[i + 3] = 255;
}

tt.canvasPutImageData({
  canvasId,
  x: 80,
  y: 80,
  width: 40,
  height: 40,
  data,
  success(res) {
    console.log("success:", res);
  }
});
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
