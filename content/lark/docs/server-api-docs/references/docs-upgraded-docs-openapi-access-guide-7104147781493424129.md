# 新旧版本说明

Source URL: https://open.feishu.cn/document/server-docs/docs/docs/upgraded-docs-openapi-access-guide
Updated: 2024-10-10

# 新旧版本说明

飞书开放平台于 2022 年 6 月开放了新版文档接口。本文介绍如何区分新旧版文档，以及新旧版文档所支持开放能力的差异。

## 新旧文档区分

你可通过文档的链接和代码中的文档类型相关字段区分新旧文档。
| **文档类别** | **文档链接**                          | **文件类型相关字段** |
| -------- | --------------------------------- | ------------ |
| 新版文档     | https://:domain/docx/:docx_token | docx         |
| 旧版文档     | https://:domain/docs/:docs_token | doc          |
**注意事项**：在云文档不同 OpenAPI 中，涉及「文件类型」的字段表述不一，其可能是 `type`、`types`、`parent_type`、`docs_type`、`file_type` 以及 `obj_type` 等。

## 新旧文档接口区分

对于以下跟文档内容相关的能力，新版文档跟旧版文档接口不同，不能混用。
**注意事项**：现已不支持通过旧版文档接口创建文档，使用旧版文档的存量应用请尽快切换至新版文档。

| **能力** | **新版文档接口** | **旧版文档接口** |
|---|---|---|
| 创建文档 | [创建文档](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/create)（不支持带内容创建文档，你可通过导入、创建副本等方式实现带内容创建） | [创建旧版文档](https://open.feishu.cn/document/ukTMukTMukTM/ugDM2YjL4AjN24COwYjN)（已废弃） |
| 编辑文档内容 | [创建块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-children/create)、[更新块的内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/patch)、[批量更新块的内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/batch_update)、[删除块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-children/batch_delete) | [编辑旧版文档内容](https://open.feishu.cn/document/ukTMukTMukTM/uYDM2YjL2AjN24iNwYjN) |
| 获取文档富文本内容 | [获取块的内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/get)、[获取所有子块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-children/get)、[获取文档所有块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list) | [获取旧版文档富文本内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDM2YjL1AjN24SNwYjN) |
| 获取文档纯文本内容 | [获取文档纯文本内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/raw_content) | [获取旧版文档纯文本内容](https://open.feishu.cn/document/ukTMukTMukTM/ukzNzUjL5czM14SO3MTN) |
| 获取文档元数据 | [获取文档基本信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/get)；<br> 你也可使用云空间中的[获取文档元数据](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/meta/batch_query)接口 | [获取旧版文档元信息](https://open.feishu.cn/document/ukTMukTMukTM/uczN3UjL3czN14yN3cTN) |

## 其它云文档能力对新旧文档的区分

云文档的其它开放能力，如云空间、权限、评论等，支持通过指定文档类型选择旧版或新版文档。

你可在请求体中传入文档类型参数指定新旧版本。具体字段如下：
- `"type":"docx"`、`"file_type":"docx"`、`"parent_type":"docx_file"` 等表示指定新版文档；
- `"type":"doc"`、`"file_type":"doc"`、`"parent_type":"doc_file"` 等表示指定旧版文档。

若应用有使用 `doc` 类型请求下表中的接口，切换到新版文档后，需将文档类型替换为 `docx`。

| **云文档能力** | **相关接口** |
|---|---|
| 云空间 | [获取文件元数据](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/meta/batch_query)<br>[复制文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/copy)<br>[复制文档（已废弃）](https://open.feishu.cn/document/ukTMukTMukTM/uYTNzUjL2UzM14iN1MTN)<br>[移动文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/move)<br>[删除文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/delete)<br>[获取文件统计信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-statistics/get)<br>[获取文件访问记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-view_record/list)<br>[创建文件快捷方式](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/create_shortcut)<br>[创建导入任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/create)<br>[查询导入结果](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/get)<br>[创建导出任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/export_task/create)<br> [查询导出结果](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/export_task/get)<br>[搜索文档](https://open.feishu.cn/document/ukTMukTMukTM/ugDM4UjL4ADO14COwgTN)|
| 权限 | [增加协作者权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/create)<br>[更新协作者权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/update)<br>[移除协作者权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/delete)<br>[判断当前用户是否有某权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/auth)<br>[判断协作者是否有某权限（已废弃）](https://open.feishu.cn/document/ukTMukTMukTM/uYzN3UjL2czN14iN3cTN)<br>[获取协作者列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/list)<br>[获取协作者列表（旧版）](https://open.feishu.cn/document/ukTMukTMukTM/uATN3UjLwUzN14CM1cTN)<br>[转移所有者](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/transfer_owner)<br>[转移所有者（已废弃）](https://open.feishu.cn/document/ukTMukTMukTM/uQzNzUjL0czM14CN3MTN)<br>[获取云文档权限设置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-public/get)<br>[获取云文档权限设置V2](https://open.feishu.cn/document/ukTMukTMukTM/uIzNzUjLyczM14iM3MTN/drive-v2/permission-public/get)<br>[获取云文档权限设置V2（已废弃）](https://open.feishu.cn/document/ukTMukTMukTM/uITM3YjLyEzN24iMxcjN)<br>[更新云文档权限设置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-public/patch)<br>[更新云文档权限设置 V2](https://open.feishu.cn/document/ukTMukTMukTM/uIzNzUjLyczM14iM3MTN/drive-v2/permission-public/patch)<br>[开启密码](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-public-password/create)<br>[刷新密码](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-public-password/update)<br>[关闭密码](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-public-password/delete)|
| 订阅 | [创建订阅](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-subscription/create)<br>[获取订阅状态](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-subscription/get)<br>[更新订阅状态](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-subscription/patch) |
|事件|[订阅云文档事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/subscribe)<br>[查询云文档事件订阅状态](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/get_subscribe)<br>[取消云文档事件订阅](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/delete_subscribe)|
|素材|[上传素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all)<br>[分片上传素材-预上传](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_prepare)|
| 知识库 | [移动云空间文档至知识空间](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-node/move_docs_to_wiki) <br>[创建知识空间节点副本](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-node/copy)|
| 评论 | [分页获取文档全文评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-comment/list)<br>[获取全文评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-comment/get)<br>[批量获取评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-comment/batch_query)<br>[添加全文评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-comment/create)<br>[获取回复信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-comment-reply/list)<br>[更新回复](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-comment-reply/update)<br>[删除回复](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-comment-reply/delete)<br>[解决/恢复评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-comment/patch) |

## 常见问题

### 1. 为什么不在旧版文档 OpenAPI 基础上兼容新版文档？

旧版文档和新版文档的底层格式和相关协议存在完全的差异，原来的数据结构和接口协议都无法实现兼容，因此需对接到新版文档的接口。

### 2. 新版文档是否同旧版文档一样，使用 Location 来标记位置？

旧版文档使用 Location 来标记位置，详情参考[旧版文档数据结构概述](https://open.feishu.cn/document/ukTMukTMukTM/uAzM5YjLwMTO24CMzkjN)。
在新版文档 OpenAPI 中，没有 Location 的概念，这也是新版和旧版文档底层数据结构主要区别之一。新版文档是基于 BlockID 及其 Parent Block ID 来定位的，可以将其看成是一棵 Block 树。
