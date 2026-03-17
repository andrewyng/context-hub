# 多图选择

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/interactive-components/image-picker
Updated: 2025-01-02

# 多图选择组件

多图选择组件是用于提供图片选项的交互组件，支持单选、多选图片。多图选择组件适用于以图片为主要选项的场景，如在卡片中展示商品图、模板图、AI生成的图片等供用户选择。本文档介绍多图选择组件的 JSON 结构和相关属性。

本文档介绍多图选择组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[多图选择](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/interactive-components/image-picker)。

## 注意事项

- 多图选择组件仅支持通过撰写卡片 JSON 代码的方式使用，暂不支持在卡片搭建工具上构建使用。
- 多图选择组件支持飞书 V7.6 及以上版本的客户端。在低于该版本的飞书客户端上，多图选择的内容将展示为“请升级至最新版本客户端，以查看内容”的占位图。

## 嵌套规则

多图选择组件可嵌套在卡片的根节点、多列布局、表单容器组件中。在不同的嵌套关系中，多图选择组件支持的交互形态不同：
- 当多图选择组件不内嵌在表单容器中时，多图选择组件仅支持单选图片，且终端用户点击图片选项后立即提交，触发回传交互，不支持多选和异步提交。
- 当多图选择组件内嵌在表单容器中时，多图选择组件支持单选、多选交互并支持异步提交，即终端用户需选择图片后，点击表单容器的提交按钮，将本地缓存的表单内容一次回调至开发者服务端，实现异步提交。

## 组件属性

### JSON 结构

多图选择组件的 JSON 数据结构如下所示：

```json
{
  "elements": [
    {
      "tag": "select_img", // 组件标签。
      "style": "laser", // 选填，不填为默认样式。声明为 laser 时为镭射样式。
      "multi_select": false, // 是否多选。
      "layout": "bisect", // 选项的布局模式。
      "name": "choice_123", // 自定义多图选择组件的名称作为唯一标识。当组件内嵌在表单容器中时，该字段生效且必填，用于识别用户提交的数据属于哪个组件。
      "required": false, // 多图选择的选项是否必选。当组件内嵌在表单容器中时，该属性可用。其它情况将报错或不生效。
      "can_preview": false, // 点击图片选项后是否弹窗放大图片。当多图选择组件嵌套在表单容器中时，该属性生效。
      "aspect_ratio": "16:9", // 选项中图片的宽高比。
      "disabled": false, // 是否禁用整个选择组件。
      "disabled_tips": { // 指禁用组件后，用户将光标悬浮在整个组件上时展示的禁用提示文案。
        "tag": "plain_text",
        "content": "用户禁用提示文案"
      }, 
      "value": { // 自定义回传参数，支持回传字符串，或 "key":"value" 构成的对象结构体。
        "key": "value"
      }, 
      // 选项数组。在此配置多图选择组件中每个图片选项的属性。
      "options": [
        {
          "img_key": "xxxxxxxxxxxxxx", // 图片资源的 Key。
          "value": "picture1", // 自定义每个图片选项的回传参数。
          "disabled": false, // 是否禁用当前图片选项。
          "disabled_tips": { // 禁用当前选项后，用户将光标悬浮在选项上或点击选项时展示的禁用提示文案。
            "tag": "plain_text",
            "content": "用户禁用提示文案"
          }, 
          "hover_tips": { // 用户在 PC 端将光标悬浮在选项上方时的文案提醒。
            "tag": "plain_text",
            "content": "第一张图"
          }
        }
      ]
    }
  ]
}
```

### 字段说明

多图选择组件各属性说明如下表所示。

