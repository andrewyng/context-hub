# 交互容器

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/containers/interactive-container
Updated: 2025-01-02

# 交互容器

你可基于业务需求在交互容器中内嵌组件，并灵活组合多个交互容器，并统一定义多个交互容器的样式、交互能力等，实现多种组合效果和丰富的卡片交互。

本文档介绍交互容器的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[交互容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/containers/interactive-container)。

## 注意事项

- 交互容器支持飞书 V7.4 及以上版本的客户端。在低于该版本的飞书客户端上，交互容器的内容将展示为“请升级至最新版本客户端，以查看内容”的占位图。
- 容器类组件最多支持嵌套五层组件。建议你避免在交互容器中嵌套多层组件。多层嵌套会压缩内容的展示空间，影响卡片的展示效果。

## 嵌套规则
在[卡片 JSON 1.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-structure)中：
- 交互容器仅支持内嵌普通文本、富文本、图片、备注、分栏、勾选器、交互容器组件。
- 交互容器支持内嵌在卡片根节点、循环容器、分栏、表单容器、交互容器组件中。

在[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)中，交互容器可内嵌除表单容器（form）和表格组件（table）外的其它所有组件。
## 组件属性

### JSON 结构

以下为一个交互容器的卡片 JSON 数据：
```json
{
  "tag": "interactive_container", // 交互容器的标签。
  "width": "fill", // 交互容器的宽度。默认值 fill。
  "height": "auto", // 交互容器的高度。默认值 auto。
  "background_style": "default", // 背景色。默认值 default（无背景色）。
  "has_border": false, // 是否展示边框，粗细固定为 1px。默认值 false。
  "border_color": "grey", // 交互容器的边框颜色，仅 has_border 为 true 时生效。
  "corner_radius": "40px", // 交互容器的圆角半径。可选。
  "padding": "10px 20px 10px 20px", // 交互容器的内边距。默认值 "4px 12px 4px 12px"。
  "behaviors": [
    {
      "type": "open_url", // 声明交互类型是打开链接的跳转交互。
      "default_url": "https://www.baidu.com", // 兜底跳转地址。
      "android_url": "https://developer.android.com/", // 安卓端跳转地址。
      "ios_url": "lark://msgcard/unsupported_action", // iOS 端跳转地址。
      "pc_url": "https://www.windows.com" // 桌面端跳转地址。
    },
    {
      "type": "callback", // 声明交互类型是回传数据到服务端的回传交互。
      "value": {
        // 回传交互数据
        "key": "value"
      }
    }
  ],
  "disabled": false,
  "disabled_tips": { "tag": "plain_text", "content": "demo" },
  "confirm": {},
  "hover_tips": {
    "tag": "plain_text",
    "content": "demo"
  },
  "elements": [] // 容器子组件，仅支持内嵌普通文本、富文本、图片、备注、分栏、勾选器、交互容器组件。
}
```

### 字段说明

交互容器各字段说明如下表所示。

