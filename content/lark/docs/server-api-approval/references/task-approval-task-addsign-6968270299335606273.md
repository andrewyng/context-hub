# 审批任务加签

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/task/approval-task-addsign
Updated: 2025-04-21

# 审批任务加签

对于单个审批任务进行加签操作。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/approval/v4/instances/add_sign
HTTP Method | POST
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 访问审批应用(approval:approval:readonly)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant_access_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant_access_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token)。<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 请求体

参数 | 类型 | 必须 | 说明
---|---|---|---
approval_code | string | 是 | 审批定义 Code 获取方式：<br>- 调用[创建审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/create)接口后，从响应参数 approval_code 获取。<br>- 登录审批管理后台，在指定审批定义的 URL 中获取，具体操作参见[什么是 Approval Code](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/overview-of-approval-resources#8151e0ae)。
instance_code | string | 是 | 审批实例 Code 获取方式：<br>- 调用[创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)接口后，从响应参数 instance_code 获取。<br>- 调用[批量获取审批实例 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/list)接口，获取所需的审批实例 Code。<br>- 调用[查询实例列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/query)，设置过滤条件查询指定的审批实例 Code。
user_id | string | 是 | 操作用户的 user_id，获取方式参考[如何获取 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)。
task_id | string | 是 | 审批任务 ID，调用[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)，从返回结果的 task_list 中获取所需的 id。
comment | string | 否 | 审核意见
add_sign_user_ids | List\<stirng\> | 是 | 被加签人的 user_id，可以指定多个。获取方式参考[如何获取 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)。
add_sign_type | int | 是 | 加签方式，可选值有：<br>- 1：前加签，在当前操作用户之前审批。<br>- 2：后加签，加签后自动通过当前审批，并流转至被加签人。<br>- 3：并加签，和当前操作用户共同审批。
approval_method | int | 否 | 仅在前加签、后加签时，需要填写该参数。可选值有：<br>- 1： 或签，一名审批人同意或拒绝即可。<br>- 2： 会签，需要所有审批人同意或拒绝。

### 请求体示例

```json
{
    "approval_code": "3B68E280-CF10-4198-B4CD-2E3BB97981D8",
    "instance_code": "289330DE-FBF1-4A47-91F9-9EFCCF11BCAE",
    "user_id": "b16g66e3",
    "task_id": "6955096766400167956",
    "comment": "addSignComment",
    "add_sign_user_ids": ["d19b913b","3313g62b"],
    "add_sign_type": 1,
    "approval_method": 1
}
```

## 响应

### 响应体
|参数|类型|说明|
|-|-|-|
|code|int|错误码，非 0 表示失败|
|msg|String|返回码的描述|

### 响应体示例

```json
{
    "code": 0,
    "msg": "success"
}
```

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