字段 | 是否必填 | 类型 | 默认值 | 描述
---|---|---|---|---
tag | 是 | String | / | 组件的标签。多图选择的固定取值为 `select_img`。
style | 否 | String | default | 图片加载等状态时的组件风格样式。可取值：<br>- default：默认灰色样式<br>- laser：彩色渐变样式，建议 AI 场景使用
multi_select | 否 | Boolean | false | 图片是否多选。可选值：<br>- true：多选，仅支持异步提交。多图选择组件需内嵌在表单容器中，否则卡片 JSON 报错。<br>- false：单选。<br>- 组件在表单容器内时，图片选项展示为带单选按钮（radio button）的异步提交样式。<br>- 组件不在表单容器内时，图片选项展示为不带单选按钮（radio button）的同步提交样式。
layout | 否 | String | bisect | 图片选项的布局方式。可选值：<br>- stretch：每个选项的图片宽度撑满父容器宽度，高度按图片大小等比例缩放。<br>- bisect：二等分排布，每个选项图片宽度占父容器的 1/2，高度按图片大小等比例缩放。<br>- trisect：三等分排布，每个选项图片宽度占父容器的 1/3，高度按图片大小等比例缩放。
name | 否 | String | 空 | 自定义多图选择组件的名称作为唯一标识。用于识别用户提交的数据属于哪个组件。<br>**注意**：当多图选择组件嵌套在表单容器中时，该字段生效、必填，且需在卡片全局内唯一。
required | 否 | Boolean | false | 多图选择的选项是否必选。当组件内嵌在表单容器中时，该属性可用。其它情况将报错或不生效。可取值：<br>- true：选项必填。当用户点击表单容器的“提交”时，未选择选项，则前端提示“有必填项未填写”，不会向开发者的服务端发起回传请求。<br>- false：选项选填。当用户点击表单容器的“提交”时，未选择选项，仍提交表单容器中的数据。
can_preview | 否 | Boolean | true | 点击图片选项后是否弹窗放大图片。当多图选择组件嵌套在表单容器中时，该属性生效。<br>- true：点击图片后，弹出图片查看器放大查看当前点击的图片。<br>- false：点击图片后，响应卡片本身的交互事件，不弹出图片查看器。
aspect_ratio | 否 | String | 16:9 | 选项中图片的宽高比。图片按最短边撑满图片渲染容器，按照居中裁剪的方式自适应裁剪。可取值：<br>- 1:1<br>- 16:9<br>- 4:3
disabled | 否 | Boolean | false | 是否禁用整个选择组件。可选值：<br>- true：禁用整个选择组件<br>- false：选择组件保持可用状态<br></ul>
disabled_tips | 否 | Object | 空 | 禁用整个组件后，用户将光标悬浮在整个组件上时展示的禁用提示文案。
└ tag | 否 | String | plain_text | 禁用提示文本的标签。固定值为 `plain_text`。
└ content | 否 | String | 空 | 禁用提示文本的内容。
value | 否 | String 或 Object | 空 | 你可在交互事件中自定义回传参数，支持回传字符串，或 `"key":"value"` 构成的对象结构体。
options | 是 | Option object | / | 选项数组，用于配置多图选择组件中每个图片选项的属性。
L img_key | 是 | String | / | 图片资源的 Key。你可以调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口或在搭建工具中上传图片，获取图片的 key。
L value | 否 | String | 空 | 自定义每个图片选项的回传参数。在回传交互中指定的回传参数将透传至开发者的服务端。
L disabled | 否 | Boolean | false | 是否禁用某个图片选项。可选值：<br>- true：禁用该选项<br>- false：选项保持可用状态
L disabled_tips | 否 | Object | 空 | 禁用某个图片选项后，用户将光标悬浮在选项上或点击选项时展示的禁用提示文案。
LL tag | 否 | String | plain_text | 禁用提示文本的标签。固定值为 `plain_text`。
LL  content | 否 | String | 空 | 禁用提示文本的内容。
L hover_tips | 否 | Object | 空 | 用户在 PC 端将光标悬浮在多图选择上方时的文案提醒。默认为空。
LL tag | 否 | String | plain_text | 悬浮提示文本的标签。固定值为 `plain_text`。
LL content | 否 | String | 空 | 悬浮提示文本的内容。

## 回调结构

为组件成功配置交互后，用户基于组件进行交互时，你在开发者后台配置的请求地址将会收到回调数据。
- 如果你添加的是新版卡片回传交互回调(`card.action.trigger`)，可参考[卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)了解回调结构。
- 如果你添加的是旧版卡片回传交互回调(`card.action.trigger_v1`)，可参考[消息卡片回传交互（旧）](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)了解回调结构。

## 示例代码

### 单选后立即提交选项内容

以下示例中，多图选择组件不内嵌在表单容器中，仅支持单选图片。终端用户点击图片选项后，数据将立即提交，触发回传交互。你可将示例代码中的 `img_key` 替换为实际的图片 Key，实现如下图示例的卡片效果：

