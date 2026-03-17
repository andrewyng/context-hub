# closeBluetoothAdapter

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/bluetooth/closebluetoothadapter
Updated: 2025-01-21

# closeBluetoothAdapter(Object object)

closeBluetoothAdapter(Object object) 该接口用于关闭蓝牙模块。
调用该接口将断开所有已建立的蓝牙连接，并释放系统资源。建议在使用蓝牙流程后，与 `tt.openBluetoothAdapter` 接口成对调用。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V3.44.0+ | V3.44.0+ | **X** | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性。

## 示例代码

调用示例：

```js
tt.closeBluetoothAdapter({ 
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`closeBluetoothAdapter fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "closeBluetoothAdapter:ok"
}
```
`fail`返回对象示例：
```json
{
    "errMsg": "closeBluetoothAdapter:fail not init",
    "errCode": 10000
}
```

## 错误码

`fail` 返回对象中可能包含 errCode 属性和 errno 属性，均代表错误码。

**errCode 错误码**

通用错误码可参见[蓝牙 API 错误码](https://open.feishu.cn/document/uYjL24iN/uYzNxYjL2cTM24iN3EjN)。

**errno 错误码**

关于 Errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
