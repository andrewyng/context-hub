# hideToast

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/interface/interaction-feedback/hidetoast
Updated: 2025-01-21

# hideToast(Object object)

hideToast(Object object) 用于隐藏灰色背景的消息提示框。

## 注意事项

`loading` 的实现基于 `toast`，所以 `hideToast` 也会将 `loading` 隐藏。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | V3.44.0+ | V3.44.0+ | V3.47.0+ | V7.35.0+ | 预览

## 输入
该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性。

## 输出
该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性。

## 示例代码

调用示例：

```js
tt.hideToast({ 
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`hideToast fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：

```json
{
  errMsg: "hideToast:ok"
}
``` 

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
