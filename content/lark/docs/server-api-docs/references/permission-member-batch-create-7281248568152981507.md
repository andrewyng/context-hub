# 批量增加协作者权限

Source URL: https://open.feishu.cn/document/docs/permission/permission-member/batch_create
Updated: 2025-07-03

# 批量增加协作者权限

为指定云文档批量添加多个协作者，协作者可以是用户、群组、部门、用户组等。

## 前提条件

- 调用该接口需要调用身份有该云文档添加协作者的权限。添加协作者的权限可通过云文档设置中的 **谁可以查看、添加、移除协作者** 等选项进行控制。
- 调用该接口时，需要调用身份与被授权对象 **互相可见**，例如：
    - **添加用户协作者**：需要调用身份与被授权对象为联系人或同组织内可搜索，且互相未屏蔽。
    - **添加群协作者**：需要调用身份在群内。要使用 `tenant_access_token` 身份添加群协作者，则需要将该应用作为机器人添加至群组中，使应用对群可见。详细步骤参考[如何为应用开通云文档相关资源的权限](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)。
    - **添加部门协作者**：需要调用身份对部门可见。由于应用对企业内的组织架构都不可见，所以暂不支持通过 `tenant_access_token`  添加部门协作者。

## 注意事项

不支持将应用直接添加到文件夹作为协作者（添加成功后实际仍然没有权限）。如果希望给应用授予文件夹的权限，请将应用作为群机器人添加到群组内，然后授予该群组可管理权限。详细步骤参考[如何为应用开通云文档相关资源的权限](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/drive/v1/permissions/:token/members/batch_create
HTTP Method | POST
接口频率限制 | [100 次/分钟](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 查看、新增、更新、删除云文档协作者(docs:permission.member)<br>添加云文档协作者(docs:permission.member:create)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>或<br>`user_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 路径参数

名称 | 类型 | 描述
---|---|---
token | string | 云文档的 token，需要与 type 参数指定的云文档类型相匹配。可参考 [如何获取云文档相关 token](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#08bb5df6)。<br>**示例值**："docxnBKgoMyY5OMbUG6FioTXuBe"

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
type | string | 是 | 云文档类型，需要与云文档的 token 相匹配。<br>**示例值**：docx<br>**可选值有**：<br>- doc：旧版文档。了解更多，参考[新旧版本文档说明](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/docs/upgraded-docs-access-guide/upgraded-docs-openapi-access-guide)。<br>- sheet：电子表格<br>- file：云空间文件<br>- wiki：知识库节点<br>- bitable：多维表格<br>- docx：新版文档<br>- folder：文件夹。使用 `tenant_access_token` 调用时，需确保文件夹所有者为应用或应用拥有文件夹的可管理权限，你需要将应用作为群机器人添加至群内，然后授予该群组可管理权限。详细步骤参考[如何为应用开通云文档相关资源的权限](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)<br>- mindnote：思维笔记<br>- minutes：妙记。目前妙记还不支持 full_access 权限角色<br>- slides：幻灯片
need_notification | boolean | 否 | 添加权限后是否通知对方。仅当使用 `user_access_token` 调用时有效。可选值：<br>- true：通知对方<br>- false：不通知<br>**示例值**：false<br>**默认值**：`false`

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
members | base_member\[\] | 是 | 本次要增加权限的协作者列表<br>**数据校验规则**：<br>- 最大长度：`10`
member_type | string | 是 | 协作者 ID 类型，与协作者 ID （member_id）的类型需要保持一致。<br>**示例值**："openid"<br>**可选值有**：<br>- email：飞书邮箱<br>- openid：开放平台 Open ID<br>- 获取应用 OpenID，参考[如何获取应用 open_id](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#6dbaa8df)<br>- 获取用户 OpenID，参考[如何获取不同的用户 ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)<br>- unionid：开放平台 Union ID。获取方式参考[如何获取不同的用户 ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)<br>- openchat：开放平台群组 ID。获取方式参考[群 ID 说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-id-description)<br>- opendepartmentid：开放平台部门 ID。仅当使用 `user_access_token` 调用时有效。获取方式参考[部门资源介绍](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/field-overview)<br>- userid：用户 ID。获取方式参考[如何获取不同的用户 ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)<br>- groupid：自定义用户组 ID。获取方式参考[用户组资源介绍](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/group/overview)<br>- wikispaceid：知识空间 ID。仅知识库文档支持该参数，当需要操作知识库文档里的「知识库成员」类型协作者时传该参数。获取方式参考[知识库概述](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-overview)
member_id | string | 是 | 协作者 ID，该 ID 的类型与 member_type 指定的值需要保持一致<br>**示例值**："ou_1234567890abcdef1234567890abcdef"
perm | string | 是 | 协作者对应的权限角色。<br>**注意：** 妙记还不支持可管理角色<br>**示例值**："view"<br>**可选值有**：<br>- view：可阅读角色<br>- edit：可编辑角色<br>- full_access：可管理角色
perm_type | string | 否 | 协作者的权限角色类型。当云文档类型为 wiki 即知识库节点时，该参数有效<br>**示例值**："container"<br>**可选值有**：<br>- container：当前页面及子页面<br>- single_page：仅当前页面，当且仅当在知识库文档中该参数有效<br>**默认值**：`container`
type | string | 否 | 协作者类型。<br>**注意**：当 `member_type` 参数为 `wikispaceid` 时，该参数必填。<br>**默认值**：""<br>**示例值**："user"<br>**可选值有**：<br>- user：用户<br>- chat：群组<br>- department：组织架构<br>- group：用户组<br>- wiki_space_member：知识库成员。在知识库启用了成员分组功能后不支持该参数<br>- wiki_space_viewer：知识库可阅读成员。仅在知识库启用了成员分组功能后才支持该参数<br>- wiki_space_editor：知识库可编辑成员。仅在知识库启用了成员分组功能后才支持该参数

### 请求体示例
```json
{
    "members": [
        {
            "member_type": "openid",
            "member_id": "ou_1234567890abcdef1234567890abcdef",
            "perm": "view",
            "perm_type": "container",
            "type": "user"
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
members | base_member\[\] | 添加成功的协作者列表<br>**注意**：当只有部分成功时，`members` 会返回成功的部分，在不同场景下，部分成功返回的错误码可能不同，请不要依赖错误码去判断是否为部分成功
member_type | string | 增加成功的协作者 ID 类型<br>**可选值有**：<br>- email：飞书邮箱<br>- openid：开放平台 ID<br>- unionid：开放平台UnionID<br>- openchat：开放平台群组 ID<br>- opendepartmentid：开放平台部门 ID<br>- userid：用户自定义 ID<br>- groupid：自定义用户组 ID<br>- wikispaceid：知识空间的唯一标识
member_id | string | 增加成功的协作者 ID，与协作者 ID 类型相对应
perm | string | 增加成功的的权限角色<br>**可选值有**：<br>- view：可阅读角色<br>- edit：可编辑角色<br>- full_access：可管理角色
perm_type | string | 协作者的权限角色类型<br>**可选值有**：<br>- container：当前页面及子页面<br>- single_page：仅当前页面，当且仅当在知识库文档中该参数有效
type | string | 协作者类型<br>**可选值有**：<br>- user：用户<br>- chat：群组<br>- department：组织架构<br>- group：用户组<br>- wiki_space_member：知识库成员<br>- wiki_space_viewer：知识库可阅读成员<br>- wiki_space_editor：知识库可编辑成员

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "members": [
            {
                "member_type": "openid",
                "member_id": "ou_c186b6833e2d5faf2bc587e71ddabcef",
                "perm": "view",
                "perm_type": "container",
                "type": "user"
            }
        ]
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 1063001 | Invalid parameter | 参数异常，可能是如下原因：<br>- 参数类型不匹配，如：<br>- 云文档的 token 和 type 不匹配<br>- 云文档不存在<br>- 添加协作者的 member_id 和 member_type 不匹配<br>- 添加的协作者不存在<br>- 不支持的参数调用，如：<br>- 使用 `tenant_access_token` 添加部门协作者<br>- 给妙记添加可管理角色
403 | 1063002 | Permission denied | 调用身份对应的用户或应用不是云文档的[协作者](https://www.feishu.cn/hc/zh-CN/articles/064037224266-%E4%BA%91%E6%96%87%E6%A1%A3%E5%92%8C%E6%96%87%E4%BB%B6%E5%A4%B9%E5%8D%8F%E4%BD%9C%E8%80%85%E4%BB%8B%E7%BB%8D)或对云文档的权限（如编辑、管理权限）不足。请参考以下方式解决：<br>- 对于转移所有者接口，你需确保调用身份为云文档的所有者<br>- 对于协作者、权限设置相关接口，你需先参考[谁可以查看、添加、移除协作者](https://www.feishu.cn/hc/zh-CN/articles/360049067527-%E8%AE%BE%E7%BD%AE%E4%BA%91%E6%96%87%E6%A1%A3%E5%88%86%E4%BA%AB-%E5%A4%8D%E5%88%B6-%E4%B8%8B%E8%BD%BD-%E8%AF%84%E8%AE%BA%E7%AD%89%E6%9D%83%E9%99%90#tabs0|lineguid-Bp0bI)了解当前云文档的权限设置，再为调用身份开通所需权限：<br>- 如果你使用的是 `tenant_access_token`，你需通过云文档网页页面右上方 **「...」** -> **「...更多」** ->**「添加文档应用」** 入口为应用添加权限。<br><br>**注意**：<br>- 在 **添加文档应用** 前，你需确保目标应用至少开通了一个云文档或多维表格的 [API 权限](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/scope-list)。否则你将无法在文档应用窗口搜索到目标应用。<br>- 如果多维表格开启了高级权限，你需为应用添加多维表格的 **可管理** 权限，否则仍无法操作多维表格。<br><br>- 如果你使用的是 `user_access_token`，你需通过云文档网页页面右上方 **分享** 入口为当前用户添加权限。<br><br>了解具体操作步骤或其它添加权限方式，参考[云文档常见问题 3](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a)。
400 | 1063003 | Invalid operation | 非法操作。该错误码表示基本参数校验没有问题，但操作不被允许，可能是如下原因：<br>- 云文档的协作者数量到达上限，请减少协作者数量<br>- 因企业设置的管控策略而无法修改权限<br>- 受可见性限制无法修改权限。例如：<br>- **添加用户协作者**：需要调用身份与被授权对象为联系人或同组织内可搜索，且互相未屏蔽。<br>- **添加群协作者**：需要调用身份在群内。要使用 `tenant_access_token` 身份添加群协作者，则需要将该应用作为机器人添加至群组中，使应用对群可见。详细步骤参考[如何为应用开通云文档相关资源的权限](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)。<br>- **添加部门协作者**：需要调用身份对部门可见。由于应用对企业内的组织架构都不可见，所以暂不支持通过 `tenant_access_token`  添加部门协作者。<br>- 给文档所有者添加权限（不允许对文档所有者操作权限）<br>- 协作者本身已有的权限大于请求参数内设置的权限
429 | 1063006 | Too many request | 服务内部限流，与接口本身设置的限流为不同维度的限流，请稍后重试。
500 | 1066001 | Internal error | 服务内部错误，包括服务端内部超时、错误码没处理等，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)排查。
