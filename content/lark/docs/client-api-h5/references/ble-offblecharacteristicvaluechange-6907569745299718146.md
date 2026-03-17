# offBLECharacteristicValueChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/ble/offblecharacteristicvaluechange
Updated: 2025-04-15

# offBLECharacteristicValueChange(function callback)

取消监听蓝牙低功耗设备的特征值变化事件

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
无

## 示例代码

```js
tt.offBLECharacteristicValueChange(this.callback);
```

**说明**

不传递 callback 值，则会移除监听所有的事件监听回调。示例代码如下：

```js
tt.offBLECharacteristicValueChange();
```

传递 callback 值，只移除对应的 callback 事件。示例代码如下：

```js
tt.offBLECharacteristicValueChange(this.callback);
```
