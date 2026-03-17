# 文档的数据结构

Source URL: https://open.feishu.cn/document/docs/docs/data-structure/document
Updated: 2024-04-24

# 文档的数据结构

文档（document）代表用户在云文档中创建的一篇在线文档。每篇文档都有唯一的 `document_id` 作为标识。从结构上看，每篇文档都是由多个块以父子关系形成的 Block 树。

## 数据结构

`document` 的基础元数据结构如下所示。你可通过调用[获取文档基本信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/get)接口获取。要了解文档内块的结构，参考[块的数据结构](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/data-structure/block)。

```JSON
"document": {
    "document_id": string, // 文档的唯一标识
    "revision_id": int,   // 文档版本的标识，可指定要查询或更新的文档版本
    "title": string, // 文档标题
    "display_setting": { // 文档展示设置
        "show_authors": boolean, // 文档信息中是否展示文档作者
        "show_comment_count": boolean, // 文档信息中是否展示评论总数
        "show_create_time": boolean, // 文档信息中是否展示文档创建时间
        "show_like_count": boolean, // 文档信息中是否展示点赞总数
        "show_pv": boolean, // 	文档信息中是否展示文档访问次数
        "show_uv": boolean  // 文档信息中是否展示文档访问人数
    },
    "cover": {  // 文档封面
        "token": string, // 封面图片的 token
        "offset_ratio_x": float, // 视图在水平方向的偏移比例
        "offset_ratio_y": float // 视图在垂直方向的偏移比例
    }
}
```

## 参数描述

上述结构中，参数的具体描述如下表所示。

<b>参数名称 | <b>数据类型 | <b>是否必须 | <b>示例值 | <b>描述
---|---|---|---|---
document_id | string | required | TLLKdcpDro9ijQxA33ycNMabcef | 文档的唯一标识，也是该文档对应的页面 Block 的 ID。<br>了解如何获取 document_id，参考[文档概述](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview)。
revision_id | int | required | 378 | 文档版本的标识，指定要查询或更新的文档版本。文档被编辑或评论会导致 revision_id 更改。<br>取值范围为：-1 或 0 < revision_id <= 文档最新版本。其中，-1 表示文档最新版本。<br>文档创建后，版本为 1。<br>**注意**：revision_id 发生更改通常意味着文档更新，但不一定是文档内容的变化，也有可能是文档被他人评论所致。
title | string | required | 工作周报 | 文档标题，只支持返回纯文本。
display_setting | object | optional | / | 文档展示设置。
display_setting.show_authors | boolean | required | true | 文档信息中是否展示文档作者。
display_setting.show_create_time | boolean | required | true | 文档信息中是否展示文档创建时间。
display_setting.show_pv | boolean | required | false | 文档信息中是否展示文档访问次数。
display_setting.show_uv | boolean | required | false | 文档信息中是否展示文档访问人数。
display_setting.show_like_count | boolean | required | false | 文档信息中是否展示点赞总数。
display_setting.show_comment_count | boolean | required | false | 文档信息中是否展示评论总数。
cover | object | optional | &nbsp; | 文档封面
cover.token | string | required | D6d9bkdH7onNylxKyvucm8abcef | 图片 token
cover.offset_ratio_x | float | required | 0 | 视图在水平方向的偏移比例。其值为距离原图中心的水平方向偏移值 px / 原图宽度 px。视图在原图中心时，该值为 0；视图在原图右部分时，该值为正数；视图在原图左部分时，改值为负数。默认为 0。
cover.offset_ratio_y | float | required | 0 | 视图在垂直方向的偏移比例。其值为距离原图中心的垂直方向偏移值 px / 原图高度 px。视图在原图中心时，该值为 0；视图在原图上部分时，该值为正数；视图在原图下部分时，改值为负数。默认为 0。
