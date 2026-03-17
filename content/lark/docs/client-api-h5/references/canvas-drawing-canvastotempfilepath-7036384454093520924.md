# canvasToTempFilePath

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/interface/canvas-drawing/canvastotempfilepath
Updated: 2025-01-21

# canvasToTempFilePath

canvasToTempFilePath(Object object) 用于导出当前画布指定区域，生成图片并返回文件路径。

## 支持说明

该接口仅支持小程序调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | /

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性如下所示。

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
canvasId | string | 是 | \- | 需要操纵的 Canvas 组件上的 canvas-id 值。
x | number | 否 | 0 | 导出区域的 x 坐标。
y | number | 否 | 0 | 导出区域的 y 坐标。
width | number | 否 | \- | 导出区域的宽度，默认为 Canvas 元素的宽度。
height | number | 否 | \- | 导出区域的高度，默认为 Canvas 元素的高度。
destWidth | number | 否 | \- | 输出的图片尺寸宽度。默认为输入参数的 `width`。
destHeight | number | 否 | \- | 输出的图片尺寸高度，默认为输入参数的 `height`。
fileType | string | 否 | png | 图片类型。可选值：<br>- `jpg`：JPG 图片格式。<br>- `png`：PNG 图片格式。
quality | number | 否 | 1 | 图片质量。取值区间为 (0, 1]，数值越大质量越高。示例值：0.3

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`success` 返回对象的扩展属性如下所示。

名称 | 数据类型 | 描述
---|---|---
tempFilePath | string | 生成图片的临时文件路径。

## 示例代码

调用示例：

```javascript
tt.canvasToTempFilePath({
  canvasId: "demo-canvas",
  x: 0,
  y: 0,
  width: 50,
  height: 50,
  destWidth: 100,
  destHeight: 100,
  success(res) {
    console.log("TempFilePath: ", res.tempFilePath);
  },
  fail(err) {
    console.log("Error", err);
  },
  complete(res) {
    console.log("CanvasToTempFilePath Complete");
  }
});
```

返回对象示例：
```json
{
  "tempFilePath": "ttfile://user/xxxx"
}
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
