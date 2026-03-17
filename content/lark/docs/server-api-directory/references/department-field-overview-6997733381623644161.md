# 部门资源介绍

Source URL: https://open.feishu.cn/document/server-docs/contact-v3/department/field-overview
Updated: 2024-07-05

# 部门资源介绍

部门是指企业组织架构树上的某一个节点。在部门内部，可添加用户作为部门成员，也可添加新的部门作为子部门。

## 基本概念

在调用部门资源 API 前，请先了解以下基本概念。

### 部门层级

一个租户内，通讯录默认包含一个根部门（根部门的部门 ID 为 0），其他所有新创建的部门都需要存在于根部门下。同时每个部门实体内部还可以添加子部门，以此构成了多层级的部门关系。例如，在根部门下创建一个 A 部门，在 A 部门下创建一个 B 部门，那么就构成了三层的部门层级关系。在调用部门资源 API 时，你可能需要使用父部门的数据来定位当前部门的层级位置。例如，创建部门时，你需要指定在哪个部门（即当前部门的父部门）下进行创建。

### 部门 ID

部门 ID 分为两种类型，department_id 和 open_department_id，具体说明如下表。

部门 ID 类型 | 说明
---|---
department_id | 该类型的 ID 在创建部门时支持自定义配置，若不自定义配置，系统会默认生成一个 ID 值。因此，如果你的企业内部系统已有维护中的部门 ID，你可以将这些部门 ID 写入到飞书通讯录的部门 ID 属性中，由此实现飞书部门 ID 和企业内部系统部门 ID 的一致性，节省跨系统调用的映射成本。<br>- 为了和 open_department_id 区分，当你自定义设置 department_id 时，不能以 `od-` 开头。<br>- 当你自定义配置 department_id 时，可以复用已删除部门的 department_id。因此，department_id 在未删除的部门范围内具有唯一性。<br>**department_id 的获取方式：**<br>- 如果你在创建部门时，均为各个部门设置了自定义的 department_id，则建议你在本地维护一个部门 ID 列表，以便自己查阅使用。<br>- 如果你是企业管理员，则可以在[管理后台](https://feishu.cn/admin/index) > **组织架构** > **成员与部门** > **部门** 页签内，通过查看指定部门的详情获取部门 ID（department_id）。<br><br>此外，你也可以在 **部门** 页签右上角点击 **批量导入/导出**，然后在页面内选择导出包含部门信息的表格。导出后，可通过表格查看租户内部门的 ID 数据（department_id）。<br><br>- 通过部门资源 API 获取。<br>- 调用[获取子部门列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/children)接口，传入根部门的 ID（department_id 取值为 0），来获取根部门下的各个部门的 department_id。<br>- 调用[搜索部门](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/search)接口，设置部门名称关键词，获取指定部门的 department_id。
open_department_id | 该类型的 ID 由系统自动生成，ID 前缀固定为 `od-`，无法自定义编辑。open_department_id 在租户内全局唯一。<br>**open_department_id 的获取方式：**<br>- 调用[获取子部门列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/children)接口，传入根部门的 ID（department_id 取值为 0），来获取根部门下的各个部门的 open_department_id。<br>- 调用[搜索部门](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/search)接口，设置部门名称关键词，获取指定部门的 open_department_id。

##  字段说明

名称 | 类型 | 描述
---|---|---
department_id | string | 支持用户自定义或者由系统默认生成的部门 ID。在用户自定义配置时可复用已删除的 department_id，因此在未删除的部门范围内 department_id 具有唯一性。<br>**示例值**："h121921"<br>**数据校验规则**：<br>- 最大长度：`64` 字符。<br>- 正则校验：`^[a-zA-Z0-9][a-zA-Z0-9_\-@.]{0,63}$`；且不以`od-`开头。
open_department_id | string | 由系统自动生成的部门 ID，ID 前缀固定为 `od-`，在租户内全局唯一。<br>**示例值**："od-4e6ac4d14bcd5071a37a39de902c7141"
name | string | 部门名称。<br>**示例值**："DemoName"<br>**数据校验规则**：<br>- 最小长度：`1` 字符<br>- 不可包含斜杠（`/`）<br>**字段权限要求（满足任一）**：<br>获取部门基础信息(contact:department.base:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)
i18n_name | department_i18n_name | 国际化的部门名称<br>**字段权限要求（满足任一）**：<br>获取部门基础信息(contact:department.base:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)
&emsp;∟&nbsp;zh_cn | string | 部门的中文名。<br>**示例值**："Demo名称"
&emsp;∟&nbsp;ja_jp | string | 部门的日文名。<br>**示例值**："デモ名"
&emsp;∟&nbsp;en_us | string | 部门的英文名。<br>**示例值**："Demo Name"
parent_department_id | string | 父部门的部门 ID。如果创建部门时，父部门是通讯录内的根部门，则该参数值为 `0`。<br>**示例值**："od-4e6ac4d14bcd5071a37a39de902c7141"
leader_user_id | string | 部门主管用户 ID。<br>**示例值**："ou_7dab8a3d3cdcc9da365777c7ad535d62"
order | string | 部门的排序，即部门在其同级部门内的展示顺序。取值格式为 String 类型的非负整数，数值越小，排序越靠前。<br>**示例值**："100"<br>**字段权限要求（满足任一）**：<br>获取通讯录部门组织架构信息(contact:department.organize:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)
unit_ids | string\[\] | 部门绑定的单位自定义 ID 列表，当前只支持绑定一个单位。了解单位信息参见[资源介绍](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/unit/overview)。<br>**示例值**：custom_unit_id<br>**字段权限要求（满足任一）**：<br>获取通讯录部门组织架构信息(contact:department.organize:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)
create_group_chat | boolean | 是否创建部门群。<br>**可选值有：**<br>- true：创建<br>- false（默认值）：不创建<br>**示例值**：false

##  数据示例
```json
{
    "department_id": "h121921",
    "open_department_id": "od-4e6ac4d14bcd5071a37a39de902c7141",
    "name": "DemoName",
    "i18n_name": {
        "zh_cn": "Demo名称",
        "ja_jp": "デモ名",
        "en_us": "Demo Name"
    },
    "parent_department_id": "od-4e6ac4d14bcd5071a37a39de902c7141",    
    "leader_user_id": "ou_7dab8a3d3cdcc9da365777c7ad535d62",
    "order": "100",
    "unit_ids": [
        "custom_unit_id"
    ],
    "create_group_chat": false
}
```
