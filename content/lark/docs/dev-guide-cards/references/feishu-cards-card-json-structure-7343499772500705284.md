# 卡片 JSON 1.0 结构

Source URL: https://open.feishu.cn/document/feishu-cards/card-json-structure
Updated: 2024-12-18

# 卡片 JSON 1.0 结构

本文档介绍卡片 JSON 1.0 的结构和属性。了解卡片 JSON 2.0 的结构和属性，参考[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)。

## 属性概述

卡片全局的字段包括全局行为设置、跳转链接设置、多语言设置、降级规则配置、标题组件配置和其它组件配置。
各个字段说明如下所示。
若这些字段均不传，则卡片 JSON 为 "{}"。飞书开放平台支持发送卡片 JSON 为 "{}" 的空白卡片。

字段 | 是否支持在搭建工具中设置 | 是否必填 | 描述
---|---|---|---
行为设置 `config` | 否 | 否 | `config` 用于配置卡片的全局行为，包括是否允许被转发、是否为共享卡片等。
跳转链接 `card_link` | 是 | 否 | `card_link` 字段用于指定卡片整体的点击跳转链接。你可以配置一个默认链接，也可以分别为 PC 端、Android 端、iOS 端配置不同的跳转链接。
多语言设置 `i18n_elements` 等 | 是 | 否 | 飞书卡片支持多语言设置。设置多语言后，卡片将根据用户的飞书客户端语言，自动展示对应语言的卡片内容，满足国际化业务需求。详情参考[配置卡片多语言](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configure-multi-language-content)。
标题组件 `header` | 是 | 否 | 标题组件 JSON 代码。详细字段说明参考[标题组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/title)。
其它组件 `elements` | 是 | 否 | 在 `elements` 字段中添加各个组件的 JSON 数据，组件将按数组顺序纵向流式排列。了解各个组件，参考[组件概述](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/component-overview)。
降级规则 `fallback` | 否 | 否 | `fallback` 用于为卡片添加全局降级规则。触发降级时，卡片将全局展示“请升级客户端至最新版本后查看”占位图。<br>**注意**：<br>该字段要求飞书客户端的版本为 V7.7 及以上。

## JSON 结构

以下为卡片整体的 JSON 代码结构。

```json
{
  "config": {
    "enable_forward": true, // 是否支持转发卡片。默认值 true。
    "update_multi": true, // 是否为共享卡片。为 true 时即更新卡片的内容对所有收到这张卡片的人员可见。默认值 false。
    "width_mode": "fill", // 卡片宽度模式。支持 "compact"（紧凑宽度 400px）模式、"fill"（撑满聊天窗口宽度）模式和 "default" 默认模式(宽度上限为 600px)。
    "compact_width": true, // 已废弃字段。是否为紧凑型卡片宽度。与 width_mode 属性同时设置时，width_mode 将生效。
    "use_custom_translation": false, // 是否使用自定义翻译数据。默认值 false。为 true 时则在用户点击消息翻译后，使用 i18n 对应的目标语种作为翻译结果。若 i18n 取不到，则使用当前内容请求翻译，不使用自定义翻译数据。
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
  "header": {}, // 卡片标题。
  "elements": [
    {}
  ], // 用于传入各个组件的 JSON 数据，组件将按数组顺序纵向流式排列。
  "i18n_elements": {
    // 除标题外其它组件的多语言配置。你可在每个语种下配置完整卡片，卡片将根据用户的飞书客户端语言，自动展示对应语言的卡片内容。
    "en_us": [{}], // 英文
    "zh_cn": [{}], // 简体中文
    "zh_hk": [{}], // 繁体中文（香港）
    "zh_tw": [{}], // 繁体中文（台湾）
    "ja_jp": [{}], // 日语
    "id_id": [{}], // 印尼语
    "vi_vn": [{}], // 越南语
    "th_th": [{}], // 泰语
    "pt_br": [{}], // 葡萄牙语
    "es_es": [{}], // 西班牙语
    "ko_kr": [{}], // 韩语
    "de_de": [{}], // 德语
    "fr_fr": [{}], // 法语
    "it_it": [{}], // 意大利语
    "ru_ru": [{}], // 俄语
    "ms_my": [{}] // 马来语
  },
  "fallback": {
    // 在此处为卡片添加降级规则。触发降级时，卡片将全局展示“请升级客户端至最新版本后查看”占位图。
    // 该字段要求飞书客户端的版本为 V7.7 及以上。
    "trigger_conditions": [
      // 触发规则，满足以下任一条件时，触发降级。
      { // 条件一：设置最低客户端版本。当用户的客户端版本低于该设置时，触发降级。
        "type": "min_client_version",
        "value": "7.4"
      },
      {
        // 条件二：指定组件。当用户的飞书客户端版本低于这些组件支持的最低客户端版本时，触发降级。
        "type": "element_tags",
        "value": [
          ""
        ]
      }
    ]
  }
}
```

