# 校验三方审批实例

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/external_instance/check
Updated: 2025-04-21

# 校验三方审批实例

调用该接口校验三方审批实例数据，用于判断服务端数据是否为最新的。请求时提交实例最新更新时间，如果服务端不存在该实例，或者服务端实例更新时间不是最新的，则返回对应实例 ID。

例如，设置定时任务每隔 5 分钟，将最近 5 分钟产生的实例使用该接口进行对比。如果数据在服务端不存在或者不是最新，则可以根据本接口返回的实例 ID、任务 ID，前往[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/approval/v4/external_instances/check
HTTP Method | POST
接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>查看、创建、更新、删除三方审批实例相关信息(approval:external_instance)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
instances | exteranl_instance_check\[\] | 是 | 校验的实例信息
instance_id | string | 是 | 审批实例 ID。自定义配置，需要确保当前企业、应用内唯一。<br>**注意**：调用本接口和[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)接口操作同一个三方审批实例时，需要确保所用的实例 ID 一致。<br>**示例值**："1234234234242423"
update_time | string | 是 | 审批实例最近更新时间，Unix 毫秒时间戳。<br>**示例值**："1591603040000"
tasks | external_instance_task\[\] | 是 | 任务信息
task_id | string | 是 | 审批实例内的审批任务 ID。自定义配置，需要确保当前企业、应用内唯一。<br>**注意**：调用本接口和[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)接口操作同一个三方审批实例内的任务时，需要确保所用的任务 ID 一致。<br>**示例值**："112253"
update_time | string | 是 | 任务最近更新时间，Unix 毫秒时间戳。<br>**示例值**："1591603040000"

### 请求体示例
```json
{
    "instances": [
        {
            "instance_id": "1234234234242423",
            "update_time": "1591603040000",
            "tasks": [
                {
                    "task_id": "112253",
                    "update_time": "1591603040000"
                }
            ]
        }
    ]
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
diff_instances | exteranl_instance_check_response\[\] | 更新时间不一致的实例信息
instance_id | string | 审批实例 ID
update_time | string | 任务最近更新时间，Unix 毫秒时间戳。
tasks | external_instance_task\[\] | 任务信息
task_id | string | 任务 ID
update_time | string | 任务最近更新时间，Unix 毫秒时间戳。

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "diff_instances": [
            {
                "instance_id": "1234234234242423",
                "update_time": "1591603040000",
                "tasks": [
                    {
                        "task_id": "112253",
                        "update_time": "1591603040000"
                    }
                ]
            }
        ]
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 1390001 | param is invalid | 参数错误。排查方案：<br>- 根据接口文档的参数说明，检查请求时传入的参数是否正确。<br>- 如果传入的有表单参数（form），则需要检查该参数内传入的表单控件数据是否正确。如果报错信息内包含控件 ID（如 `控件= widget17261088448220001`），可以调用[查看指定审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/get)或者[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口，获取响应参数 form 值，检索有问题的控件 ID，然后检查该控件的配置是否正确。
400 | 1395001 | There have been some errors. Please try again later | 服务出现错误。排查方案：<br>1. 参考接口文档的参数说明，检查请求时传入的参数是否正确。如果传入的有表单参数（form），则需要检查传入的表单控件数据是否正确。<br>2. 降低请求频率，并重试。如果重试仍然报错，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
