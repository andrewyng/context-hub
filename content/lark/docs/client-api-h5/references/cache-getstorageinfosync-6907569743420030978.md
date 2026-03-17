# getStorageInfoSync

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/cache/getstorageinfosync
Updated: 2025-01-21

# getStorageInfoSync

调用 getStorageInfoSync() 获取本地缓存数据的相关信息。

## 支持说明

该接口仅支持小程序调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | **x** | **x** | **x** | **x** | /

## 输入
无

## 输出

名称 | 数据类型 | 描述
---|---|---
keys | string[] | 本地数据缓存中的所有键名列表，如果没有本地数据则返回空数组。
currentSize | number | 占用空间大小。单位：KB
limitSize | number | 存储空间上限，单位：KB。默认情况下返回 `10240`。

## 示例代码

调用示例：

```js
try {
    let result = tt.getStorageInfoSync();
    console.log(`getStorageInfoSync success: ${JSON.stringify(result)}`);
} catch (error) {
    console.log(`getStorageInfoSync fail: ${JSON.stringify(error)}`);
}
```

返回值示例：
```json
{
    "currentSize": 0.0419921875,
    "keys": [
        "name"
    ],
    "limitSize": 10240
}
```
