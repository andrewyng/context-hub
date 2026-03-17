# 飞书卡片概述

Source URL: https://open.feishu.cn/document/feishu-cards/feishu-card-overview
Updated: 2025-05-23

# 飞书卡片概述

本文档介绍飞书卡片的基本概念、功能特性与应用场景，帮助你快速上手飞书卡片。

## 什么是飞书卡片

飞书卡片是应用的一种能力，包括构建卡片内容所需的组件和发送卡片所需的能力，并提供了[可视化搭建工具](https://open.feishu.cn/cardkit?from=open_docs_overview)。
飞书卡片能够将结构化的内容以卡片形式嵌入至聊天消息、群置顶消息、链接预览等飞书协作场景中，提升信息传递效率。用户可以在卡片上通过简单交互完成业务处理，让业务系统触手可及。简而言之，飞书卡片可使应用的使用体验从“人找应用”，演变为“应用找人”。

## 功能特性

飞书卡片能够**结构化**你的图文内容，并将其**嵌入**至业务协作场景中，同时可实现**轻量交互**、**绘制图表**、**多场景复用**等能力。具体而言，飞书卡片的功能特性可概括为以下五点。

-  **结构化**

    飞书卡片提供灵活的布局能力和丰富的图文呈现组件，可以帮助你更结构化地组织卡片内容，提升信息传递效率。

    

-  **嵌入式**

    飞书卡片能嵌入至聊天消息、群置顶、链接预览等飞书的协作场景中，让业务系统随手可及。

    

- **轻交互**

  飞书卡片支持业务中“点一下就提交”的轻量交互能力。用户可直接在飞书会话、链接预览等场景中，点击飞书卡片的交互组件完成业务处理。例如，在飞书的聊天通知中，通过飞书卡片完成工单的审批与流转、活动报名与投票、表单填写与提交等交互。

  

- **数据可视化**

  飞书卡片提供图表组件，可基于数据绘制柱状图、折线图、饼图等各类图表，丰富业务数据的呈现形式。详情参考[图表](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/chart)。

  

- **多场景复用**

  通过可视化搭建工具构建的卡片，也被称为卡片模板。每个卡片模板都有一个唯一的卡片模板 ID，由搭建工具自动生成。你可使用该 ID 在不同对话或群聊中发送相同卡片，实现多场景复用。同时，搭建工具支持卡片变量功能，通过为这些变量赋予实际业务场景中的值，你也可以实现卡片的多场景复用。详情参考[配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables)。

  

## 应用场景

飞书卡片能够嵌入至聊天消息、群置顶消息、链接预览等飞书协作场景中，提升信息传递效率。常见使用场景和说明参考下文。

### 消息场景

在发送消息时，卡片作为一种消息类型，可以发送给个人或群组。消息场景下，飞书卡片的使用十分广泛，主要包括静态内容推送、动态内容交互、AI 机器人场景。

#### **静态内容推送**

静态内容推送场景下，卡片中主要包含文本、图片、人员、图表等静态展示信息，也可包含打开指定链接的按钮。

具体场景示例：推送行业资讯、销售业绩排行、员工生日祝福、业务监控告警等。

在静态内容推送场景下，根据不同的业务需求，你可参考以下教程和搭建工具案例库中的[参考案例](http://open.feishu.cn/cardkit?catalogId=10014&from=open_docs)，搭建并发送卡片：

| **业务需求示例**                                                                                                                                                                                                                                                                                                     | **推荐上手教程**                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 作为活动运营方，需要快速制作一个一次性的活动推广卡片，在单个或多个 **群组** 投放推广。                                                                                                                                                                                                                                                                 | [无代码发送卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/send-feishu-card#52bcaee1)                             |
| 作为社群组织方，需要定期在当前社群的 **群组** 中发送活动通知卡片。希望可以通过固定的机器人发送。                                                                                                                                                                                                                                                            | [使用自定义机器人发送飞书卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/send-message-cards-with-custom-bot) |
| 作为活动运营方，需要定期向 **群组** 发布数据，希望只创建一张卡片，每次发送可以传入不同数据，实现卡片复用。<br>  | [使用自定义机器人发送飞书卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/send-message-cards-with-custom-bot) |
| 作为企业行政/财务/IT人员，需要向 **多个成员** 推送企业级通知，如安全公告、发薪通知、政策调整等。                                                                                                                                                                                                                                                          | [使用指定应用发送飞书卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/send-feishu-cards-with-app-bots)      |

#### **动态内容交互**

动态内容交互场景下，用户可以实现在卡片中“点一下就提交”，卡片需要接收用户提交的数据并做出响应。

具体场景示例：工单审批与流转、活动报名与投票、表单填写与提交。在该场景下，推荐参考[开发一个卡片交互机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)教程，实现用户在卡片上提交数据、然后更新卡片。

#### **AI 机器人**

AI 机器人场景是指当用户与 AI 机器人聊天交互时，AI 机器人通过发送流式更新的卡片、增删改卡片中的组件等方式，与用户进行实时交互的场景。在该场景下，你可参考[流式更新 OpenAPI 调用指南](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/streaming-updates-openapi-overview)，实现类似效果。

### 消息链接预览场景

飞书卡片可以与飞书开放平台的[链接预览](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/development-link-preview/link-preview-development-guide)能力相互关联，使飞书会话消息和群置顶中特定的链接通过飞书卡片实现内容预览。使用户在不跳转链接的情况下，直观洞察链接包含的信息。要通过卡片实现内容预览，推荐参考[链接预览开发指南](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/development-link-preview/link-preview-development-guide)教程。

### 群置顶卡片场景

飞书卡片支持在飞书会话的置顶消息中展示。你可在[卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_send_feishu_card)中选择 **群置顶卡片场景** 并预览效果。

## 基础概念
使用飞书卡片时可能涉及以下概念。
- **卡片模板**：基于[卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_overview)创建的卡片，被称作卡片模板。
- **卡片模板 ID**（`template_id`）：在搭建工具中，每个卡片模板都有唯一的卡片 ID，可在搭建工具的顶部菜单栏中获取，如下图所示：

    

- **卡片实体**：基于[创建卡片实体](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/create)接口创建的卡片，被称作卡片实体。
- **卡片实体 ID**（`card_id`）：在调用[卡片资源服务端接口](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/feishu-card-resource-overview#791c8e74)发送卡片、更新卡片时，需要通过 `card_id` 来指定卡片，表示卡片实体的唯一标识。
- **卡片案例**：在卡片搭建工具参考案例库中的卡片案例。

## 使用教程

根据使用飞书卡片的不同阶段，推荐参考以下文档：

使用阶段 | 使用指南
---|---
阶段一：了解与入门 | - [（推荐）开发一个卡片交互机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)：提供完整的卡片交互示例，你可以在三分钟内创建、发布并体验一个完整应用。从而了解机器人应用的基本开发流程，以及搭建、发送与更新飞书卡片的流程，和通过服务端 SDK 调用 API 和回调的方法。<br>- [使用指定应用发送飞书](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/send-feishu-cards-with-app-bots)<br>- [使用自定义机器人发送飞书卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/send-message-cards-with-custom-bot)
阶段二：搭建卡片 | - **方式一（推荐）**：使用[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_tool_overview)，通过拖拉拽的方式快速构建卡片。相关文档和示例如下：<br>- [搭建工具使用指南](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/feishu-cardkit-overview)<br>- [组件文档](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/button)<br>- [参考案例](https://open.larkoffice.com/cardkit?catalogId=10015&templateId=)<br>- **方式二**：通过编写[卡片 JSON 代码](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)搭建卡片。相关文档：<br>- [组件 JSON 文档](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/component-json-v2-overview)<br>- [卡片 JSON 2.0 版本更新说明](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-breaking-changes-release-notes)
阶段三：发送卡片 | 参考[发送卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/send-feishu-card)，通过调用发送消息等服务端 API 发送卡片。飞书卡片支持[流式更新](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/streaming-updates-openapi-overview)。
阶段四：（可选）更新已发送的卡片 | 参考[更新卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/update-feishu-card)，了解如何调用更新应用发送的消息卡片 API 更新飞书卡片。
