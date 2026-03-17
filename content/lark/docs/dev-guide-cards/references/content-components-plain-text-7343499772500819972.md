# 普通文本

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/content-components/plain-text
Updated: 2025-01-02

# 普通文本组件

卡片的普通文本组件支持添加普通文本和前缀图标，并设置文本大小、颜色、对齐方式等展示样式。

本文档介绍普通文本组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[普通文本](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/plain-text)。

## JSON 结构

普通文本组件的 JSON 数据如下所示：
```json
{
  "tag": "div",
  "text": {  // 配置普通文本信息。
    "tag": "plain_text", // 文本类型的标签。
    "content": "", // 文本内容。当 tag 为 lark_md 时，支持部分 Markdown 语法的文本内容。
    "text_size": "normal", // 文本大小。默认值 normal。
    "text_color": "default", // 文本颜色。仅在 tag 为 plain_text 时生效。默认值 default。
    "text_align": "left", // 文本对齐方式。默认值 left。
    "lines": 2, // 内容最大显示行数，超出设置行的内容用 ... 省略。
  },
  "icon": {
    // 前缀图标。
    "tag": "standard_icon", // 图标类型。
    "token": "chat-forbidden_outlined", // 图标的 token。仅在 tag 为 standard_icon 时生效。
    "color": "orange", // 图标颜色。仅在 tag 为 standard_icon 时生效。
    "img_key": "img_v2_38811724" // 图片的 key。仅在 tag 为 custom_icon 时生效。
  }
}
```

## 字段说明

普通文本组件的字段说明如下表。 

