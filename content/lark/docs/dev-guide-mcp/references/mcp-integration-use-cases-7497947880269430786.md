# 常见问题

Source URL: https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/use_cases
Updated: 2025-12-05

# 常见问题

本文提供了 MCP 使用相关的常见问题与解决方案。

## AI 工具相关

### 在 Trae 中使用 MCP 时找不到 API 工具是什么原因？

- **问题原因**：Trae MCP 调用上下文空间较小，超过一定 token 会被裁减，导致 AI 调用时找不到工具，且无任何提示。

- **解决方案**：OpenAPI MCP 默认启用的 19 个 API 工具会超过 Trae 的 context window，你可以通过 `-t` 参数缩小调用的 API 数量（建议 10 个以下），或者使用 `preset.light` 预设工具集。具体操作参见[如何启用指定的 OpenAPI](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_installation#74738783)。

### MCP 执行结果不符合预期是什么原因？

OpenAPI MCP 工具默认仅启用了部分飞书开放平台 OpenAPI，因此在某些复杂场景可能因工具无法调用匹配的 OpenAPI 导致执行结果不符合预期，此时你可以使用 MCP 工具的[高级配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration)参数 `-t` 自定义设置启用的 OpenAPI 范围。

### 在 Cursor 内配置 lark-mcp 后状态不正常是什么原因？

- 问题现象：如下图所示，lark-mcp 状态为黄色标识（正常为绿色标识）。

	

- 问题原因：可能因操作 MCP 配置过快导致的状态卡顿。

- 解决方案：重启 Cursor。

### Trae 中不能调用 lark-mcp 如何解决？

在 Trae 内 lark-mcp 开启的 API 工具数量会影响 MCP 调用，建议你尝试缩小 lark-mcp 内启用的 API 工具数量后重试。例如使用[高级配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration)中的 `-t` 参数仅启用 `preset.light` 预设工具集，该工具集内仅包含 10 个 API 工具。

### 如何查看 AI 工具的 MCP 日志？

以 Trae、Cursor 工具为例，打开工具的终端，在 **Output**（即 **输出**） 中选择 **MCP Servers Host** 查看日志。

### Trae 中报错 “Puppeteer build is not available” 如何处理？

- 问题现象：

	

- 问题原因：Node 版本过低。
- 解决方案：确保安装的 Node 版本高于 v20.0.0，推荐使用 [Node.js 官网](https://nodejs.org/zh-cn)提供的最新版本。  

## Node.js 环境相关

### Windows 系统内 Node.js 环境问题自解决建议

优先尝试重启系统。如重启后问题仍未解决，尝试使用[官方安装包](https://nodejs.org/zh-cn/download)重新安装 Node.js，再重启系统。

### npx 执行时提示 “cannot find module xxxx” 如何解决？

- 问题现象：如下图运行 npx 命令时返回错误 `Cannot find module 'xxxx'`。

	

- 问题原因：命令执行过程中网络不稳定或网络中断导致。

- 解决方法：清除缓存目录后重新执行命令。

### macOS 或 Linux 内使用 NVM 安装的 Node.js 找不到或版本不对，导致在 AI 工具中无法启动如何解决？

NVM 依赖 shell 管理 Node.js 版本，大部分 IDE 不会加载 `.zshrc`。建议把 NVM 的脚本放在 `.bash_profile` 或者用 `n` 管理 Node.js 版本。

## Lark-MCP 工具相关

### 为什么无法连接到飞书开放平台 API？

请检查网络连接，并确保填写的应用 App ID 和 App Secret 正确，若仍无法正常访问飞书开放平台 API，可能需要配置代理。

### 调用图片或文件上传/下载相关 API 失败是什么原因？

当前版本暂不支持文件和图片的上传下载功能。

### Windows 环境下命令行显示乱码是什么原因？

将命令行编码更改为 UTF-8，在命令提示符中执行 `chcp 65001`。如使用 PowerShell，可能需要更改终端字体或 PowerShell 配置。

### 安装工具时遇到权限错误如何解决？

在 macOS、Linux 上使用 **sudo** 命令以管理员身份运行，如`sudo npm install -g @larksuiteoapi/lark-mcp` 进行安装，或者修改 npm 全局安装路径的权限。Windows 用户可尝试以管理员身份运行命令提示符。

### Lark-MCP 是否支持远端 SSE/Streamable HTTP 接入点（Endpoint）？

暂不支持。

### 在终端中直接执行 lark-mcp 命令但没有输出是什么原因？

默认为 STDIO 模式，该模式没有输出，因为输出会影响协议传输。可使用 [MCP Client](https://modelcontextprotocol.io/clients) 连接。

### 启动 MCP 服务后提示 token 超过上限如何解决？

尝试使用 MCP 工具的 `-t` 参数减少启用的 API 数量，或换用支持更大 token 的模型。

## 权限相关

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

	

### 应用新增用户身份 API 权限后，是否需要重新进行登录鉴权？

需要。应用在新增用户身份 API 权限后，需要登出当前用户并重新登录。具体操作如下：

1. 在本地打开 AI 工具。

1. 打开 AI 工具内的终端，通过 **npx** 命令登出用户。

    ```
    npx -y @larksuiteoapi/lark-mcp logout
    ```

1. 重新登录。

    ```
    npx -y @larksuiteoapi/lark-mcp login -a <your_app_id> -s <your_app_secret>
    ```

    其中 `<your_app_id>` 为 Lark 应用的 App ID、`<your_app_secret>` 为 Lark 应用的 App Secret，你可登录 [飞书开发者后台](https://open.feishu.cn/app)，在已创建的自建应用详情页的 **凭证与基础信息** 页面，获取 **App ID** 和 **App Secret**。

    

1. 终端会回显用户授权的 URL，需在 60 秒内访问该 URL 并完成授权。

    

    授权页面如下图所示，单击 **授权** 后 MCP 工具才能获取到用户访问凭证（user_access_token）。

    

    成功授权后，终端将回显 **Successfully logged in**。

1. （可选）在 AI 工具的 MCP Tools 中，关闭并重新启用 lark-mcp。

    部分 AI 工具可能需要关闭并重启 MCP 服务才能生效。

    

    正常运行的 lark-mcp 如下图所示。

    

### 我的智能体只需要以应用身份（tenant_access_token）调用 API，是否可以简化配置？

可以，OpenAPI MCP 工具内置的 `--token-mode` 命令参数可以指定工具启用后调用 API 时所用的 Token 类型。
`--token-mode` 取值说明：

- auto（默认值）：由大模型推理自动选择。
- tenant_access_token：使用应用访问令牌，会过滤掉不支持 tenant_access_token 的 API 工具。
- user_access_token：使用用户访问令牌，会过滤掉不支持 user_access_token 的 API 工具。该方式需要先完成用户身份登录，再配置 MCP 服务。详细操作参见[安装并使用 OpenAPI MCP](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_installation)。

示例配置如下：

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
        "--token-mode",
        "tenant_access_token"
      ]
    }
  }
}
```

### 如何快速获取用户访问凭证（user_access_token）？

可调用[获取 user_access_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token) 接口获取用户访问凭证，也可以通过本章节快速获取用户访问凭证。

部分 MCP 工具可能需要以用户身份调用（如[创建多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)），这类场景下需要为应用配置重定向 URL，并获取用户访问令牌（user_access_token）。令牌快速获取方式：

1. 打开[创建多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)帮助文档。
2. 点击文档开头的 **尝试一下**，打开 API 调试台。
3. 在 API 调试台内切换至指定应用，并将请求头的 **Authorization** 切换为 **user_access_token**。

    
4. 点击 **获取 Token**，并在弹出的对话框内点击 **确认添加**。

    
5. 跳转到授权页面完成用户授权。

    授权完成后即可获取当前应用的 **user_access_token**。warning
    user_access_token 存在有效期，建议你在后续使用前，先通过当前方式（重复点击 **获取** **Token**）获取有效可用的 Token。

    

### 使用用户身份鉴权（user_access_token）时报错如何解决？

一般是 user_access_token 过期导致的，user_access_token 需要定期刷新。
- API 方式：调用[获取 user_access_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token)、[刷新 user_access_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/refresh-user-access-token) 接口构建 user_access_token 的自动刷新机制。
- [API 调试台](https://open.feishu.cn/document/tools-and-resources/api-explorer-guide)方式：在调试页面点击 **获取 Token** 生成有效可用的 Token。

    

### 启动 MCP 服务后无法调用某些 API，提示权限不足如何解决？

检查应用是否已获得相应 API 权限。

1. 参考 API 文档查看所需权限。

    例如，[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)文档提供的 API 权限如下图所示。

    

2. 登录[开发者后台](https://open.feishu.cn/app)，进入指定应用。
3. 在应用的**权限管理**页面，点击**开通权限**。
4. 选择 **应用身份权限** 或者 **用户身份权限**，并开通缺失权限。

    如果需要以应用身份调用 API 则选择**应用身份权限**，如果需要以用户身份调用 API 则选择**用户身份权限**。详细说明参见[申请 API 权限](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)。
