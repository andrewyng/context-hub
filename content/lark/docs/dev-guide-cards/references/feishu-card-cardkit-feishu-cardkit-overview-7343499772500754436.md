# 飞书卡片搭建工具概述

Source URL: https://open.feishu.cn/document/feishu-cards/feishu-card-cardkit/feishu-cardkit-overview
Updated: 2025-12-12

# 飞书卡片搭建工具概述

飞书卡片提供了可视化的飞书卡片搭建工具，你不需要裸写卡片的 JSON 代码，通过拖拉拽的方式即可构建一张卡片。本文档介绍搭建工具的功能特性。

## 工具入口

[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_tool_overview)
搭建工具支持 **AI 一键生成卡片**，你可以在工具首页顶部点击「**立即体验**」，即可通过多种方式灵活生成精美卡片：

## 基本概念

- **新版卡片**：基于[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)搭建的卡片，新增 20+ 卡片能力，推荐搭建新版卡片。详情参考[搭建工具新版卡片变更说明](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/cardkit-upgraded-version-card-release-notes)。

- **旧版卡片**：基于[卡片 JSON 1.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-structure)搭建的卡片。JSON 2.0 结构新增的属性和新版卡片新增能力将不在旧版卡片更新。

## 功能特性

飞书卡片搭建工具提供了可视化的容器组件、展示组件、交互组件，帮助你结构化搭建卡片内容，并提供了多语言配置、卡片变量、卡片版本、卡片导入导出等功能。具体功能如下表所示。

功能 | 说明 | 相关文档
---|---|---
案例库 | 当你创建飞书卡片时，可以结合搭建工具提供的参考案例库，选择适配当前业务的卡片案例，快速完成卡片内容的构建。 | [搭建卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/build-card-content)
多语言 | 搭建工具支持飞书卡片的多语言设置。设置多语言后，卡片将根据用户的飞书客户端语言，自动展示对应语言的卡片内容，满足国际化业务需求。 | [配置卡片多语言](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-languages)
组件 | 飞书开放平台提供了丰富的组件用于构建飞书卡片内容。搭建工具提供了以下可视化组件：<br>- 容器类组件：包括分栏、表单容器、循环容器组件。提供多列布局能力，可实现卡片内容的分栏展示、循环展示等，从而提升内容的可读性。<br>- 展示类组件：包括标题、富文本、图片、表格、人员列表等组件，可提升内容的表现力和吸引力。<br>- 交互类组件：包括按钮、输入框、选择器等组件，可实现链接跳转、数据收集等交互能力。 | [搭建工具组件文档](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/markdown)<br>[添加交互事件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/add-interactive-events)
变量 | 搭建工具支持为指定组件添加卡片变量。<br> | [配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables)
查看卡片 JSON 源码 | 搭建工具支持在卡片编辑页面查看并复制卡片 JSON 源码。<br> | 无
版本管理 | 飞书卡片发布时需要指定卡片版本。通过卡片的版本管理，你可以根据不同业务背景，升级或回滚卡片的版本内容。同时，在使用卡片时，你可以指定某一卡片的某一版本来使用。 | [预览与发布卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/preview-and-publish-cards)
卡片资源与权限管理 | - 支持卡片分组管理<br>- 支持导入导出卡片源文件，实现跨企业同步卡片数据；<br>- 卡片的创建者可为卡片添加协作者，允许多人协同编辑卡片；也可为卡片添加应用或自定义机器人，用于发布卡片。 | [导入导出卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/import-and-export-cards)<br>[管理卡片权限](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/manage-card-template)<br>[为卡片分组](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/group-cards)

## 飞书卡片搭建工具页面说明

飞书卡片搭建工具有资源管理页面和卡片编辑页面。你可参考以下说明了解各个功能特性入口。

### 资源管理页面

飞书卡片的资源管理页面用于创建和管理飞书卡片，功能模块说明如下表所示。

