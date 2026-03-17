# 富文本（Markdown）

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/content-components/rich-text
Updated: 2025-04-08

# 富文本组件

卡片的富文本（Markdown）组件支持渲染表情、表格、图片、代码块、分割线等元素。

本文档介绍富文本组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[富文本（Markdown）](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/rich-text)。

## 注意事项

富文本组件中的标题、引用、行内引用、表格、数字角标等语法仅支持在 [JSON 2.0 结构的富文本组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/rich-text)中使用。

## 组件属性

### JSON 结构

富文本组件的完整 JSON 1.0 数据如下所示：
```json
{
  "tag": "markdown",
  "text_size": "heading", // 文本大小。默认值 normal。
  "text_align": "center", // 文本对齐的方式。默认值 left。
  "icon": {
    // 前缀图标。
    "tag": "standard_icon", // 图标类型。
    "token": "chat-forbidden_outlined", // 图标的 token。仅在 tag 为 standard_icon 时生效。
    "color": "orange", // 图标颜色。仅在 tag 为 standard_icon 时生效。
    "img_key": "img_v2_38811724" // 图片的 key。仅在 tag 为 custom_icon 时生效。
  },
  "href": {
    // 在此处配置差异化跳转链接，声明 href 参数的变量，实现“不同设备跳转链接不同”的效果。2.0 结构不再支持该语法。
    "urlVal": {
      // 变量名
      "url": "xxx", // 默认链接地址
      "pc_url": "xxx", // PC 端链接地址
      "ios_url": "xxx", // iOS 端链接地址
      "android_url": "xxx" // Android 端链接地址
    }
  },
  "content": "notation字号\n标准emoji 😁😢🌞💼🏆❌✅\n*斜体*\n**粗体**\n~~删除线~~\n[差异化跳转]($urlVal)\n<at id=all></at>" // 采用 mardown 语法编写的内容。2.0 结构不再支持 "[差异化跳转]($urlVal)" 语法
}
```

### 字段说明

富文本组件包含的参数说明如下表所示。

