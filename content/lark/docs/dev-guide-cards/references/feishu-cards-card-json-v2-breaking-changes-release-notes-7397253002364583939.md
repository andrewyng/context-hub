# 卡片 JSON 2.0 版本更新说明

Source URL: https://open.feishu.cn/document/feishu-cards/card-json-v2-breaking-changes-release-notes
Updated: 2025-03-07

# 卡片 JSON 2.0 版本更新说明

本文档介绍卡片 JSON 2.0 版本与 1.0 版本结构之间的不兼容变更和优化说明。了解完整的 JSON 2.0 结构数据，参考[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)。

## 注意事项

- 卡片 JSON 2.0 结构支持飞书客户端 7.20 及之后版本。当使用 JSON 2.0 结构的卡片发送至低于 7.20 版本的客户端时，卡片标题可正常显示，但内容将展示兜底的升级提示文案。

  

- 卡片 JSON 2.0 结构暂时仅支持共享卡片，不支持独享卡片配置。即 `update_multi` 参数仅支持设为 `true`。

## 不兼容变更

本小节介绍卡片 JSON 2.0 版本相对于 1.0 版本所发生的不兼容变更。

### 卡片交互有效期变更

- 1.0 结构：发出卡片的可交互时间为 30 天，可更新时间为 14 天（如果在第 14-30 天交互卡片，且交互回调动作为更新卡片，更新动作将不会生效）。
- 2.0 结构：卡片可交互和可更新时间统一为 14 天。

### 属性校验变更

在 JSON 2.0 版本中，传入不支持的属性将报错。
| **1.0 结构**    | **2.0 结构**  |
| ------------- | ----------- |
| 传入不支持的属性作忽略处理 | 传入不支持的属性将报错 |

### JSON 全局结构和字段变更

- **结构变更**

    - JSON 2.0 版本新增 `body` 字段，`elements` 属性放置在 `body` 层级下。了解 2.0 整体结构，参考[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)。
    - JSON 2.0 版本不再支持通过 `i18n_elements` 字段设置全局多语言。你可通过 `i18n_content` 等局部多语言字段实现组件级别的多语言配置，详情参考[配置卡片多语言](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configure-multi-language-content)。

- **`fallback`** **字段变更**

    JSON 2.0 版本暂不支持使用 `fallback` 字段配置自定义的全局降级规则。

- **默认值变更**

   JSON 2.0 版本中的 `update_multi` 默认值变更为 `true`，且暂时仅支持设为 `true`。`update_multi` 属性用于设置卡片是否为共享卡片；`true` 表示设置卡片为共享卡片，更新卡片的内容对所有收到这张卡片的人员可见；`false` 表示设置卡片为独享卡片，更新卡片的内容对他人不可见。

1.0 结构 | 2.0 结构
---|---
```json<br>{<br>"schema": "1.0", // 不填默认为 1.0<br>"config": {<br>"update_multi": false // 默认值为 false。<br>},<br>"card_link": {},<br>"header": {},<br>"i18n_header": {},<br>"elements": [],<br>"i18n_elements": {},<br>"fallback": {}<br>}<br>``` | ```json<br>{<br>"schema": "2.0", // 2.0 需主动声明<br>"config": {<br>"update_multi": true // 默认值为 true，且暂时仅支持设为 `true`<br>},<br>"card_link": {},<br>"header": {},<br>"body": { // 新增 body 字段，elements 属性放置在 body 层级下。<br>"elements": [] // 不再支持 i18n_elements 字段<br>},<br>"fallback": {}<br>}<br>```

### 容器类组件布局属性默认值变更

- [表单容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/containers/form-container)的 `vertical_spacing` 和 `horizontal_spacing` 字段的默认值由 `16px` 改为 `12px`，且支持开发者自定义配置。

1.0 结构 | 2.0 结构
---|---
```json<br>{<br>"margin": "0", // 容器的外边距设置。<br>"padding": "0", // 容器的内边距设置。<br>"vertical_spacing": "16px", // 容器内组件的垂直边距设置。<br>"horizontal_spacing": "16px" // 容器内组件的水平边距设置。<br>}<br>``` | ```json<br>{<br>"margin": "0",<br>"padding": "0",<br>"vertical_spacing": "12px", // 默认值变更，且支持自定义。<br>"horizontal_spacing": "12px" // 默认值变更，且支持自定义。<br>}<br>```

