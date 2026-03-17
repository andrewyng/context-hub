# 勾选器

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/interactive-components/checker
Updated: 2025-01-02

# 勾选器组件

勾选器是一种交互组件，支持配置回调响应，主要用于任务勾选的场景。

本文档介绍勾选器组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[勾选器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/interactive-components/checker)。

## 注意事项

- 勾选器仅支持通过撰写卡片 JSON 代码的方式使用，暂不支持在卡片搭建工具上构建使用。
- 勾选器支持飞书 V7.9 及以上版本的客户端。在低于该版本的飞书客户端上，勾选器的内容将展示为“请升级至最新版本客户端，以查看内容”的占位图。

## 嵌套规则

勾选器组件支持内嵌在所有容器类组件（包括表单容器、交互容器、分栏和折叠面板）中使用。

## 组件属性

### JSON 结构

以下为勾选器组件的卡片 JSON 数据：
```json
{
  "tag": "checker",  // 组件的标签。勾选器组件的固定值为 checker。
  "name": "check_1",  // 勾选器组件的唯一标识。用于识别用户提交的数据属于哪个组件。
  "checked": false,  // 勾选器的初始勾选状态。默认值 false。
  "text": {  // 勾选器组件内的普通文本信息。
    "tag": "plain_text" // 文本类型的标签。
    "content": "", // 文本的内容。当 tag 为 lark_md 时，支持部分 Markdown 语法的文本内容。
    "text_size": "normal", // 文本大小。默认值 normal。
    "text_color": "default", // 文本颜色。仅在 tag 为 plain_text 时生效。默认值 default。
    "text_align": "left", // 文本对齐方式。默认值 left。
  },
  "overall_checkable": true,  // 当光标悬浮在勾选器上时，勾选器整体是否有阴影效果。默认值 true。
  "button_area": {  // 按钮区的配置。可选。
    "pc_display_rule": "always",   // PC 端勾选器内按钮的展示规则。默认值 always，即始终显示按钮。
    "buttons": [  // 在勾选器中添加并配置按钮。最多可配置三个按钮。
      {
        "tag": "button",  // 按钮的标签，取固定值 button。
        "type": "text",  // 按钮的类型。必填。
        "size": "small", // 按钮的尺寸。默认值 medium。
        "text": {   // 按钮上的文本。
          "tag": "plain_text",
          "content": "text按钮"
        },
        "icon": {   // 添加图标作为按钮文本上的前缀图标。支持自定义或使用图标库中的图标。
          "tag": "standard_icon", // 图标类型。
          "token": "chat-forbidden_outlined", // 图标的 token。仅在 tag 为 standard_icon 时生效。
          "color": "orange", // 图标颜色。仅在 tag 为 standard_icon 时生效。
          "img_key": "img_v2_38811724" // 图片的 key。仅在 tag 为 custom_icon 时生效。
        },
        "disabled": false,
        "behaviors": []  
      }
    ]
  },
  "checked_style": {  // 勾选状态样式。
    "show_strikethrough": true,  // 是否展示内容区的贯穿式删除线。默认值 false。
    "opacity": 1  // 内容区的不透明度。默认值 1。
  },
  "margin": "0px",  // 组件整体的外边距，支持填写单值或多值。默认值为 0px。
  "padding": "0px",  // 组件整体的内边距，支持填写单值或多值。默认值为 0px。

  "confirm": {},  // 二次确认弹窗配置。用户点击确定后再执行 behaviors 中声明的交互
  "behaviors": [  // 配置交互类型和具体交互行为。未配置 behaviors 时，终端用户可勾选，但仅本地有效。
    {
      "type": "callback", // 声明交互类型。仅支持 callback 请求回调交互。
      "value": {
        // 回传交互数据
        "key": "value"
      }
    }
  ],  
  "hover_tips": {},  //用户在 PC 端将光标悬浮在勾选器上方时的文案提醒。
  "disabled": false,  // 是否禁用该勾选器。默认值 false。
  "disabled_tips": {}  // 禁用勾选器后，用户在 PC 端将光标悬浮在勾选器上方时的文案提醒。
}
```

### 字段说明

勾选器各字段说明如下表所示。

