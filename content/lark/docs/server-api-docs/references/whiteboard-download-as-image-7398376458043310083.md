# 获取画板缩略图片

Source URL: https://open.feishu.cn/document/docs/board-v1/whiteboard/download_as_image
Updated: 2026-01-14

# 下载画板为图片

获取画板的缩略图片，响应数据为图片的二进制图片流。根据 Content-Type 值区图片格式：image/png、image/jpeg、image/gif、image/svg+xml。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/board/v1/whiteboards/:whiteboard_id/download_as_image
HTTP Method | GET
接口频率限制 | [50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 查看画板节点(board:whiteboard:node:read)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>或<br>`user_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)

### 路径参数

名称 | 类型 | 描述
---|---|---
whiteboard_id | string | 画板唯一标识。可通过文档接口 [获取文档所有块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list) 获取，`block_type` 为 43 的 block 即为画板，对应的 <code>block.token</code> 就是画板的<code>whiteboard_id</code>。<br>**示例值**："Ru8nwrWFOhEmaFbEU2VbPRsHcxb"

## 响应

HTTP状态码为 200 时，表示成功

返回文件二进制流

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 2890001 | invalid format | 参数格式不正确。请检查传入的参数格式
400 | 2890002 | invalid arg | 参数无效。请检查传入的参数是否有效
400 | 2890003 | record missing | 找不到记录。`whiteboard_id` 不存在或图片不存在。请检查传入的`whiteboard_id`是否正确以及是否存在（可通过[获取文档所有块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list)接口获取正确的`whiteboard_id`）
401 | 2890004 | auth failed | 认证失败。请检查 Authorization 参数
403 | 2890005 | forbidden | 请求身份没有当前画板的阅读权限。请参考[云文档常见问题 3](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#78a03ee2)开通权限
429 | 2890006 | too many request | 请求超过接口频率限流值。请稍后再试
500 | 2891001 | server internal error | 服务运行错误。请重试或联系[技术支持](https://applink.feishu.cn/TLJpeNdW)
