# onCompassChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/compass/oncompasschange
Updated: 2025-01-21

# onCompassChange(function callback)

监听罗盘数据变化事件，频率：5 次/秒，接口调用后会自动开始监听，可使用 [stopCompass](https://open.feishu.cn/document/uYjL24iN/uMzNx4yM3EjLzcTM) 停止监听。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **X** | V7.35.0+ | 预览
网页应用 | V5.16.0+ | V5.16.0+ | **X** | V7.35.0+ | /

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 是 | &nbsp; | 该事件的回调函数

## 输出
回调函数返回对象的属性：

名称 | 数据类型 | 描述
---|---|---
direction | number | 面对的方向度数

## 示例代码

```js
tt.onCompassChange(function(res) {
    console.log(JSON.stringify(res));
});
```

返回值示例：
```json
{
    "direction": 86.3572986955703
}
```
