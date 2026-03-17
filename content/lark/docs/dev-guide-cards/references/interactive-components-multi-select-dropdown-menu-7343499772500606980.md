# 下拉选择-多选

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/interactive-components/multi-select-dropdown-menu
Updated: 2025-01-02

# 下拉选择-多选组件

下拉选择-多选组件支持自定义多选菜单的选项文本、图标和回传参数，是一种交互组件，需嵌入在表单容器中使用。本文档介绍下拉选择-多选组件的 JSON 结构和相关属性。

本文档介绍下拉选择-多选组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[下拉选择-多选](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/interactive-components/multi-select-dropdown-menu)。

## 注意事项

下拉选择-多选组件支持飞书 V7.4 及以上版本的客户端。在低于该版本的飞书客户端上，下拉选择-多选组件的内容将展示为“请升级至最新版客户端以查看操作”。

## 嵌套规则

下拉选择-多选组件仅支持嵌入在表单容器中使用，通过表单容器的“提交”按钮提交选择的内容。了解表单容器及其交互配置，参考[表单容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/containers/form-container)。

## 组件属性

### JSON 结构

下拉选择-多选组件的 JSON 数据结构如下所示：
```json
{
  "tag": "multi_select_static", // 组件标签。
  "type": "default", // 组件边框样式。默认值 default。
  "name":"multi_select_departments", // 表单容器中组件的自定义唯一标识，当多选组件内嵌在表单容器时，该属性生效，用于识别用户提交的是哪个组件的数据。
  "required": true, // 选项是否必填。当多选组件内嵌在表单容器时，该属性可用。其它情况将报错或不生效。
  "disabled": false, // 选项是否禁用。
  "placeholder": {
    // 下拉选择组件内的占位文本。
    "tag": "plain_text",
    "content": "默认提示文本"
  },
  "width": "default",  // 下拉选择组件的宽度。
  "selected_values": [], // 选项初始值。数组项的值需要和 options.value 对应。
  "options": [
    // 选项配置
    {
      "text": {
        // 选项名称
        "tag": "plain_text",
        "content": "我是交互组件"
      },
      "icon": {
        // 添加图标作为选项前缀图标。支持自定义或使用图标库中的图标。
        "tag": "standard_icon", // 图标类型。
        "token": "chat-forbidden_outlined", // 图标的 token。仅在 tag 为 standard_icon 时生效。
        "color": "orange", // 图标颜色。仅在 tag 为 standard_icon 时生效。
        "img_key": "img_v2_38811724" // 图片的 key。仅在 tag 为 custom_icon 时生效。
      },
      "value": "selectDemo1" // 选项回调值，支持 string 类型数据。
    }
  ],
}
```

### 字段说明

下拉选择-多选组件的字段说明如下表。

字段 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | / | 组件的标签。下拉选择-多选组件取固定值 `multi_select_static`。
type | 否 | String | default | 组件边框样式。可选值：<br>- default：带边框样式<br>- text：不带边框的纯文本样式
name | 是 | string | 空 | 表单容器中组件的唯一标识。当多选组件内嵌在表单容器时，该属性生效，用于识别用户提交的数据属于哪个组件。<br>**注意**：当多选组件嵌套在表单容器中时，该字段必填且需在卡片全局内唯一。
placeholder | 否 | Object | 空 | 用户未选择选项时，下拉选择组件内的占位文本。
└ tag | 是 | String | plain_text | 占位提示的标签。固定值为 `plain_text`。
└ content | 否 | String | 请选择 | 占位文本的内容，最多支持 100 个字符。
width | 否 | String | default | 下拉选择组件的宽度。支持以下枚举值：<br>- default：默认宽度：<br>- 当组件带边框时（即 `"type":"default"`），默认宽度值固定为 282 px<br>- 当组件不带边框时（即 `"type":"text"`），组件宽度自适应选择器的内容宽度<br>- fill：组件宽度将撑满父容器宽度<br>- [100,∞)px：自定义固定数值宽度，如 200px。最小值为 100px。超出父容器宽度时，按撑满父容器宽度展示
required | 否 | Bool | true | 多选组件的选项是否必选。当组件内嵌在表单容器中时，该属性可用。其它情况将报错或不生效。可取值：<br>- true：多选组件必选。当用户点击表单容器的“提交”时，未选择多选选项，则前端提示“有必填项未填写”，不会向开发者的服务端发起回传请求。<br>- false：多选组件可选。当用户点击表单容器的“提交”时，未选择多选选项，仍提交表单容器中的数据。
disabled | 否 | Bool | false | 是否禁用该多选组件。可选值：<br>- true：禁用该多选组件，组件展示自定义的占位文本或选项初始值，且终端用户不可修改交互<br>- false：多选组件保持可用状态
selected_values | 否 | Array of string | 空 | 多选组件默认选中的选项。数组项的值需要和 `options.value` 对应。
options | 否 | Array of objects | / | 选项值配置。按选项数组的顺序展示选项内容。
└ text | 是 | Object | 空 | 选项名称。为空时展示空白选项。JSON 结构如下所示，使用 plain text 对象描述：<br>```json<br>"text": {<br>// 选项名称标签。固定值为 plain_text。<br>"tag": "plain_text", <br>// 选项名称文本。<br>"content": "我是一个选项"<br>}<br>```
└ icon | 否 | Object | / | 添加图标作为选项前缀图标。支持自定义或使用图标库中的图标。
└ └ tag | 否 | String | / | 图标类型的标签。可取值：<br>- `standard_icon`：使用图标库中的图标。<br>- `custom_icon`：使用自定义图片作为图标。
└ └ token | 否 | String | / | 图标库中图标的 token。当 `tag` 为 `standard_icon` 时生效。枚举值参见[图标库](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-icons)。
└ └ color | 否 | String | / | 图标的颜色。支持设置线性和面性图标（即 token 末尾为 `outlined` 或 `filled` 的图标）的颜色。当 `tag` 为 `standard_icon` 时生效。枚举值参见[颜色枚举值](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/enumerations-for-fields-related-to-color)。
└ └ img_key | 否 | String | / | 自定义前缀图标的图片 key。当 `tag` 为 `custom_icon` 时生效。<br>图标 key 的获取方式：调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口，上传用于发送消息的图片，并在返回值中获取图片的 image_key。
└ value | 是 | String | / | 自定义选项回调值。当用户点击交互组件的选项后，会将 value 的值返回给接收回调数据的服务器。后续你可以通过服务器接收的 value 值进行业务处理。<br>**注意**：同一个选择组件内，各选项的 value 值不可重复，否则将无法识别用户点击的是哪个选项。

