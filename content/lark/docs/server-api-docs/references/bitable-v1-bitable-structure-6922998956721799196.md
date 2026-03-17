# 数据结构概述

Source URL: https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-structure
Updated: 2025-07-21

# 数据结构概述

本文档介绍多维表格数据表中记录、字段和视图等的数据结构。多维表格中的数据表由记录（record）和字段（field）组成， 同时可以拥有多个视图（view）。

## 记录
记录由 record 和 fields 两个结构组成。

### record 结构

record 是一个 object 结构类型。
| 参数     | 数据类型         | 描述        |
| --------- | -------   | --------- |
|`record_id`| string |  记录的 ID |
|`fields`| map |  记录的字段 |

### fields 结构

fields 字段为 map 型，由字段名称和其具体内容的键值对组成。了解 fields 详细结构和参数描述，参考[多维表格记录数据结构](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/bitable-record-data-structure-overview)。
```json
{
  "任务情况总结": [
    {
      "text": "网站更新任务由黄泡泡负责，正在进行中",
      "type": "text"
    }
  ]
}
```

参数 | 数据类型 | 描述 | 示例值
---|---|---|---
key | string | 多维表格数据表中的字段名称。 | "任务情况总结"
value | union | 某个字段的具体内容，其结构可以是数字、字符串、布尔型、字符串列表或对象列表。详情参考下文。 | 该示例值为对象列表，更多示例，参考[多维表格记录数据结构](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/bitable-record-data-structure-overview)。<br>```json<br>[<br>{<br>"text": "网站更新任务正在进行中",<br>"type": "text"<br>}<br>]<br>```

## 字段

字段即多维表格数据表中的“列”，是一个`object`结构类型。字段的基本结构如下所示。了解字段详细结构和参数描述，参考[字段编辑指南](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/guide)。

```json
{
    "field_id": "fldYWaldeW", // 字段的 ID
    "field_name": "文本",   // 字段名称
    "type": 1,  // 字段的类型，详情参考下文
    "description": "字段的描述", // 对字段的更多说明
    "is_primary": true,   // 该字段是否是初始的索引字段
    "property": null,   // 字段的属性，详情参考下文
    "ui_type": "Text",  // 字段在界面上的展示类型，例如进度字段是数字的一种展示形态
    "is_hidden": false  // 字段是否是隐藏字段
}
```
参数描述如下所示：

名称 | 类型 | 描述
---|---|---
field_id | string | 字段 ID
field_name | string | 字段名称
type | int | 字段类型：相同类型用ui_type区分：<br>- 1：文本（默认值）、条码（需声明 <code>"ui_type": "Barcode"</code>）、邮箱（需声明<code>"ui_type": "Email"</code>)<br>- 2：数字（默认值）、进度（需声明 <code>"ui_type": "Progress"</code>）、货币（需声明 <code>"ui_type": "Currency"</code>）、评分（需声明 <code>"ui_type": "Rating"</code>)<br>- 3：单选<br>- 4：多选<br>- 5：日期<br>- 7：复选框<br>- 11：人员<br>- 13：电话号码<br>- 15：超链接<br>- 17：附件<br>- 18：单向关联<br>- 19：查找引用<br>- 20：公式<br>- 21：双向关联<br>- 22：地理位置<br>- 23：群组<br>- 24：流程（不支持通过写接口新增或编辑，仅支持读接口） <br>- 1001：创建时间<br>- 1002：最后更新时间<br>- 1003：创建人<br>- 1004：修改人<br>- 1005：自动编号<br>-   3001：按钮（不支持通过写接口新增或编辑，仅支持读接口）
description | 字段的描述 | 对字段的更多说明。
is_primary | true/false | 该字段是否是初始的索引字段。
property | object | 字段属性，因字段类型而异。详情参考[字段编辑指南](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/guide)。
ui_type | string | 字段的 UI 类型：<br>- "Text"：文本<br>- "Email"：邮箱<br>- "Barcode"：条码<br>- "Number"：数字<br>- "Progress"：进度<br>- "Currency"：货币<br>- "Rating"：评分<br>- "SingleSelect"：单选<br>- "MultiSelect"：多选<br>- "DateTime"：日期<br>- "Checkbox"：复选框<br>- "User"：人员<br>- "GroupChat"：群组<br>- "Phone"：电话号码<br>- "Url"：超链接<br>- "Attachment"：附件<br>- "SingleLink"：单向关联<br>- "Formula"：公式<br>- "Lookup": 查找引用<br>- "DuplexLink"：双向关联<br>- "Location"：地理位置<br>- "CreatedTime"：创建时间<br>- "ModifiedTime"：最后更新时间<br>- "CreatedUser"：创建人<br>- "ModifiedUser"：修改人<br>- "AutoNumber"：自动编号<br>- "Button"：按钮
is_hidden | true/false | 字段是否是隐藏字段。

## 视图

视图是一个 object 结构类型。

参数 | 类型 | 描述
---|---|---
view_id | string | 视图 ID。`view_id` 在一个多维表格中唯一，在全局不一定唯一。获取方式：<br>- 你可通过多维表格 URL 获取 `view_id`，下图高亮部分即为当前视图的唯一标识。<br><br>- 你也可通过[列出视图](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/list)接口获取 `view_id`。暂时无法获取到嵌入到文档中的多维表格的 `view_id`。
view_name | string | 视图名称
view_type | string | 视图类型，支持以下类型，默认为 grid 类型。<br>- grid：表格视图<br>- kanban：看板视图<br>- gallery：画册视图<br>- gantt：甘特视图<br>- form：表单视图

## 自定义数据结构

### delete_record
| 参数         | 数据类型           |  描述         | 
| --------- | --------------- | ----------- | 
|`deleted` | `boolean` | 是否删除成功 |
|`record_id` | `string` | 单条记录的 ID |