## 字段说明

本小节详细描述卡片结构中的各个字段。

### 卡片全局行为设置 `config`

`config` 字段用于配置卡片的全局行为，包括是否允许被转发、是否为共享卡片等。
**注意事项**：基于搭建工具生成的卡片模板（template）暂不支持自定义 `config` 字段。

```json
{
  "config": {
    "enable_forward": true, // 是否支持转发卡片。默认值 true。
    "update_multi": true, // 是否为共享卡片。为 true 时即更新卡片的内容对所有收到这张卡片的人员可见。默认值 false。
    "width_mode": "fill", // 卡片宽度模式。支持 "compact"（紧凑宽度 400px）模式、"fill"（撑满聊天窗口宽度）模式和 "default" 默认模式(宽度上限为 600px)。
    "compact_width": true, // 已废弃字段。是否为紧凑型卡片宽度。与 width_mode 属性同时设置时，width_mode 将生效。
    "use_custom_translation": false, // 是否使用自定义翻译数据。默认值 false。为 true 时则在用户点击消息翻译后，使用 i18n 对应的目标语种作为翻译结果。若 i18n 取不到，则使用当前内容请求翻译，不使用自定义翻译数据。
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
enable_forward | 否 | Boolean | true | 是否允许转发卡片。取值：<br>- true：允许<br>- false：不允许<br>**注意**：<br>该字段要求飞书客户端的版本为 V3.31.0 及以上。
update_multi | 否 | Boolean | false | 是否为共享卡片。取值：<br>- true：是共享卡片，更新卡片的内容对所有收到这张卡片的人员可见。<br>- false：非共享卡片，仅操作用户可见卡片的更新内容。
width_mode | 否 | String | default | 卡片宽度模式。取值：<br>- default：默认宽度。PC 端宽版、iPad 端上的宽度上限为 600px。<br>- compact：紧凑宽度模式。PC 端宽版、iPad 端上的宽度上限为 400px。<br>- fill：撑满聊天窗口宽度。
compact_width（已废弃） | 否 | Boolean | false | 是否为紧凑型卡片的宽度（400px）。该字段已废弃。<br>**注意**：`width_mode` 与 `compact_width` 属性同时设置时，`width_mode` 属性将生效。
use_custom_translation | 否 | Boolean | false | 是否使用自定义翻译数据。取值：<br>- true：在用户点击消息翻译后，使用 i18n 对应的目标语种作为翻译结果。若 i18n 取不到，则使用当前内容请求飞书的机器翻译。<br>- false：不使用自定义翻译数据，直接请求飞书的机器翻译。
enable_forward_interaction | 否 | Boolean | false | 转发的卡片是否仍然支持回传交互。
style | 否 | Object | 空 | 添加自定义字号和颜色。可应用于组件的 JSON 数据中，设置字号和颜色属性。
└ text_size | 否 | Object | 空 | 分别为移动端和桌面端添加自定义字号。用于在普通文本组件和富文本组件 JSON 中设置字号属性。支持添加多个自定义字号对象。详情参考[普通文本组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/plain-text)和[富文本组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/rich-text)。
└ color | 否 | Object | 空 | 分别为飞书客户端浅色主题和深色主题添加 RGBA 语法。用于在组件 JSON 中设置颜色属性。支持添加多个自定义颜色对象。详情参考[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。

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

`header` 字段用于配置卡片的标题。了解`header` 字段说明，参见[标题组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/title)。
```json
  "header": {},  // 卡片标题
```

### 卡片正文 `elements`

在卡片的`elements` 字段中，你需要添加卡片组件作为卡片正文内容，组件将按数组顺序纵向流式排列。了解卡片组件，参考[组件概述](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/component-overview)。
```json
  "elements": [{...}] // 用于传入各个组件的 JSON 数据，组件将按数组顺序纵向流式排列。
