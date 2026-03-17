# onBluetoothAdapterStateChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/bluetooth/onbluetoothadapterstatechange
Updated: 2025-04-15

# onBluetoothAdapterStateChange(function callback)

监听蓝牙适配器状态变化事件

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
回调函数返回对象的属性：

名称 | 数据类型 | 描述
---|---|---
discovering | boolean | 蓝牙适配器是否处于搜索状态
available | boolean | 蓝牙适配器是否可用

## 示例代码

```js
tt.onBluetoothAdapterStateChange(function (res) {
  console.log('adapterState changed, now is', res)
})
```

回调函数返回对象示例：

```json
{
  "discovering":true,
  "available",true
}
``` 

## 错误码

`fail`返回对象中会包含[errorCode属性](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#a825f4c8)，代表错误码。

通用错误码可参见 [蓝牙 API 错误码](https://open.feishu.cn/document/uYjL24iN/uYzNxYjL2cTM24iN3EjN)
