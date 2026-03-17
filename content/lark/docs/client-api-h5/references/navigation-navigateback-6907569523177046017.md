# navigateBack

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/navigation/navigateback
Updated: 2025-05-14

# navigateBack(Object object)

返回上一级页面（或上N级页面）。可通过 getCurrentPages 获取当前的页面栈，决定需要返回几层。
**注意事项**：使用 [tt.redirectTo](https://open.feishu.cn/document/uYjL24iN/ucTOz4yN5MjL3kzM) 方法跳转新页面，会同时关闭原页面，因此不会增加页面栈的层级，使用 [tt.navigateBack](https://open.feishu.cn/document/uYjL24iN/uADM04CMwQjLwADN) 时需要要注意其页面层级关系

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | /

## 输入

继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性描述：

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
delta | number | 否 | 1 | 返回的层级数，如果 delta 大于现有层级数，则返回到首页。**PC只支持delta=1**<br>**示例值**：1

## 输出

继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 示例代码

```js
tt.navigateBack({
    delta: 1,
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`navigateBack fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "navigateBack:ok"
}
```