```

### 卡片多语言设置 `i18n_elements` 等

飞书卡片支持多语言设置。设置多语言后，卡片将根据用户的飞书客户端语言，自动展示对应语言的卡片内容，满足国际化业务需求。本小节介绍多语言设置相关的 JSON 结构，详细步骤可参见[配置卡片多语言](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configure-multi-language-content)。

#### **卡片标题多语言设置**

卡片标题多语言相关字段有：`title.i18n`、`subtitle.i18n` 和 `i18n_text_tag_list`。详情参考以下代码中相关字段的注释。
```json
{
  "header": {
    "title": {
      "tag": "plain_text",
      "content": "示例标题",
      "i18n": {
        // 卡片主标题多语言配置。必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。
        "zh_cn": "",
        "en_us": "",
        "ja_jp": "",
        "zh_hk": "",
        "zh_tw": ""
      }
    },
    "subtitle": {
      "tag": "plain_text",
      "content": "示例文本",
      "i18n": {
        // 卡片副标题多语言配置。必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。
        "zh_cn": "",
        "en_us": "",
        "ja_jp": "",
        "zh_hk": "",
        "zh_tw": ""
      }
    },
    "text_tag_list": [
      {
        "tag": "text_tag",
        "text": {
          // 标签内容
          "tag": "plain_text",
          "content": "标签 1"
        },
        "color": "neutral"
      }
    ],
    "i18n_text_tag_list": {
      // 标题后缀标签多语言配置。每个语言环境最多设置 3 个 tag，超出不展示。如果同时配置仅生效 i18n_text_tag_list。
      "zh_cn": [],
      "en_us": [],
      "ja_jp": [],
      "zh_hk": [],
      "zh_tw": []
    },
    "template": "blue",
    "icon": {
      "img_key": "img_v2_38811724"
    },
    "ud_icon": {
      "token": "chat-forbidden_outlined",
      "style": {
        "color": "red"
      }
    }
  }
}
```

#### **卡片正文多语言设置**

卡片的 `i18n_elements` 字段用于为卡片正文的组件配置多语言。
```json
  "i18n_elements": {
    // 卡片正文的多语言配置。你可在每个语种下配置完整卡片，卡片将根据用户的飞书客户端语言，自动展示对应语言的卡片内容。
    "en_us": [{}], // 英文
    "zh_cn": [{}], // 简体中文
    "zh_hk": [{}], // 繁体中文（香港）
    "zh_tw": [{}], // 繁体中文（台湾）
    "ja_jp": [{}], // 日语
    "id_id": [{}], // 印尼语
    "vi_vn": [{}], // 越南语
    "th_th": [{}], // 泰语
    "pt_br": [{}], // 葡萄牙语
    "es_es": [{}], // 西班牙语
    "ko_kr": [{}], // 韩语
    "de_de": [{}], // 德语
    "fr_fr": [{}], // 法语
    "it_it": [{}], // 意大利语
    "ru_ru": [{}], // 俄语
    "ms_my": [{}] // 马来语
  }
```

### 卡片全局降级规则 `fallback`

在构建卡片时，若使用仅在较新版本客户端中支持的组件，那么在低版本的飞书客户端上，该组件将显示“请升级至飞书最新版本以查看内容”的提示。如果这类组件较多，不仅会丢失卡片的信息，还会降低卡片的视觉效果，影响用户体验。

为避免上述问题出现，你可以通过配置 `fallback` 字段为卡片添加以下降级规则，当满足以下任一规则时，将触发卡片降级并展示系统默认的卡片样式：
- 当用户的飞书客户端版本低于你指定的最低客户端版本时；
- 当用户的飞书客户端版本低于你指定的组件所支持的最低客户端版本时。

相关 JSON 结构如下所示：

```json
"fallback": {
  // 在此处为卡片添加降级规则。触发降级时，卡片将全局展示“请升级客户端至最新版本后查看”占位图。
  // 该字段要求飞书客户端的版本为 V7.7 及以上。
  "trigger_conditions": [
    // 触发规则，满足以下任一条件就触发降级。
    { // 条件一：设置最低客户端版本。当用户的客户端版本低于该设置时，触发降级。
      "type": "min_client_version",
      "value": "7.4"
    },
    {
      // 条件二：指定组件。当用户的飞书客户端版本低于这些组件支持的最低客户端版本时，触发降级。
      "type": "element_tags",
      "value": [
        ""
      ]
    }
  ]
}
```
`fallback` 下的各字段说明如下表所示。

字段名称 | 是否必填 | 类型 | 示例值 | 说明
---|---|---|---|---
trigger_conditions | 否 | Array | / | 触发降级的条件数组。满足其中的任一条件就触发降级。
└ type | 否 | String | "min_client_version" | 条件类型。可选值：<br>- <code>min_client_version</code>：设置最低客户端版本，当用户的客户端版本低于该设置时，触发降级；<br>- <code>element_tags</code>：指定组件。当用户的飞书客户端版本低于这些组件支持的最低客户端版本时，触发降级。
└ value(当 type 为 "min_client_version"时) | 否 | String | "v7.4.1" | 最低飞书客户端版本的值，写法需符合以下格式之一：<br>- 7.4、7.4.1、7.4.1-xxx<br>- v7.4、v7.4.1、v7.4.1-xxx<br>- v7.3.7（0.103）<br>- v7.4.0-dev.d2666af5（0.14）<br></ul>
└ value(当 type 为 "element_tags"时) | 否 | Array | ["table"] | 指定组件。当用户的飞书客户端版本低于这些组件支持的最低客户端版本时，触发降级。