字段名称 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | / | 交互容器的标签。固定值为 <code>interactive_container</code>。
width | 否 | String | fill | 交互容器的宽度。可取值：<br>- **fill**：卡片最大支持宽度</li><br><li>**auto**：自适应宽度</li><br><li>**[16,999]px**：自定义宽度，如 "20px"。最小宽度为 16px</li>
height | 否 | String | auto | 交互容器的高度。可取值：<br>- **auto**：自适应高度</li><br><li>**[10,999]px**：自定义高度，如 "20px"</li><br></ul>
background_style | 否 | String | default | 交互容器的背景色样式。可取值：<br>- **default**：默认的白底样式，客户端深色主题下为黑底</li><br><li>**laser**：镭射渐变彩色样式</li><br><li>卡片支持的颜色枚举值和 RGBA 语法自定义颜色。参考[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)</li><br></ul>
has_border | 否 | Boolean | false | 是否展示边框，粗细固定为 1px。
border_color | 否 | String | grey | 边框的颜色，仅 <code>has_border</code> 为 true 时，此字段生效。枚举值为卡片支持的颜色枚举值和 RGBA 语法自定义颜色，参考[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。
corner_radius | 否 | String | 0px | 交互容器的圆角半径，单位是像素（px）或百分比（%）。取值遵循以下格式：<br>- **[0,∞]px**，如 "10px"</li><br><li>**[0,100]%**，如 "30%"</li><br></ul>
padding | 否 | String | 4px 12px 4px 12px | 交互容器的内边距。值的取值范围为 [0,28]px。支持填写单值或多值：<br>- 单值：如 "10px"，表示容器内四个内边距都为 10px</li><br><li>多值：如 "4px 12px 4px 12px"，表示容器内上、右、下、左的内边距分别为 4px，12px，4px，12px。四个值必填，使用空格间隔</li><br></ul>
behaviors | 是 | [] | / | 设置点击交互容器时的交互配置。如果交互容器内有交互组件，则优先响应交互组件定义的交互。交互组件支持 callback 和 open_url 交互。详情参考[配置卡片交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)。
hover_tips | 否 | Object | 空 | 用户在 PC 端将光标悬浮在交互容器上方时的文案提醒。默认为空。
└ tag | 是 | String | plain_text | 文本的标签。固定取值为 <code>plain_text</code>。
└ content | 是 | String | 空 | 文本的内容。
disabled | 否 | Boolean | false | 是否禁用交互容器。可选值：<br>- <code>true</code>：禁用整个容器</li><br><li><code>false</code>：容器组件保持可用状态<br></li><br></ul>
disabled_tips | 否 | Object | 空 | 禁用交互容器后，用户触发交互时的弹窗文案提醒。默认为空，即不弹窗。
└ tag | 是 | String | plain_text | 弹窗标题文本的标签。固定取值为 <code>plain_text</code>。
└ content | 是 | String | 空 | 弹窗标题的内容。
confirm | 否 | Struct | 默认不生效此属性。 | 二次确认弹窗配置。指在用户提交时弹出二次确认弹窗提示；只有用户点击确认后，才提交输入的内容。该字段默认提供了确认和取消按钮，你只需要配置弹窗的标题与内容即可。<br>**注意**：<code>confirm</code> 字段仅在用户点击包含提交属性的按钮时才会触发二次确认弹窗。
confirm.title | 是 | Struct | / | 二次确认弹窗标题。
confirm.title.tag | 是 | String | plain_text | 二次确认弹窗标题文本的标签。固定取值为 `plain_text`。
confirm.title.content | 是 | String | / | 二次确认弹窗标题的内容。
confirm.text | 是 | Struct | / | 二次确认弹窗的文本内容。
confirm.text.tag | 是 | String | plain_text | 二次确认弹窗文本的标签。固定取值为 `plain_text`。
confirm.text.content | 是 | String | / | 二次确认弹窗文本的具体内容。
elements | 是 | Array&lt;element&gt; | [] | 交互容器内嵌的组件。仅支持内嵌普通文本、富文本、图片、备注、分栏、勾选器、交互容器组件。

## 回调结构

为组件成功配置交互后，用户基于组件进行交互时，你在开发者后台配置的请求地址将会收到回调数据。
- 如果你添加的是新版卡片回传交互回调(`card.action.trigger`)，可参考[卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)了解回调结构。
- 如果你添加的是旧版卡片回传交互回调(`card.action.trigger_v1`)，可参考[消息卡片回传交互（旧）](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)了解回调结构。
- 
## 示例代码

以下的 JSON 示例代码可实现如下图所示的卡片效果：

```json
{
  "config": {
    "compact_width": true
  },
  "header": {
    "title": {
      "content": "交互容器示例（依赖端版本 7.4+)",
      "tag": "plain_text"
    },
    "ud_icon": {
      "style": {
        "color": "blue"
      },
      "token": "chat-history_outlined"
    }
  },
  "elements": [
    {
      "tag": "markdown",
      "content": "在「内容创作」话题下，我可以帮助你进行产品方案、营销文案、工作报告等内容的创作。"
    },
    {
      "tag": "column_set",
      "flex_mode": "none",
      "background_style": "default",
      "columns": [
        {
          "tag": "column",
          "width": "weighted",
          "weight": 1,
          "vertical_spacing": "8px",
          "elements": [
            {
              "tag": "markdown",
              "content": "你可以对我说：",
              "text_size": "notation"
            },
            {
              "tag": "interactive_container",
              "width": "fill",
              "height": "auto",
              "background_style": "default",
              "has_border": true,
              "border_color": "grey",
              "corner_radius": "8px",
              "padding": "4px 12px 4px 12px",
              "behaviors": [
                {
                  "type": "callback",
                  "value": {
                    "key": "value"
                  }
                }
              ],
              "elements": [
                {
                  "tag": "markdown",
                  "content": "帮我生成一篇产品方案的框架",
                  "icon": {
                    "tag": "standard_icon",
                    "token": "frame-selection_outlined",
                    "color": "orange"
                  }
                }
              ]
            },
            {
              "tag": "interactive_container",
              "width": "fill",
              "height": "auto",
              "background_style": "default",
              "has_border": true,
              "border_color": "grey",
              "corner_radius": "8px",
              "padding": "4px 12px 4px 12px",
              "behaviors": [
                {
                  "type": "callback",
                  "value": {
                    "key": "value"
                  }
                }
              ],
              "disabled": false,
              "elements": [
                {
                  "tag": "markdown",
                  "content": "帮我生成一篇产品文案",
                  "icon": {
                    "tag": "standard_icon",
                    "token": "file-link-docx_outlined",
                    "color": "orange"
                  }
                }
              ]
            },
            {
              "tag": "interactive_container",
              "width": "fill",
              "height": "auto",
              "background_style": "default",
              "has_border": true,
              "border_color": "grey",
              "corner_radius": "8px",
              "padding": "4px 12px 4px 12px",
              "behaviors": [
                {
                  "type": "callback",
                  "value": {
                    "key": "value"
                  }
                }
              ],
              "disabled": false,
              "elements": [
                {
                  "tag": "markdown",
                  "content": "帮我写一篇周报",
                  "icon": {
                    "tag": "standard_icon",
                    "token": "pa-calibration-report_outlined",
                    "color": "orange"
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "tag": "column_set",
      "flex_mode": "none",
      "background_style": "default",
      "columns": [
        {
          "tag": "column",
          "width": "weighted",
          "weight": 1,
          "vertical_spacing": "8px",
          "elements": [
            {
              "tag": "markdown",
              "content": "或者继续之前的话题",
              "text_size": "notation"
            },
            {
              "tag": "interactive_container",
              "width": "fill",
              "height": "auto",
              "background_style": "default",
              "has_border": true,
              "border_color": "grey",
              "corner_radius": "8px",
              "padding": "4px 12px 4px 12px",
              "behaviors": [
                {
                  "type": "callback",
                  "value": {
                    "key": "value"
                  }
                }
              ],
              "disabled": false,
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
                      "elements": [
                        {
                          "tag": "markdown",
                          "content": "内容创作:创作暑假营销活动文案",
                          "icon": {
                            "tag": "standard_icon",
                            "token": "chat-history_outlined"
                          }
                        }
                      ]
                    },
                    {
                      "tag": "column",
                      "width": "auto",
                      "weight": 1,
                      "elements": [
                        {
                          "tag": "markdown",
                          "content": "昨天",
                          "text_size": "notation"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "tag": "interactive_container",
              "width": "fill",
              "height": "auto",
              "background_style": "default",
              "has_border": true,
              "border_color": "grey",
              "corner_radius": "8px",
              "padding": "4px 12px 4px 12px",
              "behaviors": [
                {
                  "type": "callback",
                  "value": {
                    "key": "value"
                  }
                }
              ],
              "disabled": false,
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
                      "elements": [
                        {
                          "tag": "markdown",
                          "content": "内容创作:生成了季度工作报告",
                          "icon": {
                            "tag": "standard_icon",
                            "token": "chat-history_outlined"
                          }
                        }
                      ]
                    },
                    {
                      "tag": "column",
                      "width": "auto",
                      "weight": 1,
                      "elements": [
                        {
                          "tag": "markdown",
                          "content": "上周",
                          "text_size": "notation"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "tag": "interactive_container",
              "width": "fill",
              "height": "auto",
              "background_style": "default",
              "has_border": true,
              "border_color": "grey",
              "corner_radius": "8px",
              "padding": "4px 12px 4px 12px",
              "behaviors": [
                {
                  "type": "callback",
                  "value": {
                    "key": "value"
                  }
                }
              ],
              "disabled": false,
              "elements": [
                {
                  "tag": "markdown",
                  "content": "更多历史话题",
                  "icon": {
                    "tag": "standard_icon",
                    "token": "chat-history_outlined"
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "tag": "column_set",
      "flex_mode": "none",
      "background_style": "default",
      "columns": [
        {
          "tag": "column",
          "width": "weighted",
          "weight": 1,
          "vertical_spacing": "8px",
          "elements": [
            {
              "tag": "note",
              "elements": [
                {
                  "tag": "plain_text",
                  "content": "本话题中已选择以下插件"
                }
              ]
            },
            {
              "tag": "interactive_container",
              "width": "auto",
              "height": "auto",
              "background_style": "grey",
              "has_border": false,
              "border_color": "grey",
              "corner_radius": "40px",
              "padding": "2px 8px 2px 4px",
              "behaviors": [
                {
                  "type": "callback",
                  "value": {
                    "key": "value"
                  }
                }
              ],
              "disabled": false,
              "elements": [
                {
                  "tag": "column_set",
                  "flex_mode": "none",
                  "background_style": "default",
                  "horizontal_spacing": "4px",
                  "columns": [
                    {
                      "tag": "column",
                      "width": "auto",
                      "weight": 1,
                      "vertical_spacing": "8px",
                      "elements": [
                        {
                          "tag": "img",
                          "img_key": "img_v2_58e37110-6878-44ee-bce4-7a571c1bb70g",
                          "transparent": true,
                          "scale_type": "crop_center",
                          "size": "18px 18px",
                          "preview": false
                        }
                      ]
                    },
                    {
                      "tag": "column",
                      "width": "weighted",
                      "weight": 1,
                      "vertical_spacing": "8px",
                      "elements": [
                        {
                          "tag": "markdown",
                          "content": "妙记插件"
                        }
                      ]
                    }
                  ]
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
