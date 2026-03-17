# openBluetoothAdapter

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/bluetooth/openbluetoothadapter
Updated: 2025-04-15

# openBluetoothAdapter(Object object)

openBluetoothAdapter(Object object) 用于初始化蓝牙模块。

## 注意事项

- 调用前需要用户授权 `scope.bluetooth`。了解如何授权，参见[API 权限](https://open.feishu.cn/document/uYjL24iN/uITMuITMuITM)。
- 该 API 在 Android 系统需要 `android.permission.ACCESS_FINE_LOCATION` 权限。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V3.44.0+ | V3.44.0+ | **X** | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`fail` 返回对象的扩展属性如下所示。

名称 | 数据类型 | 描述
---|---|---
state | number | 打开蓝牙返回的状态值。可能值：<br>- `0`：未知错误<br>- `1`：重置中<br>- `2`：不支持<br>- `3`：未授权<br>- `4`：未开启

## 示例代码

调用示例：

```js
tt.openBluetoothAdapter({ 
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`openBluetoothAdapter fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "openBluetoothAdapter:ok"
}
```

## 错误码

`fail` 返回对象中可能包含 errCode 属性和 errno 属性，均代表错误码。

**errCode 错误码**

错误码 | 描述 | 排查建议
---|---|---
0 | 未知错误 | 内部错误，请稍后重试，仍然出现可以[咨询客服](https://applink.feishu.cn/client/helpdesk/open?id=6626260912531570952&extra=%7B%22channel%22%3A14%2C%22created_at%22%3A1614493146%2C%22scenario_id%22%3A6885151765134622721%2C%22signature%22%3A%22ca94c408b966dc1de2083e5bbcd418294c146e98%22%7D)。
1 | 蓝牙重置中 | 蓝牙正在重置，稍后尝试即可。
2 | 当前设备不支持蓝牙 | 需提示用户，设备不支持蓝牙功能。
3 | 未授予蓝牙权限 | 需提示用户打开蓝牙相关权限。
4 | 未开启蓝牙 | 需提示用户打开蓝牙。

通用错误码列表，可参见[蓝牙 API 错误码](https://open.feishu.cn/document/uYjL24iN/uYzNxYjL2cTM24iN3EjN)。

**errno 错误码**

关于 Errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
