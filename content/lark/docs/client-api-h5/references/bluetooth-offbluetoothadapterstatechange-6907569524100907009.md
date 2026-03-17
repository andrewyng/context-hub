# offBluetoothAdapterStateChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/bluetooth/offbluetoothadapterstatechange
Updated: 2025-01-21

# offBluetoothAdapterStateChange(function callback)

取消监听蓝牙适配器状态变化事件

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V5.16.0+ | V5.16.0+ | **X** | V7.35.0+ | /

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 是 | &nbsp; | 该事件的回调函数

## 输出
无

## 示例代码

```js
const callback = (res) => {
	console.log(res);
};
tt.onBluetoothAdapterStateChange(callback);
tt.offBluetoothAdapterStateChange(callback);
```
