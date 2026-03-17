# disconnectBLEDevice

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/ble/disconnectbledevice
Updated: 2025-04-15

# disconnectBLEDevice(Object object)

断开设备连接
**注意事项**：注意事项：
- 蓝牙连接随时可能断开，建议监听 tt.onBLEConnectionStateChange 回调事件，当蓝牙设备断开时按需执行重连操作。
- 若对未接的设备或已断开连接的设备调用数据读写操作的接口，会返回10006错误，详见错误码，建议进行重连操作。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V7.3.0+ | V7.3.0+ | **X** | V7.35.0+ | /

## 输入

继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性描述：

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
deviceId | string | 是 | &nbsp; | 蓝牙设备 ID。<br>**示例值**：E5:66:9F:82:46:61

## 输出

继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 示例代码

```js
tt.disconnectBLEDevice({
      deviceId: 'E5:66:9F:82:46:61',
      success: (res) => {
        console.log(JSON.stringify(res));
      },
      fail: (res) => {
        console.log('disconnectBLEDevice fail:${JSON.stringify(res)}');
      },
});
```

`success`返回对象示例：

```json
{
  "errMsg": "connectBLEDevice:ok"
}
``` 

## 错误码

`fail`返回对象中会包含[errorCode属性](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#a825f4c8)，代表错误码。

通用错误码可参见 [蓝牙 API 错误码](https://open.feishu.cn/document/uYjL24iN/uYzNxYjL2cTM24iN3EjN)
