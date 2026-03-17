# onNetworkQualityChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/network-status/onnetworkqualitychange
Updated: 2025-01-21

# onNetworkQualityChange

onNetworkQualityChange(function callback) 用于监听网络质量变化。
调用该接口开始监听后，你可以根据实际需要，使用 `offNetworkQualityChange` 取消监听。使用说明：
- `offNetworkQualityChange(callback)`：取消 `callback(onNetworkQualityChange 中传入的函数)` 的监听。
- `offNetworkQualityChange()`：取消所有监听。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V4.9.0+ | V4.9.0+ | V5.1.0+ | V7.35.0+ | 预览
网页应用 | V4.9.0+ | V4.9.0+ | V5.1.0+ | V7.35.0+ | 预览

## 输入

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 是 | \- | 该事件的回调函数。

## 输出
回调函数返回对象的属性：

名称 | 数据类型 | 描述
---|---|---
networkQualityType | string | 网络分级类型。可能值：<br>- `unavailable`：无网络<br>- `weak`：弱网络<br>- `moderate`：中等网络<br>- `excellent`：良好网络<br>- `unknown`：如果设备无法确定网络分级，则会返回该值

## 示例代码

调用示例：

```js
tt.onNetworkQualityChange(function(res) {
    console.log(JSON.stringify(res));
});
```

回调函数返回对象示例：
```json
{
    "networkQualityType": "excellent"
}
```
