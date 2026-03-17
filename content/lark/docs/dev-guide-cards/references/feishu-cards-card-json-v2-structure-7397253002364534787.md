# 卡片 JSON 2.0 结构

Source URL: https://open.feishu.cn/document/feishu-cards/card-json-v2-structure
Updated: 2025-06-23

# 卡片 JSON 2.0 结构

本文档介绍卡片 JSON 2.0 的整体结构和属性说明。

## 概念说明

- 卡片 JSON 2.0 是指在卡片 JSON 数据中，声明了 `schema` 属性为 `"2.0"` 的版本。与 1.0 版本相比，2.0 版本有较多不兼容差异和新增属性，详情参考[卡片 JSON 2.0 版本更新说明](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-breaking-changes-release-notes)。

- 在可视化搭建工具中，你可通过搭建[新版卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/cardkit-upgraded-version-card-release-notes)，获取 2.0 版本的卡片 JSON 源代码。
## 注意事项

- 卡片 JSON 2.0 结构支持飞书客户端 7.20 及之后版本。当使用 JSON 2.0 结构的卡片发送至低于 7.20 版本的客户端时，卡片标题可正常显示，但内容将展示兜底的升级提示文案。

  

- 卡片 JSON 2.0 结构暂时仅支持共享卡片，不支持独享卡片配置。即 `update_multi` 参数仅支持设为 `true`。

- 卡片 JSON 2.0 结构中，一张卡片最多支持 200 个元素（如 `tag` 为 `plain_text` 的文本元素）或组件。

## JSON 结构

