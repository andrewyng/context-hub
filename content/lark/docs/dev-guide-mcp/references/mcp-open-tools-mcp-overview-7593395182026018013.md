# 本地 OpenAPI MCP 概述

Source URL: https://open.feishu.cn/document/mcp_open_tools/mcp-overview
Updated: 2026-01-19

# OpenAPI MCP 概述

OpenAPI MCP 工具（后续简称“MCP 工具”）可以帮助你快速实现 AI agent 与飞书开放能力的集成，实现基于 agent 的飞书云文档处理、会话管理、日历安排等自动化场景。

## 功能特性

MCP 工具使用 MCP（Model Context Protocol） 协议连接飞书开放平台，提供丰富的飞书 OpenAPI 工具集，可覆盖飞书的核心功能（如消息、群组、日历、多维表格等），同时支持应用访问凭证（tenant_access_token）和用户访问凭证（user_access_token），确保 API 的调用安全可控。MCP 工具特点如下：

- 提供简单易用的命令行接口，实现快速配置与启动。
- 支持多种配置方式，适应不同的使用场景。
- 与主流 AI 工具（如 Trae、Cursor、Claude）无缝集成。
- 配置应用信息后，可自动获取应用访问凭证；登录 MCP 并完成用户登录鉴权后，可自动获取用户访问凭证，并支持自动刷新。

## 典型案例
- AI 会根据实际输入的需求提示词进行规划，并调用不同的 OpenAPI，因此应用需要开通的权限也会存在不同。
- 飞书开放平台正在征集优秀的 MCP 开发案例，欢迎你的投稿：[飞书 MCP 优秀开发案例征集](https://bytedance.larkoffice.com/share/base/form/shrcnGy0YNaviYYLjAX8zMqIW3f)。

场景示例 | 前置配置 | Trae 运行示例
---|---|---
初始化项目管理多维表格<br> | -   **应用能力**：机器人<br>- **应用权限**：<br>查看、评论、编辑和管理多维表格(bitable:app) | &nbsp;
创建群聊、拉人进群并发送飞书卡片<br> | -   **应用能力**：机器人<br>- **应用权限**：<br>获取与更新群组信息(im:chat)<br>以应用的身份发消息(im:message:send_as_bot)<br>- **其他**：确保群内所有成员在应用的可见范围内。参考[配置应用可用范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability)。 | 
总结群内的消息，并记录到多维表格<br> | -   **应用能力**： 机器人<br>- **应用权限**：<br>获取群组中所有消息（敏感权限）(im:message.group_msg)<br>创建多维表格(base:app:create)<br>新增数据表(base:table:create)<br>新增记录(base:record:create)<br>- **其他**：机器人在群聊中 | &nbsp;
为群成员开通多维表格权限<br> | -   **应用能力**：启用机器人能力<br>- **应用权限**：<br>查看群成员(im:chat.members:read)<br>查看、评论、编辑和管理多维表格(bitable:app)<br>- **其他**：机器人在群聊中；机器人对多维表格有管理权限 | 

## 支持的 OpenAPI

你可以查看 [tools](https://github.com/larksuite/lark-openapi-mcp/blob/main/docs/reference/tool-presets/tools-zh.md) 获取 MCP 工具支持的飞书 OpenAPI 列表，也可以通过 API 文档判断该 API 是否在 MCP 工具内支持。例如，打开一篇 API 开发文档，如 [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)。若存在 **「尝试一下」** 按钮，则表示该 API 在 MCP 工具内可用。warning
- 灰度中的 API（即 API 文档开头标注了 **仅部分企业可见** 的 API），在 MCP 工具内暂不支持使用。
- 图片或文件上传/下载相关的 API 在 MCP 工具内暂不支持使用。

## MCP 工具命名规范

MCP 工具按照 `biz.version.resource.method` 模式命名，与服务端 Node SDK 的方法命名一致。可按照如下方式获取 OpenAPI 在 MCP 工具内的名称。

在 API 文档中，点击 **尝试一下**，并查看 **Node SDK** 示例代码，其中 `client` 方法后的函数即 API 在 MCP 工具内的名称。例如下图所示，发送消息 API 的名称为 `im.v1.message.create`。
