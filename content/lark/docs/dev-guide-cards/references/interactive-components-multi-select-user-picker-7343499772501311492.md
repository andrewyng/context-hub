# 人员选择-多选

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/interactive-components/multi-select-user-picker
Updated: 2025-01-02

# 人员选择-多选组件

人员选择-多选组件支持添加指定人员作为多选选项。多选组件是一种交互组件，需嵌入在表单容器中使用。本文档介绍人员选择-多选组件的 JSON 结构和相关属性。

本文档介绍人员选择-多选组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[人员选择-多选](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/interactive-components/multi-select-user-picker)。

## 注意事项

人员选择-多选组件支持飞书 V7.4 及以上版本的客户端。在低于该版本的飞书客户端上，人员选择-多选组件的内容将展示为“请升级至最新版客户端以查看操作”。
## 嵌套规则

人员选择-多选组件仅支持嵌入在表单容器中使用，通过表单容器的“提交”按钮提交选择的内容。了解表单容器及其交互配置，参考[表单容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/containers/form-container)。

## 组件属性

### JSON 结构

人员选择-多选组件的 JSON 数据结构如下所示：
```json
{
  "tag": "multi_select_person", // 组件的标签。
  "type": "text", // 组件边框样式。默认值 default。
  "name":"multi_select_users", // 表单容器中组件的自定义标识，用于识别用户提交的是哪个组件的数据。
  "placeholder": {
    // 人员选择组件内的占位文本。
    "tag": "plain_text",
    "content": "默认提示文本"
  },
  "width": "default",  // 下拉选择组件的宽度。
  "required":true, // 选项是否必填。
  "disabled":false, // 选项是否禁用。
  "selected_values": ["ou_48d0958ee4b2ab3eaf0b5f6c968xxxxx"], // 组件默认选中的选项。数组项的值需要和 options.value 对应。
  "options": [
    // 选项配置，仅支持添加候选用户的 open_id。
    {
      "value": "ou_48d0958ee4b2ab3eaf0b5f6c968xxxxx"
    },
    {
      "value": "ou_f9d24af786a14340721288cda6axxxxx"
    }
  ]
}
```

### 字段说明

人员选择-多选组件的字段说明如下表。

字段 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | / | 组件的标签。人员选择-多选组件取固定值 `multi_select_person`。
type | 否 | String | default | 组件边框样式。可选值：<br>- default：带边框样式<br>- text：不带边框的纯文本样式
name | 是 | String | 空 | 表单容器中组件的唯一标识。用于识别用户提交的数据属于哪个组件。在同一张卡片内，该字段的值全局唯一。
required | 否 | Boolean | false | 多选组件的内容是否必选。当组件内嵌在表单容器中时，该属性生效。可取值：<br>- true：多选组件必选。当用户点击表单容器的“提交”时，未填写多选组件，则前端提示“有必填项未填写”，不会向开发者的服务端发起回传请求。<br>- false：多选组件选填。当用户点击表单容器的“提交”时，未填写多选组件，仍提交表单容器中的数据。
disabled | 否 | Boolean | false | 是否禁用该多选组件。可选值：<br>- true：禁用多选组件<br>- false：多选组件保持可用状态
placeholder | 否 | Object | / | 人员选择组件内的占位文本。
└ tag | 是 | String | plain_text | 占位提示标签。固定值为 plain_text。
└ content | 否 | String | / | 占位文本的内容，最多支持 100 个字符。
width | 否 | String | default | 人员选择组件的宽度。支持以下枚举值：<br>- default：默认宽度<br>- fill：卡片最大支持宽度<br>- [100,∞)px：自定义宽度。超出卡片宽度时将按最大支持宽度展示
selected_values | 否 | Array of objects | 空 | 多选组件默认选中的选项。数组项的值需要和 `options.value` 对应。
options | 否 | Array of objects | / | 选项值配置。按选项数组的顺序展示选项内容。
└ value | 否 | String | 空 | 选项配置，仅支持添加候选用户的 open_id。了解更多，参考[如何获取不同的用户 ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)。<br>**注意**：当 options 数组为空，或 value 的值全部无效时，候选项展示为卡片所在会话中所有成员选项。

## 回调结构

当用户点击表单容器的提交按钮时，你在开发者后台配置的请求地址将会收到如下结构的回调数据。

- 如果你添加的是新版卡片回传交互回调(`card.action.trigger`)，回调数据的结构如下所示。详细参数说明可参考[卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)了解回调结构。
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
        "action": { //表单容器“提交”按钮本身配置的回传交互 value
            "value": {
                "key": "value"
             },
            "tag": "button",
            "name":"form_submit", // 表单容器中，“提交”按钮组件本身的回传属性
            "form_value":  { // 表单容器中各组件的返回值
            "multi_select_person":[ // 多选组件的 name 属性
                   "123123123123", // 数组返回多选选项内容
                   "223123123123"               
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
- 如果你添加的是旧版卡片回传交互回调(`card.action.trigger_v1`)，回调数据的结构如下所示。详细参数说明可参考[消息卡片回传交互（旧）](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)了解回调结构。
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
            "name": "form_submit", //按钮的唯一标识
            "form_value":  {
               "multi_select_person":[
                   "123123123123", // 数组返回提交多选的用户id信息
                   "223123123123"               
               ] 
            }
        }
}
```
## 示例代码

将以下 JSON 示例代码中 value 的值替换为实际的用户的 `open_id`，可实现如下图所示的卡片效果：

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
                  "tag": "multi_select_person",
                  "type": "default",
                  "name": "multi_select_users",
                  "placeholder": {
                    "tag": "plain_text",
                    "content": "请选择"
                  },
                  "width": "fill",
                  "required": true,
                  "disabled": false,
                  "selected_values": [
                    "ou_48d0958ee4b2ab3eaf0b5f6c968xxxxx"
                  ],
                  "options": [
                    {
                      "value": "ou_48d0958ee4b2ab3eaf0b5f6c968xxxxx"
                    },
                    {
                      "value": "ou_f9d24af786a14340721288cda6axxxxx"
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
