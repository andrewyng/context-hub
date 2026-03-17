# 搭建工具新版卡片说明

Source URL: https://open.feishu.cn/document/feishu-cards/feishu-card-cardkit/cardkit-upgraded-version-card-release-notes
Updated: 2025-05-20

# 搭建工具新版卡片说明

在[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs)中创建空白卡片时，你需先选择卡片版本。本小节介绍新版本卡片的新增能力和与旧版卡片的功能变更。

## 基本概念

- **新版卡片**：基于[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)搭建的卡片，新增 20+ 卡片能力，推荐搭建新版卡片。

- **旧版卡片**：基于[卡片 JSON 1.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-structure)搭建的卡片。JSON 2.0 结构新增的属性和新版卡片新增能力将不在旧版卡片更新。

## 适用场景

- **新版卡片**：适用多种场景，但仅支持飞书 V7.20 及以上版本客户端。
- **旧版卡片**：对飞书 V7.20 以下版本有兼容需求的场景。

## 新增能力
本小节介绍新版卡片新增的主要能力。
### 支持流式更新

流式更新是指飞书卡片的内容以实时或准实时的方式连续不断地更新，从而实现 AI 逐步生成、卡片逐步渲染的效果。详情参考[流式更新 OpenAPI 调用指南](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/streaming-updates-openapi-overview)。

### 支持精细化布局

新版卡片的正文及各类组件支持精细化布局能力，旧版卡片仅容器类组件支持部分布局属性：

### 富文本组件支持标准 Markdown 语法

- 新版卡片中，[富文本（Markdown）](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/rich-text)支持除 HTMLBlock 外所有标准的 Markdown 语法，包括标题、引用、行内引用、表格、数字角标等；
- 旧版卡片的[富文本（Markdown）](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/rich-text)仅支持部分 HTML 和 Markdown 语法。

	

## 功能变更

新版卡片在多语言实现方式、组件样式实现方式和变量三方面有变更。

### 多语言实现方式变更

本小节介绍新版卡片与旧版卡片在多语言的展示策略与实现方式的变更。了解具体如何在不同版本卡片配置多语言，可参考[配置卡片多语言](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configure-multi-language-content)。

变更项 | 新版卡片 | 旧版卡片
---|---|---
客户端兜底语言展示策略优化 | 新增 **默认语言**，作为展示多语言内容的兜底语种。当飞书客户端的显示语言与已添加的语言均不一致时，将展示 **默认语言** 卡片的内容。 | 当飞书客户端的显示语言与已添加的语言均不一致时，将展示已有的语言。
添加语言后，卡片编辑器页面卡片展示逻辑变更 | 添加语言后，编辑器页面将不会自动切换语言。 | 添加语言后，编辑器页面将自动切换至新增的语言卡片。
多语言卡片结构和编辑方式变更 | 不同语种的卡片仅有一套卡片结构，开发者仅可对其中部分组件的部分属性（包括文本、富文本和图片)设置多语种内容，即局部国际化。这意味着：<br>- 在编辑多语言卡片时，不同语言的卡片结构将始终保持一致。例如，当删除了简体中文卡片中的输入框组件时，**其它语言的对应的输入框组件也将被删除**。<br>- 开发者可在默认或任一语言卡片编辑页面，对特定的组件属性完成所有多语言内容的编辑。<br> | 支持不同语种卡片有完全不同的卡片结构。即在添加卡片时，可以选择 **添加空白卡片**，生成与源卡片完全不同的卡片。开发者需切换语种编辑卡片。<br>

### 组件样式实现方式变更

在新版卡片中备注、按钮组组件的实现方式和图片组件的通栏图配置实现方式有所变化，具体参考下文。

#### **备注模块实现方式与 JSON 数据变更**

- 旧版卡片中，[备注](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/note)组件为单独组件，属于展示类组件。

	

- 新版卡片中，备注模块属于复合组件，由普通文本组件配置 **辅助信息** 字号、**灰色** 文本颜色和图标属性实现。

	

#### **按钮组实现方式与 JSON 数据变更**

- 旧版卡片中，按钮组组件为单独组件，属于交互类组件。
- 新版卡片中，按钮组组件为通过 **按钮**、**分栏** 和 **折叠按钮组** 组件组合的方式实现的复合组件，支持更灵活的按钮组样式：

	

#### **图片组件不再支持通栏配置**

旧版卡片中，图片组件的图片尺寸选项提供了 **通栏图** 选项：

新版卡片中，图片组件不再提供 **通栏图** 选项，但可通过配置图片外边距为负值实现通栏图效果：

### 变量不兼容变更

新版卡片与旧版卡片在变量部分有较多变更，相关说明如下所示。了解新旧版卡片支持的所有变量和配置方式，参考[配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables)。

#### **新增变量**

新版卡片相对于旧版卡片，新增了如下变量类型。

