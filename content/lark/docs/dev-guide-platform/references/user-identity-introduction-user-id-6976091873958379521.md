# 如何选择使用哪种 ID

Source URL: https://open.feishu.cn/document/platform-overveiw/basic-concepts/user-identity-introduction/user-id
Updated: 2023-09-14

# 如何选择使用哪种 ID

在开发者开发一个应用时合理的 ID 选择逻辑应该如下：

- 创建的应用**不存在跨应用的数据关联互通**场景，可以使用 Open ID 。

- 需**跨应用做数据关联**，并且这些应用的开发者归属同一个组织，可以使用 Union ID。
由于在产品演进过程中可能会需要做跨应用互通，在应用开发时推荐开发者优先使用 Union ID。

- 明确需要使用用户的租户身份标识，例如在**组织人员管理** 场景中（创建成员/组/角色），可以使用 User ID，其与[通讯录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/passport-v1/session/usum)业务中的 Member ID 两者含义一样。
仅支持**自建应用**申请 User ID，需先在[开发者后台](https://open.feishu.cn/app)申请「**获取用户 User ID**」权限。
