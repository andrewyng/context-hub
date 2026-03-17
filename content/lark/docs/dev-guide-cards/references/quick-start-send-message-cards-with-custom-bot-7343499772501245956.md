# 使用自定义机器人发送飞书卡片

Source URL: https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot
Updated: 2025-07-07

# 使用自定义机器人发送飞书卡片

通过本文档，你可以快速体验如何使用飞书群聊中添加的自定义机器人发送卡片。

## 使用场景

使用自定义机器人发送卡片通常适用于以下场景：
- 仅需向**单个指定群组**中发送静态内容，无需用户通过卡片继续交互
- 需要向单个群组定期发送含有变量数据的静态内容。希望只创建一张卡片，每次发送卡片时可以传入不同数据，实现卡片复用

   

## 使用限制

要使用自定义机器人发送卡片，需满足以下条件：
- 卡片中未添加[请求回调交互事件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/add-interactive-events#c9d07bde)
- 卡片仅用于一次性通知或推广场景，无需再次更新
- 卡片仅向单个指定群组发送

## 注意事项

在飞书卡片中如果需要 @ 某一用户，则需要注意：自定义机器人仅支持通过 [Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid) 或 [User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id) 实现 @ 用户，暂不支持`email`、`union_id`等其他方式。

## 机器人说明

自定义机器人与应用机器人的区别如下所示：

对比项 | 应用机器人 | 自定义机器人
---|---|---
开发方式 | 需在[开发者后台](https://open.feishu.cn/app)创建应用并开启机器人能力。 | 直接在飞书群聊中通过群设置添加，无需开发。
能力范围 | 支持调用 OpenAPI（如发送消息、管理群组）、订阅事件，可跨群或单聊。 | 仅支持通过 Webhook 单向推送消息到指定群聊，无法交互或获取用户数据。
权限要求 | 需申请 API 权限，部分权限需经企业管理员审核。 | 无需权限，但功能受限。
适用场景 | 复杂业务集成（如连接ERP系统）。 | 简单的群通知（如天气提醒）。
图示 |  | 

## 操作步骤

本小节介绍如何使用自定义机器人发送一张绑定了变量的卡片。了解自定义机器人，参考[自定义机器人使用指南](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)。

### 步骤一：创建群自定义机器人

1. 登录飞书客户端。
1. 创建一个名为“`测试自定机器人发送消息`”的群聊。
1. 打开群聊的 **设置** 界面。

   
1. 点击 **群机器人**。

   
1. 点击 **添加机器人**，并在弹出的对话框中，选择 **自定义机器人**。

   
1. 在配置页面，保持默认设置，点击 **添加**。

   
1. 点击 **webhook 地址** 右侧的 **复制**，保存 webhook，并点击 **完成**。
    **注意事项**：**请妥善保存好此 webhook 地址**，不要公布在 Gitlab、博客等可公开查阅的网站上，避免地址泄露后被恶意调用发送垃圾消息。你也可以增加 **安全设置**，以保证信息安全。

### 步骤二：创建卡片

你可通过搭建工具快速搭建一张卡片，也可通过卡片 JSON 代码构建卡片。推荐使用搭建工具搭建卡片，可实现卡片搭建可视化，并支持添加卡片变量，实现卡片多次复用。

#### **（推荐）方式一：使用搭建工具创建并发布卡片**

本步骤介绍如何通过搭建工具搭建并发布一张卡片。

#### **创建卡片**

1. 登录[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs)。
1. 在 **我的卡片** 页面，点击 **参考案例库**。
1. 在 **参考案例库** 对话框，找到并使用 **个人生日祝福** 案例。

    
1. 输入卡片名称，然后点击 **创建**。

   你将进入卡片的编辑页面。

	

#### **（可选）为卡片绑定变量**

本小节介绍如何通过绑定变量的方式，将案例库中的固定姓名修改为通过发送卡片时传入 Open ID、实现@指定用户的效果。

1. 在卡片编辑页面，选中卡片中的富文本组件，在右侧文本内容框中，删除文本 `周翊`，然后添加 @ 指定人语法 `<at id=open_id></at>`。

	

5. 在文本内容框中，删除 `<at id=open_id></at>` 中的文本 `open_id`，并输入英文 `{` 符号，然后点击 **新建变量**。

	

5. 在 **添加变量** 对话框中，参考下图，将 **变量名称** 设为 `open_id`，**模拟数据** 填写为卡片创建者的 Open ID。快速获取 Open ID，参考[如何获取不同的用户 ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)。然后点击 **提交**。

	

   你将在画布中看到人员名称已变更为使用了@人语法的文本。这说明你已成功为卡片绑定了变量，你可在发送卡片时为变量传入数据，实现卡片复用。

   你可在页面右上角点击 **向我发送预览**，预览在飞书客户端内由开发者小助手发送的卡片。

	

#### **为卡片绑定自定义机器人**

卡片搭建完成后，你需为卡片绑定你在步骤一中创建的群自定义机器人，使得该机器人拥有发送该卡片的权限。以下为操作步骤。

1. 在卡片模板的编辑页面，点击应用图标。

   
5. 在 **添加自定义机器人/应用** 弹窗中，选择添加自定义机器人。

    
5. 选择 **指定自定义机器人**，填写你在步骤一获取的自定义机器人的 webhook 地址，使该机器人拥有发送该卡片的权限。

	

#### **发布卡片**

1. 在搭建工具顶部菜单栏，点击 **保存**。然后点击 **发布**。

	
5. 在 **发布卡片** 对话框，点击 **发布**。首次发布卡片时，一般版本默认为 `1.0.0`。

    

#### **获取卡片模板 ID 和版本号**

基于搭建工具创建的卡片，也称为卡片模板。你需获取卡片模板 ID 和版本号用于在步骤三中发送卡片。

   - 卡片模板 ID 在搭建工具的顶部菜单栏中获取，如下图所示。

     
   - 卡片模板版本号为你发布卡片时设置的版本号。如果需要查看历史版本号，可在搭建工具的顶部菜单栏中点击 **版本管理** 进行查看。

      

#### **方式二：基于卡片 JSON 构建卡片**

飞书卡片支持在发送卡片时，直接传入卡片 JSON 源代码。你可在飞书卡片搭建工具中搭建好卡片、并确保发送预览成功后，复制卡片源代码。

你也可自行构建卡片 JSON，在发送卡片时，传入卡片 JSON 源代码。本教程中的卡片 JSON 示例如下所示。你可参考[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)了解卡片 JSON。
**注意事项**：发送卡片时传入卡片 JSON 源代码的方式不支持添加卡片变量。

```json
{
    "schema": "2.0",
    "config": {
        "update_multi": true,
        "style": {
            "text_size": {
                "normal_v2": {
                    "default": "normal",
                    "pc": "normal",
                    "mobile": "heading"
                }
            }
        }
    },
    "body": {
        "direction": "vertical",
        "padding": "12px 12px 12px 12px",
        "elements": [
            {
                "tag": "markdown",
                "content": "西湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。",
                "text_align": "left",
                "text_size": "normal_v2",
                "margin": "0px 0px 0px 0px"
            },
            {
                "tag": "button",
                "text": {
                    "tag": "plain_text",
                    "content": "🌞更多景点介绍"
                },
                "type": "default",
                "width": "default",
                "size": "medium",
                "behaviors": [
                    {
                        "type": "open_url",
                        "default_url": "https://baike.baidu.com/item/%E8%A5%BF%E6%B9%96/4668821",
                        "pc_url": "",
                        "ios_url": "",
                        "android_url": ""
                    }
                ],
                "margin": "0px 0px 0px 0px"
            }
        ]
    },
    "header": {
        "title": {
            "tag": "plain_text",
            "content": "今日旅游推荐"
        },
        "subtitle": {
            "tag": "plain_text",
            "content": ""
        },
        "template": "blue",
        "padding": "12px 12px 12px 12px"
    }
}
```

### 步骤三：发送卡片

基于不同的卡片搭建方式，你需参考不同场景说明发送卡片。本步骤以在本地环境中使用 curl 命令为示例，分别介绍如何发送基于搭建工具搭建的卡片和由卡片 JSON 代码构建的卡片。

#### **场景一：发送基于搭建工具搭建的卡片**

如果你使用搭建工具创建了卡片，你可在本地环境中，通过 curl 指令，向自定义机器人的 webhook 地址发送 HTTP POST 请求。以下为 HTTP POST 请求的代码示例与说明。

   - 如果你的操作系统是 **macOS 系统**，请在本地打开终端（Terminal），参考下表代码说明修改示例代码，然后在本地运行：

        ```bash
        curl -X POST -H "Content-Type: application/json" \
        -d '{"msg_type":"interactive","card":{"type":"template","data":{"template_id":"AAqyBQVmUNxxx","template_version_name":"1.0.0","template_variable":{"open_id":"ou_d506829e8b6a17607e56bcd6b1aabcef"} }}}' \
        https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx
        ```

       

 -  如果你的操作系统是 **Windows 系统**，你可在本地打开命令提示符（cmd）工具，参考下表代码说明修改示例代码，然后在本地运行。使用时请注意 JSON 转义：

      ```bash
      curl -X POST -H "Content-Type: application/json" -d "{\"msg_type\":\"interactive\",\"card\":{\"type\":\"template\",\"data\":{\"template_id\":\"AAqi6xJ8rabcd\",\"template_version_name\":\"1.0.0\",\"template_variable\":{\"open_id\":\"ou_d506829e8b6a17607e56bcd6b1aabcef\"}}}}" "https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx"
      ```

      

- 如果你的操作系统是 **Windows 系统**，你也可以在本地打开 Windows PowerShell 工具，参考下表代码说明修改示例代码，然后在本地运行：

     ```bash
  Invoke-RestMethod -Uri "https://open.feishu.cn/open-apis/bot/v2/hook/a257f9ab-5666-4424-901b-c953xxxxxxxx" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"msg_type":"interactive","card":{"type":"template","data":{"template_id":"AAq4t4vOabcef","template_version_name":"1.0.0","template_variable":{"open_id":"ou_d506829e8b6a17607e56bcd6b1aabcef"}} }}'
     ```

	

代码 | 说明
---|---
POST | 请求方式，无需修改。
Content-Type: application/json | 请求头，无需修改。
`https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx` | 自定义机器人的 Webhook 地址。此处为示例值，你需要替换为自定义机器人真实的 webhook 地址。
```json<br>{<br>"msg_type": "interactive",<br>"card": {<br>"type": "template",<br>"data": {<br>"template_id": "AAqi6xJ8rabcd",<br>"template_version_name": "1.0.0",<br>"template_variable": {<br>"open_id": "ou_d506829e8b6a17607e56bcd6b1aabcef"<br>}<br>}<br>}<br>}<br>``` | 请求体，此处为示例值。具体说明参考下表。在实际使用时，你需：<br>- 将示例值设置为实际值 <br>- 根据系统环境，进行 JSON 压缩或转义 <br>- 自定义变量的值

上方请求体中参数的具体说明如下表：

参数 | 必填 | 说明
---|---|---
msg_type | 是 | 消息类型。在卡片场景下，消息类型为 `interactive`。
card | 是 | 消息内容。此处传入卡片相关内容。
└ type | 否 | 卡片类型。要发送由搭建工具搭建的卡片（也称卡片模板），固定取值为 `template`。
└ data | 否 | 卡片模板的数据，要发送由搭建工具搭建的卡片，此处需传入卡片模板 ID、卡片版本号等。
└└ template_id | 是 | 搭建工具中创建的卡片（也称卡片模板）的 ID，如 `AAqigYkzabcef`。可在搭建工具中通过复制卡片模板 ID 获取。 <br>
└└ template_version_name | 否 | 搭建工具中创建的卡片的版本号，如 `1.0.0`。卡片发布后，将生成版本号。可在搭建工具 **版本管理** 处获取。<br><br>**注意**：<br>若不填此字段，将默认使用该卡片的最新版本。
└└ template_variable | 否 | 若卡片绑定了变量，你需在该字段中传入实际变量数据的值，对应搭建工具中 **模拟数据** 的值。在本教程步骤二中，变量类型为**文本**，变量名称为 `open_id`，模拟数据为 `ou_d506829e8b6a17607e56bcd6b1aabcef`，因此此处对 `open_id` 变量赋值应为：<br>```json<br>{<br>"open_id": "ou_d506829e8b6a17607e56bcd6b1aabcef"<br>}<br>```

若调用成功，机器人将在其所在群聊发送卡片。若调用失败，你可在文档中搜索返回的错误码和错误信息获取排查建议。

#### **场景二：发送由卡片 JSON 代码构建的卡片**

如果你的卡片没有配置变量，你也可以选择直接发送卡片 JSON 代码。你可在本地环境中，通过 curl 指令，向自定义机器人的 webhook 地址发送 HTTP POST 请求。以下为 HTTP POST 请求的代码示例与说明。

   - 如果你的操作系统是 **macOS 系统**，请在本地打开终端（Terminal），参考下表代码说明修改示例代码，然后在本地运行：

        ```bash
        curl -X POST -H "Content-Type: application/json" \
        -d '{"msg_type":"interactive","card":{"schema":"2.0","config":{"update_multi":true,"style":{"text_size":{"normal_v2":{"default":"normal","pc":"normal","mobile":"heading"}}}},"body":{"direction":"vertical","padding":"12px 12px 12px 12px","elements":[{"tag":"markdown","content":"西湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。","text_align":"left","text_size":"normal_v2","margin":"0px 0px 0px 0px"},{"tag":"button","text":{"tag":"plain_text","content":"🌞更多景点介绍"},"type":"default","width":"default","size":"medium","behaviors":[{"type":"open_url","default_url":"https://baike.baidu.com/item/%E8%A5%BF%E6%B9%96/4668821","pc_url":"","ios_url":"","android_url":""}],"margin":"0px 0px 0px 0px"}]},"header":{"title":{"tag":"plain_text","content":"今日旅游推荐"},"subtitle":{"tag":"plain_text","content":""},"template":"blue","padding":"12px 12px 12px 12px"}}}' \
        https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx
        ```

-  如果你的操作系统是 **Windows 系统**，你可以在本地打开命令提示符（cmd）工具，参考下表代码说明修改示例代码，然后在本地运行。使用时请注意 JSON 转义：

      ```bash
       curl -X POST -H "Content-Type: application/json" -d "{\"msg_type\":\"interactive\",\"card\":{\"schema\":\"2.0\",\"config\":{\"update_multi\":true,\"style\":{\"text_size\":{\"normal_v2\":{\"default\":\"normal\",\"pc\":\"normal\",\"mobile\":\"heading\"}}}},\"body\":{\"direction\":\"vertical\",\"padding\":\"12px 12px 12px 12px\",\"elements\":[{\"tag\":\"markdown\",\"content\":\"西湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。\",\"text_align\":\"left\",\"text_size\":\"normal_v2\",\"margin\":\"0px 0px 0px 0px\"},{\"tag\":\"button\",\"text\":{\"tag\":\"plain_text\",\"content\":\"🌞更多景点介绍\"},\"type\":\"default\",\"width\":\"default\",\"size\":\"medium\",\"behaviors\":[{\"type\":\"open_url\",\"default_url\":\"https://baike.baidu.com/item/%E8%A5%BF%E6%B9%96/4668821\",\"pc_url\":\"\",\"ios_url\":\"\",\"android_url\":\"\"}],\"margin\":\"0px 0px 0px 0px\"}]},\"header\":{\"title\":{\"tag\":\"plain_text\",\"content\":\"今日旅游推荐\"},\"subtitle\":{\"tag\":\"plain_text\",\"content\":\"\"},\"template\":\"blue\",\"padding\":\"12px 12px 12px 12px\"}}}" "https://open.feishu.cn/open-apis/bot/v2/hook/a257f9ab-5666-4424-901b-c9538199f4ac"
      ```

   

- 如果你的操作系统是 **Windows 系统**，你也可以在本地打开 Windows PowerShell 工具，参考下表代码说明修改示例代码，然后在本地运行：

     ```bash
    Invoke-RestMethod -Uri "https://open.feishu.cn/open-apis/bot/v2/hook/a257f9ab-5666-4424-901b-c9538199f4ac" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"msg_type":"interactive","card":{"schema":"2.0","config":{"update_multi":true,"style":{"text_size":{"normal_v2":{"default":"normal","pc":"normal","mobile":"heading"}}}},"body":{"direction":"vertical","padding":"12px 12px 12px 12px","elements":[{"tag":"markdown","content":"西湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。","text_align":"left","text_size":"normal_v2","margin":"0px 0px 0px 0px"},{"tag":"button","text":{"tag":"plain_text","content":"🌞更多景点介绍"},"type":"default","width":"default","size":"medium","behaviors":[{"type":"open_url","default_url":"https://baike.baidu.com/item/%E8%A5%BF%E6%B9%96/4668821","pc_url":"","ios_url":"","android_url":""}],"margin":"0px 0px 0px 0px"}]},"header":{"title":{"tag":"plain_text","content":"今日旅游推荐"},"subtitle":{"tag":"plain_text","content":""},"template":"blue","padding":"12px 12px 12px 12px"}}}'
     ```

	

代码 | 说明
---|---
POST | 请求方式，无需修改。
Content-Type: application/json | 请求头，无需修改。
`https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx` | 自定义机器人的 Webhook 地址。此处为示例值，你需要替换为自定义机器人真实的 webhook 地址。
```json<br>{<br>"msg_type": "interactive",<br>"card": {<br>"schema": "2.0",<br>"config": {<br>"update_multi": true,<br>"style": {<br>"text_size": {<br>"normal_v2": {<br>"default": "normal",<br>"pc": "normal",<br>"mobile": "heading"<br>}<br>}<br>}<br>},<br>"body": {<br>"direction": "vertical",<br>"padding": "12px 12px 12px 12px",<br>"elements": [<br>{<br>"tag": "markdown",<br>"content": "西湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。",<br>"text_align": "left",<br>"text_size": "normal_v2",<br>"margin": "0px 0px 0px 0px"<br>},<br>{<br>"tag": "button",<br>"text": {<br>"tag": "plain_text",<br>"content": "🌞更多景点介绍"<br>},<br>"type": "default",<br>"width": "default",<br>"size": "medium",<br>"behaviors": [<br>{<br>"type": "open_url",<br>"default_url": "https://baike.baidu.com/item/%E8%A5%BF%E6%B9%96/4668821",<br>"pc_url": "",<br>"ios_url": "",<br>"android_url": ""<br>}<br>],<br>"margin": "0px 0px 0px 0px"<br>}<br>]<br>},<br>"header": {<br>"title": {<br>"tag": "plain_text",<br>"content": "今日旅游推荐"<br>},<br>"subtitle": {<br>"tag": "plain_text",<br>"content": ""<br>},<br>"template": "blue",<br>"padding": "12px 12px 12px 12px"<br>}<br>}<br>}<br>``` | 请求体。参数说明如下：<br>- `msg_type`：发送消息的类型。在卡片场景下，消息类型为 interactive。<br>- `card`：消息内容。对于使用卡片 JSON 构建的卡片，此处直接传入卡片 JSON 代码。

若调用成功，机器人将在其所在群聊发送卡片。若调用失败，你可在文档中搜索返回的错误码和错误信息获取排查建议。
