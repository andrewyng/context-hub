# onThemeChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/interface/darkmode/onthemechange
Updated: 2022-03-08

# onThemeChange(function callback)

监听系统主题变化的事件
**注意事项**：使用同一回调函数多次调用，会注册多次该事件，回调会被执行多次

## 支持说明

应用能力 | Android | iOS | PC | 预览效果
---|---|---|---|---
小程序 | V5.3.0+ | V5.3.0+ | V5.3.0+ | 预览
网页应用 | **X** | **X** | **X** | /

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 是 | &nbsp; | 该事件的回调函数

## 输出
回调函数返回对象的属性：

名称 | 数据类型 | 描述
---|---|---
theme | string | 当前系统主题，在[小程序支持 DarkMode](https://open.feishu.cn/document/uYjL24iN/uQTM5UjL0ETO14CNxkTN/darkmode) 的时候才会返回<br>**示例值**：light<br>**可选值**：<br>- `light`：浅色主题<br>- `dark`：深色主题<br>**注意事项**：- 飞书 [V5.3.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持<br>- 网页应用：不支持

## 示例代码

```js
tt.onThemeChange(({ theme }) => {
  console.log('onThemeChange', theme);
});
```

回调函数返回对象示例：
```json
{
  "theme": "dark"
}
```

## 已知问题

- 由于 Android 系统主题的刷新机制会导致整个页面重新创建，所以在 Android 设备上并不能通过此接口实时监听到系统主题变化