字段 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | / | 组件的标签。普通文本组件的标签为 `div`。
text | 否 | Object | / | 配置卡片的普通文本信息。
└ tag | 是 | String | plain_text | 文本类型的标签。可取值：<br>- `plain_text`：普通文本内容或[表情](https://www.feishu.cn/docx/doxcnG6utI72jB4eHJF1s5IgVJf)<br>- `lark_md`：支持部分 Markdown 语法的文本内容。详情参考下文 **lark_md 支持的 Markdown 语法**<br>**注意**：飞书卡片搭建工具中仅支持使用 `plain_text` 类型的普通文本组件。你可使用富文本组件添加 Markdown 格式的文本。
└ content | 是 | String | / | 文本内容。当 `tag` 为 `lark_md` 时，支持部分 Markdown 语法的文本内容。详情参考下文 **lark_md 支持的 Markdown 语法**。
└ text_size | 否 | String | normal | 文本大小。可取值如下所示。如果你填写了其它值，卡片将展示为 `normal` 字段对应的字号。你也可分别为移动端和桌面端定义不同的字号，详细步骤参考下文 **为移动端和桌面端定义不同的字号**。<br>- heading-0：特大标题（30px）<br>- heading-1：一级标题（24px）<br>- heading-2：二级标题（20 px）<br>- heading-3：三级标题（18px）<br>- heading-4：四级标题（16px）<br>- heading：标题（16px）<br>- normal：正文（14px）<br>- notation：辅助信息（12px）<br>- xxxx-large：30px<br>- xxx-large：24px<br>- xx-large：20px<br>- x-large：18px<br>- large：16px<br>- medium：14px<br>- small：12px<br>- x-small：10px
└ text_color | 否 | String | default | 文本的颜色。仅在 `tag` 为 `plain_text` 时生效。可取值：<br>- `default`：客户端浅色主题模式下为黑色；客户端深色主题模式下为白色<br>- 颜色的枚举值。详情参考[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)
└ text_align | 否 | String | left | 文本对齐方式。可取值：<br>- `left`：左对齐<br>- `center`：居中对齐<br>- `right`：右对齐
└ lines | 否 | Int | / | 内容最大显示行数，超出设置行的内容用 `...` 省略。
icon | 否 | Object | / | 添加图标作为文本前缀图标。支持自定义或使用图标库中的图标。
└ tag | 否 | String | / | 图标类型的标签。可取值：<br>- `standard_icon`：使用图标库中的图标。<br>- `custom_icon`：使用用自定义图片作为图标。
└ token | 否 | String | / | 图标库中图标的 token。当 `tag` 为 `standard_icon` 时生效。枚举值参见[图标库](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-icons)。
└ color | 否 | String | / | 图标的颜色。支持设置线性和面性图标（即 token 末尾为 `outlined` 或 `filled` 的图标）的颜色。当 `tag` 为 `standard_icon` 时生效。枚举值参见[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。
└ img_key | 否 | String | / | 自定义前缀图标的图片 key。当 `tag` 为 `custom_icon` 时生效。<br>图标 key 的获取方式：调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口，上传用于发送消息的图片，并在返回值中获取图片的 image_key。
## 示例代码<br>### `plain_text` 类型示例<br>以下的 JSON 示例代码可实现如下图所示的卡片效果：<br><br>```json<br>{<br>"i18n_elements": {<br>"zh_cn": [<br>{<br>"tag": "column_set",<br>"flex_mode": "none",<br>"horizontal_spacing": "default",<br>"background_style": "default",<br>"columns": [<br>{<br>"tag": "column",<br>"elements": [<br>{<br>"tag": "div",<br>"text": {<br>"tag": "plain_text",<br>"content": "这是一段普通文本示例。",<br>"text_size": "normal",<br>"text_align": "center",<br>"text_color": "default"<br>},<br>"icon": {<br>"tag": "standard_icon",<br>"token": "app-default_filled",<br>"color": "blue"<br>}<br>}<br>],<br>"width": "weighted",<br>"weight": 1<br>}<br>]<br>}<br>]<br>},<br>"i18n_header": {}<br>}<br>```<br>### `lark_md` 类型示例<br>以下的 JSON 示例代码可实现如下图所示的卡片效果：<br><br>```json<br>{<br>"elements": [<br>{<br>"tag": "div",<br>"text": {<br>"tag": "plain_text",<br>"content": "text-lark_md",<br>"lines": 1<br>},<br>"fields": [<br>{<br>"is_short": false,<br>"text": {<br>"tag": "lark_md",<br>"content": "<a>https://open.feishu.cn</a>"<br>}<br>},<br>{<br>"is_short": false,<br>"text": {<br>"tag": "lark_md",<br>"content": "ready\nnew line"<br>}<br>},<br>{<br>"is_short": false,<br>"text": {<br>"tag": "lark_md",<br>"content": "*Italic*"<br>}<br>},<br>{<br>"is_short": false,<br>"text": {<br>"tag": "lark_md",<br>"content": "**Bold**"<br>}<br>},<br>{<br>"is_short": false,<br>"text": {<br>"tag": "lark_md",<br>"content": "~~delete line~~"<br>}<br>},<br>{<br>"is_short": false,<br>"text": {<br>"tag": "lark_md",<br>"content": "<at id=all></at>"<br>}<br>}<br>]<br>}<br>]<br>}<br>```<br>## `lark_md` 支持的 Markdown 语法<br>能力 | 语法 | 效果
换行 | 第一行\n第二行 | 第一行<br>第二行
斜体 | `*斜体*` | *斜体*
粗体 | `**粗体**` 或 `__粗体__` | **粗体**
删除线 | `~~删除线~~` | ~~删除线~~
文字链接 | `[文字链接](https://www.feishu.cn)` | [文字链接](https://www.feishu.cn)
超链接 | `&lt;a href='https://open.feishu.cn'&gt;&lt;/a&gt;` | [https://open.feishu.cn](https://open.feishu.cn/)
@ 人 | &lt;at id=all&gt;<br>&lt;/at&gt;<br>&lt;at id={{open_id}}&gt;&lt;/at&gt;<br>&lt;at id={{user_id}}&gt;&lt;/at&gt;<br>&lt;at email=test@email.com&gt;&lt;/at&gt;<br>提示：了解如何获取 open_id 或 user_id，参考[如何获取不同的用户 ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)。 | @所有人<br>@test
彩色文本 | &lt;font color=red&gt;红色&lt;/font&gt;<br>**提示**：要查看 color 枚举，参考[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。 | 红色
emoji | 😁😢🌞💼🏆❌✅<br>**提示**：直接复制表情即可。了解更多 emoji 表情，参考 [Emoji 表情符号大全](https://www.feishu.cn/docx/doxcnG6utI72jB4eHJF1s5IgVJf)。 | 😁😢🌞💼🏆❌✅
飞书表情 | :OK:<br>**提示**：要查看表情枚举，参考[表情文案说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)。 | 
标签 | `&lt;text_tag color='neutral'&gt; neutral &lt;/text_tag&gt;`<br>color 的枚举值有：neutral、blue、turquoise、lime、orange、violet、indigo、wathet、green、yellow、red、purple、carmine | 

## 为移动端和桌面端定义不同的字号

在普通文本和富文本组件的表头文本中，你可通过配置 `text_size` 为同一段文本定义在移动端和桌面端的不同字号。相关字段描述如下表所示。

字段 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
text_size | 否 | Object | / | 文本大小。你可在此自定义移动端和桌面端的不同字号。
└ custom_text_size_name | 否 | Object | / | 自定义的字号。你需自定义该字段的名称，如 `cus-0`、`cus-1` 等。
└└ default | 否 | String | / | 在无法差异化配置字号的旧版飞书客户端上，生效的字号属性。建议填写此字段。可取值如下所示。<br>- heading-0：特大标题（30px）<br>- heading-1：一级标题（24px）<br>- heading-2：二级标题（20 px）<br>- heading-3：三级标题（18px）<br>- heading-4：四级标题（16px）<br>- heading：标题（16px）<br>- normal：正文（14px）<br>- notation：辅助信息（12px）<br>- xxxx-large：30px<br>- xxx-large：24px<br>- xx-large：20px<br>- x-large：18px<br>- large：16px<br>- medium：14px<br>- small：12px<br>- x-small：10px
└└ pc | 否 | String | / | 桌面端的字号。可取值如下所示。<br>- heading-0：特大标题（30px）<br>- heading-1：一级标题（24px）<br>- heading-2：二级标题（20 px）<br>- heading-3：三级标题（18px）<br>- heading-4：四级标题（16px）<br>- heading：标题（16px）<br>- normal：正文（14px）<br>- notation：辅助信息（12px）<br>- xxxx-large：30px<br>- xxx-large：24px<br>- xx-large：20px<br>- x-large：18px<br>- large：16px<br>- medium：14px<br>- small：12px<br>- x-small：10px
└└ mobile | 否 | String | / | 移动端的文本字号。可取值如下所示。<br>**注意**：部分移动端的字号枚举值的具体大小与 PC 端有差异，使用时请注意区分。<br>- heading-0：特大标题（26px）<br>- heading-1：一级标题（24px）<br>- heading-2：二级标题（20 px）<br>- heading-3：三级标题（17px）<br>- heading-4：四级标题（16px）<br>- heading：标题（16px）<br>- normal：正文（14px）<br>- notation：辅助信息（12px）<br>- xxxx-large：26px<br>- xxx-large：24px<br>- xx-large：20px<br>- x-large：18px<br>- large：17px<br>- medium：14px<br>- small：12px<br>- x-small：10px

  具体步骤如下所示。
1. 在卡片 JSON 代码的全局行为设置中的 `config` 字段中，配置 `style` 字段，并添加自定义字号：

    ```json
    {
      "config": {
        "style": { // 在此添加并配置 style 字段。
          "text_size": { // 分别为移动端和桌面端添加自定义字号，同时添加兜底字号。用于在组件 JSON 中设置字号属性。支持添加多个自定义字号对象。
            "cus-0": {
              "default": "medium", // 在无法差异化配置字号的旧版飞书客户端上，生效的字号属性。选填。
              "pc": "medium", // 桌面端的字号。
              "mobile": "large" // 移动端的字号。
            },
            "cus-1": {
              "default": "medium", // 在无法差异化配置字号的旧版飞书客户端上，生效的字号属性。选填。
              "pc": "normal", // 桌面端的字号。
              "mobile": "x-large" // 移动端的字号。
            }
          }
        }
      }
    }
    ```
1. 在普通文本组件或富文本组件的 `text_size` 属性中，应用自定义字号。以下为在普通文本组件中应用自定义字号的示例：

    ```json
    {
      "i18n_elements": {
        "zh_cn": [
          {
            "tag": "column_set",
            "flex_mode": "none",
            "horizontal_spacing": "default",
            "background_style": "default",
            "columns": [
              {
                "tag": "column",
                "elements": [
                  {
                    "tag": "div",
                    "text": {
                      "tag": "plain_text",
                      "content": "这是一段普通文本示例。",
                      "text_size": "cus-0", // 在此处应用自定义字号。
                      "text_align": "center",
                      "text_color": "default"
                    },
                    "icon": {
                      "tag": "standard_icon",
                      "token": "app-default_filled",
                      "color": "blue"
                    }
                  }
                ],
                "width": "weighted",
                "weight": 1
              }
            ]
          }
        ]
      },
      "i18n_header": {}
    }
    ```
