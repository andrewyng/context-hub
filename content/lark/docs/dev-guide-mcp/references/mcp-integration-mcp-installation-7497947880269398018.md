# 本地调用 OpenAPI MCP

Source URL: https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_installation
Updated: 2025-10-14

# 本地调用 OpenAPI MCP

本文介绍如何在本地的 AI 工具（以 [Trae](https://www.trae.com.cn/) 为例）内安装并使用 OpenAPI MCP 工具。

## 使用限制

OpenAPI MCP 默认情况下仅启用了飞书开放平台的部分 OpenAPI，同时支持手动开启指定的 OpenAPI。
建议你先参考本文指引依次完成 MCP 工具的安装与体验，然后根据自身所需，选择开启指定的 OpenAPI 以适配业务。了解默认启用的 OpenAPI 列表，以及如何开启指定的 OpenAPI，参见本文的 **常见问题** 章节。

## 准备工作

### 创建飞书应用

在使用 MCP 工具之前，你需要先创建一个飞书应用。

1. 登录[飞书开放者后台](https://open.feishu.cn/app)。
2. 在 **企业自建应用** 页签内，点击 **创建企业自建应用**。
3. 设置应用名称、描述、图标并点击 **创建**。

    企业自建应用详细配置说明参见[创建企业自建应用](https://open.larkoffice.com/document/develop-process/self-built-application-development-process#a0a7f6b0)。

4. 在应用的 **凭证与基础信息** 页面，保存 **应用凭证**（**App ID** 和 **App Secret**），以便后续使用。

    

5. 在应用的**添加应用能力**页面，根据需要添加应用能力。

    例如，你需要 AI 向指定用户发送消息，则需要添加 **机器人** 能力。

    

6. 在应用的 **权限管理** 页面，点击开通权限，根据业务所需开通权限。

    例如，需要以应用身份调用[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)接口，则需要根据接口文档开通权限。关于权限申请的详细说明，参见[申请 API 权限](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)。

    OpenAPI MCP 工具默认开通的 API 工具需要应用开启以下权限，你需要在 **开通权限** 界面的输入框内，粘贴以下内容，批量开通权限（注意根据需要分别为应用身份、用户身份开通权限）。

    ```
    im:chat:create, im:chat, im:message, wiki:wiki, wiki:wiki:readonly, docx:document, bitable:app, drive:drive, docs:document:import, contact:user.id:readonly
    ```

	

7. 在应用的 **安全设置** > **重定向 URL** 页面的 **重定向 URL** 区域，输入 `http://localhost:3000/callback`，并点击 **添加**。
    为应用[配置重定向 URL](https://open.feishu.cn/document/uYjL24iN/uYjN3QjL2YzN04iN2cDN)，后续用于用户授权获取用户访问凭证（user_access_token）。

    

	若页面底部存在 **刷新 user_access_token** 开关，则需要开启该开关。

    若没有该开关则无需关注，其默认处于开启状态。

	

8. 完成各项配置后，发布应用，使配置生效。

    1. 在应用的 **版本管理与发布** 页面，点击 **创建版本**。
    2. 完成应用版本号、移动端/桌面端的默认能力、更新说明等配置项后，点击页面底部 **保存**。
    3. 在弹出的对话框内点击确认发布。

        需等待企业管理员审核应用，审核通过后应用才会发布成功。

### 安装 Node.js

在使用 MCP 工具之前，你需要在 AI 工具所在的运行环境下，安装 Node.js。
请确保安装的 Node 版本高于 v20.0.0，推荐使用 [Node.js 官网](https://nodejs.org/)提供的最新版本。

1. 访问 [Node.js官网](https://nodejs.org/)。
2. 下载并安装 LTS 版本。

安装完成后运行以下命令检查是否安装成功。

```
node -v
npm -v
```
若安装成功会返回对应的版本号。

## 安装 OpenAPI MCP

1. 打开 Trae 工具。

2. 打开工具内的终端。

	

3. 执行以下命令，以用户身份登录 OpenAPI MCP。

	```bash
    npx -y @larksuiteoapi/lark-mcp login -a <your_app_id> -s <your_app_secret>
    ```

 	其中 `<your_app_id>` 为飞书应用的 App ID、`<your_app_secret>` 为飞书应用的 App Secret，你可登录[飞书开发者后台](https://open.larkoffice.com/app)，在已创建的自建应用详情页的 **凭证与基础信息** 页面，获取 **App ID** 和 **App Secret**。

    

4. 终端会回显用户授权的 URL，需在 60 秒内访问该 URL 并完成授权。

	

  	授权页面如下图所示，确保用户身份符合预期，并单击 授权，使 MCP 工具获取到用户访问凭证（user_access_token）。

	

	成功授权后，终端将回显 `success`。

5. 在工具右上角，按照 **AI 侧栏 > AI 功能管理 > MCP > 添加 > 手动添加** 的路径，打开 MCP JSON 配置对话框。

	

6. 将默认内容替换为以下 JSON，并单击 **确认**。

	```json
    {
      "mcpServers": {
        "lark-mcp": {
          "command": "npx",
          "args": [
            "-y",
            "@larksuiteoapi/lark-mcp",
            "mcp",
            "-a",
            "<your_app_id>",
            "-s",
            "<your_app_secret>",
            "--oauth"
          ]
        }
      }
    }
	```

    其中 `<your_app_id>` 为飞书应用的 App ID、`<your_app_secret>` 为飞书应用的 App Secret，你可登录[飞书开发者后台](https://open.larkoffice.com/app)，在已创建的自建应用详情页的 **凭证与基础信息** 页面，获取 **App ID** 和 **App Secret**。

    

7. 配置完成后，在 **MCP** 界面，查看 MCP Server 状态。

	Trae 中，工具名称（lark-mcp）右侧的对号（✅）图标表示配置成功。

	

## 使用 OpenAPI MCP

工具在默认情况下，仅启用了部分飞书开放平台 OpenAPI，同时支持手动开启指定的 OpenAPI。详情参见本文的 **常见问题** 章节。

1. 在 Trae 工具右侧打开 **Trae**。

    

2. 在输入框左下角点击 **智能体**，并选择 lark-mcp 工具所在的智能体（默认为 **Builder with MCP**）。

    

3. 在输入框右下角，选择任一 DeepSeek 模型（不同模型实现效果存在差异）。

    

4. 在输入框内填写场景提示词，并点击输入框右下角的发送按钮。

    示例提示词：`创建一个飞书多维表格，并将该表格发送给员工李健（员工邮箱为：xxxx@example.com）。注意飞书用户 ID 类型统一使用 open_id。`
    场景提示词应当尽可能详细，且需适当添加一些限制条件（如限制用户 ID 类型统一使用 open_id），来确保模型可以准确运行。

5. 等待 AI 运行，出现调用工具提醒后，点击 **运行**。

    

6. 运行过程中模型会调用多个工具，需要依次点击 **运行**，并等待运行结束。warning
	如果运行失败，可根据智能体回显的调用记录，排查错误原因。

	- 常见的错误原因是因为应用缺少相应的 API 权限。<br>

    	如果智能体回显了为应用开通权限的 URL，你可以直接访问 URL 跳转至应用详情页开通缺少的权限；或者你可以根据 API 文档（例如[创建多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)），为应用开通 API 所需的权限。

    - 为应用开通权限后，如果是需要审核的权限，则需要重新发布应用使配置生效。

    - 如果是以用户身份（user_access_token）调用 API，为应用开通新权限并重新发布后，需要先登出 MCP，再重新登录。具体操作参见[应用新增用户身份 API 权限后，是否需要重新进行登录鉴权](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/use_cases#d00111fb)。

    

7. 登录飞书客户端，查看运行结果。

    

    点击 **员工信息表**，可访问多维表格。

    

## 常见问题    

### MCP 工具默认启用的 OpenAPI 有哪些？

默认情况下 MCP 服务启用的 OpenAPI 如下表所示。

| **API名称**                        | **功能描述**      | **所需权限** |
| -------------------------------- | ------------- | -------|
| im.v1.chat.create                | [创建群](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create)           | 创建群（im:chat:create） |
| im.v1.chat.list                  | [获取用户或机器人所在的群列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/list)       | 获取与更新群组信息（im:chat） |
| im.v1.chatMembers.get            | [获取群成员列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-members/get)         | 获取与更新群组信息（im:chat） |
| im.v1.message.create             | [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)          | 获取与发送单聊、群组消息（im:message） |
| im.v1.message.list               | [获取会话历史消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list)        | 获取与发送单聊、群组消息（im:message） |
| wiki.v2.space.getNode            | [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)       | 查看、编辑和管理知识库（wiki:wiki） |
| wiki.v1.node.search              | [搜索 Wiki](https://open.feishu.cn/document/ukTMukTMukTM/uEzN0YjLxcDN24SM3QjN/search_wiki)      | 查看知识库（wiki:wiki:readonly） |
| docx.v1.document.rawContent      | [获取文档纯文本内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/raw_content)        | 创建及编辑新版文档（docx:document） |
| drive.v1.permissionMember.create | [增加协作者权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/create)       | 查看、编辑和管理知识库（wiki:wiki） |
|docx.builtin.import|导入文档，包括上传素材/文件、创建导入任务、查询导入任务结果三步骤，详情参见[导入文件概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/import-user-guide#461aa643)| 查看、评论、编辑和管理多维表格(bitable:app)、查看、评论、编辑和管理云空间中所有文件（drive:drive）、查看、创建云文档导入任务（docs:document:import） |
|docx.builtin.search|[搜索云文档](https://open.feishu.cn/document/ukTMukTMukTM/ugDM4UjL4ADO14COwgTN)|查看、评论、编辑和管理云空间中所有文件（drive:drive）|
| bitable.v1.app.create            | [创建多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)       |查看、评论、编辑和管理多维表格(bitable:app)|
| bitable.v1.appTable.create       | [新增一个数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/create)     |查看、评论、编辑和管理多维表格(bitable:app)|
| bitable.v1.appTable.list         | [列出数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list)   |查看、评论、编辑和管理多维表格(bitable:app)|
| bitable.v1.appTableField.list    | [列出字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list) |查看、评论、编辑和管理多维表格(bitable:app)|
| bitable.v1.appTableRecord.search | [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)   |查看、评论、编辑和管理多维表格(bitable:app)|
| bitable.v1.appTableRecord.create | [新增记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/create)   |查看、评论、编辑和管理多维表格(bitable:app)|
| bitable.v1.appTableRecord.update | [更新记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/update)   |查看、评论、编辑和管理多维表格(bitable:app)|
| contact.v3.user.batchGetId       | [通过手机号或邮箱获取用户 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/batch_get_id)      |通过手机号或邮箱获取用户 ID（contact:user.id:readonly）|

### 如何启用指定的 OpenAPI？

如需启用特定的 OpenAPI 工具，可以在 MCP 配置文件内通过 `-t` 参数指定。参数使用说明：

- 可参考 [tools](https://github.com/larksuite/lark-openapi-mcp/blob/main/docs/reference/tool-presets/tools-zh.md)，传入工具对应的 **MCP 工具名称**。
- 可传入[预设工具集](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#7f0f2ab1)。例如传入消息预设工具集（preset.im.default），则会批量启用消息 API。
- 支持同时传入多个参数值（包括单个 API 工具与预设工具集名称），用逗号分隔。
- 该方式为全量覆盖，会将默认已启用的 API 工具给覆盖掉，只启用 `-t` 内包含的 API 工具。

配置示例如下：

```json
{
  "mcpServers": {
    "lark-mcp": {
     "command": "npx",
      "args": [
        "-y",
        "@larksuiteoapi/lark-mcp",
        "mcp",
        "-a",
        "<your_app_id>",
        "-s",
        "<your_app_secret>",
        "-t",
        "im.v1.message.create,im.v1.message.list,im.v1.chat.create"
      ]
    }
  }
}
```

### 用户身份过期是否支持自动刷新？

支持，使用 OpenAPI MCP 的 **login** 命令参数完成用户身份鉴权后，在请求 API 之前会检查 user_access_token 是否过期，若过期会自动刷新 user_access_token。

若自动刷新失败，智能体会推送提示，你需要根据提示访问授权页面并重新完成授权。

### 使用应用身份创建云文档后，用户无法访问该云文档，如何解决？

MCP 工具默认不指定[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)的身份类型，由大模型推理自动选择。因此，可能会出现 MCP 使用应用身份调用接口、创建云文档的情况。

如果你希望 MCP 使用你的身份创建、操作云文档（即云文档的所有权属于你，应用仅代表你执行操作），那么你可以：

- 方式一：修改 MCP JSON 文件，通过 `--token-mode` 指定 MCP 始终使用 user_access_token 调用 API：

  ```json
  {
    "mcpServers": {
      "lark-mcp": {
       "command": "npx",
        "args": [
          "-y",
          "@larksuiteoapi/lark-mcp",
          "mcp",
          "-a",
          "<your_app_id>",
          "-s",
          "<your_app_secret>",
          "--token-mode",   // 此处指定 token 类型为 user_access_token
          "user_access_token"
        ]
      }
    }
  }
  ```

- 方式二：使用命令行指定 MCP 始终使用 user_access_token 调用 API：

  ```bash
  lark-mcp mcp -a cli_xxxxxxxxxx -s xxxxxxxxxxxx --token-mode user_access_token  
  ```
	其中，`cli_xxxxxxxxxx` 和 `xxxxxxxxxxxx` 分别表示实际的应用的 App ID 和 App Secret。你可前往[开放者后台](https://open.feishu.cn/app)，在应用的 **凭证与基础信息** 页面，获取应用凭证（App ID 和 App Secret）。
