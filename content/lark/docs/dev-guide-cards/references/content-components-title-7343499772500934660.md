# 标题

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/content-components/title
Updated: 2025-10-14

# 标题组件

卡片的标题组件支持添加卡片主标题、副标题、后缀标签和标题图标。

本文档介绍标题组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[标题](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/title)。

## 注意事项

同一张卡片仅支持添加一个标题组件。

## 组件属性

### JSON 结构

标题的完整 JSON 数据如下所示：

```json
{
  "header": {
    "title": {
      // 卡片主标题。必填。
      "tag": "plain_text",  // 文本类型的标签。可选值：plain_text 和 lark_md。
      "content": "示例标题", // 主标题内容。
      "i18n": {
        // 多语言标题内容。必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。
        "zh_cn": "",
        "en_us": "",
        "ja_jp": "",
        "zh_hk": "",
        "zh_tw": ""
      }
    },
    "subtitle": {
      // 卡片副标题。可选。
      "tag": "plain_text",  // 文本类型的标签。可选值：plain_text 和 lark_md。
      "content": "示例文本", // 副标题内容。
      "i18n": {
       // 多语言副标题内容。必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。
        "zh_cn": "",
        "en_us": "",
        "ja_jp": "",
        "zh_hk": "",
        "zh_tw": ""
      }
    },
    "text_tag_list": [
      // 标题后缀标签，最多设置 3 个 标签，超出不展示。可选。
      {
        "tag": "text_tag",
        "text": {
          // 标签内容
          "tag": "plain_text",
          "content": "标签 1"
        },
        "color": "neutral" // 标签颜色
      }
    ],
    "i18n_text_tag_list": {
      // 国际化标题后缀标签。每个语言环境最多设置 3 个 tag，超出不展示。可选。同时配置原字段和国际化字段，优先生效国际化配置。
      "zh_cn": [],
      "en_us": [],
      "ja_jp": [],
      "zh_hk": [],
      "zh_tw": []
    },
    "template": "blue", // 标题主题颜色。支持 "blue"|"wathet"|"turquoise"|"green"|"yellow"|"orange"|"red"|"carmine"|"violet"|"purple"|"indigo"|"grey"|"default"。默认值 default。
    "icon": {
      // 自定义前缀图标
      "img_key": "img_v2_38811724" // 用作前缀图标的图片 key
    },
    "ud_icon": {
      // 图标库中的前缀图标，和 icon 同时设置时以 ud_icon 为准
      "token": "chat-forbidden_outlined", // 图标的 token
      "style": {
        "color": "red"  // 图标颜色。支持设置线性和面性图标（即 token 末尾为 `outlined` 或 `filled` 的图标）的颜色。
      }
    }
  }
}
```

### 字段说明

标题组件的字段说明如下表。

