# 角色资源介绍

Source URL: https://open.feishu.cn/document/server-docs/contact-v3/functional_role/resource-introduction
Updated: 2024-07-05

# 角色资源介绍

角色指的是团队成员的专业分工类别，如人事、行政、财务等，一个角色可由一名或多名成员组成。目前，角色主要用于应用审批场景。在审批管理后台，管理员可以选择某一角色作为审批人。例如，选择财务角色作为报销流程的审批人。这样做可以避免因成员离职变动导致的审批流失效的情况，角色内的其他成员可以继续完成审批，提高审批效率。

## 基本概念

在调用角色 API 之前，请先了解以下概念。

### 角色 ID

角色 ID（role_id）是角色在当前租户下的唯一标识，在创建角色时自动生成。角色 ID 获取方式：

- 方式一：调用[创建角色](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/functional_role/create) API 时，可从返回结果中获取角色 ID。
- 方式二：企业管理员登录 [管理后台](https://feishu.cn/admin) > **组织架构** > **角色管理** 页面，在角色名称右侧获取角色 ID。

	

### 角色名称

在创建角色时自定义的名称，该名称在同一租户下唯一，不能重复创建。
