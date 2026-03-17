# stopBeaconDiscovery

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/ibeacon/stopbeacondiscovery
Updated: 2025-01-21

# stopBeaconDiscovery(Object object)

停止搜索附近的 Beacon 设备
**注意事项**：注意事项：需要先调用[startBeaconDiscovery](https://open.feishu.cn/document/uYjL24iN/uQTOuQTOuQTO/ibeacon/startbeacondiscovery)。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V4.6.0+ | V4.6.0+ | **X** | V7.35.0+ | 预览
网页应用 | V4.6.0+ | V4.6.0+ | **X** | V7.35.0+ | 预览

## 输入

继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性

## 输出

继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 示例代码

```js
tt.startBeaconDiscovery({
    uuids: [
        "fda50693-a4e2-4fb1-afcf-c6eb07647825"
    ],
    ignoreBluetoothAvailable: true,
    success(res) {
      tt.stopBeaconDiscovery({ 
    	success(res) {
      	  console.log(JSON.stringify(res));
    	},
    	fail(res) {
      	  console.log(`stopBeaconDiscovery fail: ${JSON.stringify(res)}`);
    	}
	    });
    },
    fail(res) {
      console.log(`startBeaconDiscovery fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "stopBeaconDiscovery:ok"
}
```

## 错误码
`fail`返回对象中会包含[errorCode属性](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#a825f4c8)，代表错误码。具体错误码列表参见：[Beacon API错误码](https://open.feishu.cn/document/uYjL24iN/uQTOuQTOuQTO/ibeacon/ibeacon-api-error-code)
