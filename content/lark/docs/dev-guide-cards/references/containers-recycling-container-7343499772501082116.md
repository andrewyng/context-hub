# 循环容器

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/containers/recycling-container
Updated: 2025-07-07

# 循环容器

循环容器是一个抽象的空容器，可内嵌所有展示、交互类组件和分栏组件。通过使用循环容器，你可以高效地组织一系列排版类似、数据不同的内容，适用于列表消息推送场景，如下图卡片中的内容列表。你还可以通过设置循环容器绑定的对象数组长度，控制列表内容内的条数。

## 使用限制

- 循环容器仅支持在卡片搭建工具上使用，不支持通过卡片 JSON 代码构建。
- 循环容器暂不支持设置容器内组件的间距。

## 参考案例

卡片搭建工具案例库中提供了循环容器的示例，你可直接前往卡片搭建工具试一试：

- [循环容器案例](https://open.feishu.cn/cardkit?catalogId=10015&templateId=AAqIDyz6qpMTB)
- [表单容器内嵌循环容器案例](https://open.feishu.cn/cardkit?catalogId=10015&templateId=AAqBZKqVZHLLe)

## 嵌套关系

循环容器支持内嵌所有展示、交互类组件和分栏组件。

## 操作步骤

1. 登录 [飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=recycling_container)。
1. 在指定的飞书卡片内，添加一个 **循环容器** 组件。

   添加后系统会默认创建并绑定一个 **对象数组** 变量，你可在编辑页右侧点击该变量编辑变量名称和描述。

   

1. 根据实际需求，添加任意组件至循环容器中。以下示例添加 **文本+图片** 复合组件至循环容器中。warning
   循环容器是一个抽象的空容器，你必须要在其中添加组件才可展示效果。
   

1. 确定样式后，在循环容器绑定的对象数组变量内，添加文本变量和图片变量，用于后续[富文本](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/markdown)组件和[图片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/components/image)组件绑定子变量。不同组件支持的变量类型不同，详情参考[配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables)。

   
1. 选中循环容器中的富文本组件，在右侧 **属性** 页签下，点击变量图标，绑定上一步添加的子变量文本变量。warning
   循环容器中的组件，必须要绑定对象数组的子变量，才可实现内容动态展示。
   
1. 选中循环容器中的图片组件，在右侧 **属性** 页签下，点击 **绑定变量**，绑定上一步添加的子变量图片变量。

   
1. 设置对象数组变量的模拟数据，预览生效效果。

   

## 后续操作

在搭建工具中搭建并发布卡片后，你需在[发送卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/send-feishu-card)时，通过 `template_variable` 字段为变量赋值。

`template_variable` 字段是卡片绑定的变量列表，格式为 `{key:value}`。其中 `key` 为变量名称，`value` 为变量的值，对应搭建工具中的模拟数据。建议你在搭建工具中通过模拟数据验证数据无误后再传值。

### 准备卡片数据，为变量赋值

以下以[循环容器案例卡片](https://open.feishu.cn/cardkit?catalogId=10015&templateId=AAqIDyz6qpMTB)为例，准备卡片消息数据，并为变量赋值：

```json
{
  "type": "template",   // 卡片类型，搭建工具传 template。
  "data": {
    "template_id": "AAqi6xJ8rabcd",  // 搭建工具中卡片的 ID。在卡片编辑页面左上角获取。
    "template_version_name": "1.0.0",  // 卡片发布时的版本号。
    "template_variable": { // 卡片中的变量，你可在此自定义这些变量的值。
      "looping": [ // looping 即循环容器案例中，自定义的变量名称。循环容器中，支持添加一个对象数组变量，其中可包含多个子变量。此处数据即搭建工具中的模拟数据。
        { // 第一组循环中的数据。支持添加多组数据，控制列表内容内的条数。
          "link": {
            "pc_url": "",
            "android_url": "",
            "ios_url": "",
            "url": "https://open.feishu.cn"
          },
          "description": "此款陶瓷采用传统日式风格，融合现代简约设计，轻橙色调营造温暖质感。每件作品均由资深陶艺师精心打造，呈现细腻纹理与自然色彩，既传承传统工艺精髓，又融入现代审美，是居家装饰与艺术收藏的理想之选。",
          "title": "**和风陶韵**",
          "image": {
            "img_key": "img_v3_02jl_fcb7e989-14bd-4206-9e9c-30a83ae810cg"
          }
        },
        { // 第二组循环中的数据。
          "link": {
            "pc_url": "",
            "android_url": "",
            "ios_url": "",
            "url": "https://open.feishu.cn/document/home/index"
          },
          "description": "传承古法手工制作，此陶瓷产品由经验丰富的工匠在温馨工作坊内精心铸就。每一道纹理都凝聚着匠人的热情与执着，独特造型和细腻手感使其成为提升空间格调的独特艺术品。",
          "title": "**匠心之作**",
          "image": {
            "img_key": "img_v3_02jn_b33e62a2-de34-4181-8980-c0220ec2dadg"
          }
        },
        { // 第三组循环中的数据。
          "link": {
            "pc_url": "",
            "android_url": "",
            "ios_url": "",
            "url": "https://open.feishu.com/document/feishu-cards/feishu-card-overview"
          },
          "description": "这款现代日式陶瓷以精美造型和艺术装饰风格脱颖而出。设计灵感源自传统与现代的交融，色彩明快、线条流畅，无论用作家居摆件还是实用器皿，都能为空间增添一份时尚雅致。",
          "title": "**时尚陶韵**",
          "image": {
            "img_key": "img_v3_02jn_011f9680-2771-41ad-be5d-d3879563427g"
          }
        }
      ]
    }
  }
}
```

### 发送卡片

将上述内容去除注释、传入实际值、并进行压缩转义后，传入[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)接口的 `content` 参数中，即可发送卡片。最终通过应用发送循环容器案例卡片的请求体示例如下所示：

```json
{
  "receive_id": "ou_b9600a00cda86b8fad2378eafe3abcef",
  "msg_type": "interactive",
  "content": "{\"type\":\"template\",\"data\":{\"template_id\":\"AAqIDd7labcef\",\"template_version_name\":\"1.0.0\",\"template_variable\":{\"looping\":[{\"link\":{\"pc_url\":\"\",\"android_url\":\"\",\"ios_url\":\"\",\"url\":\"https://open.feishu.cn\"},\"description\":\"此款陶瓷采用传统日式风格，融合现代简约设计，轻橙色调营造温暖质感。每件作品均由资深陶艺师精心打造，呈现细腻纹理与自然色彩，既传承传统工艺精髓，又融入现代审美，是居家装饰与艺术收藏的理想之选。\",\"title\":\"**和风陶韵**\",\"image\":{\"img_key\":\"img_v3_02jl_fcb7e989-14bd-4206-9e9c-30a83ae810cg\"}},{\"link\":{\"pc_url\":\"\",\"android_url\":\"\",\"ios_url\":\"\",\"url\":\"https://open.feishu.cn/document/home/index\"},\"description\":\"传承古法手工制作，此陶瓷产品由经验丰富的工匠在温馨工作坊内精心铸就。每一道纹理都凝聚着匠人的热情与执着，独特造型和细腻手感使其成为提升空间格调的独特艺术品。\",\"title\":\"**匠心之作**\",\"image\":{\"img_key\":\"img_v3_02jn_b33e62a2-de34-4181-8980-c0220ec2dadg\"}},{\"link\":{\"pc_url\":\"\",\"android_url\":\"\",\"ios_url\":\"\",\"url\":\"https://open.feishu.com/document/feishu-cards/feishu-card-overview\"},\"description\":\"这款现代日式陶瓷以精美造型和艺术装饰风格脱颖而出。设计灵感源自传统与现代的交融，色彩明快、线条流畅，无论用作家居摆件还是实用器皿，都能为空间增添一份时尚雅致。\",\"title\":\"**时尚陶韵**\",\"image\":{\"img_key\":\"img_v3_02jn_011f9680-2771-41ad-be5d-d3879563427g\"}}]}}}"
}
```

## 常见问题

### 循环容器是否支持再嵌套一层循环容器，再继续使用变量动态渲染？

循环容器不支持再内嵌一个循环容器，即循环容器的子变量不再支持对象数组类型的变量。

### 如何灵活控制循环容器中内容的条数？

你可通过控制循环容器中绑定的对象数组类型变量中的对象的条数，来控制动态展示多少条循环容器中的内容。

以下示例中添加了三组数据，你可根据自身需求增减数组中对象的条数，灵活控制循环容器中内容的条数。

```json
{
  "template_variable": { // 卡片中的变量，你可在此自定义这些变量的值。
    "looping": [ // looping 即循环容器案例中，自定义的变量名称。循环容器中，支持添加一个对象数组变量，其中可包含多个子变量。此处数据即搭建工具中的模拟数据。
      { // 第一组循环中的数据。支持添加多组数据，控制列表内容内的条数。
        "link": {
          "pc_url": "",
          "android_url": "",
          "ios_url": "",
          "url": "https://open.feishu.cn"
        },
        "description": "此款陶瓷采用传统日式风格，融合现代简约设计，轻橙色调营造温暖质感。每件作品均由资深陶艺师精心打造，呈现细腻纹理与自然色彩，既传承传统工艺精髓，又融入现代审美，是居家装饰与艺术收藏的理想之选。",
        "title": "**和风陶韵**",
        "image": {
          "img_key": "img_v3_02jl_fcb7e989-14bd-4206-9e9c-30a83ae810cg"
        }
      },
      { // 第二组循环中的数据。
        "link": {
          "pc_url": "",
          "android_url": "",
          "ios_url": "",
          "url": "https://open.feishu.cn/document/home/index"
        },
        "description": "传承古法手工制作，此陶瓷产品由经验丰富的工匠在温馨工作坊内精心铸就。每一道纹理都凝聚着匠人的热情与执着，独特造型和细腻手感使其成为提升空间格调的独特艺术品。",
        "title": "**匠心之作**",
        "image": {
          "img_key": "img_v3_02jn_b33e62a2-de34-4181-8980-c0220ec2dadg"
        }
      },
      { // 第三组循环中的数据。
        "link": {
          "pc_url": "",
          "android_url": "",
          "ios_url": "",
          "url": "https://open.feishu.com/document/feishu-cards/feishu-card-overview"
        },
        "description": "这款现代日式陶瓷以精美造型和艺术装饰风格脱颖而出。设计灵感源自传统与现代的交融，色彩明快、线条流畅，无论用作家居摆件还是实用器皿，都能为空间增添一份时尚雅致。",
        "title": "**时尚陶韵**",
        "image": {
          "img_key": "img_v3_02jn_011f9680-2771-41ad-be5d-d3879563427g"
        }
      }
    ]
  }
}
```

### 表单容器内嵌套循环容器，且循环容器内嵌可交互组件后，预览报错？

如下图，表单容器中内嵌循环容器，且循环容器中内嵌了输入框组件，点击 **向我发送预览** 后报错。这可能是因为在表单容器中，交互组件的 **表单项标识** 在单张卡片重复了。

你需为输入框组件的 **表单项标识** 设置不重复的子变量。参考以下步骤解决。或直接前往卡片搭建工具使用[表单容器内嵌循环容器案例](https://open.feishu.cn/cardkit?catalogId=10015&templateId=AAqBZKqVZHLLe)。
1. 选中交互组件（此处以 **输入框** 组件为例），在右侧 **表单项标识** 配置项处，点击变量按钮。

    

1. 点击 **+添加子变量**，在[循环容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/containers/recycling-container)自动生成的变量中，添加一个子变量。

    

1. 在 **编辑变量** 弹窗中，点击 **+添加子变量**，为输入框的表单项标识设置一个变量。

    

1. 参考下表为设置变量结构和模拟数据。

配置项 | 描述 | 示例值
---|---|---
**变量类型** | 为交互组件的表单项标识绑定的变量的类型。固定取值为 **文本** 即可。 | 文本
**变量名称** | 一般为字母或字母与下划线的组合。在之后发送卡片时，你需要为该变量名（key）赋值（value）。 | <code>input_name</code>
**变量描述** | 此处可补充解释该变量的用法或说明。可不填。 | 输入框的表单项标识变量
**模拟数据** | 为循环容器绑定的对象数组变量的子变量传入模拟数据。<br>**注意**：由于交互组件的 **表单项标识** 在单张卡片不可重复，你必须为变量传入模拟数据，且数据不可重复。否则点击 **向我发送预览** 后将报错。 | ```json<br>[<br>{<br>"input_name": "input1"<br>},<br>{<br>"input_name": "input2"<br>},<br>{<br>"input_name": "input3"<br>}<br>]<br>```
