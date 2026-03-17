# stopBluetoothDevicesDiscovery

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/bluetooth/stopbluetoothdevicesdiscovery
Updated: 2025-04-15

# stopBluetoothDevicesDiscovery(Object object)

停止搜寻附近的蓝牙外围设备。若已经找到需要的蓝牙设备并不需要继续搜索时，建议调用该接口停止蓝牙搜索。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V3.44.0+ | V3.44.0+ | **X** | V7.35.0+ | 预览

## 输入

继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性

## 输出

继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 示例代码

```js
tt.stopBluetoothDevicesDiscovery({ 
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`stopBluetoothDevicesDiscovery fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "stopBluetoothDevicesDiscovery:ok"
}
```
`fail`返回对象示例：
```json
{
    "errMsg": "stopBluetoothDevicesDiscovery:fail not init",
    "errCode": 10000
}
```

## 错误码

`fail`返回对象中会包含[errorCode属性](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#a825f4c8)，代表错误码。

通用错误码可参见 [蓝牙 API 错误码](https://open.feishu.cn/document/uYjL24iN/uYzNxYjL2cTM24iN3EjN)
