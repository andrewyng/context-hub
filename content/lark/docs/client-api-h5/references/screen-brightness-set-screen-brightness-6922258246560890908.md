# setScreenBrightness

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/screen-brightness/set-screen-brightness
Updated: 2025-04-07

# setScreenBrightness

setScreenBrightness(Object object) 用于设置屏幕亮度。
- 在 iOS 中离开小程序或网页应用后，该设置依然生效。
- 在 Android 中，仅在当前小程序或网页应用页面生效，离开小程序或网页应用后设置失效。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.42.0+ | V3.42.0+ | **X** | V7.35.0+ | 预览
网页应用 | V3.44.0+ | V3.44.0+ | **X** | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性如下所示。

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
value | number | 是 | \- | 屏幕亮度值。取值范围：0 ~ 1。其中，`0` 最暗、`1` 最亮。<br>在Harmony端支持传入特殊值 `-1`，表示屏幕亮度跟随系统变化。<br>示例值：`0.8`

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性。

## 示例代码

调用示例：

```js
tt.setScreenBrightness({
    "value": 0.8,
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`setScreenBrightness fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "setScreenBrightness:ok"
}
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
