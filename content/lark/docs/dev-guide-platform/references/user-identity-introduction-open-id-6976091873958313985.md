# 如何获取不同的用户 ID

Source URL: https://open.feishu.cn/document/platform-overveiw/basic-concepts/user-identity-introduction/open-id
Updated: 2025-01-21

# 如何获取不同的用户 ID

本文介绍获取用户 ID 三种方式。

## 方法一：调试台一键获取三种 ID

API 调试台提供一键获取用户 ID 的能力，你可以通过可视化操作快速获取企业内指定用户的 ID。
私有化环境不支持 API 调试台。

1. 登录 [API 调试台](https://open.feishu.cn/api-explorer)，找到[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)接口。

2. 在 **查询参数** 页签，将 **receive_id_type** 按需设置为 **user_id**、**open_id** 或 **union_id**，然后点击 **快速复制 user_id**、**快速复制 open_id** 或 **快速复制 union_id**。
      若需获取 user_id，需在 **权限配置** 页签另外开通「**获取用户 User ID**」权限。

	

 2. 在弹窗中，搜索或选择指定用户，并点击 **复制成员 ID**，获取指定 ID。

	

## 方法二：调用 OpenAPI 获取三种 ID

通过调用 [通过手机号或邮箱获取用户 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/batch_get_id) 接口，你可基于 **手机号**/**邮箱** 批量获取三种类型的用户 ID。

### 前提条件

- 已创建应用
- 已开通「**通过手机号或邮箱获取用户 ID**」权限
- 若需获取 User ID，需另外开通「**获取用户 User ID**」权限。
如何开通权限，参考 [如何为应用申请所需权限](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-fix-the-99991672-error#0acf431b)。

### 操作步骤

1. 打开 [API 调试台](https://open.feishu.cn/api-explorer/cli_a278b89588fb100d?apiName=batch_get_id&from=op_doc_tab&project=contact&resource=user&version=v3)，在左侧 API 目录中找到「**通讯录**」下的「**通过手机号或邮箱获取用户 ID**」，点击该 API 切换当前调试 API 为「通过手机号或邮箱获取用户 ID」。

	可以在 API 列表顶部的搜索框输入「通过手机号或邮箱获取用户 ID」来快速定位。

2. 点击 API 调试台左侧 **查看鉴权凭证** 中 tenant_access_token 中的 **点击获取**。

	如果之前获取过的 token 已经失效，可点击刷新图标获取新的鉴权凭证。

3. 点击右侧参数列表，将 **查询参数** 中的 **user_id_type** 参数设置为需要获取的 ID 类型。

	支持 user_id、open_id 和 union_id 三种类型。

	

4. 切换至 **请求体** Tab，将请求体中的示例 ID 删除，并修改为需要查询的手机号或 Email。

	

5. 点击右侧 **开始调试**，调用成功后，在下方**响应体**中即可获取到查询的 User ID。
响应体中返回的用户 ID 类型由查询参数中设置的 **user_id_type** 参数决定。

	

## 方法三：管理后台查看 User ID
适用于具备**企业管理员**权限的用户。

企业管理员登录 [管理后台](https://admin.feishu.cn/) ，在 **组织架构** > **成员与部门** 中查看用户详情，字段 **用户 ID** 的值即为 User ID。
