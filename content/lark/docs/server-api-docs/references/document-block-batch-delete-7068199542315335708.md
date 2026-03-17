# 删除块

Source URL: https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/batch_delete
Updated: 2025-07-18

# 删除块

指定需要操作的块，删除其指定范围的子块。如果操作成功，接口将返回应用删除操作后的文档版本号。

**注意事项**：**应用频率限制**：单个应用调用频率上限为每秒 3 次，超过该频率限制，接口将返回 HTTP 状态码 400 及错误码 99991400；

**文档频率限制**：单篇文档并发编辑上限为每秒 3 次，超过该频率限制，接口将返回 HTTP 状态码 429，编辑操作包括：
- 创建块
- 创建嵌套块
- 删除块
- 更新块
- 批量更新块

当请求被限频，应用需要处理限频状态码，并使用指数退避算法或其它一些频控策略降低对 API 的调用速率。

## 前提条件

调用此接口前，请确保当前调用身份（tenant_access_token 或 user_access_token）已有云文档的阅读、编辑等文档权限，否则接口将返回 HTTP 403 或 400 状态码。了解更多，参考[如何为应用或用户开通文档权限](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a)。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/docx/v1/documents/:document_id/blocks/:block_id/children/batch_delete
HTTP Method | DELETE
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 创建及编辑新版文档(docx:document)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>或<br>`user_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 路径参数

名称 | 类型 | 描述
---|---|---
document_id | string | 文档的唯一标识。点击[这里](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview)了解如何获取文档的 `document_id`<br>**示例值**："doxcnePuYufKa49ISjhD8Iabcef"
block_id | string | 父 Block 的唯一标识。你可通过调用[获取文档所有块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list)接口获取块的 block_id<br>**注意**：<br>- 此接口不支持删除表格（Table）的行列和删除分栏（Grid）的分栏列。你需通过[更新块的内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/patch)接口完成相关操作。<br>- 此接口不支持删除表格单元格（Table Cell）、分栏列（Grid Column）和高亮块（Callout）的全部子块。<br>**示例值**："doxcnO6UW6wAw2qIcYf4hZabcef"

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
document_revision_id | int | 否 | 要操作的文档版本。-1 表示文档最新版本。文档创建后，版本为 1。你需确保你已拥有文档的编辑权限。你可通过调用[获取文档基本信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/get)获取文档的最新 revision_id<br>**示例值**：-1<br>**默认值**：`-1`<br>**数据校验规则**：<br>- 最小值：`-1`
client_token | string | 否 | 操作的唯一标识，与接口返回值的 client_token 相对应，用于幂等的进行更新操作。此值为空表示将发起一次新的请求，此值非空表示幂等的进行更新操作<br>**示例值**："fe599b60-450f-46ff-b2ef-9f6675625b97"

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
start_index | int | 是 | 删除的起始索引（操作区间左闭右开），start_index 需要小于 end_index<br>**示例值**：0<br>**数据校验规则**：<br>- 最小值：`0`
end_index | int | 是 | 删除的末尾索引（操作区间左闭右开），start_index 需要小于 end_index<br>**示例值**：1<br>**数据校验规则**：<br>- 最小值：`1`

### 请求示例
 ```bash 
