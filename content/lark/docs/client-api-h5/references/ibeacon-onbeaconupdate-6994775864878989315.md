# onBeaconUpdate

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/ibeacon/onbeaconupdate
Updated: 2025-01-21

# onBeaconUpdate(function callback)

监听 Beacon 设备更新事件，仅能注册一个监听
**注意事项**：注意事项：需要先调用[startBeaconDiscovery](https://open.feishu.cn/document/uYjL24iN/uQTOuQTOuQTO/ibeacon/startbeacondiscovery)。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V4.6.0+ | V4.6.0+ | **X** | V7.35.0+ | 预览
网页应用 | V4.6.0+ | V4.6.0+ | **X** | V7.35.0+ | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 是 | &nbsp; | 该事件的回调函数

## 输出

回调函数返回对象的属性：

名称 | 数据类型 | 描述
---|---|---
beacons | [BeaconInfo[]](https://open.feishu.cn/document/uYjL24iN/uQTOuQTOuQTO/ibeacon/ibeaconinfo) | Beacon 设备列表
&emsp;<br>∟<br>&nbsp;<br>uuid | string | Beacon 设备广播的 uuid
&emsp;<br>∟<br>&nbsp;<br>major | number | Beacon 设备的主 id
&emsp;<br>∟<br>&nbsp;<br>minor | number | Beacon 设备的次 id
&emsp;<br>∟<br>&nbsp;<br>proximity | number | 表示设备距离的枚举值
&emsp;<br>∟<br>&nbsp;<br>accuracy | number | Beacon 设备的距离
&emsp;<br>∟<br>&nbsp;<br>rssi | number | 表示设备的信号强度

## 示例代码

```js
tt.startBeaconDiscovery({
    uuids: [
        "fda50693-a4e2-4fb1-afcf-c6eb07647825"
    ],
    ignoreBluetoothAvailable: true,
    success(res) {
      tt.onBeaconUpdate(function(res) {
        console.log(JSON.stringify(res));	
      });
    },
    fail(res) {
      console.log(`startBeaconDiscovery fail: ${JSON.stringify(res)}`);
    }
});
```

回调函数返回对象示例:
```json
{
    "beacons": [
        {
            "accuracy": 16.545591294123085,
            "major": 11054,
            "minor": 11389,
            "proximity": 3,
            "rssi": -86,
            "uuid": "FDA50693-A4E2-4FB1-AFCF-C6EB07647825"
        }
    ]
}
```

## 错误码
`fail`返回对象中会包含[errorCode属性](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#a825f4c8)，代表错误码。具体错误码列表参见：[Beacon API错误码](https://open.feishu.cn/document/uYjL24iN/uQTOuQTOuQTO/ibeacon/ibeacon-api-error-code)

## 已知问题

- Android中`major`以及`minor`字段为string类型，在V5.26.0版本已修复。
