# 配置卡片多语言

Source URL: https://open.feishu.cn/document/feishu-cards/configure-multi-language-content
Updated: 2025-08-12

# 配置卡片多语言

飞书卡片支持多语言设置。设置多语言后，卡片将根据用户的飞书客户端语言，自动展示对应语言的卡片内容，满足国际化业务需求。本文档介绍如何使用卡片 JSON 代码配置多语言。

## 使用场景

使用卡片 JSON 代码配置多语言，你可以选择对卡片局部或全局进行多语言配置。其含义和场景如下所示。
**注意事项**：如果你同时设置了局部和全局的多语言，卡片将优先生效全局的多语言配置。

配置方式 | 描述 | 限制
---|---|---
为卡片局部配置多语言 | 根据业务需要，在卡片中为部分文本、图片等属性配置多语言。推荐你选择局部多语言的配置方式，无需添加完整卡片 JSON 代码，配置多语言更便捷。 | [发送仅特定人可见的消息卡片](https://open.feishu.cn/document/ukTMukTMukTM/uETOyYjLxkjM24SM5IjN)接口不支持为卡片局部配置多语言。
为卡片全局配置多语言 | 为整张卡片内容配置多语言。你需在语种字段下添加完整卡片 JSON 代码。 | [卡片 JSON 2.0 结构](uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)不支持为卡片全局配置多语言。

## 注意事项

如果用户本地的语言环境不在消息卡片多语言配置范围内，则默认展示已有的语言。例如，卡片同时配置了中文与英文多语言，但用户本地为日文环境，则飞书客户端默认会展示英文卡片内容。

## 支持语种

卡片支持 16 种语言的配置，包括英文、简体中文、繁体中文（香港）、繁体中文（台湾）、日语、印尼语、越南语、泰语、葡萄牙语、西班牙语、韩语、德语、法语、意大利语、俄语和马来语。

### 注意事项

- 如果你同时设置了局部和全局的多语言，卡片将优先生效全局的多语言配置。
- [卡片 JSON 2.0 结构](uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)不支持为卡片全局配置多语言。
- [发送仅特定人可见的消息卡片](ukTMukTMukTM/uETOyYjLxkjM24SM5IjN)接口不支持为卡片局部配置多语言。

### 为卡片局部配置多语言

你可为卡片中指定组件的文本和图片配置多语言，实现在不同语言环境下，卡片部分内容不同的效果。

卡片支持的多语言字段描述如下表所示。

字段 | 对应的多语言字段 | 适用场景 | 字段描述
---|---|---|---
content | i18n_content | 当组件中含有文本标签时（即含有 tag 为 plain_text、lark_md 或 markdown 的属性），其对应的 content 字段支持配置多语言。 | 文本内容。
default_value | i18n_default_value | default_value 为输入框组件中的属性，用于为用户设置输入框中的默认预填写的内容。 | 输入框中为用户预填写的内容。
img_key | i18n_img_key | - 图片、多图选择、多图混排组件中的 img_key 属性<br>- 图标（icon）属性中的 img_key 属性 | 图片资源的 Key。你可调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口或在飞书卡片搭建工具中上传图片，获取图片的 key。
file_key | i18n_file_key_key | - 音频组件中的 file_key 属性 | 文件资源的 Key。你可调用[上传文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/create)接口上传音频，获取音频的 key。详情参考[音频](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/audio)组件文档。

要配置多语言，你需要在指定组件的 JSON 代码中，添加对应的 i18n 字段和语言字段（如`en_us`）。以下为在富文本组件中添加多语言文本示例：

```json
{
  "tag": "markdown",
  "content": "*斜体*\n**粗体**\n~~删除线~~\n文字链接\n差异化跳转\n",
  "i18n_content": {  
    "en_us": "*Italic*\n**Bold**\n~~Strikethrough~~\n[Text Link](URL)\n[Differentiated Jump](URL)",   // 英文 
    "zh_cn": "",  // 简体中文
    "zh_hk": "",  // 繁体中文（香港）
    "zh_tw": "",  // 繁体中文（台湾）
    "ja_jp": "",  // 日语
    "id_id": "",  // 印尼语
    "vi_vn": "",  // 越南语
    "th_th": "",  // 泰语
    "pt_br": "",  // 葡萄牙语
    "es_es": "",  // 西班牙语
    "ko_kr": "",  // 韩语
    "de_de": "",  // 德语
    "fr_fr": "",  // 法语
    "it_it": "",  // 意大利语
    "ru_ru": "",  // 俄语
    "ms_my": "",  // 马来语    
  }
}
```

#### 代码示例

以下示例中，卡片的标题、普通文本、富文本和图片组件中的文本属性和图片属性配置了多语言，实现的效果如下所示：

```json
{
  "header": {
    "template": "orange",
    "title": {
      "tag": "plain_text",
      "i18n_content": {
        "en_us": "Check-in reminder",
        "zh_cn": "会议室签到提醒"
      }
    }
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "content": "签到时间到，你可以签到了",
        "i18n_content": {
          "en_us": "It's time! You can check in now"
        },
        "text_size": "normal",
        "tag": "plain_text"
      }
    },
    {
      "tag": "markdown",
      "content": "**会议室**\n北京-xxx-F1",
      "i18n_content": {
        "en_us": "**Room**\nBeijing-xxx-F1"
      }
    },
    {
      "tag": "markdown",
      "content": "**日程主题**\n<a href='https://open.feishu.cn'>卡片支持局部多语言-产研评审</a>\n12月26日(周二) 下午2:00(GMT+8)",
      "i18n_content": {
        "en_us": "**Subject**\n<a href='https://open.feishu.cn'>卡片支持局部多语言-产研评审</a>\n12月26日(周二) 下午2:00(GMT+8)"
      }
    },
    {
      "tag": "img",
      "img_key": "img_v3_02ce_257576e4-7fce-4eab-9173-1db6655ab28g",
      "i18n_img_key": {
        "en_us": "img_v3_02ce_0980b834-4ad8-45ce-b953-40375e8c19fg"
      },
      "preview": true,
      "transparent": false,
      "scale_type": "fit_horizontal",
      "alt": {
        "tag": "plain_text",
        "content": ""
      }
    }
  ]
}
```
### 为卡片全局配置多语言

要对卡片全局设置多语言，你需要分别为卡片正文和卡片标题配置多语言。即你需要在卡片的 `i18n_elements` 字段和 `header` 的`i18n` 字段下添加语种对应的完整卡片 JSON 代码。

#### 为卡片正文配置多语言

在飞书卡片的 JSON 结构中，你需要用 `i18n_elements` 替代 `elements`，在该字段下添加语种对应的完整正文卡片 JSON。

```json
"i18n_elements": {
  // 正文的多语言配置。你可以在每个语种下配置完整卡片，卡片将根据用户的飞书客户端语言，自动展示对应语言的卡片内容。
  "en_us": [
    {}
  ], // 英文
  "zh_cn": [
    {}
  ], // 简体中文
  "zh_hk": [
    {}
  ], // 繁体中文（香港）
  "zh_tw": [
    {}
  ], // 繁体中文（台湾）
  "ja_jp": [
    {}
  ], // 日语
  "id_id": [
    {}
  ], // 印尼语
  "vi_vn": [
    {}
  ], // 越南语
  "th_th": [
    {}
  ], // 泰语
  "pt_br": [
    {}
  ], // 葡萄牙语
  "es_es": [
    {}
  ], // 西班牙语
  "ko_kr": [
    {}
  ], // 韩语
  "de_de": [
    {}
  ], // 德语
  "fr_fr": [
    {}
  ], // 法语
  "it_it": [
    {}
  ], // 意大利语
  "ru_ru": [
    {}
  ], // 俄语
  "ms_my": [
    {}
  ] // 马来语
}
```

#### 为卡片标题配置多语言

如果卡片添加了标题组件，那么你需要同步配置标题的多语言属性，即在 `header` 字段中，分别为卡片标题、卡片副标题、标题后缀标签字段中添加对应的多语言属性。关于标题组件的 JSON 参数详情，参考[标题组件](uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/title)。

```json
{
  "header": {
    "template": "blue",
    "title": {
      "tag": "plain_text",
      "content": "示例标题",
      "i18n": {
        // 卡片主标题多语言配置。必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。
        "zh_cn": "", // 简体中文
        "en_us": "", // 英文
        "zh_hk": "", // 繁体中文（香港）
        "zh_tw": "", // 繁体中文（台湾）
        "ja_jp": "", // 日语
        "id_id": "", // 印尼语
        "vi_vn": "", // 越南语
        "th_th": "", // 泰语
        "pt_br": "", // 葡萄牙语
        "es_es": "", // 西班牙语
        "ko_kr": "", // 韩语
        "de_de": "", // 德语
        "fr_fr": "", // 法语
        "it_it": "", // 意大利语
        "ru_ru": "", // 俄语
        "ms_my": "" // 马来语
      }
    },
    "subtitle": {
      "tag": "plain_text",
      "content": "示例文本",
      "i18n": {
        // 卡片副标题多语言配置。必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。
        "zh_cn": "", // 简体中文
        "en_us": "", // 英文
        "zh_hk": "", // 繁体中文（香港）
        "zh_tw": "", // 繁体中文（台湾）
        "ja_jp": "", // 日语
        "id_id": "", // 印尼语
        "vi_vn": "", // 越南语
        "th_th": "", // 泰语
        "pt_br": "", // 葡萄牙语
        "es_es": "", // 西班牙语
        "ko_kr": "", // 韩语
        "de_de": "", // 德语
        "fr_fr": "", // 法语
        "it_it": "", // 意大利语
        "ru_ru": "", // 俄语
        "ms_my": "" // 马来语
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
      "zh_cn": [
        {}
      ], // 简体中文
      "en_us": [
        {}
      ], // 英文
      "zh_hk": [
        {}
      ], // 繁体中文（香港）
      "zh_tw": [
        {}
      ], // 繁体中文（台湾）
      "ja_jp": [
        {}
      ], // 日语
      "id_id": [
        {}
      ], // 印尼语
      "vi_vn": [
        {}
      ], // 越南语
      "th_th": [
        {}
      ], // 泰语
      "pt_br": [
        {}
      ], // 葡萄牙语
      "es_es": [
        {}
      ], // 西班牙语
      "ko_kr": [
        {}
      ], // 韩语
      "de_de": [
        {}
      ], // 德语
      "fr_fr": [
        {}
      ], // 法语
      "it_it": [
        {}
      ], // 意大利语
      "ru_ru": [
        {}
      ], // 俄语
      "ms_my": [
        {}
      ] // 马来语
    }
  }
}
```

#### 代码示例

以下为配置了全局多语言的卡片 JSON 代码示例。该示例在中文和英文的飞书客户端中的效果如下图所示：

```json
{
  "header": {
    "template": "blue",
    "title": {
      "tag": "plain_text",
      "i18n": {
        "en_us": "English template",
        "ja_jp": "日本語テンプレート",
        "zh_hk": "繁體中文（中國香港）",
        "zh_tw": "繁體中文（中國臺灣）",
        "zh_cn": "中文模板"
      }
    }
  },
  "i18n_elements": {
    "en_us": [
      {
        "tag": "markdown",
        "content": "English template"
      }
    ],
    "ja_jp": [
      {
        "tag": "markdown",
        "content": "日本語テンプレート"
      }
    ],
    "zh_hk": [
      {
        "tag": "markdown",
        "content": "繁體中文（中國香港）"
      }
    ],
    "zh_tw": [
      {
        "tag": "markdown",
        "content": "繁體中文（中國臺灣）"
      }
    ],
    "zh_cn": [
      {
        "tag": "markdown",
        "content": "中文模板"
      }
    ]
  }
}
```