以下为卡片 JSON 2.0 的整体结构。
```JSON
{
    "schema": "2.0", // 卡片 JSON 结构的版本。默认为 1.0。要使用 JSON 2.0 结构，必须显示声明 2.0。
    "config": {
        "streaming_mode": true, // 卡片是否处于流式更新模式，默认值为 false。
        "streaming_config": {}, // 流式更新配置。详情参考下文。
        "summary": {  // 卡片摘要信息。可通过该参数自定义客户端聊天栏消息预览中的展示文案。
            "content": "自定义内容", // 自定义摘要信息。如果开启了流式更新模式，该参数将默认为“生成中”。
            "i18n_content": { // 摘要信息的多语言配置。了解支持的所有语种。参考配置卡片多语言文档。
                "zh_cn": "",
                "en_us": "",
                "ja_jp": ""
            }
        },
        "locales": [ // JSON 2.0 新增属性。用于指定生效的语言。如果配置 locales，则只有 locales 中的语言会生效。
            "en_us",
            "ja_jp"
        ],
        "enable_forward": true, // 是否支持转发卡片。默认值为 true。
        "update_multi": true, // 是否为共享卡片。默认值为 true，JSON 2.0 暂时仅支持设为 true，即更新卡片的内容对所有收到这张卡片的人员可见。
        "width_mode": "fill", // 卡片宽度模式。支持 "compact"（紧凑宽度 400px）模式 或 "fill"（撑满聊天窗口宽度）模式。默认不填时的宽度为 600px。
        "use_custom_translation": false, // 是否使用自定义翻译数据。默认值 false。为 true 时，在用户点击消息翻译后，使用 i18n 对应的目标语种作为翻译结果。若 i18n 取不到，则使用当前内容请求翻译，不使用自定义翻译数据。
        "enable_forward_interaction": false, // 转发的卡片是否仍然支持回传交互。默认值 false。
        "style": { // 添加自定义字号和颜色。可应用在组件 JSON 数据中，设置字号和颜色属性。
            "text_size": { // 分别为移动端和桌面端添加自定义字号，同时添加兜底字号。用于在组件 JSON 中设置字号属性。支持添加多个自定义字号对象。
                "cus-0": {
                    "default": "medium", // 在无法差异化配置字号的旧版飞书客户端上，生效的字号属性。选填。
                    "pc": "medium", // 桌面端的字号。
                    "mobile": "large" // 移动端的字号。
                }
            },
            "color": { // 分别为飞书客户端浅色主题和深色主题添加 RGBA 语法。用于在组件 JSON 中设置颜色属性。支持添加多个自定义颜色对象。
                "cus-0": {
                    "light_mode": "rgba(5,157,178,0.52)", // 浅色主题下的自定义颜色语法
                    "dark_mode": "rgba(78,23,108,0.49)" // 深色主题下的自定义颜色语法
                }
            }
        }
    },
    "card_link": {
        // 指定卡片整体的跳转链接。
        "url": "https://www.baidu.com", // 默认链接地址。未配置指定端地址时，该配置生效。
        "android_url": "https://developer.android.com/",
        "ios_url": "https://developer.apple.com/",
        "pc_url": "https://www.windows.com"
    },
    "header": {
        "title": {
            // 卡片主标题。必填。要为标题配置多语言，参考配置卡片多语言文档。
            "tag": "plain_text", // 文本类型的标签。可选值：plain_text 和 lark_md。
            "content": "示例标题" // 标题内容。
        },
        "subtitle": {
            // 卡片副标题。可选。
            "tag": "plain_text", // 文本类型的标签。可选值：plain_text 和 lark_md。
            "content": "示例文本" // 标题内容。
        },
        "text_tag_list": [
            // 标题后缀标签，最多设置 3 个 标签，超出不展示。可选。
            {
                "tag": "text_tag",
                "element_id": "custom_id", // 操作元素的唯一标识。用于在调用组件相关接口中指定元素。需开发者自定义。
                "text": {
                    // 标签内容
                    "tag": "plain_text",
                    "content": "标签 1"
                },
                "color": "neutral" // 标签颜色
            }
        ],
        "i18n_text_tag_list": {
            // 多语言标题后缀标签。每个语言环境最多设置 3 个 tag，超出不展示。可选。同时配置原字段和国际化字段，优先生效多语言配置。
            "zh_cn": [],
            "en_us": [],
            "ja_jp": [],
            "zh_hk": [],
            "zh_tw": []
        },
        "template": "blue", // 标题主题样式颜色。支持 "blue"|"wathet"|"turquoise"|"green"|"yellow"|"orange"|"red"|"carmine"|"violet"|"purple"|"indigo"|"grey"|"default"。默认值 default。
        "icon": { // 前缀图标。
            "tag": "standard_icon", // 图标类型。
            "token": "chat-forbidden_outlined", // 图标的 token。仅在 tag 为 standard_icon 时生效。
            "color": "orange", // 图标颜色。仅在 tag 为 standard_icon 时生效。
            "img_key": "img_v2_38811724" // 图片的 key。仅在 tag 为 custom_icon 时生效。
        },
        "padding": "12px 8px 12px 8px" // 标题组件的内边距。JSON 2.0 新增属性。默认值 "12px"，支持范围 [0,99]px。    
    },
    "body": { // 卡片正文。
        // JSON 2.0 新增布局类属性，用于控制子元素排列：
        "direction": "vertical", // 正文或容器内组件的排列方向。可选值："vertical"（垂直排列）、"horizontal"（水平排列）。默认为 "vertical"。
        "padding": "12px 8px 12px 8px", // 正文或容器内组件的内边距，支持范围 [0,99]px。    
        "horizontal_spacing": "3px", // 正文或容器内组件的水平间距，可选值："small"(4px)、"medium"(8px)、"large"(12px)、"extra_large"(16px)或[0,99]px。
        "horizontal_align": "left", // 正文或容器内组件的水平对齐方式，可选值："left"、"center"、"right"。默认值为 "left"。
        "vertical_spacing": "4px", // 正文或容器内组件的垂直间距，可选值："small"(4px)、"medium"(8px)、"large"(12px)、"extra_large"(16px)或[0,99]px。
        "vertical_align": "center", // 正文或容器内组件的垂直对齐方式，可选值："top"、"center"、"bottom"，默认值为 "top"。
        "elements": [ // 在此传入各个组件的 JSON 数据，组件将按数组顺序纵向流式排列。
            {
                "tag": "xxx", // 组件的标签。
                "margin": "4px", // 组件的外边距，默认值 "0"，支持范围 [-99,99]px。JSON 2.0 新增属性。
                "element_id": "custom_id" // 操作组件的唯一标识。JSON 2.0 新增属性。用于在调用流式更新相关接口中指定组件。在同一张卡片内，该字段的值全局唯一。仅允许使用字母、数字和下划线，必须以字母开头，不得超过 20 字符。
            }
        ]
    }
}
```

## 属性说明

本小节介绍卡片结构中的属性。

### 全局属性

卡片全局属性包括以下字段。
```JSON
{
    "schema": "2.0",
    "config": {},
    "card_link": {},
    "header": {},
    "body": {
        "elements": []
    }
}
```
各个字段说明如下所示。
若这些字段均不传，则卡片 JSON 为 "{}"。飞书开放平台支持发送卡片 JSON 为 "{}" 的空白卡片。

