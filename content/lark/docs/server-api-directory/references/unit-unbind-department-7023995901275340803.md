# 解除部门与单位的绑定关系

Source URL: https://open.feishu.cn/document/server-docs/contact-v3/unit/unbind_department
Updated: 2024-07-05

# 解除部门与单位的绑定关系

调用该接口解除部门与单位的绑定关系。

## 注意事项

操作的部门需要在应用的通讯录权限范围内。了解通讯录权限范围，可参见[权限范围资源介绍](https://open.feishu.cn/document/ukTMukTMukTM/uETNz4SM1MjLxUzM/v3/guides/scope_authority)。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/contact/v3/unit/unbind_department
HTTP Method | POST
接口频率限制 | [20 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 更新单位信息(contact:unit)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
unit_id | string | 是 | 单位 ID。<br>当你在创建单位时，可以在返回结果中获取单位 ID。你也可以调用[获取单位列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/unit/list)接口，获取单位 ID。<br>**示例值**："BU121"
department_id | string | 是 | 待解除关联的部门 ID。ID 类型与 department_id_type 的取值保持一致。<br>部门 API 提供了多种获取部门 ID 的方式，如[获取子部门列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/children)、[获取父部门信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/parent)、[搜索部门](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/search)，你可以选择合适的 API 进行查询。<br>**示例值**："od-4e6ac4d14bcd5071a37a39de902c7141"
department_id_type | string | 否 | 此次调用中的部门 ID 类型。关于部门 ID 的详细介绍，可参见[部门 ID 说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/field-overview#23857fe0)。<br>**示例值**："open_department_id"<br>**可选值有**：<br>- department_id：支持用户自定义配置的部门 ID。自定义配置时可复用已删除的 department_id，因此在未删除的部门范围内 department_id 具有唯一性。<br>- open_department_id：由系统自动生成的部门 ID，ID 前缀固定为 `od-`，在租户内全局唯一。<br>**默认值**：`open_department_id`

### 请求体示例
```json
{
    "unit_id": "BU121",
    "department_id": "od-4e6ac4d14bcd5071a37a39de902c7141",
    "department_id_type": "open_department_id"
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {}
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
500 | 40003 | internal error | 内部错误，请获取请求的 X-Request-Id，并向[技术支持](https://applink.feishu.cn/TLJpeNdW)进行反馈。
400 | 43050 | unit feature is prohibited | 单位是旗舰版功能，需企业开通相应版本。了解更多，可参见[单位管理](https://www.feishu.cn/hc/zh-CN/articles/333548009177)。
400 | 43051 | unit_id invalid | 非法的单位 ID。调用[获取单位列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/unit/list)接口，获取正确的单位 ID 后重试。
400 | 43058 | department_id invalid | 非法的部门 ID。请参考接口文档的参数描述，设置正确的部门 ID 类型以及部门 ID。
403 | 40004 | no dept authority error | 无部门操作权限。操作的部门需要在应用的通讯录权限范围内。了解通讯录权限范围，可参见[权限范围资源介绍](https://open.feishu.cn/document/ukTMukTMukTM/uETNz4SM1MjLxUzM/v3/guides/scope_authority)。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
