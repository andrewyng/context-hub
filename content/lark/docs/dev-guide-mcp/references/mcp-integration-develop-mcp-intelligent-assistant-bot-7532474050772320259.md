# 开发 OpenAPI MCP 智能助手机器人

Source URL: https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/develop-mcp-intelligent-assistant-bot
Updated: 2025-12-05

# 开发 OpenAPI MCP 智能助手机器人

本教程基于 OpenAPI MCP 工具，帮助你快速实现一个 OpenAPI MCP 智能助手机器人。该机器人可以通过与用户对话调用 OpenAPI MCP 工具，完成飞书云文档处理、日历安排等自动化任务。warning
MCP 工具的参数可能会发生变化，开发者请勿按照 MCP 工具的入参定制开发。

## 代码下载

本教程提供基于 Node.js 的示例代码（MCP Larkbot Demo），你可点击 [GitHub](https://github.com/larksuite/lark-samples/tree/main/mcp_larkbot_demo/nodejs) 获取项目。

## 支持能力

智能助手机器人默认启用的工具集为 `preset.default` 工具集中的 API，详情参考[预设工具集](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#7f0f2ab1)。同时，机器人默认使用 **用户身份** 访问令牌，即会以当前 **用户身份** 调用接口，因此会过滤掉 `preset.default` 工具集中不支持 `user_access_token` 的 API 工具。

## 实现效果

以下示例以 [Kimi-K2 模型](https://console.volcengine.com/ark/region:ark+cn-beijing/model/detail?Id=kimi-k2)为例，展示使用机器人 Demo 的效果：

示例 | 创建多维表格并添加指定列 | 获取文档内容
---|---|---
需求 | 帮我创建一个名为“项目任务”的多维表格，包含“任务名称”、“负责人”和“截止日期”这几列 | 请总结这篇文档的内容：[ 业务经营周报](https://www.feishu.cn/docx/EHumdbHVgoUMEixnAgOcQ2conXc)
效果 | &nbsp; | &nbsp;

## 准备工作

在开始本教程操作步骤之前，你需要完成以下准备工作：

- 拥有 AI 模型 OpenAI API 的访问权限，用于配置 `OPENAI_API_KEY`、`OPENAI_MODEL` 和 `OPENAI_BASE_URL` 参数。本教程以 [Kimi-K2 模型](https://console.volcengine.com/ark/region:ark+cn-beijing/model/detail?Id=kimi-k2)为例，了解参数获取方式，可参考[兼容OpenAI API](https://www.volcengine.com/docs/82379/1330626)。
- 准备 Node.js 开发环境，用于运行基于 Node.js 的示例代码。环境要求如下所示，安装参考 [Node.js](https://nodejs.org/)。
    - Node.js 版本大于等于 v20.0.0
    - npm 版本大于等于 v8.0.0

## 操作步骤

本小节介绍开发 MCP 智能助手机器人的整体步骤。

### 步骤一：创建并配置应用

本步骤介绍如何创建应用、并为应用配置指定能力、权限和重定向 URL。推荐你自行[创建一个新的企业](https://www.feishu.cn/hc/zh-CN/articles/360043741453-%E5%88%9B%E5%BB%BA%E4%BC%81%E4%B8%9A)，在新企业中创建应用、添加权限，实现权限免审。
1. 登录飞书 [开发者后台](https://open.feishu.cn/app)。
1. 点击创建 **企业自建应用**，填写应用的 **名称** 和 **应用描述**，点击 **创建**。
1. 参考下表，配置应用。

配置项 | 操作步骤 | 图示
---|---|---
添加应用能力：机器人 | 在 **应用能力 > 添加应用能力** 页面，添加 **机器人** 能力。 | &nbsp;
申请权限：<br>- **应用身份权限**：应用发送消息的基本权限<br>- **用户身份权限**：OpenAPI MCP 工具默认开通的 API 工具需要的用户身份权限 | 1. 在 **开发配置** > **权限管理** 页面，点击 **批量导入/导出权限** 按钮。<br>1. 在弹窗中粘贴以下权限，然后点击 **下一步，确认新增权限** > **申请开通**。<br>```json<br>{<br>"scopes": {<br>"tenant": [<br>"im:message:send_as_bot",<br>"im:message:readonly",<br>"contact:user.id:readonly",<br>"im:message.group_at_msg:readonly",<br>"im:message.p2p_msg:readonly"<br>],<br>"user": [<br>"im:chat:read",<br>"im:chat.members:read",<br>"im:message:readonly",<br>"wiki:wiki:readonly",<br>"docx:document:readonly",<br>"docx:document:create",<br>"search:docs:read",<br>"docs:document:import",<br>"docs:document.media:upload",<br>"docs:permission.member:create",<br>"base:app:create",<br>"base:table:create",<br>"base:table:read",<br>"base:field:read",<br>"base:record:retrieve",<br>"base:record:create",<br>"base:record:update",<br>"contact:user.id:readonly"<br>]<br>}<br>}<br>```     warning<br>如果你要开通的 **用户权限** 与以上权限不完全相同，你需同步修改示例代码 <code>nodejs/src/config/index.ts</code> 文件中的 **OAuth 授权范围**配置（见右图），确保开通的 **用户权限** 与代码中的 **OAuth 授权范围**保持一致。否则此处开通的用户权限将因鉴权失败无效。 | &nbsp;
**安全设置-重定向 URL** | 1. 在左侧导航栏点击 **安全设置**。<br>1. 在 **重定向 URL** 区域，输入以下 URL 并点击 **添加**。<br>```<br>http://localhost:3000/callback<br>``` | &nbsp;

### 步骤二：下载示例代码并配置 .env 文件

1. 点击此处链接下载 Node.js 示例代码并进入 nodejs 文件夹内。你也可使用 Git 命令克隆 GitHub 项目：

     ```bash
     git clone https://github.com/larksuite/lark-samples
     cd mcp_larkbot_demo/nodejs
     ```
1. 在 nodejs 文件夹内，创建名为 `.env` 的文件，粘贴并配置以下环境变量。你也可直接修改并重命名已有的 `.env.example`文件为`.env`。配置示例如下所示：

    ```bash
    # 应用配置示例
    APP_ID=cli_a8f75e4d913abcef # 你创建的应用的 App ID 
    APP_SECRET=RekOQ8EV14shNMtZokRAmdmlabcefabc # 你创建的应用的 App Secret
    LARK_DOMAIN=https://open.feishu.cn  # 飞书域名，保持不变

    # 以下 OpenAI API 配置二选一 
    #  远程 Ark 配置示例
    OPENAI_API_KEY=5caedeqd-dc4b-4444-8003-xxxx
    OPENAI_MODEL=kimi-k2-250711
    OPENAI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3/

    # 本地 Ollama 配置示例
    OPENAI_API_KEY=your_openai_api_key # 此处 ollama 不校验
    OPENAI_MODEL=qwen2:7b
    OPENAI_BASE_URL=http://localhost:11434/v1

    # 服务器配置 / Server Configuration
    PORT=3000     # 服务器配置，可保持不变
    ```

### 步骤三：安装依赖并启动项目

1. 在 nodejs 文件夹内，安装项目依赖：

    ```bash
    npm install
    ```

1. 启动服务：

     ```bash
     npm run dev
     ```

   启动成功的输出如下所示：

   

### 步骤四：添加事件

在上一步中成功启动项目建立长连接后，才可在开发者后台配置事件订阅方式并添加事件。在本教程中，你需为应用添加[接收消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive)事件（im.message.receive_v1）。操作步骤如下所示：
1. 在**开发配置 > 事件与回调 > 事件配置** 页面，编辑 **订阅方式**。

    
1. 选择 **使用** **长连接** **接收事件**，并点击 **保存**。
1. 在 **已添加事件** 区域点击 **添加事件**，并添加 **接收消息** 事件。

    

### 步骤五：发布应用

应用必须发布，才可使配置项生效。以下为发布步骤：
1. 在应用的 **版本管理与发布** 页面，点击 **创建版本**。

   
1. 在 **版本详情** 页面，配置以下应用信息，并点击 **保存**。
    1. **应用版本号**：对用户展示的自定义版本号信息。首次发布应用时可设置例如 `1.0.0` 的版本号。后续迭代的版本号需要高于上一个版本号。
    1. **更新说明**：本次应用更新的详情，将展示在应用的更新日志中。
    1. **应用能力**、**权限变更**：查看并确保变更配置符合预期。
    1. **可用范围**：应用的可用范围，点击 **编辑** 可以手动调整该范围。
    1. **申请理由**：自定义发布应用的原因，用于审核人审核应用时查看。
1. 在弹出的对话框内点击 **确认发布**。
1. 企业管理员将会收到通知。审核通过后，应用发布成功。你也可自行[创建一个新的企业](https://www.feishu.cn/hc/zh-CN/articles/360043741453-%E5%88%9B%E5%BB%BA%E4%BC%81%E4%B8%9A)，在新企业中创建应用、添加权限，实现权限免审。

    

## 体验 Demo

应用发布、项目启动后，你可在飞书客户端中打开智能助手机器人，与机器人对话，体验 Demo。

1. 在飞书客户端搜索创建的应用并发送消息。例如：`帮我搜索一下标题中包含 mcp 的 wiki 文档。` 

1. 启动服务后首次接收消息后，机器人将会发送授权登录链接。点击链接，在页面内完成授权。

   

1. 授权完成后，页面会重定向跳转至如下页面，表示你已成功接入飞书智能助手 Demo。

    

1. 获取用户授权后，机器人应用将会自动调用工具，为你搜索相关文档。

	

5. 您可以继续对话，输入其他需求，机器人应用将会自动调用对应工具实现。例如：
	- 示例一：`帮我总结下这篇文档的内容，告诉我远程调用有哪些优势和适用场景`

	

	- 示例二：`如何开通远程调用 MCP 能力`

	

1. 要清除当前对话的上下文，输入 `/clear` 命令清除。

    

## 常见问题

### 点击用户授权登录链接时，授权失败？

与机器人对话时，若点击机器人发送的授权链接时，未显示如下登录成功页面，请参考以下步骤排查：

- 确认 `.env` 文件中的 `APP_ID` 和 `APP_SECRET` 配置正确
- 确认开发者后台配置的重定向 URL 为 `http://localhost:3000/callback`
- 确保单次运行过程中，仅启动了一个服务：
    - 对于 Windows 系统用户，你可前往 **任务管理器** 查看进程
    - 对于 macOS / Linux 系统用户，你可前往 活动监视器 或使用 `ps aux` 命令行查看进程
- 重启电脑，然后重试

### 在开发者后台开通权限后，仍提示没有足够权限？

请参考以下步骤排查：
1. 确保在开发者后台开通权限后，已发布应用。发布了的应用将显示“当前修改均已发布”。

    
1. 在示例代码中，找到 `mcp_larkbot_demo/nodejs/src/config/index.ts` 文件 **OAuth授权范围** 处，确保此处的权限与在开发者后台开通的 **用户权限** 保持一致。否则开通的用户权限将因鉴权失败无效。

	

3. 修改示例代码后，关闭服务、然后再重新启动服务、再次授权。

### 如何为机器人 Demo 新增更多能力/如何启用自定义工具集？

智能助手机器人 Demo 默认启用的工具集为 `preset.default` 工具集中的 API，详情参考[预设工具集](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#7f0f2ab1)。同时，Demo 默认使用用户身份访问令牌，即会以当前用户身份调用接口，会过滤掉 `preset.default` 工具集中不支持 `user_access_token` 的 API 工具。
要自定义工具或工具集，参考以下步骤。
1. 前往 `nodejs/src/service/mcp.ts` 文件，在构建命令参数，参考注释，修改代码，自定义工具或工具集。以下示例将工具集设为日历 API 工具集。参考[预设工具集](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#7f0f2ab1)了解支持的 API。
     -   参考 [tools](https://github.com/larksuite/lark-openapi-mcp/blob/main/docs/reference/tool-presets/tools-zh.md)，传入工具对应的 **MCP 工具名称**。
        - 参考[预设工具集](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#7f0f2ab1)，传入预设工具集名称。
        - 支持同时传入多个参数值（包括单个 API 工具与预设工具集名称），用逗号分隔。
        - 该方式为全量覆盖，仅启用 `-t` 内包含的 API 工具，默认已启用的工具将被覆盖禁用。

    ```javascript
    let args = [
      '-y',
      '@larksuiteoapi/lark-mcp',
      'mcp',
      '-a',
      config.lark.appId,
      '-s',
      config.lark.appSecret,
      '-d',
      config.lark.domain,
      '-t',   // 需要启用的 MCP 工具或工具集
      'preset.calendar.default', // 此处以添加预设的日历 API 工具集为例。该方式为全量覆盖，仅启用 `-t` 内包含的 API 工具，默认已启用的工具将被覆盖禁用
    ];
   ```

1. 根据启用的工具和工具集，前往对应的 API 文档，了解要开通的权限。例如，对于示例中新增的 `preset.calendar.default` 工具集，包含的接口有：
    - calendar.v4.calendarEvent.create：[创建日程](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar-event/create)
    - calendar.v4.calendarEvent.patch：[更新日程](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar-event/patch)
    - calendar.v4.calendarEvent.get：[获取日程](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar-event/get)
    - calendar.v4.freebusy.list：[查询主日历日程忙闲信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/freebusy/list)
    - calendar.v4.calendar.primary：[查询主日历信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar/primary)
1. 通过查看 API 文档，需要开通的权限有：

     ```
     calendar:calendar;calendar:calendar:read
    ```
1. 前往[开发者后台](https://open.feishu.cn/app)，为应用开通用户身份权限，并发布应用：

    
1. 在示例代码中，找到 `mcp_larkbot_demo/nodejs/src/config/index.ts` 文件中的 “OAuth授权范围”，添加新增的 `calendar:calendar;calendar:calendar:read` 两个权限。

	
5. 重启服务，完成用户授权后，与机器人对话，验证效果：

	

    点击日程链接，可以看到日程已创建完成：
