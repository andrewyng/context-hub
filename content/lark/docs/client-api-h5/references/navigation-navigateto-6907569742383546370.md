# navigateTo

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/navigation/navigateto
Updated: 2025-05-14

# navigateTo(Object object)

跳转到指定页面。跳转后原页面保留。使用 [tt.navigateBack](https://open.feishu.cn/document/uYjL24iN/uADM04CMwQjLwADN) 可以返回到原页面。小程序中页面栈最多十层。
**注意事项**：**不能**跳转到 TabBar 页面，PC 除外。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | /

## 输入
继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
url | String | 是 | &nbsp; | 需要跳转的应用内非 tabBar 的页面的路径, 路径后可以带参数。可以以这种形式带上参数"path?key1=value1&key2=value2"。参数在指定页面的 onLoad 参数以对象形式传递<br>**示例值**：path?key=value&key2=value2

## 输出

继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 示例代码

```js
tt.navigateTo({
    "url": "../navigateTo/index?id=1",
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`navigateTo fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "navigateTo:ok"
}
```
