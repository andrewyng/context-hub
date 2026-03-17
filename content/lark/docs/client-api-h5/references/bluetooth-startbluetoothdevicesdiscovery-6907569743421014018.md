# startBluetoothDevicesDiscovery

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/bluetooth/startbluetoothdevicesdiscovery
Updated: 2025-04-15

# startBluetoothDevicesDiscovery(Object object)

调用 startBluetoothDevicesDiscovery(Object object) 可以开始搜寻附近的蓝牙外围设备。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V3.44.0+ | V3.44.0+ | **X** | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性如下所示。

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
services | string[] | 否 | \- | 要搜索的蓝牙设备主服务（service）的 uuid 列表。<br>- 某些蓝牙设备会广播自己的主服务 uuid。如果设置此参数，则只搜索广播包有对应 uuid 的主服务的蓝牙设备。<br>- 建议主要通过该参数过滤掉周边不需要处理的其他蓝牙设备。<br>**示例值**：['0000181a-0000-1000-8000-00805f9b34fb']
allowDuplicatesKey | boolean | 否 | \- | 是否允许重复上报同一设备。取值：<br>- true：允许<br>- false：不允许<br>如果允许重复上报，则 `tt.onBlueToothDeviceFound` 方法会多次上报同一设备，但是 RSSI 值会有不同。
interval | number | 否 | \- | 上报设备的间隔。<br>- `0` 表示找到新设备立即上报。<br>- 其他数值根据传入的间隔上报，单位：ms。例如，传入 `3` 表示每间隔 3 ms 上报一次。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性。

## 示例代码

调用示例：

```js
tt.startBluetoothDevicesDiscovery({
    "services": [],
    "allowDuplicatesKey": true,
    "interval": 0,
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`startBluetoothDevicesDiscovery fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "startBluetoothDevicesDiscovery:ok"
}
```
`fail`返回对象示例：
```json
{
    "errMsg": "startBluetoothDevicesDiscovery:fail not init",
    "errCode": 10000
}
```

## 错误码

`fail` 返回对象中可能包含 errCode 属性和 errno 属性，均代表错误码。

**errCode 错误码**

通用错误码可参见[蓝牙 API 错误码](https://open.feishu.cn/document/uYjL24iN/uYzNxYjL2cTM24iN3EjN)。

**errno 错误码**

关于 Errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
