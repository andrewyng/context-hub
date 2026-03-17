# startBeaconDiscovery

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/ibeacon/startbeacondiscovery
Updated: 2025-01-21

# startBeaconDiscovery(Object object)

调用 startBeaconDiscovery(Object object) 可以开始搜索附近的 Beacon 设备。

## 注意事项

调用前需要用户授权 `scope.userLocation`。了解如何授权，参见 [API 权限](https://open.feishu.cn/document/uYjL24iN/uITMuITMuITM)。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V4.6.0+ | V4.6.0+ | **X** | V7.35.0+ | 预览
网页应用 | V4.6.0+ | V4.6.0+ | **X** | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性如下所示。

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
uuids | string[] | 是 | \- | Beacon 设备广播的 uuid 列表。<br>**示例值**：["fda50693-a4e2-4fb1-afcf-c6eb07641234"]
ignoreBluetoothAvailable | boolean | 否 | false | 是否校验蓝牙开关。取值：<br>- true：校验<br>- false：不校验<br>**注意事项**：**注意**：该字段仅在 iOS 下有效。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性。

## 示例代码

调用示例：

```js
tt.startBeaconDiscovery({
    uuids: [
        "fda50693-a4e2-4fb1-afcf-c6eb07647825"
    ],
    ignoreBluetoothAvailable: true,
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`startBeaconDiscovery fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "startBeaconDiscovery:ok"
}
```

## 错误码

`fail` 返回对象中可能包含 errCode 属性和 errno 属性，均代表错误码。具体错误码可查阅 [Beacon API 错误码](https://open.feishu.cn/document/uYjL24iN/uQTOuQTOuQTO/ibeacon/ibeacon-api-error-code) 或 [Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
