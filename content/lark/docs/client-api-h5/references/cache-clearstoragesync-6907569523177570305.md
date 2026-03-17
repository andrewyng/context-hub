# clearStorageSync

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/cache/clearstoragesync
Updated: 2025-01-21

# clearStorageSync

调用 clearStorageSync() 清理全部本地缓存数据。

## 支持说明

该接口仅支持小程序调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | **x** | **x** | **x** | **x** | /

## 输入
无

## 输出
无

## 示例代码

```js
try {
    tt.clearStorageSync();
} catch (error) {
    console.log(`clearStorageSync fail: ${JSON.stringify(error)}`);
}
```
