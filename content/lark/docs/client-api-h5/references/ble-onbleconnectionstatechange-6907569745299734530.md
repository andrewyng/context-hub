# onBLEConnectionStateChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/ble/onbleconnectionstatechange
Updated: 2025-04-15

# onBLEConnectionStateChange(function callback)
蓝牙连接状态变化
**注意事项**：注意事项：
- 为防止多次注册事件监听导致一次事件多次回调，建议每次调用on方法监听事件之前，先调用off方法，关闭之前的事件监听。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V7.3.0+ | V7.3.0+ | **X** | V7.35.0+ | /

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 是 | &nbsp; | 该事件的回调函数

## 输出
回调函数返回对象的属性：

名称 | 数据类型 | 描述
---|---|---
deviceId | string | 蓝牙设备 ID，参考 device 对象。<br><md-alert type="tip" icon="none">**注意**：<br>- Harmony 字段返回为虚拟值。<br><md-alert>
connected | boolean | 连接目前的状态。

## 示例代码

```js
tt.onBLEConnectionStateChange(function(res) {
    console.log(JSON.stringify(res));
});
```

返回对象示例：

```json
{
  "deviceId": "E5:66:9F:82:46:61",
  "connected": "true"
}
```