字段 | 是否必填 | 类型 | 默认值 | 描述
---|---|---|---|---
tag | 是 | String | / | 组件的标签。勾选器组件的固定值为 `checker`。
name | 否 | String | 空 | 勾选器组件的唯一标识。用于识别用户提交的数据属于哪个组件。<br>**注意**：当勾选器组件嵌套在表单容器中时，该字段必填且需在卡片全局内唯一。
checked | 否 | Boolean | false | 勾选器的初始勾选状态。可选值：<br>- true：已勾选状态<br>- false：未勾选状态
text | 否 | Object | / | 勾选器组件内的普通文本信息。
└ tag | 是 | String | plain_text | 文本类型的标签。可取值：<br>- `plain_text`：普通文本内容<br>- `lark_md`：支持部分 Markdown 语法的文本内容。详情参考[lark_md 支持的 Markdown 语法](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/plain-text)<br>**注意**：飞书卡片搭建工具中仅支持使用 `plain_text` 类型的普通文本组件。你可使用富文本组件添加 Markdown 格式的文本。
└ content | 是 | String | / | 文本内容。当 `tag` 为 `lark_md` 时，支持部分 Markdown 语法的文本内容。详情参考[lark_md 支持的 Markdown 语法](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/plain-text)
└ text_size | 否 | String | normal | 文本大小。可取值：<br>- `normal`：正文（14px）<br>- `heading`：标题（16px）<br>- `notation`：辅助信息（12px）
└ text_color | 否 | String | default | 文本的颜色。仅在 `tag` 为 `plain_text` 时生效。可取值：<br>- `default`：客户端浅色主题模式下为黑色；客户端深色主题模式下为白色<br>- 颜色的枚举值。详情参考[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)
└ text_align | 否 | String | left | 文本对齐方式。可取值：<br>- `left`：左对齐<br>- `center`：居中对齐<br>- `right`：右对齐
overall_checkable | 否 | String | true | 当光标悬浮在勾选器上时，勾选器整体是否有阴影效果。<br>**注意**：要取消阴影效果，你需确保 `overall_checkable` 为 `false` 且 `pc_display_rule` 不为 `on_hover`。
button_area | 否 | Object | / | 按钮区配置。
└ pc_display_rule | 否 | String | always | PC 端勾选器内按钮的展示规则。移动端始终显示按钮。可取值：<br>- `always`：按钮始终显示。<br>- `on_hover`：当光标悬浮在勾选器上时，按钮显示且勾选器整体有阴影效果。
└ buttons | 否 | Array&lt;Object&gt; | [] | 在勾选器中添加并配置按钮。最多可配置三个按钮。详情参考下一小节 buttons 字段说明。
checked_style | 否 | Object | / | 勾选状态样式。
└ show_strikethrough | 否 | Boolean | false | 是否展示内容区的贯穿式删除线。
└ opacity | 否 | Number | 1 | 内容区的不透明度。取值范围为 [0,1] 之间的数字，不限小数位数。
margin | 否 | String | 0px | 组件整体的外边距，支持填写单值或多值：<br>- 单值：如 "4px"，表示组件的四个外边距都为 4px<br>- 多值：如 "4px 12px 4px 12px"，表示容器内上、右、下、左的内边距分别为 4px，12px，4px，12px。四个值必填，使用空格间隔
padding | 否 | String | 0px | 组件整体的内边距，支持填写单值或多值：<br>- 单值：如 "4px"，表示组件内四个内边距都为 4px<br>- 多值：如 "4px 12px 4px 12px"，表示容器内上、右、下、左的内边距分别为 4px，12px，4px，12px。四个值必填，使用空格间隔
confirm | 否 | Struct | 默认不生效此属性。 | 二次确认弹窗配置。指在用户提交时弹出二次确认弹窗提示；只有用户点击确认后，才提交输入的内容。该字段默认提供了确认和取消按钮，你只需要配置弹窗的标题与内容即可。<br>**注意**：<code>confirm</code> 字段仅在用户点击包含提交属性的按钮时才会触发二次确认弹窗。
confirm.title | 是 | Struct | / | 二次确认弹窗标题。
confirm.title.tag | 是 | String | plain_text | 二次确认弹窗标题文本的标签。固定取值为 `plain_text`。
confirm.title.content | 是 | String | / | 二次确认弹窗标题的内容。
confirm.text | 是 | Struct | / | 二次确认弹窗的文本内容。
confirm.text.tag | 是 | String | plain_text | 二次确认弹窗文本的标签。固定取值为 `plain_text`。
confirm.text.content | 是 | String | / | 二次确认弹窗文本的具体内容。
behaviors | 是 | Struct | / | 配置交互类型和具体交互行为。未配置 `behaviors` 时，终端用户可勾选，但仅本地有效。详情参考[配置卡片交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)。
hover_tips | 否 | Object | 空 | 用户在 PC 端将光标悬浮在勾选器上方时的文案提醒。<br>**注意**：当同时配置 `hover_tips` 和 `disabled_tips` 时，`disabled_tips` 将生效。
└ tag | 否 | String | plain_text | 文案提醒的标签。固定值为 `plain_text`。
└ content | 否 | String | 空 | 文案提醒的内容。
disabled | 否 | Boolean | false | 是否禁用该勾选器。可选值：<br>- true：禁用<br>- false：勾选器组件保持可用状态<br></ul>
disabled_tips | 否 | Object | 空 | 禁用勾选器后，用户在 PC 端将光标悬浮在勾选器上方时的文案提醒。
└ tag | 是 | String | plain_text | 禁用文案的标签。固定取值为 `plain_text`。
└ content | 是 | String | 空 | 禁用文案的内容。

