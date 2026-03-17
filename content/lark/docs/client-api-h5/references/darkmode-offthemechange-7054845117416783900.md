# offThemeChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/interface/darkmode/offthemechange
Updated: 2022-03-08

# offThemeChange(function callback)

取消监听系统主题变化的事件
## 支持说明

应用能力 | Android | iOS | PC | 预览效果
---|---|---|---|---
小程序 | V5.3.0+ | V5.3.0+ | V5.3.0+ | 预览
网页应用 | **X** | **X** | **X** | /

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 是 | &nbsp; | 该事件的回调函数

如果不传递，不会取消所有 themeChange 事件

## 输出
无

## 代码示例

```js
const fn = ({ theme }) => {
  console.log('onThemeChange', theme);
};
tt.onThemeChange(fn);
// 在某个时机取消监听
tt.offThemeChange(fn);
```
