# onNetworkStatusChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/network-status/onnetworkstatuschange
Updated: 2025-01-21

# onNetworkStatusChange(function callback)

监听网络状态变化
调用该接口开始监听后，你可以根据实际需要，使用 `offNetworkStatusChange` 取消监听。使用说明：
- `offNetworkStatusChange(callback)`：取消 `callback(onNetworkStatusChange 中传入的函数)` 的监听。
## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **X** | V7.35.0+ | 预览
网页应用 | V7.7.0+ | V7.7.0+ | **X** | V7.35.0+ | /

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 是 | &nbsp; | 该事件的回调函数

## 输出
回调函数返回对象的属性：

名称 | 数据类型 | 描述
---|---|---
isConnected | boolean | 是否链接网络
networkType | string | 网络类型，同 [getNetworkType](https://open.feishu.cn/document/uYjL24iN/uYjNx4iN2EjL2YTM) 中描述

## 示例代码

```js
tt.onNetworkStatusChange(function(res) {
    console.log(JSON.stringify(res));
});
```

回调函数返回对象示例：
```json
{
    "isConnected": true,
    "networkType": "wifi"
}
```
