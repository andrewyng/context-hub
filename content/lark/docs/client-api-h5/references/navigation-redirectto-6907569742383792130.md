# redirectTo

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/navigation/redirectto
Updated: 2025-05-14

# redirectTo(Object object)

关闭当前页面，跳转到指定页面
**注意事项**：**不能**跳转到 TabBar 页面。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | /

## 输入

继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性描述：

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
url | string | 是 | &nbsp; | 需要跳转的应用内非 tabBar 的页面的路径, 路径后可以带参数。可以以这种形式带上参数 "path?key1=value1&key2=value2"。参数在指定页面的 onLoad 参数以对象形式传递。<br>**示例值**：path?key1=value1&key2=value2

## 输出

继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 示例代码

```js
tt.redirectTo({
    "url": "/pages/navigateTo/index",
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`redirectTo fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "redirectTo:ok"
}
```