<br>

- [交互容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/containers/interactive-container)的 `vertical_spacing` 和 `horizontal_spacing` 字段的默认值由 `12px` 改为 `4px` 和 `8px`，且支持开发者自定义配置。

1.0 结构 | 2.0 结构
---|---
```json<br>{<br>"margin": "0", // 容器的外边距设置。<br>"padding": "4px 12px", // 容器的内边距设置。<br>"vertical_spacing": "12px", // 容器内组件的垂直边距设置。<br>"horizontal_spacing": "12px" // 容器内组件的水平边距设置。<br>}<br>``` | ```json<br>{<br>"margin": "0",<br>"padding": "4px 12px",<br>"vertical_spacing": "4px", // 默认值变更，且支持自定义。<br>"horizontal_spacing": "8px" // 默认值变更，且支持自定义。<br>}<br>```

<br>
- [折叠面板](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/containers/collapsible-panel)的 `padding` 字段默认值变更：
    - 当折叠面板配置了边框（border）或背景色（background_color）时，标题区 `padding` 字段的默认值变更为上下边距 4px，左右边距 8px。

1.0 结构 | 2.0 结构
---|---
```json<br>// 有边框（border）或背景色（background_color）时<br>{<br>"header": {<br>"margin": "0",<br>"padding": "8px" // 标题区的内边距。<br>},<br>"margin": "0",<br>"padding": "8px",<br>"vertical_spacing": "8px",<br>"horizontal_spacing": "8px"<br>}<br>``` | ```json<br>// 有边框（border）或背景色（background_color）时<br>{<br>"header": {<br>"margin": "0",<br>"padding": "4px 8px"  // 标题区的内边距默认值变更。上下边距为 4px，左右边距为 8px。<br>},<br>"margin": "0",<br>"padding": "8px",<br>"vertical_spacing": "8px",<br>"horizontal_spacing": "8px"<br>}<br>```

  - 当折叠面板未配置边框（border）或背景色（background_color）时，标题区 `padding` 字段的默认值变更为 0，内容区的内边距默认值变更为上边距 8px，右、下、左边距 0。

1.0 结构 | 2.0 结构
---|---
```json<br>// 无边框（border）或背景色（background_color）时<br>{<br>"header": {<br>"margin": "0",<br>"padding": "8px 0 8px 0" // 标题区的内边距。<br>},<br>"margin": "0",<br>"padding": "0",<br>"vertical_spacing": "8px",<br>"horizontal_spacing": "8px"<br>} | ```json<br>// 无边框（border）或背景色（background_color）时<br>{<br>"header": {<br>"margin": "0",<br>"padding": "0" // 标题区的内边距默认值变更<br>},<br>"margin": "0",<br>"padding": "8px 0 0 0", // 内容区的内边距默认值变更。上边距为 8px，右、下、左边距为 0px。<br>"vertical_spacing": "8px",<br>"horizontal_spacing": "8px"<br>}

### `vertical_spacing` 和 `horizontal_spacing` 枚举值 & 映射数值变更

1.0 结构 | 2.0 结构
---|---
<code>vertical_spacing</code> 和 <code>horizontal_spacing</code>字段的枚举和对应的值为：<br>- small：4px<br>- medium：8px<br>- large：16px | <code>vertical_spacing</code> 和 <code>horizontal_spacing</code>字段的枚举和对应的值为：<br>-   small：4px<br>- medium：8px<br>- large：12px<br>- extra_large：16px

### 标题组件配置变更

- 标题组件的 icon 配置结构变更，对齐其它组件：

1.0 结构 | 2.0 结构
---|---
```json<br>{<br>"header": {<br>"title": {},<br>"icon": {<br>"img_key": "img_v2_38811724" <br>},<br>"ud_icon": {<br>"token": "chat-forbidden_outlined", <br>"style": {<br>"color": "red"<br>}<br>}<br>}<br>}<br>``` | ```json<br>{<br>"header": {<br>"title": {},<br>"icon": {<br>"tag": "standard_icon",<br>"token": "chat-forbidden_outlined",<br>"color": "orange", <br>"img_key": "img_v2_38811724"<br>}<br>}<br>}<br>```