字段 | 是否必填 | 描述
---|---|---
schema | 否 | 卡片结构的版本声明。默认为 1.0 版本。要使用 JSON 2.0 结构，必须显示声明 2.0。可选值：<br>- 1.0：卡片 JSON 1.0 结构。详情参考[卡片 JSON 1.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-structure)。<br>- 2.0：卡片 JSON 2.0 结构。支持更多字段和能力，如卡片流式更新能力、富文本组件（markdown）更多语法等。详情参考[卡片 JSON 2.0 不兼容变更&更新说明](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-breaking-changes-release-notes)。
config | 否 | 配置卡片的全局行为，包括流式更新模式（JSON 2.0 新增能力）、是否允许被转发、是否为共享卡片等。
card_link | 否 | 指定卡片整体的点击跳转链接。你可以配置一个默认链接，也可以分别为 PC 端、Android 端、iOS 端配置不同的跳转链接。
header | 否 | 标题组件相关配置。详情参考[标题](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/title)组件。
body | 否 | 卡片正文，包含一个名为 elements 的数组，用于放置各类组件。

### 卡片全局行为设置 `config`

`config` 用于配置卡片的全局行为，包括流式更新模式、是否允许被转发、是否为共享卡片等。
```json
{
  "config": {
    "streaming_mode": true, // 卡片是否处于流式更新模式，默认值为 false。
    "streaming_config": { // 流式更新配置。
      "print_frequency_ms": { // // 流式更新频率，单位：ms
        "default": 30,
        "android": 25,
        "ios": 40,
        "pc": 50
      },
      "print_step": {  // // 流式更新步长，单位：字符数
        "default": 2,
        "android": 3,
        "ios": 4,
        "pc": 5
      },
      "print_strategy": "fast" // 流式更新策略，枚举值，可取：fast/delay
    },
    "summary": {  // 卡片摘要信息。可通过该参数自定义客户端聊天栏消息预览中的展示文案。
      "content": "自定义内容", // 自定义摘要信息。如果开启了流式更新模式，该参数将默认为“生成中”。
      "i18n_content": { // 摘要信息的多语言配置。了解支持的所有语种。参考配置卡片多语言文档。
        "zh_cn": "",
        "en_us": "",
        "ja_jp": ""
      }
    },
    "locales": [ // JSON 2.0 新增属性。用于指定生效的语言。如果配置 locales，则只有 locales 中的语言会生效。
      "en_us",
      "ja_jp"
    ], // 卡片支持的语言列表。
    "enable_forward": true, // 是否支持转发卡片。默认值为 true。
    "update_multi": true, // 是否为共享卡片。默认值为 true，JSON 2.0 暂时仅支持设为 true，即更新卡片的内容对所有收到这张卡片的人员可见。
    "width_mode": "fill", // 卡片宽度模式。支持 "compact"（紧凑宽度 400px）模式 或 "fill"（撑满聊天窗口宽度）模式。默认不填时的宽度为 600px。
    "use_custom_translation": false, // 是否使用自定义翻译数据。默认值 false。为 true 时，在用户点击消息翻译后，使用 i18n 对应的目标语种作为翻译结果。若 i18n 取不到，则使用当前内容请求翻译，不使用自定义翻译数据。
    "enable_forward_interaction": false, // 转发的卡片是否仍然支持回传交互。默认值 false。
    "style": { // 添加自定义字号和颜色。可应用在组件 JSON 数据中，设置字号和颜色属性。
      "text_size": { // 分别为移动端和桌面端添加自定义字号，同时添加兜底字号。用于在组件 JSON 中设置字号属性。支持添加多个自定义字号对象。
        "cus-0": {
          "default": "medium", // 在无法差异化配置字号的旧版飞书客户端上，生效的字号属性。选填。
          "pc": "medium", // 桌面端的字号。
          "mobile": "large" // 移动端的字号。
        }
      },
      "color": { // 分别为飞书客户端浅色主题和深色主题添加 RGBA 语法。用于在组件 JSON 中设置颜色属性。支持添加多个自定义颜色对象。
        "cus-0": {
          "light_mode": "rgba(5,157,178,0.52)", // 浅色主题下的自定义颜色语法
          "dark_mode": "rgba(78,23,108,0.49)" // 深色主题下的自定义颜色语法
        }
      }
    }
  }
}
```
`config` 下的各字段说明如下表所示。

