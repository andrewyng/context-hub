# 开发一个卡片交互机器人

Source URL: https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/develop-a-card-interactive-bot
Updated: 2025-05-21

# 开发一个卡片交互机器人

卡片交互机器人允许用户在机器人发送的飞书卡片上，提交数据并更新卡片。通过本教程，你可以在 **三分钟内创建、发布一个应用并体验效果**，从而了解机器人应用的基本开发流程，以及搭建、发送与更新飞书卡片的流程，和通过服务端 SDK 调用 API 和回调的方法。目前暂不支持在[测试企业](https://open.feishu.cn/document/home/introduction-to-custom-app-development/testing-enterprise-and-personnel-functions)中体验本教程。
## 搭建步骤            
<interactive-course>
  <interactive-course-module
    type="create-app"
    title="创建应用"
    appManifestUrl="[file](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/5a496a15486859ad5472fd3cccd22f19_PNjOHHMnub.json)"
  >
    创建后，系统将自动添加以下应用配置。详细配置说明参见[应用配置说明](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/faqs)。

  </interactive-course-module>

  <interactive-course-module
    type="create-lark-card"
    title="搭建飞书卡片"
    cardPkgUrl="[file](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/e335f83cbc592fda05beb76ef947b982_mBCy4k8siB.json)"
  >
    在本步骤中，你需要搭建欢迎卡片、发起告警、告警处理完成共 3 张卡片。点击 **创建卡片** 一键创建。了解如何手动搭建，参考[卡片搭建说明](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/card-building-steps)。

  </interactive-course-module>

  <interactive-course-module
    type="publish-app"
    title="创建版本并发布"
    pcDefaultAbility="bot"
    mobileDefaultAbility="bot"
  >
当应用的基本信息、权限范围和应用功能等信息发生变更时，都需要发布新的应用版本才能正式生效。自建应用发布流程可参见[发布应用](https://open.feishu.cn/document/home/introduction-to-custom-app-development/self-built-application-development-process#baf09c7d)。
  </interactive-course-module>

  <interactive-course-module
    type="run-code"
    title="运行代码"
    codePkgUrl="[file](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/d6e21e3bd357a45631348fcbed327698_RNVCD3F26o.json)"
    installedPoster="[file](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/c5d657385659d185a6a7db18589fe9aa_IQKUBg4bqq.png)"
    installedVideo="[file](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/1e4a744e1778c81c257400984d9d55c8_daWWIEF9A4.mp4)"
    uninstalledPoster="[file](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/df36b66644a252eae89df28e725613f2_iiYHc1QV0N.jpg)"
    uninstalledVideo="[file](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/4afe973a989a1f3e743d1ba51f2aa7bd_nAK4I9O0h3.mp4)"
  >请选择你所需运行的语言后，根据视频提示启动示例代码，代码下载和说明参见[示例代码解释](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/explanation-of-example-code)。
  </interactive-course-module>

  <interactive-course-module
    title="体验和试用"
    actions:button1:disabled-type="before-active"
    actions:button1:type="primary"
    actions:button1:text="打开"
    actions:button1:link="https://applink.feishu.cn/client/bot/open?appId=:appID"
  >
   点击 **打开** 按钮体验机器人。完整体验机器人的方式参考下文。
  </interactive-course-module>
</interactive-course>

如果你在一键创建、发布、运行代码、体验应用的过程中有任何问题，欢迎点击此[表单](https://bytedance.larkoffice.com/share/base/form/shrcnC4hpksD9Z8etkdyJa87F5g?hide_docid=1&hide_userid=1&hide_%E4%B8%9A%E5%8A%A1%E5%9F%9F=1&hide_%E5%8F%8D%E9%A6%88%E4%B8%8A%E4%B8%8B%E6%96%87=1&hide_%E5%8F%8D%E9%A6%88%E6%9D%A5%E6%BA%90=1&hide_%E6%96%87%E6%A1%A3%E6%A0%87%E9%A2%98=1&hide_%E6%96%87%E6%A1%A3%E9%93%BE%E6%8E%A5=1&prefill_docid=7457433042430476292&prefill_%E4%B8%9A%E5%8A%A1%E5%9F%9F=7473534698498539548&prefill_%E5%8F%8D%E9%A6%88%E4%B8%8A%E4%B8%8B%E6%96%87=%E5%8D%A1%E7%89%87%E4%BA%A4%E4%BA%92%E6%9C%BA%E5%99%A8%E4%BA%BA&prefill_%E5%8F%8D%E9%A6%88%E6%9D%A5%E6%BA%90=%E5%88%92%E8%AF%8D%E5%8F%8D%E9%A6%88&prefill_%E6%96%87%E6%A1%A3%E6%A0%87%E9%A2%98=%E4%B8%89%E5%88%86%E9%92%9F%E5%BF%AB%E9%80%9F%E5%BC%80%E5%8F%91&prefill_%E6%96%87%E6%A1%A3%E9%93%BE%E6%8E%A5=https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FuAjLw4CM%2FuMzNwEjLzcDMx4yM3ATM%2Fdevelop-a-card-interactive-bot%2Fintroduction)反馈。

## 实现效果

卡片交互机器人的的最终实现效果如下所示：

用户与机器人单聊 | 用户在群组内@机器人
---|---
1. 用户进入与机器人单聊页面，机器人自动发送“欢迎”卡片<br>2. 用户点击欢迎卡片的 **去体验：发起告警** 按钮，机器人发送“发起告警”卡片<br>提示：用户也可点击输入框上方 **发起告警** 菜单按钮，或向机器人发送任意文字消息以触发机器人发送该卡片<br>3. 用户在卡片输入框中输入处理情况说明，然后点击 **处理完成** 按钮。卡片更新为“告警处理完成”卡片 | 1. 用户在群组内@机器人，机器人自动发送“发起告警”卡片<br>3. 用户在卡片输入框中输入处理情况说明，然后点击 **处理完成** 按钮。卡片更新为“告警处理完成”卡片
 | 

## 体验机器人

应用发布生效后，前往飞书客户端验证机器人的实现效果。
**注意事项**：登录飞书客户端的用户必须要在[应用可用范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability)内。本教程中建议使用应用所有者身份登录飞书客户端进行测试。
### 与机器人单聊

1. 在飞书客户端内搜索应用机器人名称，进入与机器人单聊页面。
**注意事项**：你也可以通过 AppLink 打开机器人会话，链接地址 `https://applink.feishu.cn/client/bot/open?appId={appId}`，详情参见[打开机器人会话](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/applink-protocol/supported-protocol/open-a-bot)。

机器人将自动发送“欢迎体验”卡片。

2. 点击 **去体验：发起告警** 按钮。

    机器人将发送“发起告警”卡片。
**注意事项**：你也可点击输入框上方 **发起告警** 菜单按钮，或向机器人发送任意文字消息以触发机器人发送“发起告警”卡片。

3. 在卡片输入框中输入处理情况说明，然后点击 **处理完成** 按钮。

   卡片更新为“告警处理完成”卡片。

	

### 在群聊中@机器人

1. 进入某一群组，在群组的 **设置** > **群机器人** 功能中，搜索应用机器人并添加。

	

	

2. 在群组聊天中，发送@机器人消息。机器人将发送“发起告警”卡片。

	

4. 在卡片输入框中输入处理情况说明，然后点击 **处理完成** 按钮。

   卡片将更新为“告警处理完成”卡片。

	
## 常见问题
### 问题一：无法搜索到应用

当前用户不在[应用可用范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability)内。你可前往开发者后台 **版本管理与发布** 确认。

### 问题二：进入机器人单聊后，机器人没有自动发送 “欢迎” 卡片

项目与开放平台的长连接已断开。请重新复制启动命令并重新启动程序，确保命令提示符中显示如下信息。

- Go

	

- Python

	

- Java

	

- Node.js

	

### 问题三：与机器人单聊会话中，没有菜单按钮

这是因为机器人菜单的配置有延时。请稍等几分钟再查看。

### 问题四：运行代码报 SSLCertVerificationError 错误

该错误表示 SSL 证书验证失败，通常是由于本地环境服务器证书无效、过期、或自签名缺失等原因造成。你可尝试升级系统或升级系统依赖解决。

### 问题五：如何重复体验机器人

如需重复体验（例如体验创建发布应用、体验多种开发语言），可在第一步创建应用中，点击 **查看应用** 按钮右侧的 **重新创建应用**。

## 后续操作

如果你已完成本教程的搭建步骤、成功搭建了卡片交互机器人，你可以：

- 在示例代码包中，选择所需代码语言的示例文件，基于你自己的业务场景，修改代码逻辑
- 自行搭建服务器并部署代码，将启动指令中的 `APP_ID`、`APP_SECRET`、`CARD_ID` 等参数传入本地环境变量即可
  **注意事项**：本教程中的示例代码使用 **长连接** 接收事件方式，支持线上部署。但如果你在 FaaS 模型下部署代码、在生产环境中调试，推荐你选择[将事件发送至开发者服务器](https://open.feishu.cn/document/ukTMukTMukTM/uYDNxYjL2QTM24iN0EjN/event-subscription-configure-/choose-a-subscription-mode/send-notifications-to-developers-server)的方式，资源利用更高效，调试更便利。

## 相关文档

完成三分钟快速开发后，你可参考以下相关说明，进一步了解本次开发的实现思路、应用配置、卡片搭建和示例代码：

- [实现思路](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/development-steps)
- [应用配置说明](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/faqs)
- [卡片搭建说明](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/card-building-steps)
- [示例代码解释](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/explanation-of-example-code)
