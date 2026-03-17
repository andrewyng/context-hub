# makePhoneCall

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/make-a-phone-call/makephonecall
Updated: 2025-01-21

# makePhoneCall(Object object)

拨打电话

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **X** | V7.35.0+ | 预览
网页应用 | V3.44.0+ | V3.44.0+ | **X** | V7.35.0+ | 预览

## 输入

继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性描述：

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
phoneNumber | string | 是 | &nbsp; | 电话号码<br>**示例值**：18888888888

## 输出

继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 示例代码

```js
tt.makePhoneCall({
    "phoneNumber": "18888888888",
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`makePhoneCall fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "makePhoneCall:ok"
}
```
