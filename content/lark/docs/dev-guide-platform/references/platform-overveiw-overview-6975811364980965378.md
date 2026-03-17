# 应用类型与能力

Source URL: https://open.feishu.cn/document/platform-overveiw/overview
Updated: 2025-04-02

# 应用概述

应用是开发者向内部或外部用户提供服务的载体，也是开发者调用飞书所提供的开放能力的载体。本文档介绍应用的类型、形态和能力。你也可观看以下视频了解应用。
> 视频播放时长：12分钟

## 应用类型
根据 **应用的上架方式**，应用可分为以下两种类型。
* **企业自建应用**：由企业内部人员或企业授权的开发人员进行开发，只能在同一企业内发布和使用。
* **商店应用**：由第三方服务商开发，在[飞书应用中心](https://app.feishu.cn/)发布，所有飞书企业均可安装和使用。

企业自建应用和其使用场景和区别如下所示。

应用类型 | 企业自建应用 | 商店应用
---|---|---
如何选择 | 如果你开发的应用只会给单一企业内的用户使用，不需要分享到企业外部，需创建企业自建应用。 | 如果希望将你开发的应用上架到[飞书应用中心](https://app.feishu.cn/)，并开放给不同的企业使用，可选择创建商店应用。
实际案例 | 参考[客户案例](https://open.larkoffice.com/solutions?category=0)，了解如何解决企业实际问题。 | 点击[飞书应用中心](https://app.feishu.cn/)，查看已上架的商店应用。
开发人员 | 企业内部人员或企业授权的开发人员 | 第三方独立软件服务商（ISV）
使用人员 | 企业内部人员 | 购买开通该商店应用的企业内部人员、飞书个人版用户
支持的应用能力 | 已有能力均支持 | 不支持工作台小组件能力
开发流程 | 参考[企业自建应用开发流程](https://open.feishu.cn/document/home/introduction-to-custom-app-development/self-built-application-development-process)。 | 整体开发与上架流程参考[商店应用上架流程](https://open.feishu.cn/document/uMzNwEjLzcDMx4yM3ATM/ugzNwEjL4cDMx4CO3ATM)。

## 应用形态与能力

根据应用在客户端的呈现形态，应用有机器人、网页和小组件三种形态。不同形态的应用，需要开启不同的能力。开发者也可以为应用开启多种能力，实现应用的多种形态，适配复杂业务场景。

应用支持机器人、网页应用、云文档小组件、多维表格插件、链接预览等多种能力。下表列出对于不同的应用形态，开放平台提供的的应用能力、开发工具与资源。

应用形态 | 机器人（Bot） | 网页应用（H5） | 小组件（Block）
---|---|---|---
使用场景 | <br>机器人是一种基于会话与用户进行交互的应用，通过集成飞书日历、审批、文档及第三方业务系统，可以在飞书中可实现一站式聚合各类应用的通知（如监控警报、待办提醒、数据报告等），同时支持自动化管理群组、监听并响应用户消息等能力。 | <br>网页应用指的是用 H5 方式开发，可以运行在飞书客户端内的应用。通过调用飞书开放接口（如身份认证、通讯录、云文档等）深度集成飞书生态能力。集成 SSO 免登系统后，企业可将已有应用快速迁移。 |  <br>小组件是飞书独创的轻量级功能块，是一个集渲染、交互、数据为一体的信息单元载体，实现信息在飞书套件内的顺畅流转与消费。通过小组件，企业 IT 和第三方服务商可以开发各类垂直场景的应用，实现云文档协作与企业工作流的打通，扩展飞书套件的能力，进而提升效率。
**对应应用能力** | 机器人能力 | 网页应用能力 | - 云文档小组件<br>- 多维表格插件
**开发工具** | [服务端 SDK](https://open.feishu.cn/document/ukTMukTMukTM/uETO1YjLxkTN24SM5UjN)。可结合[飞书卡片搭建工具](https://open.feishu.cn/cardkit?lang=zh-CN)发送卡片消息 | - [服务端 SDK](https://open.feishu.cn/document/ukTMukTMukTM/uETO1YjLxkTN24SM5UjN)<br>- [飞书开发者工具](https://open.feishu.cn/document/uYjL24iN/ucDOzYjL3gzM24yN4MjN)<br>- [网页应用远程调试工具](https://open.feishu.cn/document/uYjL24iN/uEzMzUjLxMzM14SMzMTN/webapp-remote-debugging-tool-user-guide)<br>- [网页应用在线调试工具](https://open.feishu.cn/document/uYjL24iN/uEzMzUjLxMzM14SMzMTN/development-of-h5-in-tools/enable-the-inspect-debugging-capability) | - [服务端 SDK](https://open.feishu.cn/document/ukTMukTMukTM/uETO1YjLxkTN24SM5UjN)<br>- [飞书开发者工具](https://open.feishu.cn/document/uYjL24iN/ucDOzYjL3gzM24yN4MjN)
**接入文档** | - 新手教程：<br>- [开发回声机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-an-echo-bot/introduction)<br>- [开发卡片交互机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)<br>- 使用指南：[机器人概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/bot-v3/bot-overview) | - 新手教程：<br>- [快速开发网页应用](https://open.feishu.cn/document/home/quickly-develop-a-web-app-nodejs/introduction)<br>- [将已有网页应用嵌入飞书工作台](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/embed-web-app-into-feishu-workbench/introduction)<br>- 使用指南：[网页应用概述](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/introduction)<br>- API 参考：[H5-JS-SDK](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/) | - 使用指南：<br>- [云文档小组件概述](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/docs-add-on/docs-add-on-introduction)<br>- [多维表格插件概述](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/base-extensions/base-extension-introduction)<br>- [工作台小组件概述](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/block/guide/hosting-scenario-introduction/workplace)<br>- API 参考：<br>- [云文档小组件 API](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/docs-add-on/05-api-doc/05-api-doc)<br>- [多维表格插件 API](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/base-extensions/base-automation-extensions/api/getbasekiturl)<br>- [工作台小组件 API](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/block/api/api-introduction)
**是否支持服务端 API** | 支持 | 支持 | 支持
**是否支持商店应用** | 支持 | 支持 | 支持

除机器人、网页、应用、小组件能力外，应用还支持开启以下能力：

支持能力 | 链接预览 | 移动应用登录
---|---|---
适用场景 | 将飞书消息中的链接，转换为文字或卡片的形式进行展示。以便消息接收者在不进行链接跳转的情况下，快速了解链接所包含的内容，或者通过卡片交互完成业务操作。 | 允许用户通过飞书账号授权登录第三方移动端的应用。
功能示意 |  | 
开发工具 | [服务端 SDK](https://open.feishu.cn/document/ukTMukTMukTM/uETO1YjLxkTN24SM5UjN)。可结合[飞书卡片搭建工具](https://open.feishu.cn/cardkit?lang=zh-CN)将链接转换为卡片形式 | [授权登录 SDK](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/mobile-app/sdk)
接入文档 | - 入门教程：[开发链接预览](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/development-link-preview/quick-start)<br>- 使用指南：<br>- [链接预览开发指南](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/development-link-preview/link-preview-development-guide)<br>- [飞书卡片概述](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-overview) | - SDK 文档：[授权登录 SDK 文档](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/mobile-app/sdk)<br>- 使用指南：[移动应用登录流程](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/mobile-app/mobile-app-overview)
是否支持服务端 API | 支持，相关 API：[更新 URL 预览](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/group/im-v2/url_preview/batch_update) | 支持
是否支持商店应用 | 支持 | 支持

## 如何选择合适的应用能力

选择开启不同的应用能力时，可参考以下原则：

**选择机器人**：

- 如果你的应用需要与用户在聊天中进行交互，向用户或群组自动发送消息，响应用户的消息，并进行群组管理，可以考虑开启机器人能力。

**选择网页应用**：

- 如果你的应用已经有基于 H5 技术框架实现的版本，希望迁移到飞书，开发周期紧张，可以考虑使用网页应用接入免登功能快速实现。
- 如果你的应用会频繁更新内容，并且是偏向于运营类的内容，且需要在飞书之外的环境中传播，可以考虑使用网页应用。
**选择小组件**：

- 需要将云文档协作与企业工作流的打通，扩展飞书套件的能力，进而提升效率。

**搭配组合**：飞书的应用能力可以组合使用，你可以为**网页应用开启机器人能力**，来更好地与用户交互，例如：
- 配合事件订阅，把原本 H5 应用中触发的业务通知发送到飞书的会话或者群聊中。
- 使用机器人结合飞书卡片的能力，进行通知下发或让用户与应用进行轻量交互。
