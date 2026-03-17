# 创建云文档

Source URL: https://open.feishu.cn/document/docs/drive-v1/file/create-cloud-document
Updated: 2024-10-22

# 创建云文档
云文档是飞书在线文档、电子表格、多维表格、知识库、云空间等产品的统称。你可参考以下接口文档创建目标云文档类型。

## 创建文档

操作 | 文档地址
---|---
创建文档（docx） | [https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/create](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/create)
基于模板创建文档 | [https://open.feishu.cn/document/server-docs/docs/drive-v1/file/copy](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/copy)

## 创建电子表格

操作 | 文档地址
---|---
创建电子表格（sheet） | [https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/sheets-v3/spreadsheet/create)
基于模板创建电子表格 | [https://open.feishu.cn/document/server-docs/docs/drive-v1/file/copy](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/copy)

## 创建多维表格

操作 | 文档地址
---|---
创建多维表格（bitable） | [https://open.feishu.cn/document/server-docs/docs/bitable-v1/app/create](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)
基于模板创建电子表格 | [https://open.feishu.cn/document/server-docs/docs/drive-v1/file/copy](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/copy)

### 常见问题

#### 1. 如何直接通过云文档模板创建云文档？

模板其实也是一篇云文档，可以先通过模板链接获取该模板的 token 作为文件 token，再调用 [复制文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/copy) 接口创建云文档。

示例：如下图，假定「工作周报」该模板的访问链接是 `https://{domain}/docx/ke6jdf477ohCVVxzANnc56abcef`，那么你可通过 `ke6jdf477ohCVVxzANnc56abcef` 这个 `document_id` 作为源文件 token 调用复制文件接口，创建一篇新文档。
