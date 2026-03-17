# API 概述

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/api-overview
Updated: 2022-03-08

# 概述

小程序提供了多种 API 来暴露客户端能力，如获取用户信息、本地存储等功能，分为两种：同步、异步。其中异步 API 通过回调返回结果，同步 API 直接返回结果。 
**PC端 API 支持版本：3.8.0+**
## 代码示例

```js
tt.API({
    success (res) {
        console.log(`API 调用成功 ${res}`);
    },
    fail (res) {
        console.log(`API 调用失败`);
    }
});
```

```js
try {
    var res = tt.APISync();
    console.log(`API 调用成功 ${res}`);
} catch (error) {
    console.log(`API 调用失败`);
}
```
