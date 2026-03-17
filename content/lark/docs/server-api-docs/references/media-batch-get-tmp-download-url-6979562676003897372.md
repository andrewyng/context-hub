# 获取素材临时下载链接

Source URL: https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url
Updated: 2025-02-20

# 获取素材临时下载链接

该接口用于获取云文档中素材的临时下载链接。链接的有效期为 24 小时，过期失效。

## 前提条件

调用此接口之前，你需确保应用已拥有素材的下载权限。否则接口将返回 403 的 HTTP 状态码。参考[云空间常见问题](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/faq)第 3 点了解如何分享素材的下载权限给应用。更多云文档接口权限问题，参考[云文档常见问题](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN)。

## 注意事项

本接口仅支持下载云文档而非云空间中的资源文件。如要下载云空间中的资源文件，需调用[下载文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/download)接口。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/drive/v1/medias/batch_get_tmp_download_url
HTTP Method | GET
接口频率限制 | [特殊频控](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 查看、评论、编辑和管理多维表格(bitable:app)<br>查看、评论和导出多维表格(bitable:app:readonly)<br>查看、评论、编辑和管理文档(docs:doc)<br>查看、评论和导出文档(docs:doc:readonly)<br>下载云文档中的图片和附件(docs:document.media:download)<br>查看、评论、编辑和管理云空间中所有文件(drive:drive)<br>查看、评论和下载云空间中所有文件(drive:drive:readonly)<br>查看、评论、编辑和管理电子表格(sheets:spreadsheet)<br>查看、评论和导出电子表格(sheets:spreadsheet:readonly)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>或<br>`user_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)

更多云文档接口权限问题，参考[常见问题](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN)。

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
file_tokens | string\[\] | 是 | 素材文件的 token。获取方式如下所示：<br>* 新版文档：通过[获取文档所有块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list)接口获取指定文件块（File Block）或图片块（Image Block）的 token，即为素材 token。<br>* 电子表格：通过[读取多个范围](https://open.feishu.cn/document/ukTMukTMukTM/ukTMzUjL5EzM14SOxMTN)接口获取指定附件的 <br>`fileToken`，即为素材的 token。<br>* 多维表格：通过[列出记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/list)接口获取指定附件的 `file_token`，即为素材的 token。<br>如需一次获取多个素材的下载链接，可多次传递本参数及素材的 token 值，格式如下：<br>`https://{url}?file_tokens={token1}&file_tokens={token2}`<br>其中：<br>- `file_tokens` 是参数名，可以多次传递<br>- `token1` 和 `token2` 为素材的实际 token 值<br>- 一次最多可传递 5 个素材的 token，但在 API 调试台仅支持传一个 token<br>**示例值**：boxcnrHpsg1QDqXAAAyachabcef
extra | string | 否 | 拓展信息，如拥有高级权限的多维表格在下载素材时，需要添加额外的扩展信息作为 URL 查询参数鉴权。详情参考[extra 参数说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction)。未正确填写该参数的接口将返回 403 的 HTTP 状态码。<br>**示例值**：请参考 [extra 参数说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction)

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
tmp_download_urls | tmp_download_url\[\] | 临时下载列表
file_token | string | 素材的 token
tmp_download_url | string | 素材的临时下载链接

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "tmp_download_urls": [
            {
                "file_token": "boxcnrHpsg1QDqXAAAyachabcef",
                "tmp_download_url": "https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZDA3MzNiNmUwMjE2MGUzZmQ1OGZlOWYzMWQ4YmI0ZjdfMDYzOWNlZjgyMmI1MmY5NTUxZmM0MjJlYWIyMGVjOWZfSUQ6Njk3NjgzMTY0Mjc5OTI5MjQyMl8xNjI0NDMxMDY3OjE2MjQ1MTc0NjdfVjM"
            }
        ]
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 1061002 | params error. | 请检查请求参数是否正确。
