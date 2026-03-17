# 安装并使用开发文档检索 MCP

Source URL: https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/install-and-use-document-search-mcp
Updated: 2026-02-03

# 安装并使用文档检索 MCP

本文介绍如何在 AI 工具（以 [Trae](https://www.trae.com.cn/) 为例）内安装并使用文档检索 MCP 工具。

## 准备工作

### 安装 Node.js

在使用 MCP 工具之前，你需要在 AI 工具所在的运行环境下，安装 Node.js。
请确保安装的 Node 版本高于 v18.20.8，推荐使用 [Node.js 官网](https://nodejs.org/)提供的最新版本。

- **macOS 安装 Node.js**

	- 方式一（推荐）：使用 Homebrew 安装

        ```
        brew install node
        ```

	- 方式二：使用 Node.js 官方安装包

        1. 访问 [Node.js官网](https://nodejs.org/)。
        2. 下载并安装 LTS 版本。

    安装完成后运行以下命令检查是否安装成功。

    ```
    node -v
    npm -v
    ```

    若安装成功会返回对应的版本号。

    

- **Windows 安装 Node.js**

    - 方式一：使用 Node.js 官方安装包

        1. 访问 [Node.js官网](https://nodejs.org/)。
        2. 下载并运行 Windows 安装程序（.msi 文件）。
        3. 按照安装向导操作，完成安装。

    - 方式二：使用 nvm-windows 安装

        1. 下载 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)。
        2. 安装 nvm-windows。
        3. 使用 nvm 安装 Node.js。

            ```
            nvm install latest
            nvm use <版本号>
            ```
    	安装完成后运行以下命令检查是否安装成功。

        ```
        node -v
        npm -v
        ```
    	若安装成功会返回对应的版本号。

		

### 安装 lark-mcp 工具

lark-mcp 是飞书开放平台提供的 MCP 工具包。你需要先安装 lark-mcp（版本要求大于或等于 0.3.0），才能使用文档检索 MCP 工具。

1. 在 Trae 运行环境内打开命令行，执行以下命令，全局安装 lark-mcp 工具。
    - 你可以在 Trae 内打开 Terminal 执行命令，也可以打开 Trae 所在的操作系统命令行执行命令，两者没有区别。
    - 以下命令默认安装最新版本的 lark-mcp。若你历史安装的 lark-mcp 版本低于 0.3.0，则需重新执行该命令安装最新版本的 lark-mcp。

    ```
    npm install -g @larksuiteoapi/lark-mcp
    ```

	

2. 安装完成后，执行以下命令检查安装状态。

    ```
    lark-mcp -V
    ```

    安装成功会返回工具的版本号。

    

## 安装文档检索 MCP

在 AI 工具（以 [Trae](https://www.trae.com.cn/) 为例）内添加 MCP Server，安装文档检索 MCP 工具。

1. 打开 Trae 工具。
2. 在界面右上角点击 **AI 侧栏** 图标。

    

3. 在 AI 侧栏的 **设置** 内，点击 **MCP**。

    

4. 在 **MCP** 界面点击 **添加 MCP Server**。

    

5. 点击 **手动配置**。

    

6. 在 **手动配置** 输入框内，将默认内容替换为以下内容，并单击 **确认**。

	```json
    {
      "mcpServers": {
        "lark_open_doc_search": {
          "command": "npx",
          "args": [
            "-y",
            "@larksuiteoapi/lark-mcp",
            "recall-developer-documents"
          ]
        }
      }
    }
	```

7. 系统会提示 MCP 工具已经自动添加到 **@Builder with MCP**，单击**我知道了**。

    

    配置完成后，在 **MCP Servers** 页面内可以查看到 MCP 工具（名称为 lark_open_doc_search）。

    

## 使用文档检索 MCP

本章节介绍在 AI 工具（以 [Trae](https://www.trae.com.cn/) 为例）内使用文档检索 MCP 工具的步骤与示例效果。

1. 在 Trae 工具右侧打开 **Trae**。

    

2. 在输入框左下角点击 **智能体**，并选择 lark_open_doc_search 工具所在的智能体（默认为 **Builder with MCP**）。

    

3. 在输入框右下角，选择任一 DeepSeek 模型（不同模型实现效果存在差异）。

    

4. 在输入框内填写场景提示词，并点击输入框右下角的发送按钮。

    例如，发送提示词 `如何搭建飞书卡片并将卡片发送给指定用户？`，MCP 工具会检索相关的飞书开放平台文档并生成示例代码。

	- 如下图 ① 区域，在文档检索 MCP 工具的响应结果中，可查看检索到的文档访问链接和内容。
	- 如下图 ② 区域，大模型会根据 MCP 工具的检索结果，生成对应的示例代码。

	
	场景提示词应当尽可能详细，且需适当添加一些限制条件，来确保模型可以准确运行。例如，需要大模型直接返回飞书开放平台文档链接时，在提示词内增加 `搜索文档`、`提供文档访问链接` 等限制条件。