### 图片组件不再支持通栏配置

1.0 结构 | 2.0 结构
---|---
支持 stretch_without_padding 通栏配置，图片的宽度将撑满卡片宽度。<br>```json<br>{<br>"tag": "img",<br>"img_key": "img_v3_0238_073f1823-df2b-4377-86c6-e293f183622j",<br>"size": "stretch_without_padding" // 支持通栏配置，图片宽度将撑满卡片宽度。<br>}<br>``` | 不再支持通栏配置，但可设置 margin 字段为负数实现通栏效果。<br>```json<br>{<br>"tag": "img",<br>"img_key": "img_v3_0238_073f1823-df2b-4377-86c6-e293f183622j",<br>"size": "crop_center",<br>"margin": "4px -12px"<br>}<br>```

### 富文本（Markdown）组件废弃差异化跳转语法

2.0 结构不再支持以下差异化跳转语法。你可使用`<link></link>` 标签替代，如 `<link icon='chat_outlined' url='``https://applink.feishu.cn/client/chat/xxxxx'``  pc_url='' ios_url='' android_url=''> ``  战略研讨会 </link> `。
```json
{
    "tag": "markdown",
    "href": {
        "urlVal": {
            "url": "xxx",
            "pc_url": "xxx",
            "ios_url": "xxx",
            "android_url": "xxx"
        }
    },
    "content": "[差异化跳转]($urlVal)"
}
```

### 兜底高度 & 宽度变更

1.0 结构 | 2.0 结构
---|---
-   卡片兜底高度：24px<br>- 组件宽度设置的像素值如果大于父容器宽度，会收缩限制到父容器宽度，仅在交互容器中会截断展示 | -   卡片的兜底高度：40px<br>- 组件宽度设置的像素值如果大于父容器宽度，将会截断展示

### 废弃备注组件 & 交互模块

2.0 结构不再支持[备注](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/note)（note）组件和[交互模块](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/component-list/common-components-and-elements)（"tag" 为 "action"），相关效果可由以下组件和属性实现：
- 备注（note）组件：可由普通文本组件配置 notation 字号、grey 字体颜色、icon 属性替代；
- 交互模块：可由按钮（button）或折叠按钮组（overflow）组件配置合适的组件间距 (`vertical_spacing` 和 `horizontal_spacing`) 替代。

## 新增属性和优化说明

本小节介绍 2.0 结构新增的属性和优化点。

### 新增 `streaming_mode` 属性，支持流式更新

2.0 结构新增 `streaming_mode` 和 `summary` 字段，支持卡片流式更新、文本流式更新能力。详情参考[流式更新 OpenAPI 调用指南](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/streaming-updates-openapi-overview)。
```json
{
    "schema": "2.0", // 卡片 JSON 结构的版本。默认为 1.0。
    "config": {
        "streaming_mode": true, // 卡片是否处于流式更新模式，默认值为 false。
        "summary": {
            "content": "自定义内容", // 自定义摘要信息。默认为“生成中”。
            "i18n_content": { // 摘要信息的多语言配置。了解支持的所有语种。参考。
                "zh_cn": "",
                "en_us": "",
                "ja_jp": ""
            }
        }
    }
}
```

### 新增 `element_id` 属性，用于操作组件

所有组件和元素（如 `tag` 为 `plain_text` 的文本元素）新增 `element_id` 属性，作为操作组件或元素的唯一标识。在同一张卡片内，该字段的值全局唯一。仅允许使用字母、数字和下划线，必须以字母开头，不得超过 20 字符。
```json
{
    "tag": "button", // 组件的标签。
    "element_id": "button_1" // 操作组件时的唯一标识。
}
```

### 组件统一支持布局相关能力

