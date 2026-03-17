# 高级权限概述

Source URL: https://open.feishu.cn/document/server-docs/docs/bitable-v1/advanced-permission/advanced-permission-guide
Updated: 2025-01-08

# 高级权限概述
多维表格的 **所有者** 或 **有可管理权限** 的协作者可通过开放平台接口对多维表格设置高级权限，包括设置自定义角色、管理协作者，从而为每个多维表格数据表设置指定人员阅读或编辑指定行、列的权限。了解如何使用高级权限，请参考飞书帮助中心文档[使用多维表格高级权限](https://www.feishu.cn/hc/zh-CN/articles/588604550568)。

## 注意事项
- 调用高级权限的自定义角色和协作者相关接口前，请先确保多维表格已开启高级权限。你可通过[更新多维表格元数据](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/update)接口开启高级权限。
- 开启高级权限有延迟，开启高级权限后立即调用高级权限的接口时遇到 `OperationTypeError` 的报错请稍后重试。
- 高级权限的协作者与云文档权限协作者为不同权限身份，添加高级权限协作者之后，为保证云文档权限设置正常，建议再通过 [增加协作者权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/create)接口新增云文档权限。
- 开启高级权限后，需先设置自定义角色，再新增协作者。

## 使用限制

- 在线文档和电子表格中嵌入的多维表格、知识库中的多维表格不支持开启高级权限。
- 多维表格高级权限接口暂不支持设置仪表盘权限。
## 资源介绍
高级权限中自定义角色和协作者资源的说明如下所示。
### 自定义角色 role

在高级权限中添加角色并设置权限，该角色即为自定义角色。每个自定义角色都有唯一标识 `role_id`。`role_id` 需要通过[列出自定义角色](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role/list)接口获取。

### 协作者 member

高级权限设置中，一个自定义角色（role）中的成员，即为协作者（member）。每个协作者都有唯一标识 `member_id`。`member_id` 需要通过[列出协作者](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role-member/list)接口获取。
## 方法列表

以下为高级权限的方法列表。其中，“商店”代表商店应用；“自建”代表企业自建应用，了解更多应用相关信息，参考[应用类型简介](https://open.feishu.cn/document/home/app-types-introduction/overview)。了解调用服务端 API 的流程，参考[流程概述](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)。

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
