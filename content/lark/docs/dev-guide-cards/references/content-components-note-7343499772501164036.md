# 备注

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/content-components/note
Updated: 2025-03-04

# 备注组件

你可以使用备注组件展示卡片内的一些次要信息，用于辅助说明。备注组件支持添加图标、图片以及文本。

## 注意事项
[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)不再支持备注（note）组件。你可使用[普通文本](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/plain-text)组件配置 notation 字号、使用 grey 字体颜色和 icon 属性替代。

## JSON 结构

备注组件的完整 JSON 数据如下所示：
```json
{
    "tag": "note", // 组件的标签。
    "elements": [ // 备注信息。支持添加图标、图片以及文本。
        {
            "tag": "standard_icon", // 图标类型。
            "token": "chat-forbidden_outlined", // 图标的 token。仅在 tag 为 standard_icon 时生效。
            "color": "orange", // 图标颜色。仅在 tag 为 standard_icon 时生效。
            "img_key": "img_v2_38811724" // 图片的 key。仅在 tag 为 custom_icon 时生效。
        },
        {
            "tag": "plain_text" // 文本类型的标签。
            "content": "", // 文本内容。当 tag 为 lark_md 时，支持部分 Markdown 语法的文本内容。
        }
    ]
}
```

## 字段说明

备注组件的字段说明如下表。

字段 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | / | 组件的标签。备注模块组件的固定值为 `note`。
elements | 否 | Object | / | 配置卡片的备注模块信息。支持添加图标、图片以及文本。

备注组件支持添加图标、图片以及文本，其中，图标的字段说明如下表。

字段 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 否 | String | / | 图标类型的标签。可取值：<br>- `standard_icon`：使用图标库中的图标<br>- `custom_icon`：使用用自定义图片作为图标
token | 否 | String | / | 图标库中图标的 token。当 `tag` 为 `standard_icon` 时生效。枚举值参见[图标库](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-icons)。
color | 否 | String | / | 图标的颜色。支持设置线性和面性图标（即 token 末尾为 `outlined` 或 `filled` 的图标）的颜色。当 `tag` 为 `standard_icon` 时生效。枚举值参见[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。
img_key | 否 | String | / | 自定义前缀图标的图片 key。当 `tag` 为 `custom_icon` 时生效。<br>图标 key 的获取方式：调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口，上传用于发送消息的图片，并在返回值中获取图片的 image_key。

备注组件支持添加图标、图片以及文本，其中，图片的字段说明如下表。

字段 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | img | 图片组件的标签。
img_key | 是 | String | / | 图片资源的 Key。你可以调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口或在搭建工具中上传图片，获取图片的 key。
alt | 是 | Struct | / | 悬浮（hover）在图片上时展示的说明文案。示例值：<br>```json<br>"alt": {<br>"tag": "plain_text",<br>"content": "悬浮（hover）在图片上时展示的说明文案，不需要可以传空"<br>}<br>```

备注组件支持添加图标、图片以及文本，其中，文本的字段说明如下表。

字段名称 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | plain_text | 文本类型的标签。可取值：<br>- `plain_text`：备注模块内容<br>- `lark_md`：支持部分 Markdown 语法的文本内容。详情参考 [普通文本](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/plain-text)组件中 **lark_md 支持的 Markdown 语法** 一节。<br>**注意**：飞书卡片搭建工具中仅支持使用 `plain_text` 类型的备注模块组件。你可使用富文本组件添加 Markdown 格式的文本。
content | 是 | String | / | 文本内容。当 `tag` 为 `lark_md` 时，支持部分 Markdown 语法的文本内容。详情参考 [普通文本](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/plain-text)组件中 **lark_md 支持的 Markdown 语法** 一节。

## 示例代码

以下的 JSON 示例代码可实现如下图所示的卡片效果：

```json
{
  "elements": [
    {
      "tag": "note",
      "elements": [
        {
          "tag": "custom_icon",
          "token": "chat-forbidden_outlined",
          "img_key": "img_v2_041b28e3-5680-48c2-9af2-497ace79333g"
        },
        {
          "tag": "plain_text",
          "content": "备注信息1"
        },
        {
          "tag": "img",
          "img_key": "img_v2_041b28e3-5680-48c2-9af2-497ace79333g",
          "alt": {
            "tag": "plain_text",
            "content": "这是备注图片"
          }
        },
        {
          "tag": "plain_text",
          "content": "备注信息2"
        }
      ]
    }
  ]
}
```
