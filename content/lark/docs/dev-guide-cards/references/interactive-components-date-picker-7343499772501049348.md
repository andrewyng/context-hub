# 日期选择器

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/interactive-components/date-picker
Updated: 2025-01-02

# 日期选择器组件

日期选择器组件是用于提供日期选项的交互组件。本文档介绍日期选择器组件的 JSON 结构和相关属性。

本文档介绍日期选择器组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[日期选择器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/interactive-components/date-picker)。

## 注意事项

- 日期选择器组件支持飞书 V3.11.0 及以上版本的客户端。在低于该版本的飞书客户端上，表单容器的内容将展示为“当前版本不支持查看此消息”。
- 在使用日期选择器时，你需提醒用户选择与当前日期场景相对应的时区信息。例如，在预定海外酒店的场景下，一般使用酒店所在地时区；设置日程场景下，一般使用用户当前所在地的时区。开放平台会返回用户当前的时区作为参考，但并不代表用户选择了该时区。
- 在卡片 JSON 代码中，若日期选择器组件直接位于卡片根节点，而非嵌套在其它组件中，你需将其 JSON 数据配置在[交互模块](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/component-list/common-components-and-elements)（`"tag": "action"`）的 `actions` 字段中使用。

## 嵌套规则

日期选择器组件支持嵌套在分栏、表单容器、折叠面板、循环容器中使用。

## 组件属性

### JSON 结构

日期选择器组件的结构如下所示：
```json
{
  "tag": "date_picker",
  "name": "date_picker1", // 日期选择器组件的唯一标识。当组件内嵌在表单容器中时，该属性生效，用于识别用户提交的文本属于哪个输入框。
  "required": false, // 日期是否必选，默认值 false。当日期选择器内嵌在表单容器时，该属性可用。其它情况将报错或不生效。
  "disabled": false, // 是否禁用该日期选择器组件。默认值 false。
  "width": "default",  // 日期选择器的宽度。
  "initial_date": "2024-01-01", // 日期初始值。
  "placeholder": {
    // 日期选择器组件内的占位文本。
    "tag": "plain_text",
    "content": "请选择"
  },
  "value": {
    // 回传数据
    "key_1": "value_1"
  },
  "confirm": {
    // 二次确认弹窗配置
    "title": {
      "tag": "plain_text",
      "content": "title"
    },
    "text": {
      "tag": "plain_text",
      "content": "content"
    }
  }
}
```

### 字段说明

日期选择器组件的字段说明如下表。

字段 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | string | / | 组件的标签。日期选择器组件取固定值 `date_picker`。
name | 否 | String | 空 | 该日期选择器组件的唯一标识。当日期选择器内嵌在表单容器时，该属性生效，用于识别用户提交的数据属于哪个组件。<br>**注意**: 当日期选择器组件嵌套在表单容器中时，该字段必填且需在卡片全局内唯一。
required | 否 | Boolean | false | 日期的内容是否必选。当组件内嵌在表单容器中时，该属性可用。其它情况将报错或不生效。可取值：<br>- true：日期必选。当用户点击表单容器的“提交”时，未填写日期，则前端提示“有必填项未填写”，不会向开发者的服务端发起回传请求。<br>- false：日期选填。当用户点击表单容器的“提交”时，未填写日期，仍提交表单容器中的数据。
disabled | 否 | Boolean | false | 是否禁用该日期选择器。该属性仅支持飞书 V7.4 及以上版本的客户端。可选值：<br>- true：禁用日期选择器组件<br>- false：日期选择器组件保持可用状态
placeholder | 否 | object | / | 日期选择器组件内的占位文本。
└ tag | 是 | String | plain_text | 占位提示标签。固定值为 plain_text。
└ content | 否 | String | / | 占位文本的内容，最多支持 100 个字符。
width | 否 | String | default | 日期选择器组件的宽度。支持以下枚举值：<br>- default：默认宽度<br>- fill：卡片最大支持宽度<br>- [100,∞)px：自定义宽度。超出卡片宽度时将按最大支持宽度展示
initial_date | 否 | String | 空 | 日期选择器组件的初始选项值。格式为 `yyyy-MM-dd`。该配置将会覆盖 `placeholder` 配置的占位文本。
value | 是 | JSON | / | 设置交互的回传数据，当用户点击交互组件的选项后，会将 value 的值返回给接收回调数据的服务器。后续你可以通过服务器接收的 value 值进行业务处理。该字段值仅支持 key-value 形式的 JSON 结构，且 key 为 String 类型。<br>示例值：<br>```json<br>"value":{<br>"key-1":Object-1,<br>"key-2":Object-2,<br>"key-3":Object-3,<br>······<br>}<br>```
confirm | 否 | Struct | 默认不生效此属性。 | 二次确认弹窗配置。指在用户提交时弹出二次确认弹窗提示；只有用户点击确认后，才提交输入的内容。该字段默认提供了确认和取消按钮，你只需要配置弹窗的标题与内容即可。<br>**注意**：<code>confirm</code> 字段仅在用户点击包含提交属性的按钮时才会触发二次确认弹窗。
confirm.title | 是 | Struct | / | 二次确认弹窗标题。
confirm.title.tag | 是 | String | plain_text | 二次确认弹窗标题文本的标签。固定取值为 `plain_text`。
confirm.title.content | 是 | String | / | 二次确认弹窗标题的内容。
confirm.text | 是 | Struct | / | 二次确认弹窗的文本内容。
confirm.text.tag | 是 | String | plain_text | 二次确认弹窗文本的标签。固定取值为 `plain_text`。
confirm.text.content | 是 | String | / | 二次确认弹窗文本的具体内容。

## 回调结构
为组件成功配置交互后，用户基于组件进行交互时，你在开发者后台配置的请求地址将会收到回调数据。
- 如果你添加的是新版卡片回传交互回调(`card.action.trigger`)，可参考[卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)了解回调结构。
- 如果你添加的是旧版卡片回传交互回调(`card.action.trigger_v1`)，可参考[消息卡片回传交互（旧）](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)了解回调结构。
## 示例代码

以下的 JSON 示例代码可实现如下图所示的卡片效果：

```json
{
  "i18n_elements": {
    "zh_cn": [
      {
        "tag": "action",
        "actions": [
          {
            "tag": "date_picker",
            "placeholder": {
              "tag": "plain_text",
              "content": "请选择"
            },
            "width": "default",
            "initial_date": "2024-01-01"
          }
        ]
      },
      {
        "tag": "action",
        "actions": [
          {
            "tag": "date_picker",
            "placeholder": {
              "tag": "plain_text",
              "content": "请选择"
            },
            "width": "default"
          }
        ]
      }
    ]
  },
  "i18n_header": {}
}
```
