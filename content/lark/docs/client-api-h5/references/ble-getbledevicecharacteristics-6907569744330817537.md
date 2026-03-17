# getBLEDeviceCharacteristics

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/ble/getbledevicecharacteristics
Updated: 2025-04-15

# getBLEDeviceCharacteristics(Object object)

获取读写特征
**注意事项**：注意事项：
- 建立连接后先执行 tt.getBLEDeviceServices 与 tt.getBLEDeviceCharacteristics 后再进行与蓝牙设备的数据交互。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V7.3.0+ | V7.3.0+ | **X** | V7.35.0+ | /

## 输入
继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性描述：

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
deviceId | string | 是 | &nbsp; | 蓝牙设备 ID，参考 device 对象<br>**示例值**：'FF:24:79:5D:6D:0C'
serviceId | string | 是 | &nbsp; | 蓝牙特征值对应 service 的 UUID

## 输出

`success`返回对象的扩展属性：

名称 | 数据类型 | 描述
---|---|---
characteristics | object[] | 设备特征值列
&emsp;<br>∟<br>&nbsp;<br>characteristicId | string | 蓝牙设备特征值的 UUID
&emsp;<br>∟<br>&nbsp;<br>serviceId | string | 蓝牙设备特征值对应服务的 UUID
&emsp;<br>∟<br>&nbsp;<br>value | hex string | 蓝牙设备特征值对应的 16 进制值
&emsp;<br>∟<br>&nbsp;<br>properties | object | 该特征值支持的操作类型

**Properties 对象**

|名称                |类型      |描述       |
|------------------|--------|---------|
|read              |boolean |该特征值是否支持 read 操作|
|write             |boolean |该特征值是否支持 write 操作|
|notify            |boolean |该特征值是否支持 notify 操作|
|indicate          |boolean |该特征值是否支持 indicate 操作|

## 示例代码

```js
tt.getBLEDeviceCharacteristics({
    deviceId: "",
    serviceId: "",
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`getBLEDeviceCharacteristics fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：

```json
{
  "characteristics": {
    "characteristicId": "xxx",
    "serviceId": "xxx",
    "value": "xxx",
    "properties": {
      "write": false,
      "notify": false,
      "read": true,
      "indicate": false
    }
  },
  "errMsg": "getBLEDeviceCharacteristics:ok",
}
``` 
`fail`返回对象示例：
```json
{
    "errMsg": "getBLEDeviceCharacteristics:fail not init",
    "errCode": 10000
}
```

## 错误码

`fail`返回对象中会包含[errorCode属性](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#a825f4c8)，代表错误码。

错误码可参见 [蓝牙 API 错误码](https://open.feishu.cn/document/uYjL24iN/uYzNxYjL2cTM24iN3EjN)
