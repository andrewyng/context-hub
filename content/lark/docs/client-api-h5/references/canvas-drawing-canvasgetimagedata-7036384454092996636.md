# canvasGetImageData

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/interface/canvas-drawing/canvasgetimagedata
Updated: 2025-01-21

# canvasGetImageData

调用 canvasGetImageData(Object object) 获取画布像素数据。

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
x | number | 是 | \- | x 坐标。
y | number | 是 | \- | y 坐标。
width | number | 是 | \- | 区域宽度。
height | number | 是 | \- | 区域高度。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`success` 返回对象的扩展属性如下所示。

名称 | 数据类型 | 描述
---|---|---
width | number | 返回像素数据的宽度。
height | number | 返回像素数据的高度。
data | Uint8ClampedArray | RGBA 像素数据。

## 示例代码

调用示例：

```javascript
tt.canvasGetImageData({
  canvasId,
  x: 0,
  y: 0,
  width: 40,
  height: 40,
  success(res) {
    console.log("CanvasGetImageData Response Width:", res.width);
    console.log("CanvasGetImageData Response Height:", res.height);
    console.log("CanvasGetImageData Response data test:", res.data instanceof Uint8ClampedArray); // true
    console.log("CanvasGetImageData Response data length:", res.data.length); // 40 * 40 * 4
    console.log("CanvasGetImageData Response data:", res.data);
  },
  fail(err) {
    console.log("Error", err);
  },
  complete() {
    console.log("GetImageData Complete");
  }
});
```

返回对象示例：
```json
{
  "width": 40,
  "height": 40,
  "data": "<Uint8ClampedArray Instance>"
}
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
