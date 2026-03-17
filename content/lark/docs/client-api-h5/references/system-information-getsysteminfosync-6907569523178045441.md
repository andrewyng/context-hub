# getSystemInfoSync

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/system-information/getsysteminfosync
Updated: 2025-07-07

# getSystemInfoSync()

getSystemInfoSync() 用于获取系统信息。

## 支持说明

该接口仅支持小程序调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | /

## 输入

无

## 输出

该接口的返回值为 `object` 类型，其属性与异步方法的 `success` 返回对象参数的扩展属性相同。详情可参见 [getSystemInfo](https://open.feishu.cn/document/uYjL24iN/uQjNx4CN2EjL0YTM)。

## 示例代码

调用示例：

```js
try {
    let result = tt.getSystemInfoSync();
    console.log(`getSystemInfoSync success: ${JSON.stringify(result)}`);
} catch (error) {
    console.log(`getSystemInfoSync fail: ${JSON.stringify(error)}`);
}
```

`success`返回对象示例：

```json
{
  "errMsg": "getSystemInfo:ok",
  "system": "11.4.0",
  "platform": "darwin",
  "appName": "Feishu",
  "version": "5.1.0",
  "language": "zh_CN",
  "SDKVersion": "1.9.56",
  "screenWidth": 1322,
  "screenHeight": 913,
  "windowWidth": 1322,
  "windowHeight": 913,
  "pixelRatio": 2,
  "statusBarHeight": 0,
  "safeArea": {
    "left": 0,
    "right": 1322,
    "top": 0,
    "bottom": 913,
    "width": 1322,
    "height": 913
  },
  "navigationBarSafeArea": {
    "left": 0,
    "right": 1268,
    "top": 0,
    "bottom": 36,
    "width": 1268,
    "height": 36
  },
  "brand": "PC",
  "model": "PC",
  "fontSizeSetting": 12,
  "theme": "light",
  "deviceType": "phone"
}
``` 

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
