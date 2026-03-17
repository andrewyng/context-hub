# 应用鉴权

Source URL: https://open.feishu.cn/document/platform-overveiw/basic-concepts/overview
Updated: 2023-10-30

# 应用鉴权 

权限体系是飞书保护企业数据资产的核心机制，也是开发者在接入飞书生态时要关注的关键问题，本文帮助你快速了解飞书的权限体系。

应用权限体系分为以下三个维度，这些维度的结合，使得飞书的权限管理更加灵活，安全性更高。

* **访问凭证**（access_token）：用于识别应用在访问飞书时使用的虚拟身份，代表应用从平台侧获取的授权。用于验证调用方身份、确保调用方具有执行操作所需要的权限。详情参考 [应用访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)。

* **API 权限**（Scope）：定义应用能够调用哪些飞书开放能力接口（OpenAPI）。API **接口权限是以应用为维度授予的**，每个应用的接口权限都是独立存在的，若多个应用需要调用同一个接口，那么每个应用都要添加对应的接口权限。详情参考 [应用 API 权限](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)。

* **可用范围**：定义哪些用户可以在飞书中看到和使用该应用，详情参考 [应用可用范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability)。

在上述三个维度中，访问凭证是最基本的权限，用于验证应用的身份并确保调用方具有执行操作所需的权限；API 权限是控制应用可以调用哪些飞书开放能力接口的关键因素；可用范围则定义了哪些用户可以在飞书中查看和使用该应用。

此外，飞书还支持[数据权限](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions)，即定义应用可以访问资源数据的范围及字段，即行权限及列权限。行权限定义能访问什么范围用户数据，列权限则表示可以访问哪些用户数据字段。数据权限可以通过在开发者后台申请，由租户管理员审批来进行设置。例如，用户 A 可以读取部门 B 用户的手机号，部门 B 是行权限，手机号是列权限范畴。数据权限的设置，可以进一步提升数据资产的安全性和隐私保护。
