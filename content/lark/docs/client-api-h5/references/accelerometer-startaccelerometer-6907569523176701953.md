# startAccelerometer

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/accelerometer/startaccelerometer
Updated: 2025-01-21

# startAccelerometer(Object object)

通知客户端开始监听加速度计数据。具体的数据返回通过注册 [onAccelerometerChange](https://open.feishu.cn/document/uYjL24iN/uEzNx4SM3EjLxcTM) 接口回调方法获取

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **X** | V7.35.0+ | 预览
网页应用 | V3.44.0+ | V3.44.0+ | **X** | V7.35.0+ | 预览

## 输入

继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性

## 输出

继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 示例代码

```js
tt.startAccelerometer({ 
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`startAccelerometer fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "startAccelerometer:ok"
}
```
