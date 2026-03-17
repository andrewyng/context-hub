# getNetworkType

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/network-status/getnetworktype
Updated: 2025-01-21

# getNetworkType

getNetworkType(Object object) 用于获取设备当前所处的网络类型。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | V3.44.0+ | V3.44.0+ | V3.47.0+ | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`success` 返回对象的扩展属性如下所示。

名称 | 数据类型 | 描述
---|---|---
networkType | string | 网络类型。可能值：<br>- `none`：无网络<br>- `wifi`：Wi-Fi 网络<br>- `2g`：2G 网络<br>- `3g`：3G 网络<br>- `4g`：4G 网络<br>- `unknown`：如果设备无法确定上述网络类型，则会返回该值<br>- `connected`：已连接网络，仅 PC 端返回该值<br>**注意事项**：**注意**：PC 端仅支持 `connected` 和 `none` 两种类型。

## 示例代码

调用示例：

```js
tt.getNetworkType({ 
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`getNetworkType fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：

```json
{
    "networkType": "wifi",
    "errMsg": "getNetworkType:ok"
}
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
