# 新增人员类型

Source URL: https://open.feishu.cn/document/server-docs/contact-v3/employee_type_enum/create
Updated: 2024-07-05

# 新增人员类型

调用该接口新增一个自定义的人员类型。人员类型是用户属性之一，用于灵活标记用户的身份类型。

## 使用限制

自定义的人员类型数量上限为 255，其中创建后又删除的自定义人员类型也会计入数量限制内。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/contact/v3/employee_type_enums
HTTP Method | POST
接口频率限制 | [20 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 更新通讯录(contact:contact)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
content | string | 是 | 人员类型的选项内容。<br>**示例值**："专家"<br>**数据校验规则**：<br>- 长度范围：`1` ～ `100` 字符
enum_type | int | 是 | 人员类型的选项类型。新增人员类型时固定取值为 `2` 即可。<br>**示例值**：2<br>**可选值有**：<br>- 1：内置类型，只读。新增人员类型时不支持选择该类型。<br>- 2：自定义。
enum_status | int | 是 | 人员类型的选项激活状态。只有已激活的选项可以用于配置用户属性。<br>**示例值**：1<br>**可选值有**：<br>- 1：激活<br>- 2：未激活
i18n_content | i18n_content\[\] | 否 | 选项内容的国际化配置。<br>**说明**：在飞书客户端查看用户人员类型时，系统会根据客户端语言环境，自动展示相匹配的选项语言。如果相应语言不在选项国际化配置当中，则会展示默认选项内容（即 content 字段）。
locale | string | 否 | 语言版本。例如：<br>- zh_cn：中文<br>- en_us：英文<br>- ja_jp：日文<br>**示例值**："zh_cn"
value | string | 否 | 语言版本对应的内容。<br>**数据校验规则：**<br>长度范围：`1` 字符 ～ `100` 字符<br>**示例值**："专家（中文）"

### 请求体示例
```json
{
    "content": "专家",
    "enum_type": 2,
    "enum_status": 1,
    "i18n_content": [
        {
            "locale": "zh_cn",
            "value": "专家（中文）"
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
employee_type_enum | employee_type_enum | 新建的人员类型信息。
enum_id | string | 人员类型的选项 ID。后续可以使用该 ID 更新、删除选项。
enum_value | string | 人员类型的选项编号，新增人员类型后，由系统生成的编号。后续可使用该编号配置用户的人员类型属性。例如，调用[创建用户](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/create)接口时，employee_type 参数值对应的就是当前的 enum_value。
content | string | 选项内容。
enum_type | int | 选项类型。<br>**可选值有**：<br>- 1：内置类型<br>- 2：自定义
enum_status | int | 选项的激活状态。<br>**可选值有**：<br>- 1：激活<br>- 2：未激活
i18n_content | i18n_content\[\] | 选项内容的国际化配置。
locale | string | 语言版本。例如：<br>- zh_cn：中文<br>- en_us：英文<br>- ja_jp：日文
value | string | 语言版本对应的内容。

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "employee_type_enum": {
            "enum_id": "exGeIjow7zIqWMy+ONkFxA==",
            "enum_value": "2",
            "content": "专家",
            "enum_type": 2,
            "enum_status": 1,
            "i18n_content": [
                {
                    "locale": "zh_cn",
                    "value": "专家（中文）"
                }
            ]
        }
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 42301 | param content duplicate | content 取值重复。当前已有相同 content 取值的自定义人员类型，无需再次添加。你也可以更换其他 content 值后，重新尝试添加人员类型。
400 | 42302 | param i18n_content duplicate | i18n_content 取值重复。当前已有相同 i18n_content 取值的自定义人员类型，无需再次添加。你也可以更换其他 i18n_content 值后，重新尝试添加人员类型。
400 | 42303 | exceed content max num | 超过最大限制。你需要参考接口文档的参数描述，设置符合要求的参数值。例如，传入的 content 值长度不能超过 100 字符。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