字段名称 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
streaming_mode | 否 | Boolean | false | 卡片是否处于流式更新模式。详情参考[流式更新卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/streaming-updates-openapi-overview)。
streaming_config | 否 | object | / | 流式更新相关配置。详情参考[流式更新卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/streaming-updates-openapi-overview)。
summary | 否 | Object | / | 自定义摘要信息配置。即飞书客户端聊天栏消息预览中的文案。
content | 否 | String | 无 | 摘要文本。当 `streaming_mode` 为 `true` 时，该字段默认为“生成中”。支持自定义。
i18n_content | 否 | Object | / | 摘要文本的多语言配置。详情参考[局部国际化配置](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configure-multi-language-content)。
enable_forward | 否 | Boolean | true | 是否允许转发卡片。取值：<br>- true：允许<br>- false：不允许
update_multi | 否 | Boolean | true | 是否为共享卡片。取值：<br>- true：是共享卡片，更新卡片的内容对所有收到这张卡片的人员可见。<br>- false：非共享卡片，仅操作用户可见卡片的更新内容。
width_mode | 否 | String | default | 卡片宽度模式。取值：<br>- default：默认宽度。PC 端宽版、iPad 端上的宽度上限为 600px。<br>- compact：紧凑宽度 400px<br>- fill：自适应屏幕宽度<br>注意：卡片搭建工具上暂时不支持 `width_mode` 属性。
use_custom_translation | 否 | Boolean | false | 是否使用自定义翻译数据。取值：<br>- true：在用户点击消息翻译后，使用 i18n 对应的目标语种作为翻译结果。若 i18n 取不到，则使用当前内容请求飞书的机器翻译。<br>- false：不使用自定义翻译数据，直接请求飞书的机器翻译。
enable_forward_interaction | 否 | Boolean | false | 转发的卡片是否仍然支持回传交互。
style | 否 | Object | 空 | 添加自定义字号和颜色。可应用于组件的 JSON 数据中，设置字号和颜色属性。
text_size | 否 | Object | 空 | 分别为移动端和桌面端添加自定义字号，同时添加兜底字号。用于在普通文本组件和富文本组件 JSON 中设置字号属性。支持添加多个自定义字号对象。详情参考[普通文本](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/plain-text)组件和[富文本（Markdown）](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/rich-text)组件。
color | 否 | Object | 空 | 分别为飞书客户端浅色主题和深色主题添加 RGBA 语法。用于在组件 JSON 中设置颜色属性。支持添加多个自定义颜色对象。详情参考[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。

### 卡片全局跳转链接 `card_link`

`card_link` 字段用于指定卡片整体的点击跳转链接。你可以配置一个默认链接，也可以分别为 PC 端、Android 端、iOS 端配置不同的跳转链接。

```json
"card_link": {
    // 指定卡片整体的跳转链接。
    "url": "https://www.baidu.com", // 默认链接地址。未配置指定端地址时，该配置生效。
    "android_url": "https://developer.android.com/",
    "ios_url": "https://developer.apple.com/",
    "pc_url": "https://www.windows.com"
  }
```
card_link 下的各字段说明如下表所示。
**注意事项**：**注意**
-   url 和各端的链接（android_url、ios_url、pc_url）必填其中一个。如果不填写 url，则必须完整填写 android_url、ios_url、pc_url 三个字段。如果同时填写了 url 和 android_url、ios_url、pc_url，url 字段生效。
- 如果需要禁止某端进行跳转，可以将对应的参数值配置为 `lark://msgcard/unsupported_action`。

字段名称 | 是否必填 | 类型 | 说明
---|---|---|---
url | 否 | String | 默认的链接地址。
pc_url | 否 | String | PC 端的链接地址。
ios_url | 否 | String | iOS 端的链接地址。
android_url | 否 | String | Android 端的链接地址。

### 卡片标题 `header`

`header` 字段用于配置卡片的标题。了解`header` 字段说明，参见[标题组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/title)。
```json
  "header": {}  // 卡片标题
```

### 卡片正文 `body`

在卡片的`body`字段中，你需要添加卡片组件作为卡片正文内容，组件将按数组顺序纵向流式排列。了解卡片组件，参考[卡片 JSON 2.0 版本组件概述](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/component-json-v2-overview)。

在卡片 JSON  2.0 结构中，所有组件（标题组件除外）和元素（如 tag 为 plain_text 的文本元素）新增 element_id 属性，作为操作组件或元素的唯一标识。在同一张卡片内，该字段的值全局唯一。仅允许使用字母、数字和下划线，必须以字母开头，不得超过 20 字符。
```json
{
    "body": { // 卡片正文。
        "elements": [ // 在此传入各个组件的 JSON 数据，组件将按数组顺序纵向流式排列。
            {
                "tag": "xxx", // 组件的标签。
                "element_id": "custom_id" // 操作组件的唯一标识。
            }
        ]
    }
}
```