```json
{
  "elements": [
    {
      "tag": "select_img",
      "name": "select_img-1",
      "layout": "bisect",
      "aspect_ratio": "16:9",
      "disabled": false,
      "disabled_tips": {
        "tag": "plain_text",
        "content": "用户禁用提示文案"
      },
      "options": [
        {
          "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
          "value": "picture1",
          "disabled": false,
          "disabled_tips": {
            "tag": "plain_text",
            "content": "用户禁用提示文案1"
          },
          "hover_tips": {
            "tag": "plain_text",
            "content": "第一张图"
          }
        },
        {
          "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
          "value": "picture2",
          "disabled": false,
          "disabled_tips": {
            "tag": "plain_text",
            "content": "用户禁用提示文案2"
          },
          "hover_tips": {
            "tag": "plain_text",
            "content": "第二张图"
          }
        },
        {
          "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
          "value": "picture3",
          "disabled": false,
          "disabled_tips": {
            "tag": "plain_text",
            "content": "用户禁用提示文案3"
          },
          "hover_tips": {
            "tag": "plain_text",
            "content": "第三张图"
          }
        },
        {
          "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
          "value": "picture4",
          "disabled": false,
          "disabled_tips": {
            "tag": "plain_text",
            "content": "用户禁用提示文案4"
          },
          "hover_tips": {
            "tag": "plain_text",
            "content": "第四张图"
          }
        },
        {
          "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
          "value": "picture5",
          "disabled": false,
          "disabled_tips": {
            "tag": "plain_text",
            "content": "用户禁用提示文案5"
          },
          "hover_tips": {
            "tag": "plain_text",
            "content": "第五张图"
          }
        },
        {
          "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
          "value": "picture6",
          "disabled": false,
          "disabled_tips": {
            "tag": "plain_text",
            "content": "用户禁用提示文案6"
          },
          "hover_tips": {
            "tag": "plain_text",
            "content": "第六张图"
          }
        }
      ]
    }
  ]
}
```

### 在表单容器中异步提交多选的选项内容

以下示例中，多图选择组件内嵌在表单容器中，且为单选交互的异步提交方式。在终端用户选择图片后，数据将缓存至本地；当用户点击表单容器的提交按钮后，本地缓存的所有表单内容将一次回调至开发者服务端，实现异步提交。你可将示例代码中的 `img_key` 替换为实际的图片 Key，实现如下图示例的卡片效果：

```json
{
  "elements": [
    {
      "tag": "form",
      "name": "form1",
      "elements": [
        {
          "tag": "select_img",
          "multi_select": false,
          "name": "select_img-1",
          "layout": "bisect",
          "can_preview": false,
          "aspect_ratio": "16:9",
          "disabled": false,
          "disabled_tips": {
            "tag": "plain_text",
            "content": "用户禁用提示文案"
          },
          "options": [
            {
              "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
              "value": "picture1",
              "disabled": false,
              "disabled_tips": {
                "tag": "plain_text",
                "content": "用户禁用提示文案1"
              },
              "hover_tips": {
                "tag": "plain_text",
                "content": "第一张图"
              }
            },
            {
              "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
              "value": "picture2",
              "disabled": false,
              "disabled_tips": {
                "tag": "plain_text",
                "content": "用户禁用提示文案2"
              },
              "hover_tips": {
                "tag": "plain_text",
                "content": "第二张图"
              }
            },
            {
              "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
              "value": "picture3",
              "disabled": false,
              "disabled_tips": {
                "tag": "plain_text",
                "content": "用户禁用提示文案3"
              },
              "hover_tips": {
                "tag": "plain_text",
                "content": "第三张图"
              }
            },
            {
              "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
              "value": "picture4",
              "disabled": false,
              "disabled_tips": {
                "tag": "plain_text",
                "content": "用户禁用提示文案4"
              },
              "hover_tips": {
                "tag": "plain_text",
                "content": "第四张图"
              }
            },
            {
              "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
              "value": "picture5",
              "disabled": false,
              "disabled_tips": {
                "tag": "plain_text",
                "content": "用户禁用提示文案5"
              },
              "hover_tips": {
                "tag": "plain_text",
                "content": "第五张图"
              }
            },
            {
              "img_key": "img_v2_9dd98485-2900-4d65-ada9-e31d1408dcfg",
              "value": "picture6",
              "disabled": false,
              "disabled_tips": {
                "tag": "plain_text",
                "content": "用户禁用提示文案6"
              },
              "hover_tips": {
                "tag": "plain_text",
                "content": "第六张图"
              }
            }
          ]
        },
        {
          "tag": "button",
          "text": {
            "tag": "plain_text",
            "content": "提交"
          },
          "type": "primary",
          "name": "button-submit",
          "form_action_type": "submit",
          "behaviors": [
            {
              "type": "callback",
              "value": "form_callback"
            }
          ]
        },
        {
          "tag": "button",
          "text": {
            "tag": "plain_text",
            "content": "取消"
          },
          "name": "button-cancel",
          "form_action_type": "reset"
        }
      ]
    }
  ]
}
```