字段名称 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | / | 组件的标签。富文本组件固定取值为 `markdown`。
text_align | 否 | String | left | 设置文本内容的对齐方式。可取值有：<br>* left：左对齐<br>* center：居中对齐<br>* right：右对齐
text_size | 否 | String | normal | 文本大小。可取值如下所示。如果你填写了其它值，卡片将展示为 `normal` 字段对应的字号。<br>- heading-0：特大标题（30px）<br>- heading-1：一级标题（24px）<br>- heading-2：二级标题（20 px）<br>- heading-3：三级标题（18px）<br>- heading-4：四级标题（16px）<br>- heading：标题（16px）<br>- normal：正文（14px）<br>- notation：辅助信息（12px）<br>- xxxx-large：30px<br>- xxx-large：24px<br>- xx-large：20px<br>- x-large：18px<br>- large：16px<br>- medium：14px<br>- small：12px<br>- x-small：10px
icon | 否 | Object | / | 添加图标作为文本前缀图标。支持自定义或使用图标库中的图标。
└ tag | 否 | String | / | 图标类型的标签。可取值：<br>-   `standard_icon`：使用图标库中的图标。<br>-   `custom_icon`：使用用自定义图片作为图标。
└ token | 否 | String | / | 图标库中图标的 token。当 `tag` 为 `standard_icon` 时生效。枚举值参见[图标库](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-icons)。
└ color | 否 | String | / | 图标的颜色。支持设置线性和面性图标（即 token 末尾为 `outlined` 或 `filled` 的图标）的颜色。当 `tag` 为 `standard_icon` 时生效。枚举值参见[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。
└ img_key | 否 | String | / | 自定义前缀图标的图片 key。当 `tag` 为 `custom_icon` 时生效。<br>图标 key 的获取方式：调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口，上传用于发送消息的图片，并在返回值中获取图片的 image_key。
href | 否 | Object | / | 配置差异化跳转链接，实现“不同设备跳转链接不同”的效果。JSON 2.0 结构不再支持该语法。
└ urlVal | 否 | Object | / | URL 的变量。
└ └ url | 是 | String | "https://www.baidu.com" | 默认的链接地址。
└ └ pc_url | 否 | String | "https://developer.android.com" | PC 端的链接地址。
└ └ ios_url | 否 | String | "https://developer.apple.com" | iOS 端的链接地址。
└ └ android_url | 否 | String | "https://www.windows.com" | Android 端的链接地址。
content | 是 | String | / | Markdown 文本内容。了解支持的语法，参考下文。

### 示例代码

以下的 JSON 示例代码可实现如下图所示的卡片效果：

```json
{
  "i18n_elements": {
    "zh_cn": [
      {
        "tag": "markdown",
        "content": "标准emoji 😁😢🌞💼🏆❌✅\n飞书emoji :OK::THUMBSUP:\n*斜体* **粗体** ~~删除线~~ \n这是红色文本\n<text_tag color='blue'>标签</text_tag>\n[文字链接](https://open.feishu.cn/document/home/index)\n<link icon='chat_outlined' url='https://open.feishu.cn' pc_url='' ios_url='' android_url=''>带图标的链接</link>\n<at id=all></at>\n- 无序列表1\n    - 无序列表 1.1\n- 无序列表2\n1. 有序列表1\n    1. 有序列表 1.1\n2. 有序列表2\n```JSON\n{\"This is\": \"JSON demo\"}\n```",
        "text_align": "left",
        "text_size": "normal"
      }
    ]
  }
}
```

## 支持的 Markdown 语法

[卡片 JSON 1.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-structure)仅支持 Markdown 语法的子集，详情参见下表。

[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)支持除 `SetextHeading`、`CodeBlock` 和 `HTMLBlock` 外所有标准的 Markdown 语法，以及部分 HTML 语法。详情参考[卡片 JSON 2.0 版本更新说明](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-breaking-changes-release-notes)。

名称 | 语法 | 效果 | 注意事项
---|---|---|---
换行 | ```<br>第一行<br />第二行<br>第一行<br>第二行<br>``` | 第一行<br>第二行 | - 如果你使用卡片 JSON 构建卡片，也可使用字符串的换行语法 `\n` 换行。<br>- 如果你使用卡片搭建工具构建卡片，也可使用回车键换行。
斜体 | ```<br>*斜体*<br>``` | *斜体* | 无
加粗 | ```<br>**粗体**<br>或<br>__粗体__<br>``` | __粗体__ | 不要连续使用 4 个 `*` 或 `_` 加粗。该语法不规范，可能会导致渲染不正确。
删除线 | ```<br>~~删除线~~<br>``` | ~~删除线~~ | 无
@指定人 | ```<br><at id=open_id></at><br><at id=user_id></at><br><at ids=id_01,id_02,xxx></at><br><at email=test@email.com></at><br>``` | @用户名 | - [自定义机器人](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)仅支持使用 `open_id`、`user_id` @指定人。<br>- 支持使用 `<at ids=id_01,id_02,xxx></at>` 传入多个 ID，使用 `,` 连接。<br>- 了解如何获取 user_id、open_id，参考[如何获取不同的用户 ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)。
@所有人 | ```<br><at id=all></at><br>``` | @所有人 | @所有人需要群主开启权限。若未开启，卡片将发送失败。
超链接 | ```<br><a href='https://open.feishu.cn'><br></a><br>``` | [https://open.feishu.cn](https://open.feishu.cn) | 超链接必须包含 schema 才能生效，目前仅支持 HTTP 和 HTTPS。
彩色文本样式 | ```<br>这是一个绿色文本 <br>这是一个红色文本<br>这是一个灰色文本<br>``` | <br><br> | * 彩色文本样式不支持对链接中的文本生效<br>* color 取值：<br>-   **default**：默认的白底黑字样式<br>- 卡片支持的颜色枚举值和 RGBA 语法自定义颜色。参考[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)
可点击的电话号码 | ```<br>[文本展示的电话号码或其他文案内容](tel://移动端弹窗唤起的电话号码)<br>``` |  | 该语法仅在移动端生效。
文字链接 | ```<br>[开放平台](https://open.feishu.cn/)<br>``` | [开放平台](https://open.feishu.cn/) | 超链接必须包含 schema 才能生效，目前仅支持 HTTP 和 HTTPS。
差异化跳转链接 | ```<br>{<br>"tag": "markdown",<br>"href": {<br>"urlVal": {<br>"url": "xxx",<br>"pc_url":"xxx",<br>"ios_url": "xxx",<br>"android_url": "xxx"<br>}<br>},<br>"content":<br>"[差异化跳转]($urlVal)"<br>}<br>``` | \- | * 超链接必须包含 schema 才能生效，目前仅支持 HTTP 和 HTTPS。<br>- 仅在 PC 端、移动端需要跳转不同链接时使用。
图片 | ```<br><br>``` | &nbsp; | * `hover_text` 指在 PC 端内光标悬浮（hover）图片所展示的文案。<br>* **image_key** 可以调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口获取。
分割线 | ```<br>---<br>``` |  | 分割线必须单独一行使用。即如果分割线前后有文本，你必须在分割线前后添加换行符。
飞书表情 | ```<br>:DONE:<br>``` |  | 支持的 Emoji Key 列表可以参看 [表情文案说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)。
标签 | ```<br><text_tag color='red'>标签文本</text_tag><br>``` | &nbsp; | `color`支持的枚举值范围包括：<br>- `neutral`: 中性色<br>- `blue`: 蓝色<br>- `turquoise`: 青绿色<br>- `lime`: 酸橙色<br>- `orange`: 橙色<br>- `violet`: 紫罗兰色<br>- `indigo`: 靛青色<br>- `wathet`: 天蓝色<br>- `green`: 绿色<br>- `yellow`: 黄色<br>- `red`: 红色<br>- `purple`: 紫色<br>- `carmine`: 洋红色
有序列表 | ```<br>1. 有序列表1<br>1. 有序列表 1.1<br>2. 有序列表2<br>``` | 1. 有序列表1<br>1. 有序列表 1.1<br>2. 有序列表2 | * 序号需在行首使用<br>* 4 个空格代表一层缩进<br>**注意事项**：仅在飞书 7.6 及以上版本生效。在低版本飞书客户端中，包含该语法的 Markdown 组件将展示为升级提示占位图。
无序列表 | ```<br>- 无序列表1<br>- 无序列表 1.1<br>- 无序列表2<br>``` | - 无序列表1<br>- 无序列表 1.1<br>- 无序列表2 | * 序号需在行首使用<br>* 4 个空格代表一层缩进<br>**注意事项**：仅在飞书 7.6 及以上版本生效。在低版本飞书客户端中，包含该语法的 Markdown 组件将展示为升级提示占位图。
代码块 | `````markdown<br>```JSON<br>{"This is": "JSON demo"}<br>```<br>````` | ```JSON<br>{"This is": "JSON demo"}<br>``` | * 代码块语法和代码内容需在行首使用<br>* 支持指定编程语言解析。未指定默认为 Plain Text<br>**注意事项**：仅在飞书 7.6 及以上版本生效。在低版本飞书客户端中，包含该语法的 Markdown 组件将展示为升级提示占位图。
含图标的链接 | ```<br><link icon='chat_outlined' url='https://open.feishu.cn' pc_url='' ios_url='' android_url=''>战略研讨会</link><br>``` |  | 该语法中的字段说明如下所示：<br>- `icon`：链接前缀的图标。仅支持图标库中的图标，枚举值参见[图标库](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-icons)。图标颜色固定为蓝色。可选。<br>- `url`：默认的链接地址，未按设备配置下述字段时，该配置生效。必填。<br>- `pc_url`：pc 端的链接地址，优先级高于 `url`。可选。<br>- `ios_url`：ios 端的链接地址，优先级高于 `url`。可选。<br>- `android_url`：android 端的链接地址，优先级高于 `url`。可选。<br>**注意事项**：图标仅在飞书 7.12 及以上版本生效。
人员 | `````markdown<br><person id = 'user_id' show_name = true show_avatar = true style = 'normal'></person><br>````` |  | 该语法中的字段说明如下所示：<br>- `id`：用户的 ID，支持 open_id、union_id 和 user_id。不填、为空、数据错误时展示为兜底的“未知用户”样式。了解更多，参考[如何获取不同的用户 ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)。<br>- `show_name`：是否展示用户名。默认为 true。<br>- `show_avatar`：是否展示用户头像，默认为 true。<br>- `style`：人员组件的展示样式。可选值有：<br>- `normal`：普通样式（默认）<br>- `capsule`：胶囊样式

### 特殊字符转义说明
如果要展示的字符命中了 markdown 语法使用的特殊字符（例如 `*、~、>、<` 这些特殊符号），需要对特殊字符进行 HTML 转义，才可正常展示。常见的转义符号对照表如下所示。查看更多转义符，参考 [HTML 转义通用标准](https://www.w3school.com.cn/charsets/ref_html_8859.asp)实现，转义后的格式为 `&#实体编号;`。

| **特殊字符** | **转义符** | **描述** |
| --- | --- | --- |
| ` ` | `&nbsp;	` | 不换行空格 |
| ` ` | `&ensp;` | 半角空格 |
| `  ` | `&emsp;` | 全角空格 |
| `>` | `&#62;` | 大于号 |
| `<` | `&#60;` | 小于号 |
| `~` | `&sim;` | 飘号 |
| `-` | `&#45;` | 连字符 |
| `!` | `&#33;` | 惊叹号 |
| `*` | `&#42;` | 星号 |
| `/` | `&#47;` | 斜杠 |
| `\` | `&#92;` | 反斜杠 |
| `[` | `&#91;` | 中括号左边部分 |
| `]` | `&#93;` | 中括号右边部分 |
| `(` | `&#40;` | 小括号左边部分 |
| `)` | `&#41;` | 小括号右边部分 |
| `#` | `&#35;` | 井号 |
| `:` | `&#58;` | 冒号 |
| `+` | `&#43;` | 加号 |
| `"` | `&#34;` | 英文引号 |
| `'` | `&#39;` | 英文单引号 |
| \`  | `&#96;` | 反单引号 |
| `$` | `&#36;` | 美金符号 |
| `_` | `&#95;` | 下划线 |
| `-` | `&#45;` | 无序列表 |

### 代码块支持的编程语言

富文本组件支持通过代码块语法渲染代码，支持的编程语言如下列表所示，且对大小写不敏感：
`````markdown
```JSON
{"This is": "JSON demo"}
```
`````
- plain_text 
- abap 
- ada 
- apache 
- apex 
- assembly 
- bash 
- c_sharp 
- cpp 
- c 
- cmake
- cobol 
- css 
- coffee_script 
- d 
- dart 
- delphi 
- diff 
- django 
- docker_file 
- erlang
- fortran 
- gherkin 
- go 
- graphql 
- groovy 
- html 
- htmlbars 
- http 
- haskell 
- json 
- java
- javascript 
- julia 
- kotlin 
- latex 
- lisp 
- lua 
- matlab 
- makefile 
- markdown 
- nginx 
- objective_c
- opengl_shading_language 
- php 
- perl 
- powershell 
- prolog 
- properties 
- protobuf 
- python 
- r 
- ruby
- rust 
- sas 
- scss 
- sql 
- scala 
- scheme 
- shell 
- solidity 
- swift 
- toml 
- thrift 
- typescript
- vbscript 
- visual_basic 
- xml 
- yaml
## 为移动端和桌面端定义不同的字号

在普通文本组件和富文本组件中，你可为同一段文本定义在移动端和桌面端的不同字号。相关字段描述如下表所示。

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
              "mobile": "x-large" // 移动的字号。
            }
          }
        }
      }
    }
    ```
1. 在普通文本组件或富文本组件的 `text_size` 属性中，应用自定义字号。以下为在富文本组件中应用自定义字号的示例：
    ```json
    {
      "elements": [
        {
          "tag": "markdown",
          "text_size": "cus-0", // 在此处应用自定义字号。
          "href": {
            "urlVal": {
              "url": "xxx1",
              "pc_url": "xxx2",
              "ios_url": "xxx3",
              "android_url": "xxx4"
            }
          },
          "content": "普通文本\n标准emoji😁😢🌞💼🏆❌✅\n*斜体*\n**粗体**\n~~删除线~~\n文字链接\n差异化跳转\n<at id=all></at>"
        },
        {
          "tag": "hr"
        },
        {
          "tag": "markdown",
          "content": "上面是一行分割线\n!hover_text\n上面是一个图片标签"
        }
      ],
      "header": {
        "template": "blue",
        "title": {
          "content": "这是卡片标题栏",
          "tag": "plain_text"
        }
      }
    }
    ```
