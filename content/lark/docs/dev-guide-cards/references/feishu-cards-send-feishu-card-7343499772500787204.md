# 发送卡片

Source URL: https://open.feishu.cn/document/feishu-cards/send-feishu-card
Updated: 2025-04-29

# 发送卡片方式

卡片搭建完成后，你可以参考本文档，根据实际业务场景，选择适合的发送卡片的方式，然后发送卡片。

## 前提条件

你已通过[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs)或卡片 JSON 搭建了一张卡片。

## 发送方式

发送卡片有多种方式，详情参考下文。

### 方式一：无代码发送卡片

要无代码发送卡片，卡片需满足以下条件：
- 卡片由[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs)搭建
- 卡片中未[配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables)与[配置请求回调交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)
- 卡片中未使用 @ 指定人的富文本语法（这是因为对于转发的卡片，被@的用户将不再收到提及通知）
- 卡片仅用于一次性通知或推广场景，无需再次更新

具体步骤如下所示：
1. 在[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs)卡片编辑页面，点击 **向我发送预览**。

    你将在飞书客户端收到由 **开发者小助手** 发送的预览卡片。

      
1. 若卡片预览无误，你可直接转发卡片至指定成员或群聊，实现无代码快速发送卡片。

    

### 方式二：通过自定义机器人请求 Webhook 地址发送卡片

要通过自定义机器人发送卡片，卡片需满足以下条件：
- 卡片中未[配置请求回调交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)
- 卡片仅用于一次性通知或推广场景，无需再次更新
- 卡片仅向单个指定群组发送

具体操作步骤可参考[使用自定义机器人发送飞书卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/send-message-cards-with-custom-bot)。

### 方式三：通过应用调用接口发送卡片

通过应用调用接口发送卡片的方式支持以下多样化场景：
- 为卡片[配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables)，实现卡片模板复用、数据动态更新
- 为卡片配置了[请求回调交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)，实现用户通过卡片提交数据，或卡片基于用户操作即时更新
- 卡片发送后 14 天内，需要更新卡片的场景

具体操作步骤可参考[使用指定应用发送飞书卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/send-feishu-cards-with-app-bots)。

### 方式四：通过多维表格发送卡片并收集数据

使用飞书集成平台，通过多维表格发送卡片。该方式同时可实现将卡片表单中用户填写的数据收集回填至多维表格中，详情参考[飞书集成平台：消息卡片直接录入到多维表格](https://bytedance.larkoffice.com/docx/ADehdLO9ToGyKIxsMbdc8Sb6n3e)。
