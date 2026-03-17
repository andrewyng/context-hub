# onAccelerometerChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/accelerometer/onaccelerometerchange
Updated: 2025-01-21

# onAccelerometerChange(function callback)

监听加速度计数据。注册回调后一旦数据变化会收到结果。
调用该方法时若未打开加速度计，会调用一次 [startAccelerometer](https://open.feishu.cn/document/uYjL24iN/ukjNx4SO2EjL5YTM) 方法。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **X** | V7.35.0+ | 预览
网页应用 | V3.44.0+ | V3.44.0+ | **X** | V7.35.0+ | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 是 | &nbsp; | 该事件的回调函数

## 输出
回调函数返回对象的属性：

名称 | 数据类型 | 描述
---|---|---
x | number | x 轴数据
y | number | y 轴数据
z | number | z 轴数据

## 示例代码

```js
tt.startAccelerometer();
tt.onAccelerometerChange(function(res) {
    console.log(JSON.stringify(res));
});
```

回调函数返回对象示例：
```json
{
    "y": -0.5976561903953552,
    "z": -0.808624267578125,
    "x": 0.1167755201458931
}
```
