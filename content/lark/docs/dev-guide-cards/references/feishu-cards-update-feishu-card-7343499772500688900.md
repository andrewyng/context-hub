# 更新卡片

Source URL: https://open.feishu.cn/document/feishu-cards/update-feishu-card
Updated: 2025-05-07

# 更新卡片

发送卡片后，支持在 14 天内更新卡片。你可参考本文档，根据实际业务场景，选择适合的更新卡片的方式。飞书卡片支持的更新方式如下表所示。

更新方式 | 适用场景 | 相关接口
---|---|---
全量更新 | 适用于卡片内容差异较大的更新场景，如表单提交后更新为已提交卡片、AI 机器人的思考中卡片更新为答案卡片等。 | - [更新应用发送的消息卡片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/patch)<br>- [延时更新消息卡片](https://open.feishu.cn/document/ukTMukTMukTM/uMDO1YjLzgTN24yM4UjN)<br>- [全量更新卡片实体](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/update)
局部更新 | 适用于卡片中部分内容需要修改的场景。如 AI 机器人问答场景中，机器人回答过程中卡片新增更多组件、回答结束后删除“停止生成”按钮组件、用户点击赞踩反馈按钮后更新按钮图标。 | 卡片级：<br>- [更新卡片配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/settings)<br>- [批量更新卡片实体](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/batch_update)<br>组件级：<br>- [新增组件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/create)<br>- [更新组件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/update)<br>- [更新组件属性](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/patch)<br>- [删除组件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/delete)
文本流式更新 | 适用于机器人生成答案的场景，“打字机”式返回文本内容，避免终端用户等待较长时间。 | [流式更新文本](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/content)

## 全量更新卡片

全量更新卡片指通过传入新卡片的 JSON 代码或模板 ID，直接取代原卡片。

### 适用场景

适用于卡片内容差异较大的更新场景，如表单提交后更新为已提交卡片、AI 机器人的思考中卡片更新为答案卡片等。

### 相关接口

不同场景下，使用不同接口或方式更新卡片：

**场景一**：卡片发送后，开发者主动更新卡片，无需用户与卡片交互：
- [更新应用发送的消息卡片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/patch)：通过指定消息 ID（message_id）更新卡片
- [全量更新卡片实体](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/update)：通过指定卡片实体 ID 更新卡片。仅支持卡片 JSON 代码

**场景二**：卡片发送后，卡片的全量更新由用户与卡片交互触发。你可选择：

用户与卡片交互后，开发者服务端将收到卡片的回调请求。在[处理卡片回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)时，可选择：
- 立即全量更新卡片：在响应回调请求的 `card.data` 参数中，传入卡片 JSON 或卡片模板数据
- [延时全量更新消息卡片](https://open.feishu.cn/document/ukTMukTMukTM/uMDO1YjLzgTN24yM4UjN)：基于回调请求中获取的 token 参数，传入卡片 JSON 或卡片模板数据

## 局部更新卡片

局部更新卡片指在卡片内进行组件级别的增删改、或仅更新卡片的设置。

### 适用场景

适用于卡片中部分内容需要修改的场景。如 AI 机器人问答场景中，机器人回答过程中卡片新增更多组件、回答结束后删除“停止生成”按钮组件、用户点击赞踩反馈按钮后更新按钮图标。

### 相关接口

卡片级：
- [更新卡片配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/settings)
- [批量更新卡片实体](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/batch_update)

组件级：
- [新增组件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/create)
- [更新组件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/update)
- [更新组件属性](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/patch)
- [删除组件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/delete)

## 文本流式更新

对文本类型组件的内容，进行持续地增量更新，实现“打字机”式的文字输出效果。

### 适用场景

适用于机器人生成答案的场景，“打字机”式返回文本内容，避免终端用户等待较长时间。

### 相关接口

参考[流式更新 OpenAPI 调用指南](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/streaming-updates-openapi-overview)，创建卡片实体、发送卡片后，再根据卡片实体 ID 和组件 ID 流式更新文本，实现“打字机”的输出效果。
