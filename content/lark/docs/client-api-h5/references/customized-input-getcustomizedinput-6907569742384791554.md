# getCustomizedInput

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/interface/customized-input/getcustomizedinput
Updated: 2025-07-04

# getCustomizedInput()

获取**全局唯一**的`CustomizedInput`实例。通过`CustomizedInput`显示一个 可定制化的富文本输入框，支持@联系人、插入图片、插入表情、显示用户头像、切换用户头像状态。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **X** | V7.47.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | /

## 输入
无

## 输出

返回值：`CustomizedInput`，该对象的方法列表参见下表：
**注意事项**：点击下表中的方法名，查看对应API的支持说明、调用方法

方法 | 介绍
---|---
[show(Object object)](https://open.feishu.cn/document/uYjL24iN/uADN1EjLwQTNx4CM0UTM/customizedinput/show) | 显示输入框
[update(Object object)](https://open.feishu.cn/document/uYjL24iN/uADN1EjLwQTNx4CM0UTM/customizedinput/update) | 更新输入框中显示的内容。params参数与show(params)一致
[hide()](https://open.feishu.cn/document/uYjL24iN/uADN1EjLwQTNx4CM0UTM/customizedinput/hide) | 隐藏输入框
[onPicSelect(function callabck)](https://open.feishu.cn/document/uYjL24iN/uADN1EjLwQTNx4CM0UTM/customizedinput/onpicselect) | 监听选择图片的事件回调
[onModelSelect(function callback)](https://open.feishu.cn/document/uYjL24iN/uADN1EjLwQTNx4CM0UTM/customizedinput/onmodelselect) | 监听选择pickerView之后的事件回调，res参数与`onPicSelect((res) => {})`一致
[onPublish(function callback)](https://open.feishu.cn/document/uYjL24iN/uADN1EjLwQTNx4CM0UTM/customizedinput/onpublish) | 监听点击发送按钮的事件回调，res参数与`onPicSelect((res) => {})`一致
[onHide(function callback)](https://open.feishu.cn/document/uYjL24iN/uADN1EjLwQTNx4CM0UTM/customizedinput/onhide) | 监听隐藏输入框的事件回调，res参数与`onPicSelect((res) => {})`一致
[onError(function callback)](https://open.feishu.cn/document/uYjL24iN/uADN1EjLwQTNx4CM0UTM/customizedinput/onerror) | 监听错误事件回调

## 示例代码

```js
try {
    let result = tt.getCustomizedInput();
    console.log(`getCustomizedInput success: ${JSON.stringify(result)}`);
} catch (error) {
    console.log(`getCustomizedInput fail: ${JSON.stringify(error)}`);
}
```

返回值示例：
```json
getCustomizedInput success: {}
```