卡片 JSON 2.0 结构中，各类组件统一新增了一批布局类属性。
```json
// 卡片层级
{
    "schema": "2.0",
    "header": {
        "title": {},
        "padding": "4px" // 支持设置[0,99]px
    },
    "body": {
        "vertical_spacing": "4px", // body 内子组件的垂直间距，支持设置[0,99]px
        "padding": "4px", // body 的内边距配置，支持设置[0,99]px
        "elements": []
    }
}
// 组件
{
    "tag": "xxxx",
    // 各组件均新增的布局类属性
    "margin": "4px", // 外边距，默认值 "0"，支持范围 [-99,99]px
    // 容器类组件(含elements)新增的布局类属性，用于控制子元素排列
    "padding": "4px", // 内边距，支持范围 [0,99]px
    "direction": "vertical", // 布局方向，支持 "vertical"|"horizontal"，默认值 "vertical"
    "horizontal_spacing": "3px", // 水平间距，支持范围 [0,99]px
    "vertical_spacing": "4px", // 垂直间距，支持范围 [0,99]px
    "horizontal_align": "left", // 水平对齐，支持 "left"|"center"|"right"，默认值 "left"
    "vertical_align": "center", // 垂直对齐，支持 "top"|"center"|"bottom"，默认值 "top"
    // 其他
    "elements": []
}
```
[普通文本组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/plain-text)支持配置 width 属性。可取值：
- fill：文本的宽度将与组件宽度一致，撑满组件。
- auto：文本的宽度自适应文本内容本身的长度。
- [16,999]px：自定义文本宽度。
```json
{
  "tag": "div",
  "width": "fill", // 文本宽度。支持 "fill"|"auto"|"{{[16,999]}}px"。默认值为 fill。
  }
```

### 富文本组件支持标准 markdown 语法

[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)支持除 `HTMLBlock` 外所有标准的 Markdown 语法和部分 HTML 语法。了解 Markdown 标准语法，请参考 [CommonMark Spec 官方文档](https://spec.commonmark.org/0.31.2/)。你也可以使用 [CommonMark playground](https://spec.commonmark.org/dingus/) 预览 Markdown 效果。了解更多，参考[富文本（Markdown）](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/rich-text)。

注意，在卡片的富文本组件中，以下语法的渲染效果与 CommonMark 有差异：
- 富文本组件支持使用一个 Enter 键作为软换行（Soft Break）；支持两个 Enter 键作为硬换行（Hard Break）。软换行在渲染时可能会被忽略，具体取决于渲染器如何处理；硬换行在渲染时始终会显示为一个新行。

- 2.0 结构支持以下 HTML 语法：
    - 开标签 `<br>`
    - 自闭合标签 `<br/>`
    - 开标签 `<hr>`
    - 自闭合标签 `<hr/>`
    - 闭合标签 `<person></person>`
    - 闭合标签 `<local_datetime></local_datetime>`
    - 闭合标签 `<at></at>`
    - 闭合标签 `<a></a>`
    - 闭合标签 `<text_tag></text_tag>`
    - 闭合标签 `<raw></raw>`
    - 闭合标签 `<link></link>`
    - 闭合标签 `</font>`，支持嵌套其它标签，如 `<font color=red>red<font color=green>greenagain</font>`。其它标签包括：
        - 闭合标签 `<local_datetime></local_datetime>`
        - 闭合标签 `<at></at>`
        - 闭合标签 `<a></a>`
        - 闭合标签 `<link></link>`
        - 闭合标签 `<font></font>`

### 容器类组件新增可内嵌的组件类型

JSON 2.0 结构中，表单容器、交互容器、折叠面板、分栏组件可内嵌除表单容器和表格组件外的其它所有组件。

1.0 结构 | 2.0 结构
---|---
- 表单容器：不支持内嵌表格、图表、和表单容器组件；不可直接内嵌普通文本组件<br>- 交互容器：仅支持内嵌普通文本、富文本、图片、备注、分栏、勾选器、交互容器组件<br>- 折叠面板：不支持内嵌表单容器（form）和表格组件（table）组件<br>- 分栏：不支持内嵌表格（table）、表单（form）和多图混排（img_combination）组件 | 表单容器、交互容器、折叠面板、分栏组件可内嵌除表单容器（form）和表格组件（table）外的其它所有组件。
