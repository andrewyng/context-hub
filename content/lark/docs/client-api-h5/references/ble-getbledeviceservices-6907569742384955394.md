# getBLEDeviceServices

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/ble/getbledeviceservices
Updated: 2025-04-15

# getBLEDeviceServices(Object object)

低功耗蓝牙获取设备服务

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V7.3.0+ | V7.3.0+ | **X** | V7.35.0+ | /

## 输入

继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性描述：

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
deviceId | string | 是 | &nbsp; | 蓝牙设备 ID<br>**示例值**：E5:66:9F:82:46:61

## 输出

`success`返回对象的扩展属性：

名称 | 数据类型 | 描述
---|---|---
services | object[] | 已发现的设备服务列表。
&emsp;<br>∟<br>&nbsp;<br>isPrimary | boolean | 该服务是否为主服务。是主服务则为 true ，反之为 false 。
&emsp;<br>∟<br>&nbsp;<br>serviceId | string | 蓝牙设备特征值对应服务的 uuid。

## 示例代码

```js
tt.getBLEDeviceServices({
      deviceId: 'E5:66:9F:82:46:61',
      success: (res) => {
  		console.log(JSON.stringify(res));
      },
      fail: (error) => {
        console.log('getBLEDeviceServices fail:${JSON.stringify(res)}');
      }
    });
```
`success`返回对象示例：

```json
{
  "errMsg": "getBLEDeviceServices:ok ok",
  "innerMsg": "ok",
  "services": [
    {
      "isPrimary": true,
      "serviceId": "0000fe95-0000-1000-8000-00805f9b34fb"
    }
  ]
}
``` 
`fail`返回对象示例：
```json
{
    "errMsg": "getBluetoothAdapterState:fail not init",
    "errCode": 10000
}
```

## 错误码

`fail`返回对象中会包含[errorCode属性](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#a825f4c8)，代表错误码。

通用错误码可参见 [蓝牙 API 错误码](https://open.feishu.cn/document/uYjL24iN/uYzNxYjL2cTM24iN3EjN)