#### `buttons` 字段说明

你可在勾选器中通过 `buttons` 字段添加并配置按钮。最多可配置三个按钮。

字段名称 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | button | 按钮的标签，取固定值 `button`。
type | 是 | String | 空 | 按钮的类型，可选值：<br>- text：黑色字体按钮，无边框<br>- primary_text：蓝色字体按钮，无边框<br>- danger_text：红色字体按钮，无边框
size | 否 | String | medium | 按钮的尺寸，可选值：<br>- tiny：超小尺寸，PC 端为 24px；移动端为 28px<br>- small：小尺寸，PC 端为 28 px；移动端为 28 px<br>- medium：中尺寸，PC 端为 32 px；移动端为 36 px<br>- large：大尺寸，PC 端为 40 px；移动端为 48 px
text | 否 | Struct | 空 | 按钮上的文本。
└ tag | 是 | String | plain_text | 文本的标签。固定取值为 <code>plain_text</code>。
└ content | 是 | String | 空 | 文本的内容。
icon | 否 | Object | / | 添加图标作为文本前缀图标。支持自定义或使用图标库中的图标。
└ tag | 否 | String | / | 图标类型的标签。可取值：<br>- `standard_icon`：使用图标库中的图标。<br>- `custom_icon`：使用用自定义图片作为图标。
└ token | 否 | String | / | 图标库中图标的 token。当 `tag` 为 `standard_icon` 时生效。枚举值参见[图标库](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-icons)。
└ color | 否 | String | / | 图标的颜色。支持设置线性和面性图标（即 token 末尾为 `outlined` 或 `filled` 的图标）的颜色。当 `tag` 为 `standard_icon` 时生效。枚举值参见[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。
└ img_key | 否 | String | / | 自定义前缀图标的图片 key。当 `tag` 为 `custom_icon` 时生效。<br>图标 key 的获取方式：调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口，上传用于发送消息的图片，并在返回值中获取图片的 image_key。
disabled | 否 | Boolean | false | 是否禁用按钮。可选值：<br>- true：禁用按钮<br>- false：按钮组件保持可用状态
behaviors | 是 | Struct | / | 配置交互类型和具体交互行为。详情参考[配置卡片交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)。

## 回调结构

为组件成功配置交互后，用户基于组件进行交互时，你在开发者后台配置的请求地址将会收到回调数据。
- 如果你添加的是新版卡片回传交互回调(`card.action.trigger`)，可参考[卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)了解回调结构。
- 如果你添加的是旧版卡片回传交互回调(`card.action.trigger_v1`)，可参考[消息卡片回传交互（旧）](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)了解回调结构。

## 示例代码

以下的 JSON 示例代码可实现如下图所示的卡片效果：

```json
{
  "header": {
    "template": "blue",
    "title": {
      "tag": "plain_text",
      "content": "勾选组件（依赖端版本 7.9+)"
    }
  },
  "elements": [
    {
      "tag": "column_set",
      "flex_mode": "none",
      "background_style": "default",
      "columns": [
        {
          "tag": "column",
          "width": "weighted",
          "weight": 1,
          "vertical_spacing": "1px",
          "elements": [
            {
              "tag": "checker",
              "name": "check_1",
              "checked": false,
              "text": {
                "tag": "lark_md",
                "content": "完成新品上市计划报告 💬[战略研讨会](https://open.feishu.cn)"
              },
              "overall_checkable": false,
              "button_area": {
                "pc_display_rule": "always",
                "buttons": [
                  {
                    "tag": "button",
                    "type": "text",
                    "size": "large",
                    "text": {
                      "tag": "plain_text",
                      "content": ""
                    },
                    "icon": {
                      "tag": "standard_icon",
                      "token": "forward-com_outlined",
                      "color": "grey-500"
                    },
                    "disabled": false,
                    "behaviors": [
                      {
                        "type": "callback",
                        "value": {
                          "key": "btn1"
                        }
                      }
                    ]
                  },
                  {
                    "tag": "button",
                    "type": "text",
                    "size": "large",
                    "text": {
                      "tag": "plain_text",
                      "content": ""
                    },
                    "icon": {
                      "tag": "standard_icon",
                      "token": "tab-todo_outlined",
                      "color": "grey-500"
                    },
                    "disabled": false,
                    "behaviors": [
                      {
                        "type": "open_url",
                        "default_url": "https://www.baidu.com",
                        "android_url": "https://developer.android.com/",
                        "ios_url": "lark://msgcard/unsupported_action",
                        "pc_url": "https://www.windows.com"
                      }
                    ]
                  }
                ]
              },
              "checked_style": {
                "show_strikethrough": true,
                "opacity": 0.5
              },
              "padding": "2px 2px 2px 2px",
              "behaviors": [
                {
                  "type": "callback",
                  "value": {
                    "key": "todo1"
                  }
                }
              ]
            },
            {
              "tag": "checker",
              "name": "check_2",
              "checked": false,
              "text": {
                "tag": "lark_md",
                "content": "把材料提前给💬[业务数据共享群](https://open.feishu.cn)审阅"
              },
              "overall_checkable": true,
              "button_area": {
                "pc_display_rule": "on_hover",
                "buttons": [
                  {
                    "tag": "button",
                    "type": "text",
                    "size": "large",
                    "text": {
                      "tag": "plain_text",
                      "content": ""
                    },
                    "icon": {
                      "tag": "standard_icon",
                      "token": "forward-com_outlined",
                      "color": "grey-500"
                    },
                    "disabled": false,
                    "behaviors": [
                      {
                        "type": "callback",
                        "value": {
                          "key": "btn2"
                        }
                      }
                    ]
                  },
                  {
                    "tag": "button",
                    "type": "text",
                    "size": "large",
                    "text": {
                      "tag": "plain_text",
                      "content": ""
                    },
                    "icon": {
                      "tag": "standard_icon",
                      "token": "tab-todo_outlined",
                      "color": "grey-500"
                    },
                    "disabled": false,
                    "behaviors": [
                      {
                        "type": "open_url",
                        "default_url": "https://www.baidu.com",
                        "android_url": "https://developer.android.com/",
                        "ios_url": "lark://msgcard/unsupported_action",
                        "pc_url": "https://www.windows.com"
                      }
                    ]
                  }
                ]
              },
              "checked_style": {
                "show_strikethrough": true,
                "opacity": 0.5
              },
              "padding": "2px 2px 2px 2px",
              "confirm": {
                "title": {
                  "tag": "plain_text",
                  "content": "弹窗标题"
                },
                "text": {
                  "tag": "plain_text",
                  "content": "确认提交吗"
                }
              },
              "behaviors": [
                {
                  "type": "callback",
                  "value": {
                    "key": "todo2"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```
