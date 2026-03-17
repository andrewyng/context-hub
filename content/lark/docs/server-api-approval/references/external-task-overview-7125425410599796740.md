# 三方审批任务概述

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/external_task/overview
Updated: 2025-04-21

# 三方审批任务概述

审批业务提供了获取三方审批任务状态的开放能力，用于查询指定审批实例、指定用户或指定状态下的审批任务数据。

## 字段说明

名称 | 类型 | 描述
---|---|---
approval_codes | string\[\] | 三方审批定义 Code，用于指定只获取这些定义下的数据。获取方式：<br>- 调用[创建三方审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_approval/create)时，会返回审批定义 Code。<br>- 登录审批管理后台，在指定审批定义的 URL 中获取，具体操作参见[什么是 Approval Code](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/overview-of-approval-resources#8151e0ae)。<br>**示例值**：["E78F1022-A166-447C-8320-E151DA90D70F"]<br>**数据校验规则**：<br>- 最大长度：`20`
instance_ids | string\[\] | 三方审批实例 ID，用于指定只获取这些实例下的数据，最多支持 20 个。<br>**说明**：三方审批实例 ID 是调用[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)、[校验三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/check)时自定义的实例 ID（instance_id）。<br>**示例值**：["oa_159160304"]
user_ids | string\[\] | 审批人 user_id，用于指定只获取这些用户的数据。获取方式参见[如何获取用户的 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)。<br>**示例值**：["112321"]
status | string | 审批任务状态，用于指定获取该状态下的数据。<br>**示例值**："PENDING"<br>**可选值有**：<br>- PENDING：审批中<br>- APPROVED：审批流程结束，结果为同意<br>- REJECTED：审批流程结束，结果为拒绝<br>- TRANSFERRED：任务转交<br>- DONE：任务通过但审批人未操作。审批人看不到该任务时，如需查看可抄送至该审批人。

## 数据示例

```json
{
    "approval_codes": [
        "E78F1022-A166-447C-8320-E151DA90D70F"
    ],
    "instance_ids": [
        "oa_159160304"
    ],
    "user_ids": [
        "112321"
    ],
    "status": "PENDING"
}
```
