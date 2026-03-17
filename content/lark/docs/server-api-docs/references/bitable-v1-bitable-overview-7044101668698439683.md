# 多维表格概述

Source URL: https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview
Updated: 2025-05-07

# 多维表格概述
多维表格（Base）是全新的业务管理工具，帮助用户重构工作应用和团队协同模式，高效在线协同数据，随心构建个性化应用，轻松掌控全盘业务数据，和团队一起创造效率的无限可能。多维表格可以是一个表格，也可以是无数个应用。它拥有强大的底层开放能力，你可以通过多维表格 API 轻松打通内部其他业务系统，让业务数据通畅流转，实时同步。
## 典型案例

开放平台提供了集成多维表格能力的客户实践案例：

- [芝麻开门，在飞书五天打造门禁管理系统](https://open.feishu.cn/solutions/detail/wiseasy) 
- [飞书集成平台，让企业服务行业项目管理与销售体验升级](https://open.feishu.cn/solutions/detail/cloudwise)
## 接入流程

接入多维表格 OpenAPI 的流程如下图所示。了解更多，参考[云文档概述](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/docs-overview) 的 **接入流程** 一节。

## 开发教程
体验以下多维表格相关教程，了解如何运用多维表格 API 助力企业高效协作。

- [快速调用一个服务端 API（以创建多维表格接口为例）](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/call-a-server-api-base-example/introduction)
- [快速接入多维表格](https://open.feishu.cn/document/home/quick-access-to-base/preparation)
- [多维表格管理敏捷项目](https://open.feishu.cn/document/home/agile-project-cycle-management-based-on-bitable/introduction)

## 鉴权说明
使用 tenant_access_token 访问多维表格资源之前，请确保你的应用已经是多维表格的所有者或者协作者，否则会调用失败。
你可通过添加文档应用的方式将应用添加为协作者，详情参考[开通文档、电子表格等其它云文档资源权限](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app#223459af)；或通过应用身份创建一篇多维表格，再使用 tenant_access_token 来调用接口。

## 使用限制

使用多维表格接口，整体有以下限制或说明：
- 对于接口的批量操作，单次最高为 1,000 条记录，且响应状态是全部成功或者失败，不存在部分成功或失败的结果。
- 为保证稳定性，建议对单一多维表格同时只请求**一次** API 写操作。
单一多维表格中，各个资源的数量限制如下所示：

| **资源**    | **最大支持数量** |
| --------- | ---------- |
| 记录        | 不同租户的最大支持数量不同，开放平台没有额外限制。你可以在多维表格数据表 UI 中点击查看。    |
| 字段        | 300，对于公式类型的字段，最多支持 100 个 |  |
| 视图        | 200        |
| 数据表+仪表盘       | 100        |
| 高级权限自定义角色 | 30         |
| 高级权限协作者   | 200        |

## 资源介绍

多维表格开放了多维表格 App、数据表、视图、记录、字段、仪表盘、高级权限等多种资源的接口。本小节介绍这几类资源的含义。了解更多多维表格的概念和使用说明，可参考飞书帮助中心文档[快速上手多维表格](https://www.feishu.cn/hc/zh-CN/articles/697278684206-%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8B%E5%A4%9A%E7%BB%B4%E8%A1%A8%E6%A0%BC)。

### 多维表格 app

一个多维表格可以理解成是一个应用（app，但不是在开发者后台创建的应用），标记该应用的唯一标识为 `app_token`。作为一个应用，多维表格有多种形态：可以作为一个独立应用，也可以作为一个模块（block）与文档、电子表格结合。

#### 多维表格形态

| **多维表格形态** | **资源定义**             | **含义**                                                                                                                                                                                                                                                                                                                       |
| ---------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文件夹中的多维表格  | Base app             | 存储在飞书云空间（云盘）文件夹中的多维表格。URL 以 **feishu.cn/base** 开头                  |
| 知识库下的多维表格  | Base app 和 wiki node | 放置在知识库中的多维表格。URL 以 **feishu.cn/wiki** 开头                           |
| 文档嵌入多维表格   | Base docx block      | 即在"文档"中插入的多维表格，URL 以 **feishu.cn/docx** 开头    |
| 电子表格嵌入多维表格 | Base sheet block     | 在电子表格中嵌入的多维表格，URL 以 **feishu.cn/sheets** 开头 |

#### 多维表格 app_token 获取方式

不同形态的多维表格，其 `app_token` 的获取方式不同，具体如下所示。

##### **文件夹中的多维表格**

该类多维表格的 app_token 为 URL 下图高亮部分：

##### **知识库下的多维表格**

需调用知识库相关[获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)接口获取该类多维表格的 app_token。如下返回示例，当 `obj_type` 的值为 `bitable` 时，`obj_token` 字段的值 `AW3Qbtr2cakCnesXzXVbbsrIcVT` 是多维表格的 `app_token`：
```json
{
    "node":{
        "space_id":"6946843325487912356",
        "node_token":"wikcnKQ1k3p******8Vabcef",
        "obj_token":"AW3Qbtr2cakCnesXzXVbbsrIcVT",  // 多维表格的 app_token
        "obj_type":"bitable",
        "parent_node_token":"wikcnKQ1k3p******8Vabcef",
        "node_type":"origin",
        "origin_node_token":"wikcnKQ1k3p******8Vabcef",
        "origin_space_id":"6946843325487912356",
        "has_child":false,
        "title":"标题",
        "obj_create_time":"1642402428",
        "obj_edit_time":"1642402428",
        "node_create_time":"1642402428",
        "creator":"ou_xxxxx",
        "owner":"ou_xxxxx"
    }
}
```

##### **文档嵌入多维表格**

文档中嵌入的多维表格，需要调用文档相关接口获取多维表格的 `app_token`。
调用[获取文档所有块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list)，在返回结果中检索，其中 `bitable.token` 字段的值 `AW3Qbtr2cakCnesXzXVbbsrIcVT_tblkIYhz52o6G5nx`是用 `_` 隔开的 `app_token` 和 `table_id`；
```json
{
  "bitable": {
    "token": "AW3Qbtr2cakCnesXzXVbbsrIcVT_tblkIYhz52o6G5nx"
  },
  "block_id": "Mgeadqo4CoeoOGxI7Lgb4GNicEd",
  "block_type": 18,
  "parent_id": "YUqpdO2eLo7xJdxy5RQbuQBdctf"
}
```

##### **电子表格嵌入多维表格**

电子表格中嵌入的多维表格，需要调用电子表格相关接口获取多维表格的 `app_token`。
若电子表格中嵌有多维表格，需调用[获取表格元数据](https://open.feishu.cn/document/ukTMukTMukTM/uETMzUjLxEzM14SMxMTN)，在返回结果中将返回 `blockInfo`。其中，当 `blockType` 的值为 `BITABLE_BLOCK` 时，blockToken 字段的值`AW3Qbtr2cakCnesXzXVbbsrIcVT_tblkIYhz52o6G5nx` 是用 `_` 隔开的 `app_token` 和 `table_id`。
```json
{
  "blockInfo": {
    "blockToken": "AW3Qbtr2cakCnesXzXVbbsrIcVT_tblkIYhz52o6G5nx",
    "blockType": "BITABLE_BLOCK"
  },
  "columnCount": 0,
  "frozenColCount": 0,
  "frozenRowCount": 0,
  "index": 0,
  "rowCount": 0,
  "sheetId": "***",
  "title": "*** "
}
```

### 数据表 table

多维表格的数据容器，一个多维表格中至少有一个数据表（table），也可能有多个数据表。每个数据表都有唯一标识 `table_id`。`table_id` 在一个多维表格 App 中唯一，在全局不一定唯一。
你可通过多维表格 URL 获取 `table_id`，下图高亮部分即为当前数据表的唯一标识。你也可通过[列出数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list)接口获取 `table_id`。

### 视图 view

指数据的汇总和展现形式。视图有多种类型，包括表格视图、看板视图、画册视图、甘特视图和表单视图等，可参考飞书帮助中心文档[视图类型](https://www.feishu.cn/hc/zh-CN/articles/360049067931-%E4%BD%BF%E7%94%A8%E5%A4%9A%E7%BB%B4%E8%A1%A8%E6%A0%BC%E8%A7%86%E5%9B%BE#tabs0|lineguid-6kjqG)。一个数据表至少有一个视图，可能有多个视图。每个视图都有唯一标识 `view_id`，`view_id` 在一个多维表格中唯一，在全局不一定唯一。
你可通过多维表格 URL 获取 `view_id`，下图高亮部分即为当前视图的唯一标识。你也可通过[列出视图](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/list)接口获取 `view_id`。暂时无法获取到嵌入到文档中的多维表格的 `view_id`。

#### **表单视图 form**

表单视图是多维表格的一种视图类型，形式类似于问卷，可以用来收集信息和数据。每个表单都有唯一标识 `form_id`，即当前视图的 `view_id`。`form_id` 的获取方式和 `view_id` 的获取方式相同。

### 记录 record

数据表中的每一行数据都是一条记录（record）。每条记录都有唯一标识 `record_id`，`record_id` 在一个多维表格中唯一，在全局不一定唯一。`record_id` 需要通过[查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)接口获取。

### 字段 field

即多维表格的“列”，多维表格提供丰富的字段类型。每个字段都有唯一标识 `field_id`，`field_id` 在一个多维表格内唯一，在全局不一定唯一。`field_id` 需要通过[列出字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list)接口获取。了解更多字段说明，参考[字段编辑指南](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/guide)。

### 仪表盘 block

仪表盘与数据看板类似，可以从不同的维度统计对多维表格中的数据进行统计。了解更多，参考飞书帮助中心文档[使用多维表格仪表盘](https://www.feishu.cn/hc/zh-CN/articles/161059314076-%E4%BD%BF%E7%94%A8%E5%A4%9A%E7%BB%B4%E8%A1%A8%E6%A0%BC%E4%BB%AA%E8%A1%A8%E7%9B%98)。

仪表盘的唯一标识为 `block_id`，以 `blk` 开头，你可通过多维表格 URL 获取 `block_id`，下图高亮部分即为当前仪表盘的唯一标识，也可通过[列出仪表盘](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-dashboard/list)接口获取。

### 高级权限

高级权限允许用户针对单一数据表设置哪些用户可以查看、编辑指定的行，或是设置针对某用户可以编辑的列。高级权限接口分为 **自定义角色** 和 **协作者** 两部分，多维表格的 **所有者** 或者 **有可管理权限** 的用户可通过接口设置高级权限，管理高级权限的协作者。了解更多，参考[高级权限概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role/advanced-permission-guide)。

#### **自定义角色 role**

在高级权限中添加角色并设置权限，该角色即为自定义角色。每个自定义角色都有唯一标识 `role_id`。`role_id` 需要通过[列出自定义角色](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role/list)接口获取。

#### **协作者 member**

高级权限设置中，一个自定义角色（role）中的成员，即为协作者（member）。每个协作者都有唯一标识 `member_id`。`member_id` 需要通过[列出协作者](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role-member/list)接口获取。

### 自动化流程 workflows

自动化流程是用户给多维表格设定的自动运行规则。设定“触发条件”和“执行操作”以后，多维表格会根据数据变更，自动执行下一步操作。你可通过[列出自动化流程](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-workflow/list)获取自动化流程的 ID，即 `workflow_id`。

## 方法列表
以下为多维表格的方法列表。其中，“商店”代表[商店应用](https://open.feishu.cn/document/home/app-types-introduction/overview)；“自建”代表[企业自建应用](https://open.feishu.cn/document/home/app-types-introduction/overview)，了解更多应用相关信息，参考[应用类型简介](https://open.feishu.cn/document/home/app-types-introduction/overview)。了解调用服务端 API 的流程，参考[流程概述](https://open.feishu.cn/document/uMzNwEjLzcDMx4yM3ATM/ugzNwEjL4cDMx4CO3ATM)。

### 多维表格 app

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求（满足任一） | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)（选择其一）** | 商店 | 自建
---|---|---|---|---
[创建多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)<br>`POST` /open-apis/bitable/v1/apps | 创建多维表格(base:app:create)<br>查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[复制多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/copy)<br>`POST` /open-apis/bitable/v1/apps/:app_token/copy | 复制多维表格(base:app:copy)<br>查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[获取多维表格元数据](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/get)<br>`GET` /open-apis/bitable/v1/apps/:app_token | 查看、评论和导出多维表格(bitable:app:readonly)<br>查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[更新多维表格元数据](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/update)<br>`PUT` /open-apis/bitable/v1/apps/:app_token | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**

### 数据表 table

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求（满足任一） | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)（选择其一）** | 商店 | 自建
---|---|---|---|---
[列出数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list)<br>`GET` /open-apis/bitable/v1/apps/:app_token/tables | 查看、评论和导出多维表格(bitable:app:readonly)<br>查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[新增数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/create)<br>`POST` /open-apis/bitable/v1/apps/:app_token/tables | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[新增多个数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/batch_create)<br>`POST` /open-apis/bitable/v1/apps/:app_token/tables/batch_create | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[删除数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/delete)<br>`DELETE` /open-apis/bitable/v1/apps/:app_token/tables/:table_id | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[删除多个数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/batch_delete)<br>`POST` /open-apis/bitable/v1/apps/:app_token/tables/batch_delete | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**

### 视图 view

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求（满足任一） | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)（选择其一）** | 商店 | 自建
---|---|---|---|---
[列出视图](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/list)<br>`GET` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/views | 查看、评论和导出多维表格(bitable:app:readonly)<br>查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[新增视图](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/create)<br>`POST` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/views | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[更新视图](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/patch)<br>`PATCH` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/views/:view_id | 查看、评论和导出多维表格(bitable:app:readonly)<br>查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[检索视图](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/get)<br>`GET` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/views/:view_id | 检索视图(base:view:read)<br>查看、评论、编辑和管理多维表格(bitable:app)<br>查看、评论和导出多维表格(bitable:app:readonly) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[删除视图](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/delete)<br>`DELETE` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/views/:view_id | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**

### 记录 record

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求（满足任一） | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)（选择其一）** | 商店 | 自建
---|---|---|---|---
[列出记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/list)<br>`GET` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records | 查看、评论和导出多维表格(bitable:app:readonly)<br>查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[检索记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/get)<br>`GET` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[新增记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/create)<br>`POST` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[新增多条记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/batch_create)<br>`POST` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_create | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[更新记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/update)<br>`PUT` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[更新多条记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/batch_update)<br>`POST` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_update | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[删除记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/delete)<br>`DELETE` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[删除多条记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/batch_delete)<br>`POST` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_delete | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**

### 字段 field

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求（满足任一） | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)（选择其一）** | 商店 | 自建
---|---|---|---|---
[列出字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list)<br>`GET` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/fields | 查看、评论和导出多维表格(bitable:app:readonly)<br>查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[新增字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/create)<br>`POST` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/fields | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[更新字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/update)<br>`PUT` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/fields/:field_id | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[删除字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/delete)<br>`DELETE` /open-apis/bitable/v1/apps/:app_token/tables/:table_id/fields/:field_id | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**

### 仪表盘 dashboard

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求（满足任一） | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)（选择其一）** | 商店 | 自建
---|---|---|---|---
[复制仪表盘](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-dashboard/copy)<br>`POST` /open-apis/bitable/v1/apps/:app_token/dashboards/:block_id/copy | 复制仪表盘(base:dashboard:copy)<br>查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[列出仪表盘](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-dashboard/list)<br>`GET` /open-apis/bitable/v1/apps/:app_token/dashboards | 获取仪表盘信息(base:dashboard:read)<br>查看、评论、编辑和管理多维表格(bitable:app)<br>查看、评论和导出多维表格(bitable:app:readonly) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**

### 自定义角色 role

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求（满足任一） | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)（选择其一）** | 商店 | 自建
---|---|---|---|---
[列出自定义权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role/list)<br>`GET` /open-apis/bitable/v1/apps/:app_token/roles | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[新增自定义权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role/create)<br>`POST` /open-apis/bitable/v1/apps/:app_token/roles/:role_id | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[更新自定义权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role/update)<br>`PUT` /open-apis/bitable/v1/apps/:app_token/roles/:role_id | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[删除自定义权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role/delete)<br>`DELETE` /open-apis/bitable/v1/apps/:app_token/roles/:role_id | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**

### 协作者 member

高级权限下的协作者。

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求（满足任一） | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)（选择其一）** | 商店 | 自建
---|---|---|---|---
[列出协作者](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role-member/list)<br>`GET` /open-apis/bitable/v1/apps/:app_token/roles/:role_id/members | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[新增协作者](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role-member/create)<br>`POST` /open-apis/bitable/v1/apps/:app_token/roles/:role_id/members | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[删除协作者](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role-member/delete)<br>`DELETE` /open-apis/bitable/v1/apps/:app_token/roles/:role_id/members/:member_id | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[批量新增协作者](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role-member/batch_create)<br>`POST` /open-apis/bitable/v1/apps/:app_token/roles/:role_id/members/batch_create | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[批量删除协作者](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role-member/batch_delete)<br>`DELETE` /open-apis/bitable/v1/apps/:app_token/roles/:role_id/members/batch_delete | 查看、评论、编辑和管理多维表格(bitable:app) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