字段名称 | 是否必填 | 类型 | 说明
---|---|---|---
title | 是 | Object | 配置卡片的主标题信息。
└ tag | 是 | String | 文本类型的标签。可取值：<br>- `plain_text`：普通文本内容或[表情](https://www.feishu.cn/docx/doxcnG6utI72jB4eHJF1s5IgVJf)<br>- `lark_md`：支持以下 Markdown 语法的文本内容：<br>- @指定人：<br>```<br><at id=open_id></at><br><at id=user_id></at><br><at ids=id_01,id_02,xxx></at><br><at email=test@email.com></at><br>```<br>- @所有人：`<at id=all></at>`<br>- emoji：😁😢🌞💼🏆❌✅。直接复制表情即可。了解更多 emoji 表情，参考 [Emoji 表情符号大全](https://www.feishu.cn/docx/doxcnG6utI72jB4eHJF1s5IgVJf)。<br>- 飞书表情：如 `:OK:`。参考[表情文案说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)。
└ content | 否 | String | 卡片主标题内容。注意：<br>- 必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。<br>- 主标题内容最多四行，超出四行的内容用 `...` 省略。
└ i18n | 否 | Object | 多语言标题内容，支持设置的多语言枚举值如下：<br>- zh_cn：简体中文<br>- en_us：英文<br>- ja_jp：日文<br>- zh_hk：繁体中文（中国香港）<br>- zh_tw：繁体中文（中国台湾）<br>- id_id: 印尼语<br>- vi_vn: 越南语<br>- th_th: 泰语<br>- pt_br: 葡萄牙语<br>- es_es: 西班牙语<br>- ko_kr: 韩语<br>- de_de: 德语<br>- fr_fr: 法语<br>- it_it: 意大利语<br>- ru_ru: 俄语<br>- ms_my: 马来语<br>示例配置：<br>```json<br>{ <br>"zh_cn": "这是主标题", <br>"en_us": "It is the title"<br>}<br>```<br>注意：<br>- 必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。<br>- 主标题内容最多四行，超出四行的内容用 `...` 省略。
subtitle | 否 | Object | 配置卡片的副标题信息。<br>**注意**：不允许只配置副标题内容。如果只配置副标题，则实际展示为主标题效果。
└ tag | 是 | String | 文本类型的标签。可取值：<br>- `plain_text`：普通文本内容或[表情](https://www.feishu.cn/docx/doxcnG6utI72jB4eHJF1s5IgVJf)<br>- `lark_md`：支持以下 Markdown 语法的文本内容：<br>- @指定人：<br>```<br><at id=open_id></at><br><at id=user_id></at><br><at ids=id_01,id_02,xxx></at><br><at email=test@email.com></at><br>```<br>- @所有人：`<at id=all></at>`<br>- emoji：😁😢🌞💼🏆❌✅。直接复制表情即可。了解更多 emoji 表情，参考 [Emoji 表情符号大全](https://www.feishu.cn/docx/doxcnG6utI72jB4eHJF1s5IgVJf)。<br>- 飞书表情：如 `:OK:`。参考[表情文案说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)。
└ content | 否 | String | 卡片副标题内容。注意：<br>- 必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。<br>- 副标题内容最多一行，超出一行的内容用 `...` 省略。
└ i18n | 否 | Object | 多语言标题内容，支持设置的多语言枚举值如下：<br>- zh_cn：简体中文<br>- en_us：英文<br>- ja_jp：日文<br>- zh_hk：繁体中文（中国香港）<br>- zh_tw：繁体中文（中国台湾）<br>- id_id: 印尼语<br>- vi_vn: 越南语<br>- th_th: 泰语<br>- pt_br: 葡萄牙语<br>- es_es: 西班牙语<br>- ko_kr: 韩语<br>- de_de: 德语<br>- fr_fr: 法语<br>- it_it: 意大利语<br>- ru_ru: 俄语<br>- ms_my: 马来语<br>示例配置：<br>```json<br>{<br>"zh_cn": "这是副标题",<br>"en_us": "It is the sub-title"<br>}<br>```<br>注意：<br>- 必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。<br>- 副标题内容最多一行，超出一行的内容用 `...` 省略。
text_tag_list | 否 | TextTagList | 添加标题的后缀标签。最多可添加 3 个标签内容，如果配置的标签数量超过 3 个，则取前 3 个标签进行展示。标签展示顺序与数组顺序一致。<br>**注意**：<br>- 标题标签在飞书 V6.11 及以上版本开始生效。在旧版本客户端内将不会展示标题标签内容。<br>- `text_tag_lis`t 和 `i18n_text_tag_list` 只能配置其中之一。如果同时配置仅生效 `i18n_text_tag_list`。
└ tag | 是 | String | 后缀标签的标识。固定取值：text_tag。
└ text | 否 | Text Object | 后缀标签的内容。基于文本组件的 plain_text 模式定义内容。<br>示例值：<br>```JSON<br>"text": {<br>"tag": "plain_text",<br>"content": "这里是标签"<br>}<br>```
└ color | 否 | String | 后缀标签的颜色，默认为蓝色（blue）。可选值与示例效果参见下文的后缀标签颜色枚举。
i18n_text_tag_list | 否 | Object | 配置后缀标签的多语言属性，在所需语种字段下添加完整的后缀标签结构体即可。每个语言最多可配置 3 个标签内容，如果配置的标签数量超过 3 个，则取前 3 个标签进行展示。标签展示顺序与数组顺序一致。支持设置的多语言枚举值如下：<br>- zh_cn：简体中文<br>- en_us：英文<br>- ja_jp：日文<br>- zh_hk：繁体中文（中国香港）<br>- zh_tw：繁体中文（中国台湾）<br>- id_id: 印尼语<br>- vi_vn: 越南语<br>- th_th: 泰语<br>- pt_br: 葡萄牙语<br>- es_es: 西班牙语<br>- ko_kr: 韩语<br>- de_de: 德语<br>- fr_fr: 法语<br>- it_it: 意大利语<br>- ru_ru: 俄语<br>- ms_my: 马来语<br>示例配置：<br>```json<br>"i18n_text_tag_list": {<br>"zh_cn": [<br>{<br>"tag": "text_tag",<br>"text": {<br>"tag": "plain_text",<br>"content": "标签内容"<br>},<br>"color": "carmine"<br>}<br>],<br>"en_us": [<br>{<br>"tag": "text_tag",<br>"text": {<br>"tag": "plain_text",<br>"content": "Tag content"<br>},<br>"color": "carmine"<br>}<br>]<br>}<br>```<br>**注意**：<br>- 标题标签在飞书 V6.11 及以上版本开始生效。在旧版本客户端内将不会展示标题标签内容。<br>- `text_tag_list` 和 `i18n_text_tag_list` 只能配置其中之一。如果同时配置两个字段，则优先生效多语言配置。
template | 否 | String | 配置标题主题颜色。可选值与示例效果参见下文的标题主题样式枚举。
icon | 否 | Object | 通过上传图片，自定义标题的前缀图标。<br>**注意**：<br>一个卡片仅可配置一个标题图标。如果同时配置 `icon` 和 `ud_icon`，仅生效 `ud_icon`。
└ img_key | 否 | String | 自定义前缀图标的图片 key。<br>图标 key 的获取方式：调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create))接口，上传用于发送消息的图片，并在返回值中获取图片的 image_key。
ud_icon | 否 | Object | 添加图标库中已有的图标。<br>**注意**：一个卡片仅可配置一个标题图标。如果同时配置 `icon` 和 `ud_icon`，仅生效 `ud_icon`。
└ token | 否 | String | 图标库中图标的 token。枚举值参见[图标库](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-icons)。
└ style | 否 | Object | 图标的样式。支持自定义图标颜色。
└└ color | 否 | String | 图标的颜色。支持设置线性和面性图标（即 token 末尾为 `outlined` 或 `filled` 的图标）的颜色。默认为 `template` 字段设置的颜色。枚举值参见[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。<br>**注意**：搭建工具暂不支持自定义图标颜色。

### 示例代码

以下的 JSON 示例代码可实现如下图所示的卡片效果：

```json
{
  "config": {},
  "card_link": {
    "url": "",
    "pc_url": "",
    "ios_url": "",
    "android_url": ""
  },
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
                  "content": "普通文本示例",
                  "text_size": "normal",
                  "text_align": "left",
                  "text_color": "default"
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
  "header": {
    "title": {
      "tag": "plain_text",
      "content": "卡片主标题"
    },
    "subtitle": {
      "tag": "plain_text",
      "content": "卡片副标题"
    },
    "text_tag_list": [
      {
        "tag": "text_tag",
        "text": {
          "tag": "plain_text",
          "content": "后缀标签1"
        },
        "color": "turquoise"
      },
      {
        "tag": "text_tag",
        "text": {
          "tag": "plain_text",
          "content": "后缀标签2"
        },
        "color": "orange"
      },
      {
        "tag": "text_tag",
        "text": {
          "tag": "plain_text",
          "content": "后缀标签3"
        },
        "color": "indigo"
      }
    ],
    "template": "blue",
    "ud_icon": {
      "token": "larkcommunity_colorful"
    }
  }
}
```

## 枚举

### 标题主题样式枚举

标题组件中的 `template` 字段决定了卡片的标题主题样式。你可参考下表了解 `template` 的枚举值和对应的主题样式。
| 枚举值       | 主题样式示例                                                                                                                                                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| blue      |  |
| wathet    |  |
| turquoise |  |
| green     |  |
| yellow    |  |
| orange    |  |
| red       |  |
| carmine   |  |
| violet    |  |
| purple    |  |
| indigo    |  |
| grey      |  |
| default   |  |

### 后缀标签颜色枚举

标题的后缀标签的颜色样式由`text_tag_list` 或 `i18n_text_tag_list` 中的 `color` 字段定义，该字段支持的枚举值与示例样式如下表所示。
| 枚举值       | 颜色效果                                                                                                                                                                                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| neutral   |  |
| blue      |  |
| turquoise |  |
| lime      |  |
| orange    |  |
| violet    |  |
| indigo    |  |
| wathet    |  |
| green     |  |
| yellow    |  |
| red       |  |
| purple    |  |
| carmine   |  |

### 图标枚举

查看字段 `ud_icon` 的枚举，参考[图标库](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-icons)。

### 图标颜色枚举

你可通过 `ud_icon` 中的 `color` 字段设置图标颜色。查看 `color` 枚举，参考[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。

## 标题主题样式建议

在群聊中，可使用彩色标题。对于需高亮提醒的卡片信息，可将标题配置为应用的品牌色或表达状态的语义色，增强信息的视觉锚点。
在单聊中，建议根据卡片的状态配置标题样式。你可以参考以下示例，配置不同语义下的主题样式。
| **样式颜色**   | **语义** | **示例**                                                                                                                                                                                                                                                     |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 绿色（green）  | 完成或成功。 |  |
| 橙色（orange） | 警告或警示。 |  |
| 红色（red）    | 错误或异常。 |  |
| 灰色（grey）   | 失效。    |