变量类型 | 描述 | 适用组件或属性 | 数据结构示例
---|---|---|---
人员 | 人员变量，需传入用户 ID，支持 Open ID、Union ID 和 User ID。了解如何获取 ID，参考[如何获取不同的用户 ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)。 | [人员](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/user-profile)组件的 `id` 属性 | ```json<br>{<br>"id": "on_445705689d4d1660d5bf4125399abcef"<br>}<br>```
人员数组 | 人员数组变量，需传入多个用户 ID，支持 Open ID、Union ID 和 User ID。了解如何获取 ID，参考[如何获取不同的用户 ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)。 | - [人员列表](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/user-list)组件的 `id` 属性<br>- [人员选择-单选](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/interactive-components/single-select-user-picker)组件的选项列表属性<br>- [人员选择-多选](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/interactive-components/multi-select-user-picker)组件的选项列表属性 | - `"selected": true` 表示选择组件是否默认选中该选项。支持人员单选和多选组件。<br>- 对于单选组件，如果对多个选项配置了 `"selected": true`，仅有第一个选项的配置生效。<br>```json<br>[<br>{<br>"id": "ou_c99c5f35d542efc7ee492afe11af19ef",<br>"selected": true<br>},<br>{<br>"id": "ou_c99c5f35d542efc7ee492afe11af19ef"<br>}<br>]<br>```
选项数组 | 绑定在下拉选择单选和多选组件上的特有变量，用于定义每次发送卡片时可变的选项内容。 | - [下拉选择-单选组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/interactive-components/single-select-dropdown-menu)<br>- [下拉选择-多选组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/interactive-components/multi-select-dropdown-menu) | - `"selected": true` 表示选择组件是否默认选中该选项。<br>- 对于单选组件，如果对多个选项配置了 `"selected": true`，仅有第一个选项的配置生效。<br>```json<br>[<br>{<br>"text": "选项 1",<br>"value": "1",<br>"icon": {<br>"tag": "standard_icon",<br>"token": "chat-forbidden_outlined"<br>},<br>"selected": true,<br>"i18n_text": {<br>"zh_cn": "选项 1",<br>"en_us": "option 1",<br>"ja_jp": "option 1"<br>}<br>},<br>{<br>"text": "选项 2",<br>"value": "2",<br>"icon": {<br>"tag": "custom_icon",<br>"img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg"<br>},<br>"i18n_text": {<br>"zh_cn": "选项 2",<br>"en_us": "option 2",<br>"ja_jp": "option 2"<br>}<br>},<br>{<br>"text": "选项 3",<br>"value": "3",<br>"i18n_text": {<br>"zh_cn": "选项 3",<br>"en_us": "option 3",<br>"ja_jp": "option 3"<br>}<br>}<br>]<br>```

#### **废弃变量**

新版卡片相对于旧版卡片，废弃了如下变量类型。

变量类型 | 描述 | 适用组件或属性 | 废弃原因
---|---|---|---
富文本 | Markdown 格式的字符串变量，将被渲染为富文本样式。 | 富文本内容 | 新版卡片的 **普通文本** 变量可直接渲染富文本样式，开发者无需再使用富文本变量。<br>**提示**：要使富文本内容不被渲染，可使用 `<raw></raw>` 标签包裹，如：<br>```markdown<br><raw>`inline-code`</raw><br>```<br>效果如下所示：<br>
文本数组 | 由字符串组成的数组型变量，数组每一项为一个字符串。 | - [人员列表](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/user-list)<br>- [人员选择-单选](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/interactive-components/single-select-user-picker)<br>- [人员选择-多选](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/interactive-components/multi-select-user-picker) | 新版卡片的 **人员数组** 变量可实现该变量功能。
单选数组 | 绑定在下拉选择-单选组件上的特有变量，用于定义每次发送卡片时可变的选项内容。 | [下拉选择-单选组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/interactive-components/single-select-dropdown-menu) | 新版卡片的 **选项数组** 变量可实现该变量功能。
多选数组 | 绑定在下拉选择-多选组件上的特有变量，用于定义每次发送卡片时可变的选项内容。 | [下拉选择-多选组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/interactive-components/multi-select-dropdown-menu) | 新版卡片的 **选项数组** 变量可实现该变量功能。
人员多选数组 | 绑定在人员选择-多选组件上的特有变量，用于定义一组每次发送卡片时可变的选项内容。 | [人员选择-多选](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/interactive-components/multi-select-user-picker) | 新版卡片的 **人员数组** 变量可实现该变量功能。

#### **变量结构变更**

新版卡片相对于旧版卡片，以下变量类型的数据结构有变更。

变量类型 | 新版卡片结构 | 旧版卡片结构
---|---|---
图片 | ```json<br>{<br>"img_key": "img_v3_02er_196d133d-aa22-4021-9b79-c11105223e4j"<br>}<br>``` | <code>img_xxx</code>
图片数组 | ```json<br>[<br>{<br>"img_key": "img_v3_02er_196d133d-aa22-4021-9b79-c11105223e4j"<br>},<br>{<br>"img_key": "img_v3_02er_196d133d-aa22-4021-9b79-c11105223e4j"<br>}<br>]<br>``` | <pre><code>[ "img_xxx", "imx_xxx" ]</code></pre>

#### **变量绑定属性变更**

新版卡片相对于旧版卡片，以下变量类型支持绑定的组件或属性有变更。

变量类型 | 支持绑定的组件或属性变更
---|---
普通文本变量 | 不再支持绑定人员组件的 ID 属性，你可用新版卡片新增的人员变量绑定。
按钮组变量 | 按钮组变量不再支持绑定按钮组组件，仅支持绑定折叠按钮组组件。

## 常见问题

### 搭建工具是否支持将旧版卡片（1.0 结构）转为新版卡片（2.0 结构）？

搭建工具不支持新旧版卡片的转换。你需要自行创建一个新版卡片。
