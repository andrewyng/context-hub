# 原生审批评论概述

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/instance-comment/overview
Updated: 2025-04-21

# 原生审批评论概述

原生审批实例内，支持员工进行评论、回复评论。评论内容支持文本、@用户以及添加附件。

## 字段说明

名称 | 类型 | 描述
---|---|---
content | string | 评论内容，包括文本内容、图片、附件等。<br>**注意**：<br>- JSON 格式，传入时需要压缩转义为字符串。<br>- 以下示例值未转义，你可参考请求体示例中的示例 content 进行编辑。<br>- 对于附件，在 PC 端使用 HTTP 资源链接传图片资源可能会导致缩略图异常，建议使用 HTTPS 传资源附件。<br>**示例值**："{\"text\":\"最前面艾特展示\",\"files\":[{\"url\":\"xxx\",\"fileSize\":155149,\"title\":\"9a9fedc5cfb01a4a20c715098.png\",\"type\":\"image\",\"extra\":\"\"}]}"
at_info_list | comment_at_info\[\] | 评论中艾特人信息
user_id | string | 被艾特人的 ID，ID 类型与查询参数 user_id_type 取值一致。<br>**示例值**："579fd9c4"
name | string | 被艾特人的姓名<br>**示例值**："张敏"
offset | string | 被艾特人在评论中的位置，从 0 开始。用于偏移覆盖（注意会覆盖原有位置上的内容）。例如：<br>- 取值为 0 时的效果：@username 示例文本<br>- 取值为 2 时的效果：示例 @username 文本<br>- 取值为 4 时的效果：示例文本 @username<br>**示例值**："0"
parent_comment_id | string | 父评论 ID，如果是回复评论，需要传入该值。获取方式：<br>- 调用当前接口成功后会返回本次评论的 ID，你可以保存用于下次使用。<br>- 调用[获取评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/list)接口，获取评论 ID。<br>**示例值**："7081516627711524883"
comment_id | string | 评论 ID。如果需要编辑、删除一条评论，则需要将该评论的 ID 传入当前参数。获取方式：<br>- 调用当前接口成功后会返回本次评论的 ID，你可以保存用于下次使用。<br>- 调用[获取评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/list)接口，获取评论 ID。<br>**示例值**："7081516627711524883"
disable_bot | boolean | 是否不启用 Bot，取值为 true 时只同步数据，不触发 Bot。<br>**示例值**：false
extra | string | 附加字段，JSON 格式，传入时需要压缩转义为字符串。<br>**示例值**："{\"a\":\"a\"}"

## 数据示例

```json
{
    "content": "{\"text\":\"agree\",\"files\":[{\"url\":\"xxx\",\"fileSize\":155149,\"title\":\"9a9fedc5cfb01a4a20c715098.png\",\"type\":\"image\",\"extra\":\"\"}]}",
    "at_info_list": [
        {
            "user_id": "579fd9c4",
            "name": "zhangsan",
            "offset": "1"
        }
    ],
    "parent_comment_id": "7081516627711524883",
    "comment_id": "7081516627711524883",
    "disable_bot": false,
    "extra": "{\"a\":\"a\"}"
}
```