curl --location --request DELETE 'https://open.feishu.cn/open-apis/docx/v1/documents/doxcnAJ9VRRJqVMYZ1MyKnavXWe/blocks/doxcnAJ9VRRJqVMYZ1MyKnavXWe/children/batch_delete?document_revision_id=-1' \
--header 'Authorization: Bearer u-xxx'
--header 'Content-Type: application/json' \
--data-raw '{
    "start_index": 0,
    "end_index": 1
}'
# 调用前请替换 'Authorization: Bearer u-xxx' 中的 'u-xxx' 为真实的访问令牌
```

### 请求体示例
```json
{
    "start_index": 0,
    "end_index": 1
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
document_revision_id | int | 当前删除操作成功后文档的版本号
client_token | string | 操作的唯一标识，更新请求中使用此值表示幂等的进行此次更新

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "document_revision_id": 1,
        "client_token": "fe599b60-450f-46ff-b2ef-9f6675625b97"
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 1770001 | invalid param | 确认传入的参数是否合法
404 | 1770002 | not found | **文档场景中**：<br>文档的 `document_id` 不存在。请确认文档是否已被删除或 `document_id` 是否填写正确。参考[文档概述](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview)了解如何获取文档的 `document_id`。<br>**群公告场景中**：<br>群 ID `chat_id` 不存在。请确认群是否被解散或 `chat_id` 是否填写正确。
400 | 1770003 | resource deleted | 确认资源是否已被删除
400 | 1770004 | too many blocks in document | 确认文档 Block 数量是否超上限
400 | 1770005 | too deep level in document | 确认文档 Block 层级是否超上限
400 | 1770006 | schema mismatch | 确认文档结构是否合法
400 | 1770007 | too many children in block | 确认指定 Block 的 Children 数量是否超上限
400 | 1770008 | too big file size | 确认上传的文件尺寸是否超上限
400 | 1770010 | too many table column | 确认表格列数是否超上限
400 | 1770011 | too many table cell | 确认表格单元格数量是否超上限
400 | 1770012 | too many grid column | 确认 Grid 列数量是否超上限
400 | 1770013 | relation mismatch | 图片、文件等资源的关联关系不正确。请确保在创建图片、文件块时，同时上传了相关图片或文件素材至对应的文档块中。详情参考文档[常见问题 3 和 4](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq#1908ddf0)
400 | 1770014 | parent children relation mismatch | 确认 Block 父子关系是否正确
400 | 1770015 | single edit with multi document | 确认 Block 所属文档与指定的 Document 是否相同
400 | 1770019 | repeated blockID in document | 确认 Document 中的 BlockID 是否有重复
400 | 1770020 | operation denied on copying document | 确认 Document 是否正在创建副本中
400 | 1770021 | too old document | 确认指定的 Document 版本（Revision_id）是否过旧。指定的版本号与文档最新版本号差值不能超过 1000
400 | 1770022 | invalid page token | 确认查询参数中的 page_token 是否合法
400 | 1770024 | invalid operation | 确认操作是否合法:<br>- 除了 text_run，其他 text_element 不允许设置 link 属性<br>- 编辑请求中 text_element 中不允许设置 undefined 元素 <br>- 分栏的列数范围在 [2, 10] 之间，不允许减少或者增加分栏列数超过约定范围<br>- 表格只有一行或者一列时，不允许通过减少表格行列的请求操作表格
400 | 1770025 | operation and block not match | 确认指定 Block 应用对应操作是否合法
400 | 1770026 | row operation over range | 确认行操作下标是否越界
400 | 1770027 | column operation over range | 确认列操作下标是否越界
400 | 1770028 | block not support create children | 确认指定 Block 添加 Children 是否合法
400 | 1770029 | block not support to create | 确认指定 Block 是否支持创建
400 | 1770030 | invalid parent children relation | 确认指定操作其父子关系是否合法
400 | 1770031 | block not support to delete children | 确认指定 Block 是否支持删除 Children
400 | 1770033 | content size exceed limit | 纯文本内容大小超过 10485760  字符限制，请减少内容后重试。
400 | 1770034 | operation count exceed limited | 当前请求中涉及单元格个数过多，请拆分成多次请求
403 | 1770032 | forbidden | **文档场景中**：<br>确认当前调用身份是否有文档阅读（获取相关接口）或编辑（更新、删除、创建相关接口）权限。请参考以下方式解决：<br>- 如果你使用的是 `tenant_access_token`，意味着当前应用没有文档权限。你需通过云文档网页页面右上方 **「...」** -> **「...更多」** ->**「添加文档应用」** 入口为应用添加文档权限。<br>**说明**：在 **添加文档应用** 前，你需确保目标应用至少开通了一个云文档或多维表格的 [API 权限](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/scope-list)。否则你将无法在文档应用窗口搜索到目标应用。<br><br>- 如果你使用的是 `user_access_token`，意味着当前用户没有文档权限。你需通过云文档网页页面右上方 **分享** 入口为当前用户添加文档权限。<br><br>了解具体操作步骤或其它添加权限方式，参考[云文档常见问题 3](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a)。<br>对于创建和更新相关接口，你还需要确认：<br>- 当前调用身份是否有 MentionDoc 即 @文档 中文档的阅读权限<br>- MentionUser 即 @用户 中的用户是否在职且与当前调用身份互为联系人<br>- 当前调用身份是否具有群卡片的查看和分享权限<br>- 当前调用身份是否具有访问指定 Wiki 即知识库子目录的权限<br>- 当前调用身份是否具有 OKR、ISV、Add-Ons 等文档块的查看权限<br>**群公告场景中**：<br>当前的操作者没有群公告的编辑权限。解决方案：<br>- 方案一：调用[指定群管理员](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-managers/add_managers)接口，将当前操作者置为群管理员，然后重试。<br>- 方案二：在 **飞书客户端 > 群组 > 设置 > 群管理** 中，将 **谁可以编辑群信息** 设置为 **所有群成员**，然后重试。<br>对于创建和更新相关接口，你还需要确认：<br>- 当前调用身份是否有 MentionDoc 即 @文档 中文档的阅读权限<br>- MentionUser 即 @用户 中的用户是否在职且与当前调用身份互为联系人<br>- 当前调用身份是否具有群卡片的查看和分享权限<br>- 当前调用身份是否具有访问指定 Wiki 即知识库子目录的权限<br>- 当前调用身份是否具有 OKR、ISV、Add-Ons 等文档块的查看权限
500 | 1771001 | server internal error | 服务器内部错误。请重试，若仍无法解决请咨询[技术支持](https://applink.feishu.cn/TLJpeNdW)。
500 | 1771006 | mount folder failed | 挂载文档到云空间文件夹失败。请检查是否错误地传入了 wiki_token 并重试。若仍无法解决请咨询[技术支持](https://applink.feishu.cn/TLJpeNdW)。
500 | 1771002 | gateway server internal error | 网关服务内部错误。请重试，若仍无法解决请咨询[技术支持](https://applink.feishu.cn/TLJpeNdW)。
500 | 1771003 | gateway marshal error | 网关服务解析错误。请重试，若仍无法解决请咨询[技术支持](https://applink.feishu.cn/TLJpeNdW)。
500 | 1771004 | gateway unmarshal error | 网关服务反解析错误。请重试，若仍无法解决请咨询[技术支持](https://applink.feishu.cn/TLJpeNdW)。
503 | 1771005 | system under maintenance | 系统服务正在维护中，请重试，若仍无法解决请咨询[技术支持](https://applink.feishu.cn/TLJpeNdW)
