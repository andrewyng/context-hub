# 远程调用飞书 MCP Server（历史版本）

Source URL: https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode
Updated: 2026-01-13

# 远程调用飞书 MCP Serverwarning
该功能已不再更新，建议使用[新版远程 MCP 服务（内测中）](https://open.feishu.cn/document/mcp_open_tools/end-user-call-remote-mcp-server)。

飞书开放平台提供远程 MCP Server 配置功能，支持  Streamable HTTP 传输协议，满足用户在云场景中，安全高效地通过 Cursor 、Trae、Claude、 n8n 等 AI agent 一键集成并使用丰富的飞书开放能力。

## 配置 MCP Server

在飞书 MCP 配置平台创建 MCP 远程服务，自定义添加工具（即飞书开放平台服务端 API），灵活构建业务所需的 MCP 工具。
该工具均以当前登录用户身份（user_access_token）调用 API。相关说明：
- 在配置功能过程中，系统会引导你一键完成登录用户的授权操作，只有在用户授权后，MCP Server 才可以以用户身份调用工具。
- user_access_token 本身存在有效期，远程 MCP Server 配置功能已支持过期前自动刷新有效期的能力。
- 了解 user_access_token 可参考 [获取 user_access_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token)、[刷新 user_access_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/refresh-user-access-token)。

1. 登录[飞书 MCP 配置平台](https://open.feishu.cn/page/mcp)。

3. 在页面左侧，点击 **创建 MCP 服务**。
4. 在服务创建页面，完成以下配置。

	1. 在 **MCP 工具配置** 区域，确认当前用户身份。

		后续使用 MCP 管理飞书业务资源时，均是以当前显示的用户进行的，因此，你需要确认当前用户身份正确，若不正确则需要退出登录，并使用正确的用户重新登录。

		

	2. 在 **添加工具** 卡片内，点击 **添加**。
	3. 在 **选择工具** 对话框，选择所需的工具。

		平台提供了 **常用场景** 供你选择，若常用场景没有满足需求的工具，可以在 **自定义选择** 列表中灵活选择多种工具。例如，你的业务需要 MCP 具有管理飞书多维表格的能力，则选中多维表格。  
        展开工具列表，点击某一工具右侧的 **查看文档**，可查看工具的详细介绍。

		

	4. 点击 **确认添加**，并在弹出的 **获取用户授权** 对话框，确认授权用户登录信息、飞书 MCP 应用获得的权限信息后，点击 **授权**。

		

4. 成功添加后，在 **如何使用 MCP 服务** 区域，选择 **传输方式**，并查看 **服务器 URL、JSON**。
    - 其中包含的链接代表以当前登录用户身份去调用飞书工具，相当于个人密钥，请勿泄露给其他人。
	- 链接存在有效期，过期自动失效，如需延长有效期，可以在 URL/JSON 下方点击 **重新授权**。
	- 如担心链接已经泄露，可以在 URL/JSON 下方点击 **重置链接**，将原链接失效并生成新的链接。

	

	- **传输方式**：保持默认 Streamable HTTP 即可。Streamable HTTP 是基于 HTTP 协议的分块（chunked）流式传输，支持任意格式数据（如文件、日志）的渐进式传输。
	- **服务器 URL、JSON**：根据需要将链接配置到 AI agent 内，使 AI agent 能够远程连接飞书 MCP 服务。

    	Trae/Cursor 支持一键安装，操作说明参考本文下一章节。其他 AI agent 可以在相应的 MCP 配置界面设置 URL 或 JSON 来连接飞书 MCP 服务。

## 一键安装到 Trae/Cursor

配置飞书 MCP 服务后，在服务页面底部已提供了快捷添加到 Trae、Cursor 的入口，供你快速安装到 Trae、Cursor。
该方式需要确保本地已安装 [Trae](https://www.trae.cn/) 或者 [Cursor](https://cursor.com/)。

以 Trae 为例，操作如下：

1. 点击 **快捷添加到 Trae**，并根据指引打开 Trae 客户端。
2. 在 Trae 的 MCP 手动配置对话框内，点击 **确认**。

	

3. 点击 **MCP** 路径。

	

	查看已配置的飞书 MCP Server。

	

## 使用 MCP

以 Trae 为例，在 AI agent 内使用飞书 MCP 服务。

- **示例场景 1**：识别保存在飞书云文档内的 PRD 并生成代码

    例如下图，准备一个登录页 PRD 供 AI agent 解析。

	

	1. 在 Trae 工具右侧打开 **Trae**。

    	

	2. 在输入框左下角点击 **智能体**，并选择飞书 MCP 工具所在的智能体（默认为 **Builder with MCP**）。

    	

	3. 在输入框右下角，选择任一 DeepSeek 模型（不同模型实现效果存在差异）。

    	

	4. 在输入框内填写场景提示词，并点击输入框右下角的发送按钮。

		

	5. 等待 AI 运行完毕，并应用示例代码。

		

    	同时，可根据 AI 返回的预览方式，预览示例代码效果。

		

- **示例场景 2**：智能体获取数据并记录在飞书多维表格

	例如下图，准备一份 AI 学习日志云文档，供 AI agent 解析。

	

    1. 在 Trae 工具右侧打开 **Trae**。

    	

	2. 在输入框左下角点击 **智能体**，并选择飞书 MCP 工具所在的智能体（默认为 **Builder with MCP**）。

    	

	3. 在输入框右下角，选择任一 DeepSeek 模型（不同模型实现效果存在差异）。

    	

	4. 在输入框内填写场景提示词，并点击输入框右下角的发送按钮。

		

    	等待 AI 执行完毕：

		

        访问多维表格链接，查看示例数据。

		

## 常见问题

### 如何重命名或删除已配置的 MCP Server？

1. 登录[飞书 MCP 配置平台](https://open.feishu.cn/page/mcp)。
2. 在左侧 **已创建的 MCP 服务** 列表，选择需要操作的服务。
3. 在标题区域，点击 **···**，可选择 **重命名** 或 **删除** 当前服务。

	

### 配置工具后，如何修改？修改后是否需要重新生成服务器 URL？

1. 登录[飞书 MCP 配置平台](https://open.feishu.cn/page/mcp)。
2. 在左侧 **已创建的 MCP 服务** 列表，选择需要操作的服务。
3. 在 **MCP 工具配置** 区域的 **添加工具** 卡片内，点击 **编辑**，修改已选择的工具，并保存即可。

	

4. 修改后，需要在 AI 工具内刷新或重启 MCP 服务。

	

### Cursor 内的 MCP Tools 状态显示异常是什么原因？
- 问题现象：如下图，将 MCP 服务一键安装到 Cursor 后，工具状态指示灯显示为红色。

	
- 问题原因：受工具影响，状态指示灯可能显示为红色，一般不影响 MCP 工具的使用。
- 解决方案：可忽略该状态，直接在 AI Chat 中发送需求，根据 AI 响应结果判断是否可以正常调用飞书 MCP 工具，如果可以即没有问题。如果无法调用，请重新配置远程 MCP 服务并一键安装到 Cursor 后重试。

### 在 Trae 中使用 MCP 时找不到 API 工具是什么原因？

- **问题原因**：Trae MCP 调用上下文空间较小，超过一定 token 会被裁减，导致 AI 调用时找不到工具，且无任何提示。

- **解决方案**：在配置 MCP 服务时选择的工具数量控制在 10 个以下。
