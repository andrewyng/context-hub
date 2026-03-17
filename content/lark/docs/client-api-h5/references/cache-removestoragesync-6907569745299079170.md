# removeStorageSync

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/cache/removestoragesync
Updated: 2025-01-21

# removeStorageSync

调用 removeStorageSync(string key) 删除本地缓存数据。

## 支持说明

该接口仅支持小程序调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | **x** | **x** | **x** | **x** | /

## 输入

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
key | string | 是 | \- | 键名。最小长度为 1 字符。示例值：name

## 输出
无

## 示例代码

```js
try {
    tt.removeStorageSync("name");
} catch (error) {
    console.log(`removeStorageSync fail: ${JSON.stringify(error)}`);
}
```
