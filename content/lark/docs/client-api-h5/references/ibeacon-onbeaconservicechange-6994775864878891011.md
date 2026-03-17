# onBeaconServiceChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/ibeacon/onbeaconservicechange
Updated: 2025-01-21

# onBeaconServiceChange(function callback)

监听蓝牙适配器状态变化事件
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
available | boolean | 服务目前是否可用
discovering | boolean | 目前是否处于搜索状态

## 示例代码

```js
tt.startBeaconDiscovery({
    uuids: [
        "fda50693-a4e2-4fb1-afcf-c6eb07647825"
    ],
    ignoreBluetoothAvailable: true,
    success(res) {
      tt.onBeaconServiceChange(function(res) {  
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
    "available": false,
    "discovering": true
}
```

## 错误码
`fail`返回对象中会包含[errorCode属性](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#a825f4c8)，代表错误码。具体错误码列表参见：[Beacon API错误码](https://open.feishu.cn/document/uYjL24iN/uQTOuQTOuQTO/ibeacon/ibeacon-api-error-code)
