# 人员

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/content-components/user-profile
Updated: 2025-06-23

# 人员组件

人员组件支持展示人员的用户名和头像。用户点击头像或姓名后，还可展示人员的个人名片。你需通过传入人员的 `open_id`、`user_id` 或 `union_id` 使用该组件。

本文档介绍人员组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[人员](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/user-profile)。

## 注意事项

若你要使用指定应用发送含有人员组件的卡片，你需保证该应用有访问用户 ID 的权限。否则卡片中的人员组件无法展示人员信息。

## JSON 结构

人员的完整 JSON 数据如下所示：
```json
{
  "tag": "person",
  "size": "extra_small", // 人员头像尺寸。默认值为 medium。
  "user_id": "ou_4a136bca010747fc3bd7b6f8f4cabcef", //人员的 ID。
  "show_avatar": true,   // 是否展示人员的头像。默认为 true。
  "show_name": false,  // 是否展示人员的用户名。默认为 false。
  "style": "normal"   // 人员组件的展示样式。可选值有 normal （默认样式）和 capsule （胶囊样式）。
}
```

## 字段说明

人员组件的字段说明如下表。

参数 | 是否必须 | 类型 | 默认值 | 描述
---|---|---|---|---
tag | 是 | String | person | 组件的标签，人员组件的取值为 `person`。
size | 否 | String | medium | 人员的头像尺寸。可取值：<br>- extra_small：超小尺寸<br>- small：小尺寸<br>- medium：中尺寸<br>- large：大尺寸
show_avatar | 否 | Boolean | true | 是否展示人员的头像。
show_name | 否 | Boolean | false | 是否展示人员的用户名。
style | 否 | String | normal | 人员组件的展示样式。可选值有:<br>- normal：默认样式<br>- capsule：胶囊样式
user_id | 是 | String | 空 | 人员的 ID。可选值有：<br>- 人员的 Open ID：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。详情参考[如何获取 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>- 人员的 Union ID：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。详情参考[如何获取 Union ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>- 人员的 User ID ：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。详情参考[如何获取User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)

## 示例代码

将以下示例代码中的 `user_id` 替换为实际的用户 ID，即可实现如下图示例的卡片效果：

```json
{
  "header": {
    "template": "blue",
    "title": {
      "content": "人员示例",
      "tag": "plain_text"
    }
  },
  "elements": [
    {
      "tag": "markdown",
      "content": "**extra_small 尺寸，默认样式**"
    },
    {
      "tag": "person",
      "size": "extra_small",
      "user_id": "ou_48d0958ee4b2ab3eaf0b5f6c968abcef",
      "show_avatar": true,
      "show_name": true,
      "style": "normal"
    },
    {
      "tag": "markdown",
      "content": "**small 尺寸，胶囊样式**"
    },
    {
      "tag": "person",
      "size": "small",
      "user_id": "ou_48d0958ee4b2ab3eaf0b5f6c968abcef",
      "show_avatar": true,
      "show_name": true,
      "style": "capsule"
    },
    {
      "tag": "markdown",
      "content": "**medium 尺寸，默认样式**"
    },
    {
      "tag": "person",
      "size": "medium",
      "user_id": "ou_48d0958ee4b2ab3eaf0b5f6c968abcef",
      "show_avatar": true,
      "show_name": true,
      "style": "normal"
    },
    {
      "tag": "markdown",
      "content": "**large 尺寸，胶囊样式**"
    },
    {
      "tag": "person",
      "size": "large",
      "user_id": "ou_48d0958ee4b2ab3eaf0b5f6c968abcef",
      "show_avatar": true,
      "show_name": true,
      "style": "capsule"
    }
  ]
}
```
