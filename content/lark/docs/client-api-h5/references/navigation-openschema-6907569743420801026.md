# openSchema

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/navigation/openschema
Updated: 2025-02-24

# openSchema

调用 openSchema(Object object) 跳转到小程序以外的应用。

## 注意事项

- 如果小程序出现无法跳转的现象，请先检查 schema 是否在应用的白名单中。
- PC 端在飞书 V3.41.0 及以上版本，需要对内置独立窗口可以打开的网页配置白名单，你可以通过配置 `*:*` 来允许打开任意链接。

关于白名单的配置方式，可参见[配置跳转应用的白名单](https://open.feishu.cn/document/uYjL24iN/uEjMxYjLxITM24SMyEjN)。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.1.0+ | V3.1.0+ | V3.1.0+ | V7.35.0+ | 预览
网页应用 | V3.44+ | V3.44+ | V3.47+ | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性如下所示。

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
schema | string | 是 | \- | 指定应用的 schema，schema需要满足 URI 协议。示例值：https://open.feishu.cn
external | boolean | 否 | false | 是否跳转到飞书以外的应用（浏览器或其他应用程序）。<br>**注意事项**：**注意**：<br>- 飞书内的应用不受此参数限制。例如，云文档、小程序等，需要注意云文档仅指在移动端打开，如果在 PC 端打开云文档会跳转至浏览器。<br>- PC 端：飞书 [V3.38.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持设置该字段。通过指定 `external` 为 `false`，使用内置独立窗口打开网页，同时支持通过 `options` 字段指定窗口尺寸。<br>- Android/iOS 端：飞书 [V3.1.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持设置该字段。
options | object | 否 | \- | 用于指定额外参数的对象。示例值：{"width":1200,"height":700}<br>**注意事项**：**注意**：<br>- PC 端：飞书 [V3.38.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持设置该字段。<br>- Android/iOS/Harmony 端：暂不支持设置该字段。
&emsp;<br>∟<br>&nbsp;<br>width | number | 否 | 飞书窗口的宽度 | 指定打开的端内容器的宽度，仅当 `external` 为 `false` 时生效。<br>- 最小值：640。<br>- 最大值：屏幕的宽度。<br>**注意事项**：**注意**：飞书 [V5.12.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本的宽度最小值从 1200 调整为 640。
&emsp;<br>∟<br>&nbsp;<br>height | number | 否 | 飞书窗口的高度 | 指定打开的端内容器的高度，仅当 `external` 为 `false` 时生效。<br>- 最小值：480。<br>- 最大值：屏幕的高度。<br>**注意事项**：**注意**：飞书 [V5.12.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本高度最小值从 700 调整为 480。
target | string | 否 | inline | 指定 [sidebar 模式](https://open.feishu.cn/document/uYjL24iN/uIjNzUjLyYzM14iM2MTN)小程序 A 调用 openSchema 接口打开另外一个 sidebar 模式的小程序 B 时的模式。可选值：<br>- `inline`：打开新应用 B 时，当前应用 A 会保留。当前应用 A 被关闭时，新应用 B 会一起被关闭。<br>- `replace`：打开新应用 B 时，当前应用 A 会被关闭。<br>**注意事项**：**注意**：<br>- PC 端：飞书 [V5.13.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上、V7.0 以下版本支持设置该字段。<br>- iOS/Android/Harmony 端：暂不支持设置该字段。

## 输出
该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性。

## 示例代码

调用示例：

```js
tt.openSchema({
    schema: "https://feishu.cn/",
    external: true,
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`openSchema fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "openSchema:ok"
}
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
