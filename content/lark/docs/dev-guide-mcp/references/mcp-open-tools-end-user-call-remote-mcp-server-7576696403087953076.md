# 个人调用远程 MCP 服务（内测中）

Source URL: https://open.feishu.cn/document/mcp_open_tools/end-user-call-remote-mcp-server
Updated: 2026-02-25

# 个人使用 MCP 服务
飞书远程 MCP 服务，是经过官方精心打造的“AI 连接器”，让你的 AI 客户端直接变身为强大的飞书助理，安全、稳定且高效。
当前支持「**云文档**」场景，查看[支持的 MCP 工具集](https://open.larkoffice.com/document/mcp_open_tools/supported-tools)，后续会开放更多场景（如多维表格、日历）。欢迎[反馈](https://bytedance.larkoffice.com/share/base/form/shrcnGy0YNaviYYLjAX8zMqIW3f)您的使用场景 🥳

## 步骤一：创建 MCP 远程服务

你可以通过生成一个专属的 MCP 远程服务链接，即可安全地授权 AI 客户端访问您的飞书数据。
1. 登录[飞书 MCP 配置平台](https://open.feishu.cn/page/mcp)。warning
    远程 MCP Server 配置功能正在内测中，如无法访问配置平台，可在文档页面右下角联系技术支持（选择 **展开  > 技术支持 **）。

3. 在页面左侧，点击 **创建 MCP 服务**。
5. 在 **MCP 工具配置** 区域，确认当前用户身份。
    后续使用 MCP 服务时，都会以当前显示的用户身份访问和操作飞书数据，因此，需确认当前用户身份正确，否则需使用正确的用户重新登录。     
	
2. 在 **添加工具** 卡片内，点击 **添加**，在添加工具对话框，选择「**云文档**」工具集。
    当前支持「**云文档**」场景，后续会开放更多业务场景，查看[已支持的 MCP 工具集](https://open.feishu.cn/document/mcp_open_tools/supported-tools)。
4. 点击 **确认添加**，并在弹出的 **获取用户授权** 对话框，确认授权用户登录信息、飞书 MCP 应用获得的权限信息后，点击 **授权**。

	

4. 添加工具后，在 **如何使用 MCP 服务** 区域，查看 **服务器 URL、JSON**。warning
    服务器 URL 代表以当前登录用户身份去调用飞书工具，相当于个人密钥，**请勿泄露给其他人**。
	

    - 自2026年2月24日起，新创建的飞书 MCP 服务有效期缩短为 7 天，过期自动失效，如需延长有效期，可点击 **重新授权**。
	- 如担心链接已泄露，可点击 **重置链接**，使当前的 URL 失效，并生成一个新的 URL。
	- **传输方式** 保持默认 Streamable HTTP 即可。Streamable HTTP 是基于 HTTP 协议的分块（chunked）流式传输，支持任意格式数据（如文件、日志）的渐进式传输。

## 步骤二：一键安装到 TRAE\Cursor\VS Code

平台在 MCP 服务页面底部提供了快捷添加到 TRAE、Cursor、VS Code 的入口，供你一键快速安装。
该方式需要确保本地已安装 **最新版本** 的 [TRAE](https://www.trae.cn/)、[Cursor](https://cursor.com/) 或 [VS Code](https://code.visualstudio.com/download)。

客户端 | 安装步骤
---|---
**TRAE** | 1.点击 **添加到 TRAE**，并根据指引打开 TRAE 客户端。 <br>2. 在 TRAE 的 MCP 手动配置对话框内，点击 **确认**。<br><br>3. 点击 MCP 路径，查看已成功配置的飞书 MCP Server。 <br><br>4. 因飞书工具较多，为避免超出 TRAE 上下文限制，建议**创建智能体并按需选择工具**。配置完成后，输入场景提示词并发送，等待 AI 响应即可。 <br>
**Cursor** | 1.点击 **添加到 Cursor**，并根据指引打开 Cursor 客户端。 <br>2. 在 Cursor 的 MCP Server 安装对话框内，点击 **安装**。 <br><br>**注意事项**：<br>3. 可打开控制台，在 output 页签下查看当前 MCP server 处于成功连接的运行状态。 <br><br>4. 在右侧 AI 对话框中输入提示词，即可使用飞书 MCP 服务。 <br><md-alert>Cursor 版本更新可能会导致工具调用截断，官方修复版正灰度发布中。<br>
**VS Code** | 1.点击 **添加到 VS Code**，并根据指引打开 VS Code 客户端。<br>2. 在 VS Code 的 MCP 安装对话框内，点击 **安装**。 <br><br>3. 安装后，点击管理图标 > **显示输出** 或 **显示配置 JSON**，即可查看 MCP server 当前正在运行状态。 <br><br><br>4. 在右侧 AI 对话框中输入提示词，即可使用飞书 MCP 服务。 <br>

### （可选）安装到其他 AI 客户端

1. 在[飞书 MCP 配置平台](https://open.feishu.cn/page/mcp) 中，复制已创建的 MCP 服务的 **服务器 URL\JSON**。

	

2. 参考以下常见 AI 客户端的官方文档将复制的 MCP 地址配置到对应的 AI 客户端上：

    - **Claude Code**：[Claude Code 官方文档](https://code.claude.com/docs/en/mcp#installing-mcp-servers)
    - **Gemini CLI**：[Gemini CLI 官方文档](https://geminicli.com/docs/tools/mcp-server/#how-to-set-up-your-mcp-server)
    - **n8n**：[n8n 官方文档](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolmcp/)
    - **Windsurf**：[Windsurf 官方文档](https://docs.windsurf.com/zh/plugins/cascade/mcp)

# 常见问题

## 如何重命名或删除已配置的 MCP Server？

1. 登录[飞书 MCP 配置平台](https://open.feishu.cn/page/mcp)。

3. 在左侧 **已创建的 MCP 服务** 列表，选择需要操作的服务。

5. 在标题区域，点击 **···**，可选择 **重命名** 或 **删除** 当前服务。

	

## 配置工具后，如何修改？修改后是否需要重新生成服务器 URL？

1. 登录[飞书 MCP 配置平台](https://open.feishu.cn/page/mcp)。

3. 在左侧 **已创建的 MCP 服务** 列表，选择需要操作的服务。

5. 在 **MCP 工具配置** 区域的 **添加工具** 卡片内，点击 **编辑**，修改已选择的工具，并保存即可。

	

4. 修改后，需要在 AI 工具内刷新或重启 MCP 服务。

	

## Cursor 内的 MCP Tools 状态显示异常是什么原因？

- **问题现象**：如下图，将 MCP 服务一键安装到 Cursor 后，工具状态指示灯显示为红色。

	

- **解决方案**：可忽略该状态，直接在 AI Chat 中发送需求，根据 AI 响应结果判断是否可以正常调用飞书 MCP 工具，如果可以即没有问题。如果无法调用，请重新配置远程 MCP 服务并一键安装到 Cursor 后重试。

## 使用 MCP 访问文档时有哪些权限规则？

与当前使用 MCP 服务的用户自身所拥有的云文档权限完全一致，MCP 服务没有设置其他权限规则。