功能模块 | 说明
---|---
我的卡片 | 该模块用于展示存量的飞书卡片，包括已发布和未发布状态的所有卡片。<br>- 支持按来源、分组、是否发布来筛选指定范围的卡片。<br>- 支持按以下方式对卡片排序：<br>- **最近修改时间**：按卡片最后一次修改的时间先后排序，最近修改的卡片排在最前面<br>- **创建时间**：按创建卡片的时间排序，最近创建的卡片排在最前面<br>- **卡片名称**：按卡片名称字典序排序，顺序为：数字 → 英文 → 中文，A → Z<br>- 支持通过小窗模式预览卡片内容，点击卡片即可进入卡片的编辑页。<br>- 支持一键创建卡片副本，或一键删除未发布的卡片（不支持删除已发布的卡片）。
创建卡片 | 飞书卡片支持以下四种创建方式：<br>- 点击 **创建空白卡片**，创建一个空白内容的飞书卡片<br>- 点击 **参考案例库**，可跳转至搭建工具提供的卡片案例库，你可以选用某一案例快速创建一个属于你的飞书卡片<br>- 点击 **导入卡片**，可根据已有卡片 JSON 或 `.card` 文件，实现跨企业同步卡片数据<br>- 基于已有卡片，创建卡片副本
参考案例库 | 飞书卡片搭建工具提供了适用于部分场景的[卡片案例](http://open.feishu.cn/cardkit?catalogId=10014)，你可以直接选用这些案例快速创建卡片。

### 卡片编辑页面

飞书卡片编辑页用于构建和预览卡片，并最终保存和发布卡片。功能模块说明如下表所示。

功能模块 | 图示 | 说明
---|---|---
顶部菜单栏左侧 | &nbsp; | 展示卡片名称、ID 以及修改时间。你可直接点击卡片名称修改卡片名。
顶部菜单栏右侧 | &nbsp; | - 帮助中心：点击查看飞书卡片相关的帮助文档。<br>- 设置：设置卡片整体的跳转链接或者绑定变量。<br>- 添加协作者：为卡片添加协作者。详情参考管理卡片权限。<br>- 添加自定义机器人/应用：为卡片添加自定义机器人或应用。详情参考[管理卡片权限](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/manage-card-template)。<br>- 创建副本：点击后，可根据当前卡片内容，新建一个卡片副本。<br>- 导入/导出卡片：详情参考[导入导出卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/import-and-export-cards)。<br>- 版本管理：已发布的飞书卡片存在独立的版本号，你可以在版本管理中查看或回滚至指定的卡片版本。详情参考[预览与发布卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/preview-and-publish-cards)。<br>- 向我发送预览：点击 **向我发送预览** 按钮之后，飞书开放平台会通过开发者小助手向当前登录用户的飞书客户端发送当前卡片的预览消息。<br>- 保存：当完成本次卡片编辑后，你需要点击 **保存** 按钮，将变更内容保存至搭建工具中。<br>- 发布：正式发布飞书卡片后，才可以使用该卡片发送消息或绑定链接预览。在发布时你需要设置当前卡片的版本号。
组件 |  | 搭建工具提供丰富的卡片组件供你选用，你只需要点击组件，即可将组件添加至飞书卡片内进行编辑。在组件列表底部提供了 参考案例库，你可以在案例库中选择指定案例一键生成卡片内容。
大纲树 |  | 大纲树展示了当前飞书卡片的结构层级。当卡片内容越来越复杂时，通过大纲树可以清晰快捷的定位目标组件。
画布工具栏 | &nbsp; | 画布上方的工具栏支持以下操作：<br>- 调整当前编辑器适配的预览场景，包括消息卡片、消息链接预览、群置顶卡片场景。<br>- 支持配置多语言环境下的卡片内容。<br>- 支持切换桌面端、移动端的预览效果。<br>- 支持为卡片设置变量。
右侧属性面板 | &nbsp; | 在该模块中，你可以编辑指定组件的属性、样式、事件。<br>- 在模块顶部，支持点击某一层级的组件进行跳转。支持编辑当前组件的名称，该名称会生效于左侧的大纲树内，便于你区分多个相同的组件。<br>- 在 **属性** 页签，支持调整当前组件的参数配置。<br>- 在 **样式** 页签，支持调整布局、背景色、间距等样式配置。<br>- 在 **事件** 页面，支持设置组件的交互事件，即点击组件后会触发哪些动作。

## 了解更多

- 了解搭建工具的更新说明，参考[飞书卡片更新说明](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-release-notes)。
- 了解如何通过搭建工具构建卡片内容，参考以下文档：
    - [构建卡片内容](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/build-card-content)
    - [配置卡片多语言](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configure-multi-language-content)
    - [配置卡片交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)
    - [配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables)
- 了解如何使用卡片，参考以下文档：
    - [预览与发布卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/preview-and-publish-cards)
    - [导入导出卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/import-and-export-cards)
    - [发送卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/send-feishu-card) 
         - [更新卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/update-feishu-card)
         - [链接预览开发指南](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/development-link-preview/link-preview-development-guide)
