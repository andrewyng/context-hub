# 使用指定应用发送飞书卡片

Source URL: https://open.feishu.cn/document/feishu-cards/quick-start/send-feishu-cards-with-app-bots
Updated: 2025-07-07

# 使用指定应用发送飞书卡片

通过本文你可以快速上手体验如何通过指定应用调用发送消息接口，向某个成员发送由搭建工具或卡片 JSON 构建的卡片。

## 使用场景

通过应用调用接口发送卡片的方式支持以下多样化场景：
- 为卡片[配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables)，实现卡片模板复用、数据动态更新
- 为卡片配置了[请求回调交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)，实现用户通过卡片提交数据，或卡片基于用户操作即时更新
- 卡片发送后 14 天内，需要更新卡片的场景
**注意事项**：如果你仅需向单个指定群组中发送静态卡片，无需用户通过卡片进一步交互，你可选择通过自定义机器人发送卡片，无需企业管理员审核。详情参考[使用自定义机器人发送飞书卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/send-message-cards-with-custom-bot)。

## 效果展示

按照本文的操作步骤，最终指定用户可在飞书客户端接收到一条来自应用发送的卡片消息。

## 操作步骤
要通过指定应用向某个成员发送卡片，你需创建一个用于发送卡片的应用、搭建一张飞书卡片，然后调用开放平台接口发送卡片。
### 步骤一：创建并配置应用

