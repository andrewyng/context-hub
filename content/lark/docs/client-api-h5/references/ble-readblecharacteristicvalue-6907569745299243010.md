# readBLECharacteristicValue

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/ble/readblecharacteristicvalue
Updated: 2025-04-15

# readBLECharacteristicValue(Object object)

读取数据
**注意事项**：注意事项：
- 设备的特征值必须支持read才可以成功调用，具体参照 characteristic 的 properties 属性。
- 并行多次调用读写接口存在读写失败的可能性。
- 如果读取超时，错误码 10015，tt.onBLECharacteristicValueChange 接口之后可能返回数据，需要接入方酌情处理。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V7.3.0+ | V7.3.0+ | **X** | V7.35.0+ | /

## 输入
继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性描述：

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
deviceId | string | 是 | &nbsp; | 蓝牙设备 id，参考 device 对象
serviceId | string | 是 | &nbsp; | 蓝牙特征值对应 service 的 uuid<br>**示例值**：'FF:24:79:5D:6D:0C'
characteristicId | string | 是 | &nbsp; | 蓝牙特征值的 uuid

## 输出

`success`返回对象的扩展属性：

名称 | 数据类型 | 描述
---|---|---
characteristic | object | 设备特征值信息
&emsp;<br>∟<br>&nbsp;<br>characteristicId | string | 蓝牙设备特征值的 uuid
&emsp;<br>∟<br>&nbsp;<br>serviceId | string | 蓝牙设备特征值对应服务的 uuid
&emsp;<br>∟<br>&nbsp;<br>value | hex string | 蓝牙设备特征值的value

## 示例代码

```js
tt.readBLECharacteristicValue({
    deviceId: "",
    serviceId: "",
    characteristicId: "",
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`readBLECharacteristicValue fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：

```json
{
  "characteristic": {
    "deviceId": "E5:66:9F:82:46:61",
    "serviceId": "xxx",
    "value": "xxx"
  },
  "errMsg": "readBLECharacteristicValue:ok",
}
``` 

`fail`返回对象示例：
```json
{
    "errMsg": "readBLECharacteristicValue:fail device not found",
    "errCode": 10002
}
```

## 错误码

`fail`返回对象中会包含[errorCode属性](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#a825f4c8)，代表错误码。

错误码可参见 [蓝牙 API 错误码](https://open.feishu.cn/document/uYjL24iN/uYzNxYjL2cTM24iN3EjN)
