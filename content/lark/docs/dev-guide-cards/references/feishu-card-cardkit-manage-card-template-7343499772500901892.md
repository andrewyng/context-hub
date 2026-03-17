# 管理卡片权限

Source URL: https://open.feishu.cn/document/feishu-cards/feishu-card-cardkit/manage-card-template
Updated: 2025-05-20

# 管理卡片权限

本文档介绍如何为搭建工具中的卡片添加协作者、转移所有权、绑定应用或自定义机器人。
**注意事项**：仅卡片的所有者可以为卡片添加协作者、转移卡片所有权、绑定应用或自定义机器人。

## 为卡片添加协作者
为卡片添加协作者后，协作者将拥有卡片的编辑权限，方便卡片的协同开发、生产。你可参考以下步骤为卡片添加协作者。
1. 登录 [飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_manage_card_template)并点击要编辑的卡片。
1. 在卡片的编辑页面，点击协作者图标。

   
1. 在 **添加协作者** 弹窗中，添加成员或指定应用，为该成员或该应用的所有协作者开通编辑权限。

   

## 转移卡片所有权

如果你是卡片的所有者，你可参考以下步骤转移卡片所有权。

1. 在卡片的编辑页面，点击更多图标，然后点击 **转移所有权**。

	

2. 在转移所有权弹窗，搜索企业内要转移的用户名称。

	

3. 你可选择是否保留协作者权限。要查看哪些成员拥有协作者权限，你可在卡片的编辑页面，点击协作者图标查看。

   

若卡片的所有者离职：
- 对于[新版卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/cardkit-upgraded-version-card-release-notes)，卡片所有权将默认转移给该成员的上级，无需手动转移
- 对于[旧版卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/cardkit-upgraded-version-card-release-notes)，其将跟随应用资源一并转移。即卡片有者创建的应用如被转移至他人名下，相应的卡片也将一并转移至该接收人名下  
## 为卡片添加应用或自定义机器人

为卡片添加应用或自定义机器人后，该应用或自定义机器人将拥有发送卡片消息的权限，方便卡片的发布与消费。添加应用和自定义机器人的区别如下：

- **添加指定应用**：添加应用后，该应用可通过发送消息相关 API 向指定成员推送消息。 通过应用发送的卡片支持交互能力，企业成员可提交数据到开发者服务端。
- **添加自定义机器人**：绑定自定义机器人后，该自定义机器人通过 webhook 向群聊推送卡片消息。通过自定义机器人发送的卡片仅支持静态内容，即在交互上，只支持链接跳转，不支持提交数据到开发者服务端的请求回调交互。

你可参考以下步骤为卡片添加应用或自定义机器人。
1. 在卡片的编辑页面，点击应用图标。

   
1. 在 **添加自定义机器人/应用** 弹窗中，添加应用或自定义机器人，使该应用或自定义机器人拥有调用该卡片的权限。

   
1. （可选）为卡片添加应用或自定义机器人后，你可参考[发送卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/send-feishu-card)使用该应用或自定义机器人发送卡片。