1.  登录[飞书开发者后台](https://open.larkoffice.com/app?lang=zh-CN)。
1. 在 **企业自建应用** 页签，点击 **创建企业自建应用**。
1. 配置应用名称、应用描述以及应用图标，并点击 **创建**。

 	 

1. 进入应用详情页，在左侧导航栏中，进入 **[测试企业与人员](https://open.feishu.cn/document/home/introduction-to-custom-app-development/testing-enterprise-and-personnel-functions)** 页面，并在页面右上角点击 **创建测试企业** 创建你的测试企业或关联已有测试企业。
**注意事项**：你也可以选择[自行创建一个新的企业](https://www.feishu.cn/hc/zh-CN/articles/360043741453-%E5%88%9B%E5%BB%BA%E4%BC%81%E4%B8%9A)，再在新企业中创建应用、添加权限，实现权限免审。
5. 在 **操作** 列，点击 **关联应用**。

   
1. 测试企业关联应用后，在页面顶部切换企业应用为测试版本应用。

   
1. 在左侧导航栏中，进入 **应用能力** > **添加应用能力** 页面，找到 **机器人** 卡片，并点击 **添加**。

    
1. 在左侧导航栏中，进入 **开发配置** > **权限管理**，在 **权限管理** 页面中，点击 **开通权限**。

	

3. 将以下权限的 Key 粘贴到权限搜索框，点击 **确认开通** 权限：

    ```
    im:message:send_as_bot
    ```
    开通后，**权限管理** 列会显示已开通的权限。

	
**注意事项**：如果你使用的是正式版本应用而非测试版本，你需要创建应用版本并发布应用，上述配置才可生效。
### 步骤二：创建卡片

你可以选择通过搭建工具搭建一张卡片、或通过卡片 JSON 构建卡片。

#### 通过搭建工具搭建卡片

本步骤介绍如何通过搭建工具搭建一张卡片。

 1. 登录[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_send_cards_with_app)。
 1. 在 **我的卡片** 页面，点击 **+ 创建空白卡片**。
 1. 在 **创建空白卡片** 对话框，输入卡片名称，选择 **新版卡片**，然后点击 **创建**。

    
1. 在卡片内添加 **标题** 组件，并将标题修改为 `示例标题`、副标题修改为 `示例副标题`。

      

1. 在卡片内添加 **普通文本** 组件，并将文本内容修改为 `这是一条示例信息`。

	

1. 在卡片模板的编辑页面，点击应用图标。

   

1. 在 **添加自定义机器人/应用** 弹窗中，选择添加应用。

   

8. 选择 **指定应用**，然后选择你在步骤一中创建的应用，单击 **确定**，使该应用拥有发送该卡片的权限。

   
1. 在搭建工具顶部菜单栏，点击 **保存**。
1. 在搭建工具顶部菜单栏，点击 **向我发送预览**。你将收到由开发者小助手发送的卡片。
1. 预览无误后，回到卡片编辑页面，在页面右上角点击 **发布**。
1. 在 **发布卡片** 对话框，设置 **卡片版本号**，并点击 **发布**。首次发布卡片时，一般设置版本号为 `1.0.0`。

  

#### 通过卡片 JSON 构建卡片

你可参考[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)、[卡片 JSON 2.0 版本组件概述](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/component-json-v2-overview)等文档构建卡片 JSON。以下是卡片 JSON 示例：

```json
{
  "elements": [
    {
      "tag": "div",
      "text": {
        "content": "This is the plain text",
        "tag": "plain_text"
      }
    }
  ],
  "header": {
    "template": "blue",
    "title": {
      "content": "This is the title",
      "tag": "plain_text"
    }
  }
}
```

### 步骤三：调用接口发送卡片
本步骤介绍如何在 API 调试台中调用发送消息接口，向指定成员发送卡片。

1. 登录 [API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=create&project=im&resource=message&version=v1)。
**注意事项**：- 在步骤一中，如果你使用的是应用的测试版本而非正式版本，你需要测试版本关联的测试人员账号调用开放平台接口。
- 私有化环境不支持 API 调试台和测试企业功能。

2. 切换应用为 `Card AppDemo`。

   
3. 获取鉴权凭证 tenant_access_token，获取后 token 会自动填充到 **请求头** 页签下的 **Authorization** 字段。

  	

1. 在[发送消息 API](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) 中，配置请求参数。

  	1. 在 **查询参数** 页签下，设置 **receive_id_type** 为 `open_id`。
  	2. 在 **请求体** 页签下，将请求体替换为以下发送卡片的 JSON 示例：
  	 - 对于 JSON 代码构建的卡片，参考以下请求体示例：

        ```json
        {
            // 与消息接收对象的 ID 类型（receive_id_type）一致的 ID 数据。例如用户 open_id 的值
            "receive_id": "ou_449b53ad6aee526f7ed311b216aabcef",
            // 发送消息的类型。消息卡片的类型值为：interactive
            "msg_type": "interactive",
            // 卡片 JSON 数据序列化后的字符串
            "content": "{\"elements\":[{\"tag\":\"div\",\"text\":{\"content\":\"This is the plain text\",\"tag\":\"plain_text\"}}],\"header\":{\"template\":\"blue\",\"title\":{\"content\":\"This is the title\",\"tag\":\"plain_text\"}}}"
        }
        ```

    - 对于搭建工具搭建的卡片，参考以下请求体示例和表格，将示例值修改为实际值：

        ```json
        {
          "receive_id": "ou_c764e5b96778b6ce48d7d342efeabcef",
          "msg_type": "interactive",
          "content": "{\"type\":\"template\",\"data\":{\"template_id\":\"AAqyjwfhabcef\",\"template_version_name\":\"1.0.0\"}}"
        }
        ```

参数 | 是否必填 | 说明
---|---|---
receive_id | 是 | 消息接收者的 ID。你可 **查询参数** 页签下的 **receive_id_type** 处，点击 **快速复制 open_id**，在弹窗中，选择要发送消息的测试成员。<br><BR>**注意**：消息接收者必须在应用的可用范围内。在本教程中：<br><BR>- 如果你使用的是应用的正式版本，请复制应用创建者的 open_id；<br>- 如果你使用的是应用测试版本，请使用测试人员账号登录 API 调试台后，复制测试人员的 open_id。详情可参见[配置应用可用范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability)。<br>
msg_type | 是 | 消息类型。在卡片场景下，消息类型为 `interactive`。
content | 是 | 消息内容。此处传入卡片相关内容。要发送由搭建工具搭建的卡片，参考以下说明。
└ type | 否 | 卡片类型，发送由搭建工具搭建的卡片（也称卡片模板），固定取值为 `template`。
└ data | 否 | 卡片模板的数据，此处需传入卡片模板 ID、卡片版本号等数据。
└└ template_id | 是 | 搭建工具中创建的卡片（也称卡片模板）的 ID，如 AAqigYkzabcef。可在搭建工具中通过复制卡片 ID 获取。   	<br>
└└ template_version_name | 否 | 搭建平台中创建的卡片的版本号，如 `1.0.0`。<br><br>**注意**：<br>若不填此字段，系统将默认使用该卡片的最新版本。即在搭建平台发布卡片新版本后，该新版本的卡片内容将立即对卡片 API 调用生效。
└└ template_variable | 否 | 若卡片绑定了变量，你需在该字段中传入实际变量数据的值，对应搭建工具中 **模拟数据** 的值。详情参考[配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables)。

<br>

5. 点击 **开始调试**，并确保 API 调用成功。

   

6. 使用消息接收者对应的测试账号，登录飞书客户端，查看接收到的飞书卡片。

   例如，你设置的消息接收对象为用户 open_id，则需要使用该用户账号登录飞书客户端。

   

## 错误排查与分析

若调用接口时遇到报错，你可通过以下方式自助分析与解决。

### 方式 1 ：在 API 调试台参考智能助手的报错信息分析

若在 API 调试台调试接口报错，你可将你的请求参数授权给 AI 智能助手，查看具体错误原因；也可复制 Log ID 至搜索框查看排查建议。

### 方式 2 ：在开发者后台中检索日志分析

要进一步分析了解近 7 日内调用的 API 情况，包括包含请求时长、请求 URL、请求返回错误码、错误信息等，你可前往开发者后台检索。具体步骤如下所示：

1. 前往 [开发者后台](https://open.feishu.cn/app) ，找到指定应用并进入应用详情页。
1. 在左侧导航栏，选择 **运营监控** > **日志检索**。
3. 在 **服务端日志检索** 页签内，配置查询参数，检索应用调用服务端 API 的日志数据。详情参考[日志检索](https://open.feishu.cn/document/tools-and-resources/open-api-log-query)。

## 了解更多

- 如果业务场景需要卡片基于用户操作即时更新，推荐参考[开发一个卡片交互机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)教程与[示例代码](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/explanation-of-example-code)。
- 除发送消息接口外，你还可以通过应用调用其它接口发送卡片。支持发送卡片的接口如下表所示：

接口 | 类型 | 描述
---|---|---
[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) | 服务端 API | 支持向机器人所在的群聊、拥有机器人可用性的用户单聊内发送消息卡片。
[批量发送消息](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM) | 服务端 API | 支持向多个用户或者多个部门中的成员发送卡片。
[发送仅特定人可见的消息卡片](https://open.feishu.cn/document/ukTMukTMukTM/uETOyYjLxkjM24SM5IjN) | 服务端 API | 用于机器人在群会话中发送仅指定用户可见的消息卡片。卡片上将展示 **仅对你可见** 标识。
[删除仅特定人可见的消息卡片](https://open.feishu.cn/document/ukTMukTMukTM/uITOyYjLykjM24iM5IjN) | 服务端 API | 配合发送临时卡片使用，用于销毁不需要的临时消息。
[延时更新消息卡片](https://open.feishu.cn/document/ukTMukTMukTM/uMDO1YjLzgTN24yM4UjN) | 服务端 API | 用于交互组件的回传交互场景。当用户在卡片上操作交互组件后，如服务端无法在 3s 内返回更新卡片内容，可先返回空值，并在 30 分钟内调用此接口延时更新卡片内容。
[更新应用发送的消息卡片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/patch) | 服务端 API | 用于更新已发送的消息卡片内容，可以更新应用发送的 14 天内的消息。<br>**注意**：不要与 **延时更新消息卡片** 接口混用。
[sendMessageCard](https://open.feishu.cn/document/uYjL24iN/uUjN5UjL1YTO14SN2kTN) | 客户端 API，必须在小程序或网页应用中调用 | 能以登录用户身份向指定会话发送消息卡片。发送前会对登录用户弹出二次确认弹窗，预览待发送的卡片内容。
