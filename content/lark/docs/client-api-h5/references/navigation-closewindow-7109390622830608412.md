# closeWindow（网页应用）

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/navigation/closewindow
Updated: 2025-04-24

# closeWindow(Object object)

关闭当前窗口
**注意事项**：无需 [网页应用鉴权](https://open.feishu.cn/document/uYjL24iN/uEzM4YjLxMDO24SMzgjN)，即可调用此API，但仍需要保证在 [window.h5sdk.ready](https://open.feishu.cn/document/uYjL24iN/uITO4IjLykDOy4iM5gjM) 的回调函数触发后调用

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **X** | **X** | **X** | **X** | /
网页应用 | V5.14.0+ | V5.14.0+ | V5.14.0+ | V7.41.0+ | 预览

## 示例代码
```js
window.h5sdk.ready(() => { // ready方法不需要每次都调用
  tt.closeWindow({
      fail(res) {
        console.log(`closeWindow fail: ${JSON.stringify(res)}`);
      }
  });
});
```
`fail`返回对象示例：
```json
{
    "errMsg": "closeWindow:fail unknown error"
}
```
