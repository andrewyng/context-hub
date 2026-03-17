# getNetworkQualityType

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/network-status/getnetworkqualitytype
Updated: 2025-01-21

# getNetworkQualityType

getNetworkQualityType(Object object) 是网络评级接口，用于获取当前设备所处的网络状态。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V4.9.0+ | V4.9.0+ | V5.1.0+ | V7.35.0+ | 预览
网页应用 | V4.9.0+ | V4.9.0+ | V5.1.0+ | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`success` 返回对象的扩展属性如下所示。

名称 | 数据类型 | 描述
---|---|---
networkQualityType | string | 网络分级类型。可能值：<br>- `unavailable`：无网络<br>- `weak`：弱网络<br>- `moderate`：中等网络<br>- `excellent`：良好网络<br>- `unknown`：如果设备无法确定网络分级，则会返回该值

## 示例代码

调用示例：

```js
tt.getNetworkQualityType({ 
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`getNetworkQualityType fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：

```json
{
    "networkQualityType": "excellent",
    "errMsg": "getNetworkQualityType:ok"
}
```

## 已知问题

本接口在 iOS 5.6 版本存在异常，会返回固定值 `excellent`。

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
