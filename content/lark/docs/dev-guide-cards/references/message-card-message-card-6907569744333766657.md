# 常见问题

Source URL: https://open.feishu.cn/document/common-capabilities/message-card/message-card
Updated: 2025-06-23

# 飞书卡片常见问题

本文档提供你在搭建卡片、发送卡片和更新卡片时可能遇到的问题及其解决办法。

## 搭建卡片问题

### 1. 卡片中使用有序列表、无序列表等 markdown 语法没有生效？

有序列表、无序列表等 markdown 语法必须放在富文本组件中才能生效。参考文档：
- 搭建工具中使用富文本：[富文本](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/markdown)
- 使用 JSON 代码构建富文本：[富文本（Markdown）](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/rich-text)

### 2. 卡片是否支持 HTML 语法？

卡片支持一部分 HTML 语法，但需要使用新版卡片（JSON 2.0 结构卡片）。详情参考[富文本组件支持 HTML 语法和标准 markdown 语法](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-breaking-changes-release-notes#1ec43211)。

### 3. 卡片是否支持@单个成员或所有人？

支持。你可使用[富文本](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/markdown)组件的@指定人语法。但该语法仅适用于通过机器人、调用接口发送卡片的场景。人工手动转发卡片的场景@语法不生效。
另外，如果要在卡片中展示人员的用户名、头像、个人名片等，你可使用[人员](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/user-profile)或[人员列表](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/user-list)组件。但人员和人员列表组件仅作为展示，用户不会收到提及通知。

### 4. 卡片部分 Markdown 语法无效？

目前旧版卡片（即 JSON 1.0 版本）只支持 markdown 语法的子集，支持语法参考[富文本（Markdown）](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/rich-text)组件。要使用更多富文本语法，参考：
- 搭建工具中使用富文本：[富文本](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/markdown)
- 使用 JSON 代码构建富文本：[富文本（Markdown）](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/rich-text)

### 5. 人员选择组件是否支持在企业全局范围内选择？

不支持。人员选择组件仅支持自动获取当前群聊的人员或搭建卡片时传入的人员。

### 6. 卡片的按钮中可以添加 emoji 表情吗？

卡片的按钮支持以直接复制 emoji 的方式添加表情。查看 [emoji表情大全](https://www.feishu.cn/docx/doxcnG6utI72jB4eHJF1s5IgVJf)。

### 7. 表格组件内部支持添加链接吗？

支持。你需将列的数据类型（data_type）设置为 lark_md 或 markdown，再添加链接语法。参考文档：

- 搭建工具中使用表格：[表格](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/table)
- 使用 JSON 代码构建表格：[表格](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/table)

### 8. 在卡片搭建工具中，如何回滚卡片模板的版本？

参考[预览与发布卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/preview-and-publish-cards)中**管理卡片版本**一节。

### 9. 卡片的跳转链接，如何能在飞书内部打开，而不是通过浏览器打开？

通过 [appLink](https://open.feishu.cn/document/uYjL24iN/ucjN1UjL3YTN14yN2UTN) 可实现在飞书内打开，其余链接都是在外部打开。示例：
```
https://applink.feishu.cn/client/web_url/open?mode=sidebar-semi&max_width=800&reload=false&url=https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FuAjLw4CM%2FuMzNwEjLzcDMx4yM3ATM%2Fdevelop-a-card-interactive-bot%2Fintroduction
```

### 10. 如何在搭建工具中删除某个组件？

如下图，你可以在搭建工具左侧导航栏中，切换至 **大纲树** 一栏，在卡片的大纲树中选中指定组件删除。

### 11. 飞书卡片中上传图片有什么限制？

请参考[图片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/image)组件文档中的注意事项。

### 12. 卡片按钮等交互组件里可否不传 value 属性？

可以。在此情况下，用户点击交互组件时，回调将不会返回对应字段。

### 13. 在飞书卡片搭建工具中，提示 template variable can't be here，如何解决？

这个是因为对应的变量不支持绑定到相应的组件上。可参考[配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables#1d19fbb3)了解不同组件支持的变量类型。

### 14. 飞书卡片迁移到新版搭建工具后，变量不生效，如何解决？

将旧版工具导出的 *.json 文件导入至新版搭建工具时，需注意：
- 若旧版工具中有变量占位符，你需确保你已在旧版工具中声明了变量。即你需要在旧版工具中 创建变量 并添加 模拟数据。否则变量在新版工具中将失效。
- 若旧版工具中有「循环对象」变量，你需确保你已在「循环对象」的模拟数据中填充了子变量数据，否则绑定了「循环对象」的分栏将在新版工具中渲染异常。新版工具会将旧版工具的「循环对象」变量转换为「对象数组」变量，并根据旧版工具模拟数据中声明的 key-value 创建相应类型的子变量。

### 15. 如何实现用户点击按钮后，将填写的表单项通过回调回传至我的服务器上？

[表单容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/form)中自带的“提交”按钮默认支持该功能，无需开发者自行实现。当用户点击提交按钮后，本地缓存的表单内容将一次回调至开发者的服务端，实现一次提交多个表单项数据效果。

### 16. 如何在卡片中插入视频？

飞书卡片目前不支持插入视频直接播放。你可通过**插入视频链接** 或使用**图片+链接** 方式使用户点击链接或图片后跳转至视频链接：

- **插入视频链接**：
使用[富文本](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/markdown)组件，在卡片中插入视频的链接地址，使用户点击链接后可以在浏览器或飞书内打开视频。

- **使用图片+链接的方式**：使用[图片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/image)组件，在卡片中插入视频的封面图片，并为图片设置跳转链接，指向视频地址。

### 17. 如何删除搭建工具中的卡片？

在卡片搭建工具的 **我的卡片** 页面，点击目标卡片的更多按钮，然后删除卡片。若卡片无法删除，说明该卡片已被发布。已发布的卡片将不再支持删除。

### 18. 飞书卡片是否支持级联选项/组件之间的联动（如省份和城市之间的联动）？

目前暂不支持拉下选项等组件的联动。仅支持通过组件绑定请求回调事件后，再通过回调更新卡片。详情参考[添加自定义交互事件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/add-interactive-events)和[处理卡片回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)。

**注意**：要实现级联效果，请勿将交互组件放置于表单容器中。表单容器中的交互组件仅支持通过表单中的按钮提交数据。

### 19. 如何调整标题组件中文本的大小？

标题组件中的标题和副标题文本不支持调整大小。

### 20. 为卡片配置多语言后，如何在飞书客户端查看效果？

为卡片设置多语言后，卡片将根据用户的飞书客户端语言，自动展示对应语言的卡片内容。因此你需要切换飞书客户端语言，查看对应语种效果。

### 21. 在 URL 链接是否支持部分内容作为变量使用？

搭建工具中的新版卡片（2.0 结构）支持 URL 链接中部分内容（如路径参数）作为变量，动态传值。旧版卡片（1.0）不支持。

## 发送卡片问题

### 1. 如何将卡片消息发送到群聊中？

你可通过以下两种方式将卡片发送到群中：
- 在群聊中添加自定义机器人，使用自定义机器人通过 webhook 向群聊发送消息。详情参考[使用自定义机器人发送飞书卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/send-message-cards-with-custom-bot)。
- 将上线的机器人应用添加到群聊中，再调用[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) API，指定接收消息类型为群聊并指定群聊 ID，再发送卡片。详情参考[发送卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/send-feishu-card)。

### 2. 发送卡片有什么限制？

- 卡片整体数据不可超过 30 KB。
- 卡片中组件之间的嵌套层级不可超过五层。
- 单张卡片最多支持放置五个表格组件。若卡片配置了多语言，则单个语言最多支持放置五个表格组件。

### 3. 卡片能批量发给多人吗？

支持。API 参考[批量发送消息](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM)。但你需注意：
- 请求参数中`msg_type`为`interactive`，`content` 需改为`card:{}`结构体
- 批量发送的卡片不支持更新、不支持回传交互

### 4. 卡片发送时报链接 scheme 不在白名单？

目前不支持不合法的URL，仅支持 http 和 https。

### 5. 为什么在发送卡片时，markdown 文本中带有明文链接有时候会发送失败？

可以检查一下该链接是否为 `https://xxxx.xxx中文文本` 这样的形式。你需要在链接和中文之间加空格将其隔开，避免 markdown 将整个 `https://xxxx.xxx中文文本` 判断为一个不合法链接。如果你需要这样使用，可以使用 `<a>` 标签。

### 6. 为什么在发送卡片时，我发送的链接报链接有误，但是复制到浏览器上可以打开？

可能是如下原因：卡片中的链接不支持特殊字符。建议将对应的参数转义。例如：`https://open.feishu.cn?time=31/12/2014`` 23:59:59`。该链接有误，你需将其转义为：`https://open.feishu.cn?time=31%2F12%2F2014%2023%3A59%3A59`。

### 7. 卡片人工手动转发后，为什么艾特指定人不生效？

艾特指定人适用于通过接口发送给指定用户的场景，在此场景下才生效。人工手动转发的场景下不生效。

### 8. 点击“向我发送预览”，飞书客户端收到的卡片和当前卡片不一致？不同用户看到的卡片内容不一致？

这是由于当前卡片配置了多语言。当飞书客户端的显示语言与已添加的卡片的任一语言一致时，将显示该语言的内容。

你可在多语言设置中，查看、添加、删除不同语言对应的卡片。

### 9. 为什么在发送卡片时，markdown 模块里发送的 `<xxx>` 文本不显示？

`<xxx>` 命中了 markdown 语法使用的特殊字符，因此不显示。此时你可以在文本前加 `&zwj;`，例如 `<&zwj;aaa>` 来处理。了解更多，参考[富文本（Markdown）](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/rich-text)末尾的转义符。

### 10. 在发送卡片时，markdown 模块里发送的 &reg、&copy 等特殊符号会被特殊处理，怎么办？

在 markdown 模块中，部分特殊字符例如 &reg，&copy，会被当作 HTML 字符处理成®、©等特殊符号，建议不要在 markdown 模块中使用这类字符，包括在链接内。若字符在链接外，你可通过添加 `&zwj;` 来解决，例如：`&&zwj;reg`、`&&zwj;copy`。

### 11. 飞书卡片升级后，服务端 SDK 需要升级使用吗？

不需要。[服务端 SDK](https://open.feishu.cn/document/ukTMukTMukTM/uETO1YjLxkTN24SM5UjN) 对新版旧版卡片是兼容的。

### 12. 如何修改飞书客户端聊天栏消息预览中的文案？

你可通过自定义卡片 JSON 代码中的 `config.summary` 参数，自定义飞书客户端消息预览的文案。

- 卡片 JSON 代码示例如下所示：

  ```json
  {
      "schema": "2.0",
      "config": {
          "update_multi": true,
          "summary": {  // 在此自定义卡片的摘要内容，用于展示在消息预览文案中
              "content": "西湖，西湖位于浙江省杭州市西湖区龙井路1号，是浙江省杭州市西湖区的中心景点，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。"
          },
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

- 效果如下所示：

	

如果不设置 summary 参数，客户端聊天栏消息预览中的文案将按以下逻辑展示：

- **卡片标题内容**：如果卡片添加了[标题](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/title)组件，消息预览文案默认为卡片标题的内容：

	

- **文本组件内容**：如果卡片没有添加标题组件，但以普通文本组件或富文本组件为首个组件，消息预览文案默认为实际文本内容：

	

- **卡片消息**：如果卡片既没有添加标题组件、也没有以普通文本组件或富文本组件为首个组件，消息预览文案默认为**卡片消息**：

	

## 更新卡片问题

### 1. 使用卡片搭建工具预览并转发到聊天里的卡片可以更新吗？

不支持更新使用卡片搭建工具预览并转发到聊天里的卡片。

### 2. 使用前端接口 [sendMessageCard](https://open.feishu.cn/document/uYjL24iN/uUjN5UjL1YTO14SN2kTN) 发送的卡片可以更新吗？

可以更新。需要发送卡片的人员在对应应用内生成 user_access_token，然后调用[更新应用发送的消息卡片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/patch)接口来修改。

### 3. 卡片回调超时时间是多少?

卡片回调超时时间为 **3 秒**，不支持自定义。如果开发者在 3 秒内无法返回回调内容，可以先返回 `{}`，然后使用在回调中的 token [延时更新消息卡片](https://open.feishu.cn/document/ukTMukTMukTM/uMDO1YjLzgTN24yM4UjN)，在 30 分钟内更新卡片。详情参考[处理卡片回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)。

### 4. 是否支持针对不同的卡片设置不同的回调地址？

不支持。卡片需要通过应用发送，一个应用仅能设置一个回调地址。

### 5. 为什么点击卡片交互按钮客户端出现报错？

可参考以下步骤进行排查：
1. 若仅为一个设备出现，请检查设备的网络情况
1. 若为多个设备均出现，请检查：
    1. 是否配置了卡片请求网址并订阅了相关回调，需要在应用的机器人设置或者交互回调中配置。详情参考[回调相关文档](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/callback-overview)
    1. 对应的后台服务是否正常收到了交互回调并在 3 秒内返回 HTTP 200 状态码请求。详情可参考[配置卡片交互-步骤三：在本地服务端接收并处理回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions#1b37805e)
    1. 使用回传参数立即更新的情况下，请确认卡片报文是否为正确
    1. 是否使用了[更新应用发送的消息卡片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/patch)接口更新了非共享卡片
    **注意事项**：飞书卡片搭建工具的卡片模版默认均为共享卡片，即 update_multi 属性为 true 且暂不支持修改。

### 6. 为什么点击卡片进行卡片更新时，没有成功更新或者更新成功后立即复原？

请参考以下步骤排查：
1. 如果使用接口更新卡片，请检查是否在响应回调请求之前就已经调用接口。注意使用接口更新必须在响应回调请求之后执行，并行执行或提前执行会出现更新失败的情况
1. 是否使用了[更新应用发送的消息卡片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/patch)接口更新了非共享卡片
    **注意事项**：飞书卡片搭建工具的卡片模版默认均为共享卡片，即 update_multi 属性为 true 且暂不支持修改。
### 7. 卡片回调会类似事件订阅那样进行重推吗？

不会，如果推送出现问题会立即在客户端上显示错误。

### 8. 为什么接口无法获取临时卡片（即仅特定人可见的卡片）的内容？

仅特定人可见的卡片不支持接口获取其内容。

### 9. 卡片配置了回调，该怎么区分用户点击的是机器人私发的卡片还是群组里的卡片呢？

可以从回调数据中获取到对应的 open_chat_id，然后用该字段值去调用 [获取群信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/get)接口，可以从返回的 `chat_mode` 字段中区分。

### 10. 卡片回调怎么区分是哪个按钮的点击事件？假设我有多个按钮，怎么区分做后续的回调处理？

可以为按钮设置 key value 值，完成发布后，用户点击卡片上的按钮，配置好的 key value 值会回传到设置的回调服务地址，业务侧即可区分。详情参考[配置卡片交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)。

### 11. 卡片回调是否可以判断用户是在移动端还是 PC 端完成的交互？

目前暂不支持判断用户触发回调的客户端类型。

### 12. 如何将卡片中的按钮设置为仅允许点击一次？用户点击卡片中的按钮后，如何将按钮设置为禁用？

你需要准备两张卡片，一张卡片 A 将按钮设置为可点击状态，一张卡片 B 将按钮设置为禁用状态。

实现思路：
1. 通过应用发送卡片 A
2. 用户点击卡片 A 上的按钮，成功触发卡片回调
3. 参考[处理卡片回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)，选择：

	- **方式一：在 3 秒内立即更新卡片**：将卡片 B 的数据传入响应回调的结构体中，更新卡片；
	- **方式二：在 30 分钟内延时更新卡片**：先以空结构体响应，再调用[延时更新消息卡片](https://open.feishu.cn/document/ukTMukTMukTM/uMDO1YjLzgTN24yM4UjN)，在 30 分钟内传入卡片 B，更新卡片。

### 13. 如何获取点击按钮的用户信息？

[卡片回传交互回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)中，默认包含回调触发者的信息：

```json
{
  "operator": { // 回调触发者信息
    "tenant_key": "2df73991750*****", // 回调触发者的 tenant key，即租户唯一标识
    "user_id": "867*****", // 回调触发者的 user ID。当应用开启“获取用户 user ID”权限后，该参数返回
    "open_id": "ou_3c14f3a59eaf2825dbe25359f15*****", // 回调触发者的 Open ID
    "union_id": "on_cad4860e7af114fb4ff6c5d496d*****" // 回调触发者的 Union ID
  }
}
```

你可基于以上信息，调用[获取单个用户信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/get)，获取用户名称等信息。

### 14. 开发者后台是否可以查到卡片回调的请求数据？

不可以。卡片回调触发成功后，会直接将用户与卡片的交互数据发送至开发者配置的回调地址上。无法查到 LogId 等信息。

## 其它问题

### 1. 如何统计已发送卡片的阅读量、点击量？

飞书卡片暂不支持直接统计卡片阅读量或点击量。

对于卡片阅读量，你可以参考消息相关接口，自行实现该场景：

- [消息已读](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/message_read)事件支持用户阅读单聊消息后触发。你可基于此事件统计发送给个人的卡片阅读量

- [查询消息已读信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/read_users)接口支持查询消息已读用户的信息，你可基于此接口统计发送至群聊的卡片阅读量

对于卡片点击量，你可通过配置交互组件，在[处理卡片回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)卡时，自行添加统计逻辑。