### 回调结构

当用户点击表单容器的提交按钮时，你在开发者后台配置的请求地址将会收到如下结构的回调数据。详情参考[表单容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/containers/form-container)和[卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)。

- 如果你添加的是新版卡片回传交互回调(`card.action.trigger`)，回调数据的结构如下：

  ```json
  {
      "schema": "2.0",
      "header": { 
          "event_id": "f7984f25108f8137722bb63cee927e66",
          "token": "066zT6pS4QCbgj5Do145GfDbbagCHGgF",
          "create_time": "1603977298000000",
          "event_type": "card.action.trigger",
          "tenant_key": "xxxxxxx",
          "app_id": "cli_xxxxxxxx"
      },
      "event":{
          "operator": {
              "tenant_key": "xxxxxxx", 
              "user_id": "xxxxxxx",    
              "open_id": "ou_xxx"     
          },
          "token": "c-xxxx",
          "action": { // 表单容器“提交”按钮本身配置的回传交互的值
              "value": {
                  "key": "value"
               },
              "tag": "button",
              "name":"form_submit", // 表单容器中，“提交”按钮组件本身的回传属性
              "form_value":  { // 表单容器中各组件的返回值
              "multi_select_departments":[ // 表单容器中下拉选择-多选组件的自定义标识
                     "selectDemo1", // options.value 的值，用于判断用户选择的是哪个选项
                     "selectDemo2"               
                 ] 
              }
          },
          "host": "im_message", 
          "context": {
              "open_message_id":"om_xxx",
              "open_chat_id":"oc_xxx"           
          }  
      }
  }
  ```
- 如果你添加的是旧版卡片回传交互回调(`card.action.trigger_v1`)，回调数据的结构如下：

  ```json
  {
      "open_id": "ou_sdfimx9948345", 
      "user_id": "eu_sd923r0sdf5", 
      "open_message_id": "om_abcdefg1234567890",
      "tenant_key": "d32004232",
      "token": "c-xxxxx",
      "action": 
          {
              "value":{
                 "key":"value"
              },
              "tag": "button",
              "name": "form_submit",// 自定义的按钮的唯一标识
              "form_value":  {
                 "multi_select_departments":[
                     "selectDemo1", // options.value 的值，用于判断用户选择的是哪个选项
                     "selectDemo2"               
                 ] 
              }
          }
  }
  ```
## 示例代码

```json
{
  "elements": [
    {
      "tag": "form",
      "elements": [
        {
          "tag": "column_set",
          "flex_mode": "none",
          "horizontal_spacing": "default",
          "background_style": "default",
          "columns": [
            {
              "tag": "column",
              "elements": [
                {
                  "tag": "multi_select_static",
                  "type": "default",
                  "name": "multi_select_departments",
                  "placeholder": {
                    "tag": "plain_text",
                    "content": "默认提示文本"
                  },
                  "width": "fill",
                  "required": true,
                  "disabled": false,
                  "selected_values": [],
                  "options": [
                    {
                      "text": {
                        "tag": "plain_text",
                        "content": "选项1"
                      },
                      "icon": {
                        "tag": "standard_icon",
                        "token": "chat-forbidden_outlined",
                        "color": "orange"
                      },
                      "value": "selectDemo1"
                    },
                    {
                      "text": {
                        "tag": "plain_text",
                        "content": "选项2"
                      },
                      "icon": {
                        "tag": "standard_icon",
                        "token": "chat-forbidden_outlined",
                        "color": "orange"
                      },
                      "value": "selectDemo2"
                    }
                  ]
                }
              ],
              "width": "weighted",
              "weight": 1
            }
          ]
        },
        {
          "tag": "column_set",
          "flex_mode": "none",
          "background_style": "default",
          "horizontal_spacing": "default",
          "columns": [
            {
              "tag": "column",
              "width": "auto",
              "vertical_align": "top",
              "elements": [
                {
                  "tag": "button",
                  "text": {
                    "tag": "plain_text",
                    "content": "提交"
                  },
                  "type": "primary",
                  "complex_interaction": true,
                  "action_type": "form_submit",
                  "name": "Button_lrztw8x3"
                }
              ]
            },
            {
              "tag": "column",
              "width": "auto",
              "vertical_align": "top",
              "elements": [
                {
                  "tag": "button",
                  "text": {
                    "tag": "plain_text",
                    "content": "取消"
                  },
                  "type": "default",
                  "complex_interaction": true,
                  "action_type": "form_reset",
                  "name": "Button_lrztw8x4"
                }
              ]
            }
          ]
        }
      ],
      "name": "Form_lrztw8x2"
    }
  ]
}
```
