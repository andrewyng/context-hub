# 预览与发布卡片

Source URL: https://open.feishu.cn/document/feishu-cards/feishu-card-cardkit/preview-and-publish-cards
Updated: 2025-05-20

# 预览与发布卡片

完成卡片的构建后，你可以通过搭建工具向飞书客户端发送卡片预览。当预览卡片无问题后，你需要先在搭建工具内保存并发布卡片，才能使用卡片 ID 发送卡片。本文档介绍如何在搭建工具中预览与发布卡片。

## 预览卡片

在[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_preview_and_publish)卡片编辑页面的右上角，点击 **保存**，然后点击 **向我发送预览**，你将在飞书客户端收到由开发者小助手发送的卡片预览消息。

## 保存并发布卡片

1. 在[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_preview_and_publish)目标卡片编辑页面的右上角，点击 **保存**，然后点击 **发布**。

   
1. 在 **发布卡片** 对话框，设置 **卡片版本号**，并点击 **发布**。首次发布时版本号默认为 `1.0.0`。

   

   发布卡片后，你可参考[发送卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/send-feishu-card)调用 API 发送卡片。
**注意事项**：- 搭建工具不支持删除已发布的卡片。 
- 卡片发布后，将对线上的卡片相关的 API 调用立即生效。你需确认本次发布是否会对服务端代码逻辑产生不兼容变更。为避免此类情况，在请求发送卡片时，你可将 `template_version_name` 参数设置为固定的卡片版本号，避免在工具上发布卡片后立即影响线上业务逻辑。详情参考[发送卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/send-feishu-card)。

## 管理卡片版本

发布卡片时，卡片将生成本次发布的版本号。要查看历史版本的卡片及其对应的版本号，可在搭建工具的顶部菜单栏中点击 **版本管理** 进行查看。

在版本管理页面，你可查看最近已发布的 10 个卡片版本。也可回退至某个版本，重新编辑、发布。
