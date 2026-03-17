# 查询任务列表

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/approval-search/search
Updated: 2025-04-21

# 查询任务列表

该接口通过不同条件查询审批系统中符合条件的审批任务列表。

## 使用限制
- 该接口会过滤被撤销的审批实例，实例内的任务也会被过滤掉，因此会有任务存在却不返回数据的情况。

    该情况的具体表现：返回结果中每页的数据条目数可能小于 page_size 值。例如，page_size 取值为 10，实际查询结果中当前页只显示 6 条数据，则表示有 4 条数据是被撤销实例内的任务。

- 该接口查询结果可能存在延迟，无法保证实时性。如需实时查询，建议使用[查询用户的任务列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/query)。

- 查询时：

    - user_id、approval_code、instance_code、instance_external_id、group_external_id 不能同时为空。

    - approval_code 和 group_external_id 查询结果取并集；instance_code 和 instance_external_id 查询结果取并集；其他查询条件之间均取交集。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/approval/v4/tasks/search
HTTP Method | POST
接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 访问审批应用(approval:approval:readonly)<br>查询审批列表(approval:approval.list:readonly)
字段权限要求 | **注意事项**：该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户 user ID(contact:user.employee_id:readonly)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
page_size | int | 否 | 分页大小。如果当前页包含被撤销实例内的任务，则查询结果中每页的数据条目数可能小于 page_size 值。例如，page_size 取值为 10，实际查询结果中当前页只显示 6 条数据，则表示有 4 条数据是被撤销实例内的任务。<br>**示例值**：10<br>**默认值**：`10`<br>**数据校验规则**：<br>- 取值范围：`5` ～ `200`
page_token | string | 否 | 分页标记，第一次请求不填，表示从头开始遍历；分页查询结果还有更多项时会同时返回新的 page_token，下次遍历可采用该 page_token 获取查询结果<br>**示例值**：nF1ZXJ5VGhlbkZldGNoCgAAAAAA6PZwFmUzSldvTC1yU
user_id_type | string | 否 | 用户 ID 类型<br>**示例值**：open_id<br>**可选值有**：<br>- open_id：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。[了解更多：如何获取 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>- union_id：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。[了解更多：如何获取 Union ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>- user_id：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。[了解更多：如何获取 User ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>**默认值**：`open_id`<br>**当值为 `user_id`，字段权限要求**：<br>获取用户 user ID(contact:user.employee_id:readonly)

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
user_id | string | 否 | 任务审批人 ID，ID 类型与查询参数 user_id_type 保持一致。<br>**示例值**："lwiu098wj"
approval_code | string | 否 | 审批定义 Code。获取方式：<br>- 调用[创建审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/create)接口后，从响应参数 approval_code 获取。<br>- 登录审批管理后台，在指定审批定义的 URL 中获取，具体操作参见[什么是 Approval Code](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/overview-of-approval-resources#8151e0ae)。<br>**注意**：<br>- user_id、approval_code、instance_code、instance_external_id、group_external_id 不能同时为空。<br>- approval_code 和 group_external_id 查询结果取并集。<br>**示例值**："EB828003-9FFE-4B3F-AA50-2E199E2ED942"
instance_code | string | 否 | 审批实例 Code。获取方式：<br>- 调用[创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)接口后，从响应参数 instance_code 获取。<br>- 调用[批量获取审批实例 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/list)接口，获取所需的审批实例 Code。<br>**注意**：<br>- user_id、approval_code、instance_code、instance_external_id、group_external_id 不能同时为空。<br>- instance_code 和 instance_external_id 查询结果取并集。<br>**示例值**："EB828003-9FFE-4B3F-AA50-2E199E2ED943"
instance_external_id | string | 否 | 审批实例的第三方 ID。<br>**注意**：<br>- user_id、approval_code、instance_code、instance_external_id、group_external_id 不能同时为空。<br>- instance_code 和 instance_external_id 查询结果取并集。<br>**示例值**："EB828003-9FFE-4B3F-AA50-2E199E2ED976"
group_external_id | string | 否 | 审批定义分组的第三方 ID。<br>**注意**：<br>- user_id、approval_code、instance_code、instance_external_id、group_external_id 不能同时为空。<br>- approval_code 和 group_external_id 查询结果取并集。<br>**示例值**："1234567"
task_title | string | 否 | 审批任务标题。<br>**说明**：仅第三方审批存在审批任务标题。<br>**示例值**："test"
task_status | string | 否 | 审批任务状态。<br>**注意**：若不设置则查询全部状态，若不在集合中，则报错。<br>**示例值**："PENDING"<br>**可选值有**：<br>- PENDING：审批中<br>- REJECTED：已拒绝<br>- APPROVED：已通过<br>- TRANSFERRED：已转交<br>- DONE：已完成<br>- RM_REPEAT：去重<br>- PROCESSED：已处理<br>- ALL：所有状态
task_start_time_from | string | 否 | 任务查询开始时间，Unix 毫秒时间戳。与 task_start_time_to 参数构成时间段查询条件，仅会返回在该时间段内的审批任务。<br>**注意**：查询时间跨度不得大于 30 天，开始和结束时间必须同时设置或者同时不设置。<br>**示例值**："1547654251506"
task_start_time_to | string | 否 | 任务查询结束时间，Unix 毫秒时间戳。与 task_start_time_from 参数构成时间段查询条件，仅会返回在该时间段内的审批任务。<br>**注意**：查询时间跨度不得大于 30 天，开始和结束时间必须同时设置或者同时不设置。<br>**示例值**："1547654251506"
locale | string | 否 | 语言。<br>**示例值**："zh-CN"<br>**可选值有**：<br>- zh-CN：中文<br>- en-US：英文<br>- ja-JP：日文
task_status_list | string\[\] | 否 | 查询多种状态的任务，当填写此参数时，task_status 参数将失效。<br>**可选值有**：<br>- `PENDING`：审批中<br>- `REJECTED`：拒绝<br>- `APPROVED`：通过<br>- `TRANSFERRED`：转交<br>- `DONE`：已完成<br>- `RM_REPEAT`：去重<br>- `PROCESSED`：已处理<br>**示例值**：["PENDING"]
order | int | 否 | 按任务时间排序<br>**示例值**：2<br>**可选值有**：<br>- 0：按审批任务更新时间（update_time）倒排。<br>- 1：按审批任务更新时间（update_time）正排。<br>- 2：按审批任务开始时间（start_time）倒排。<br>- 3：按审批任务开始时间（start_time）正排。<br>**默认值**：`2`

### 请求体示例
```json
{
    "user_id": "lwiu098wj",
    "approval_code": "EB828003-9FFE-4B3F-AA50-2E199E2ED942",
    "instance_code": "EB828003-9FFE-4B3F-AA50-2E199E2ED943",
    "instance_external_id": "EB828003-9FFE-4B3F-AA50-2E199E2ED976",
    "group_external_id": "1234567",
    "task_title": "test",
    "task_status": "PENDING",
    "task_start_time_from": "1547654251506",
    "task_start_time_to": "1547654251506",
    "locale": "zh-CN",
    "task_status_list": [
        "PENDING"
    ],
    "order": 2
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
count | int | 查询结果中包含的审批任务总数
task_list | task_search_item\[\] | 审批任务列表
approval | instance_search_approval | 审批定义信息
code | string | 审批定义 Code
name | string | 审批定义名称
is_external | boolean | 是否为第三方审批
external | instance_search_approval_external | 第三方审批信息
batch_cc_read | boolean | 是否支持批量读
approval_id | string | 审批定义 ID
icon | string | 审批定义图标信息
group | instance_search_group | 审批定义分组
external_id | string | 审批定义分组的第三方 ID
name | string | 审批定义分组名称
instance | instance_search_node | 审批实例信息
code | string | 审批实例 Code
external_id | string | 审批实例的第三方 ID
user_id | string | 审批实例发起人的 user_id
start_time | string | 审批实例开始时间，Unix 毫秒时间戳
end_time | string | 审批实例结束时间，Unix 毫秒时间戳
status | string | 审批实例状态<br>**可选值有**：<br>- rejected：已拒绝<br>- pending：审批中<br>- canceled：已撤回<br>- deleted：已删除<br>- approved：已通过
title | string | 审批实例名称（只有第三方审批有返回值）
extra | string | 审批实例扩展字段，字符串类型的 JSON 数据
serial_id | string | 审批流水号
link | instance_search_link | 审批实例链接（只有第三方审批有返回值）
pc_link | string | 审批实例 PC 端链接
mobile_link | string | 审批实例移动端链接
task | task_search_node | 审批任务信息
user_id | string | 审批任务的审批人 user_id
start_time | string | 审批任务开始时间，Unix 毫秒时间戳
end_time | string | 审批任务结束时间，Unix 毫秒时间戳
status | string | 审批任务状态<br>**可选值有**：<br>- rejected：已拒绝<br>- pending：审批中<br>- approved：已通过<br>- transferred：已转交<br>- done：已完成<br>- rm_repeat：去重<br>- processed：已处理<br>- hidden：隐藏
title | string | 审批任务名称（只有第三方审批有返回值）
extra | string | 审批任务扩展字段，字符串类型的 JSON 数据
link | instance_search_link | 审批任务链接（只有第三方审批有返回值）
pc_link | string | 审批任务 PC 端链接
mobile_link | string | 审批任务移动端链接
task_id | string | 审批任务 ID
update_time | string | 审批任务更新时间，Unix 毫秒时间戳
task_external_id | string | 三方审批扩展任务 ID
page_token | string | 分页标记，当 has_more 为 true 时，会同时返回新的 page_token，否则不返回 page_token
has_more | boolean | 是否还有更多项

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "count": 10,
        "task_list": [
            {
                "approval": {
                    "code": "EB828003-9FFE-4B3F-AA50-2E199E2ED943",
                    "name": "approval",
                    "is_external": true,
                    "external": {
                        "batch_cc_read": false
                    }
                },
                "group": {
                    "external_id": "0004",
                    "name": "groupA"
                },
                "instance": {
                    "code": "EB828003-9FFE-4B3F-AA50-2E199E2ED943",
                    "external_id": "0004_3ED52DC1-AA6C",
                    "user_id": "lwiu098wj",
                    "start_time": "1547654251506",
                    "end_time": "1547654251506",
                    "status": "pending",
                    "title": "test",
                    "extra": "{}",
                    "serial_id": "201902020001",
                    "link": {
                        "pc_link": "https://www.baidu.com/",
                        "mobile_link": "https://www.baidu.com/"
                    }
                },
                "task": {
                    "user_id": "lwiu098wj",
                    "start_time": "1547654251506",
                    "end_time": "1547654251506",
                    "status": "pending",
                    "title": "test",
                    "extra": "{}",
                    "link": {
                        "pc_link": "https://www.baidu.com/",
                        "mobile_link": "https://www.baidu.com/"
                    },
                    "task_id": "7110153401253494803",
                    "update_time": "1547654251506"
                }
            }
        ],
        "page_token": "nF1ZXJ5VGhlbkZldGNoCgAAAAAA6PZwFmUzSldvTC1yU",
        "has_more": false
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 1390001 | param is invalid | 参数错误。排查方案：<br>- 根据接口文档的参数说明，检查请求时传入的参数是否正确。<br>- 如果传入的有表单参数（form），则需要检查该参数内传入的表单控件数据是否正确。如果报错信息内包含控件 ID（如 `控件= widget17261088448220001`），可以调用[查看指定审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/get)或者[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口，获取响应参数 form 值，检索有问题的控件 ID，然后检查该控件的配置是否正确。
400 | 1395001 | There have been some errors. Please try again later | 服务出现错误。排查方案：<br>1. 参考接口文档的参数说明，检查请求时传入的参数是否正确。如果传入的有表单参数（form），则需要检查传入的表单控件数据是否正确。<br>2. 降低请求频率，并重试。如果重试仍然报错，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)。
400 | 1390003 | instance code not found | 找不到审批实例 Code，检查传入的审批实例 Code 是否正确。<br>审批实例 Code 获取方式：<br>- 调用[创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)接口后，从响应参数 instance_code 获取。<br>- 调用[批量获取审批实例 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/list)接口，获取所需的审批实例 Code。<br>- 调用[查询实例列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/query)，设置过滤条件查询指定的审批实例 Code。
400 | 1390002 | approval code not found | 找不到审批定义 Code，检查传入的审批定义 Code 是否正确。<br>审批定义 Code 获取方式：<br>- 调用[创建审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/create)接口后，从响应参数 approval_code 获取。<br>- 登录审批管理后台，在指定审批定义的 URL 中获取，具体操作参见[什么是 Approval Code](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/overview-of-approval-resources#8151e0ae)。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
