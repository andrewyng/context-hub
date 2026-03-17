# notifyBLECharacteristicValueChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/ble/notifyblecharacteristicvaluechange
Updated: 2025-04-15

# notifyBLECharacteristicValueChange(Object object)

监听特征值数据变化
**注意事项**：注意事项：
- 订阅操作成功后需要设备主动更新特征值的 value，才会触发 [tt.onBLECharacteristicValueChange](https://open.feishu.cn/document/uYjL24iN/uQTOxYjL0kTM24CN5EjN) 。
- 订阅方式效率比较高，推荐使用订阅代替 [read](https://open.feishu.cn/document/uYjL24iN/uYTOxYjL2kTM24iN5EjN) 方式。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V7.3.0+ | V7.3.0+ | **X** | V7.35.0+ | /

## 输入
继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性描述：

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
deviceId | string | 是 | &nbsp; | 蓝牙设备 ID，参考 device 对象
serviceId | string | 是 | &nbsp; | 蓝牙特征值对应 service 的 uuid
characteristicId | string | 是 | &nbsp; | 蓝牙特征值的 uuid
descriptorId | string | 否 | &nbsp; | notify 的 descriptor 的 uuid （只有android 会用到，非必填）
state | boolean | 否 | &nbsp; | 是否启用notify或indicate
type | string | 否 | notify | 设置特征订阅类型，有效值为：<br>- notify<br>- indicate<br>**注意**：<br>- 飞书版本为 [V7.19.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上时，支持设置该字段。

## 输出

继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 示例代码

```js
tt.notifyBLECharacteristicValueChange({
    deviceId: "F16DF2DF-0406-5EAA-E7F7-8BE962C0B88D",
    serviceId: "D0611E78-BBB4-4591-A5F7-487910AE4355",
    characteristicId: "00002A19-0000-1000-8001-00805F8B34FB",
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`notifyBLECharacteristicValueChange fail: ${JSON.stringify(res)}`);
    }
});

```

`success`返回对象示例：

```json
{
	"errMsg": "notifyBLECharacteristicValueChange:ok"
}
``` 
`fail`返回对象示例：
```json
{
    "errMsg": "notifyBLECharacteristicValueChange:fail not init",
    "errCode": 10000
}
```

## 错误码

`fail`返回对象中会包含[errorCode属性](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#a825f4c8)，代表错误码。

错误码可参见 [蓝牙 API 错误码](https://open.feishu.cn/document/uYjL24iN/uYzNxYjL2cTM24iN3EjN)
