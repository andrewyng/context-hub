# 表格

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/content-components/table
Updated: 2025-01-02

# 表格组件

飞书卡片支持表格组件，并支持在表格中添加普通文本、富文本、选项标签、数字、人员列表、日期类型的内容。

本文档介绍表格组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[表格](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/table)。

## 注意事项

- 表格组件支持飞书 V7.4 及以上版本的客户端。在低于该版本的飞书客户端上，表格的内容将展示为一句“请升级客户端为最新版本后查看内容”的占位图。
- 单张卡片最多支持放置五个表格组件。若卡片配置了多语言，则单个语言最多支持放置五个表格组件。
- 当单元格内剩余空间无法完整展示内容时，末尾将省略。在客户端，用户可通过光标悬浮或点击的方式查看被省略的内容。

## 嵌套规则

- 表格组件不可被内嵌在其它组件内，只可放在卡片根节点下。
- 表格组件不支持内嵌其它组件。

## 组件属性

### JSON 结构

表格组件的完整 JSON 数据如下所示：
```json
// 7.4 支持
{
    "tag": "table", // 组件的标签。表格组件的固定取值为 table。
    "page_size": 5, // 每页最大展示的数据行数。支持[1,10]整数。默认值 5。
    "row_height": "low", // 行高设置。默认值 low。
    "freeze_first_column": true, //是否冻结首列，默认 false。
    "header_style": {
        // 在此设置表头。
        "text_align": "left", // 文本对齐方式。默认值 left。
        "text_size": "normal", // 字号。默认值 normal。
        "background_style": "none", // 背景色。默认值 none。
        "text_color": "grey", // 文本颜色。默认值 default。
        "bold": true, // 是否加粗。默认值 true。
        "lines": 1 // 文本行数。默认值 1。
    },
    "columns": [ // 在此添加列。最多支持添加 50 列，超出 50 列的内容不展示。
        { // 添加列，列的数据类型为不带格式的普通文本。
            "name": "customer_name", // 自定义列的标记。必填。用于唯一指定行数据对象数组中，需要将数据填充至这一行的具体哪个单元格中。
            "display_name": "客户名称", // 列名称。为空时不展示列名称。
            "width": "auto", // 列宽。默认值 auto。
            "data_type": "text", // 列的数据类型。
            "vertical_align": "top", // 列内数据垂直对齐方式。默认值 center。
            "horizontal_align": "left" // 列内数据水平对齐方式。默认值 left。
        },
        { // 添加列，列的数据类型为 lark_md 文本。
            "name": "customer_link",
            "display_name": "相关链接",
            "data_type": "lark_md"
        },
        { // 添加类型为数字的列。
            "name": "customer_arr",
            "display_name": "ARR(万元)",
            "data_type": "number",
            "format": { // 列的数据类型为 number 时的字段配置。
                "symbol": "¥", // 数字前展示的货币单位。支持 1 个字符的货币单位文本。可选。
                "precision": 2, // 数字的小数点位数。支持 [0,10] 的整数。默认不限制小数点位数。
                "separator": true // 是否生效按千分位逗号分割的数字样式。默认值 false。
            },
            "width": "120px"
        },
        { // 添加类型为选项的列。
            "name": "customer_scale",
            "display_name": "客户规模",
            "data_type": "options"
        },
        { // 添加类型为人员的列。
            "name": "customer_poc",
            "display_name": "客户对接人",
            "data_type": "persons"
        },
        { // 添加类型为日期的列。
            "name": "meeting_date",
            "display_name": "对接时间",
            "data_type": "date",
            "date_format": "YYYY/MM/DD"
        },
        { // 添加类型为 markdown 文本的列。
            "name": "company_image",
            "display_name": "企业图片",
            "data_type": "markdown"
        }
    ],
    "rows": [ // 在此添加与列定义对应的行数据。用 "name":VALUE 的形式，定义每一行的数据内容。name 即你自定义的列标记。
        {
            "customer_name": "飞书科技",
            "customer_date": 1699341315000,
            "customer_scale": [
                {
                    "text": "S2",
                    "color": "blue"
                }
            ],
            "customer_arr": 168,
            "customer_poc": [
                "ou_14a32f1a02e64944cf19207aa43abcef",
                "ou_e393cf9c22e6e617a4332210d2aabcef"
            ],
            "customer_link": "[飞书科技](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)"
        },
        {
            "customer_name": "飞书科技_01",
            "customer_date": 1606101072000,
            "customer_scale": [
                {
                    "text": "S1",
                    "color": "red"
                }
            ],
            "customer_arr": 168.23,
            "customer_poc": "ou_14a32f1a02e64944cf19207aa43abcef",
            "customer_link": "[飞书科技_01](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)",
            "company_image": ""
        },
        {
            "customer_name": "飞书科技_02",
            "customer_date": 1606101072000,
            "customer_scale": [
                {
                    "text": "S3",
                    "color": "orange"
                }
            ],
            "customer_arr": 168.23,
            "customer_poc": "ou_14a32f1a02e64944cf19207aa43abcef",
            "customer_link": "[飞书科技_02](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)",
            "company_image": ""

        },
        {
            "customer_name": "飞书科技_03",
            "customer_date": 1606101072000,
            "customer_scale": [
                {
                    "text": "S2",
                    "color": "blue"
                }
            ],
            "customer_arr": 168.23,
            "customer_poc": "ou_14a32f1a02e64944cf19207aa43abcef",
            "customer_link": "[飞书科技_03](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)",
            "company_image": ""
        }
    ]
}
```

### 字段说明

表格组件的字段说明如下表。

字段 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | / | 组件的标签。表格组件的固定取值为 `table`。
page_size | 否 | Number | 5 | 每页最大展示的数据行数。支持 [1,10] 整数。
row_height | 否 | String | low | 表格的行高。单元格高度如无法展示一整行内容，则上下裁剪内容。可取值：<br>- low：低<br>- middle：中<br>- high：高<br>- [32,124]px：自定义行高，单位为像素，如 40px。取值范围是 [32,124]
header_style | 否 | header_style | / | 表头样式风格。详见下方 `header_style` 字段说明。
freeze_first_column | 否 | Boolean | false | 是否冻结首列。可取值：<br>- true：冻结首列。即左右滚动表格时不滚动首列，其余列叠加展示在首列底下<br>- false：不冻结首列。即左右滚动表格时所有表格均做滚动
columns | 是 | column[] | [] | 列对象数组。详见下方 `column` 字段说明。
rows | 是 | JSON | [] | 行对象数组。与列定义对应的数据。用 `"name":VALUE` 的形式，定义每一行的数据内容。`name`即你自定义的列标记。

#### `header_style` 字段说明

`header_style` 用于设置表头的样式、风格等。`header_style` 的子字段如下表所示。

字段 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
text_align | 否 | String | left | 表头文本对齐方式。可取值：<br>- left：左对齐<br>- center：居中对齐<br>- right：右对齐
text_size | 否 | String | normal | 表头文本大小。可取值：<br>- normal：正文（14px）<br>- heading：标题（16px）
background_style | 否 | String | none | 表头背景色。可取值：<br>- grey：灰色<br>- none：无背景色
text_color | 否 | String | default | 文本颜色。可取值：<br>- default：客户端浅色主题模式下为黑色；客户端深色主题模式下为白色<br>- grey：灰色
bold | 否 | Boolean | true | 表头文本是否加粗。可取值：<br>- true：加粗<br>- false：不加粗
lines | 否 | Number | 1 | 表头文本的行数。支持大于等于 1 的整数。

#### **`column`** **字段说明**

`column` 用于定义表格的列。最多支持添加 50 列，超出 50 列的内容不展示。

字段 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
name | 是 | String | 空 | 自定义列的标记。用于唯一指定行数据对象数组中，需要将数据填充至这一行的具体哪个单元格中。
display_name | 否 | String | 空 | 在表头展示的列名称。不填或为空则不展示列名称。
width | 否 | String | auto | 列宽度。可取值：<br>- auto：自适应内容宽度<br>- 自定义宽度：自定义表格的列宽度，如 120px。取值范围是 [80px,600px] 的整数<br>- 自定义宽度百分比：自定义列宽度占当前表格画布宽度的百分比（表格画布宽度 = 卡片宽度-卡片左右内边距），如 25%。取值范围是 [1%,100%]
vertical_align | 否 | String | center | 列内数据垂直对齐方式。可选值：<br>- top：顶部对齐<br>- center：中间对齐<br>- bottom：底部对齐
horizontal_align | 否 | String | left | 列内数据水平对齐方式。可选值：<br>- left：左对齐<br>- center：居中对齐<br>- right：右对齐
data_type | 是 | String | text | 列数据类型。可选值如下所示。了解不同类型用法，参考 `data_type` 字段说明一节。<br>- text：不带格式的普通文本。为 `data_type` 默认值。<br>- lark_md：支持部分 markdown 格式的文本。飞书 v7.10 及之后版本支持。详情参考[普通文本-lark_md 支持的 Markdown 语法](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/plain-text)<br>- options：选项标签。标签中的文本内容不可过长，否则可能会导致 PC 端或移动端内容显示不完整。如果文本过长，可使用 text 或者 lark_md 类型<br>- number：数字。默认在单元格中右对齐展示。若选择该数据类型，你可继续在 `column` 中添加 `format` 字段，设置数字的格式属性<br>- persons：人员列表。为用户名称+头像样式<br>- date：日期时间。需输入 Unix 标准毫秒级时间戳，飞书客户端将按用户本地时区展示日期时间。飞书 v7.6 及之后版本支持<br>- markdown：支持完整 Markdown 语法的文本内容。详情参考[富文本（Markdown）组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/rich-text)。飞书 v7.14 及之后版本支持
format | 否 | Object | / | 该字段仅当 `data_type` 为 `number` 时生效，你可以在该字段内选择设置小数点位数、货币单位以及千分位样式。
└ precision | 否 | Int | 空 | 数字的小数点位数。默认不限制小数点位数，原样透传展示开发者输入的数字。可填 0~10 的整数。小数点位数为 0 表示取整数。
└ symbol | 否 | String | 空 | 数字前的货币单位。不填或为空不展示。可填 1 个字符的货币单位文本，如 “¥”。
└ separator | 否 | Boolean | false | 是否生效按千分位逗号分割的数字样式。
date_format | 否 | String | 空 | 该字段仅当 `data_type` 为 `date` 时生效。你可按需选择以下日期时间占位符，并使用任意分隔符组合。<br>- YYYY：年<br>- MM：月<br>- DD：日<br>- HH：小时<br>- mm：分钟<br>- ss：秒<br>推荐使用以下日期格式。默认按 RFC 3339 标准格式展示日期时间。<br>- YYYY/MM/DD<br>- YYYY/MM/DD HH:mm<br>- YYYY-MM-DD<br>- YYYY-MM-DD HH:mm<br>- DD/MM/YYYY<br>- MM/DD/YYYY

#### `data_type` 字段说明

`data_type` 用于指定列的数据类型。`data_type` 支持的枚举值及详细说明如下所示。

data_type 枚举 | 支持版本 | 描述 | 对应行的数据结构与示例
---|---|---|---
text | 飞书 v7.4 及以上 | 不带格式的普通文本。为 data_type 默认值。 | 结构：<br>```json<br>"name":"plain text"  // 不填或为空时展示空单元格，非字符串类型转换为字符串展示<br>```<br>示例：<br>```json<br>"business_domain_name": "飞书卡片"<br>```
lark_md | 飞书 v7.10 及以上 | 支持部分 markdown 格式的文本。详情参考[普通文本-lark_md 支持的 Markdown 语法](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/plain-text)。 | 结构：<br>```json<br>"name":"[文字链接](https://www.feishu.cn)"  // 不填或为空时展示空单元格，非字符串类型转换为字符串展示<br>```<br>示例：<br>```json<br>"customer_link": "[飞书科技_01](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)"<br>```
options | 飞书 v7.4 及以上 | 选项标签。支持使用 color 参数自定义标签颜色。color 枚举值及展示效果如下所示。默认值为 blue。<br>**注意**：标签中的文本内容不可过长，否则可能会导致 PC 端或移动端内容显示不完整。如果文本过长，可使用 text 或者 lark_md 类型。<br> | 结构：<br>```json<br>// 支持仅展示一个默认样式的标签<br>"name":"option"<br>// 支持展示多个自定义样式的标签<br>"name":[<br>{<br>"text":"option 1",<br>"color":"red"<br>},<br>{<br>"text":"option 2",<br>"color":"green"<br>}<br>]<br>```<br>示例：<br>```json<br>"customer_scale": [<br>{<br>"text": "S2",<br>"color": "green"<br>}<br>]<br>```
number | 飞书 v7.4 及以上 | 数字。默认在单元格中右对齐展示。支持添加 format 字段，设置数字的格式属性。详情参考 format 字段说明。 | 结构：<br>```json<br>"name":NUMBER<br>```<br>示例：<br>```json<br>"customer_arr": 26.57774928467545<br>```
persons | 飞书 v7.4 及以上 | 人员列表。为用户名称+头像样式。支持传入用户 ID 指定人员，用户 ID 类型可以是 user_id、open_id、union_id和 lark_id。了解更多 ID 相关信息，参考[用户身份概述](https://open.feishu.cn/document/home/user-identity-introduction/introduction)。<br>**注意**：当用户 ID 无效时，将展示“未知用户”样式。 | 结构：<br>```json<br>"name":[<br>"user_id_1",<br>"user_id_2",<br>…<br>] //展示多人员<br>或<br>"name":"user_id" //展示单人员<br>```<br>示例：<br>```json<br>"customer_name": "ou_c99c5f35d542efc7ee492afe11af19ef"<br>```
date | 飞书 v7.6 及以上 | 日期时间。需输入 Unix 标准毫秒级时间戳，飞书客户端将按用户本地时区展示日期时间。<br>支持添加 date_format 字段，设置日期的格式属性。默认按 RFC 3339 标准格式展示日期时间。详情参考 date_format 字段说明。 | 结构：<br>```json<br>name":NUMBER<br>```<br>示例：<br>```json<br>"customer_date": 1606101072000  // 毫秒级时间戳<br>```
markdown | 飞书 v7.14 及以上 | 支持完整 Markdown 语法的文本内容。详情参考[富文本（Markdown）](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/rich-text)组件。 | 结构：<br>```json<br>"name":"markdown text"  // 不填或为空时展示空单元格，非字符串类型转换为字符串展示<br>```<br>示例：<br>```json<br>"company_image": ""<br>```

## 示例代码

以下的 JSON 示例代码可实现如下图所示的卡片效果。

```json
{
  "header": {
    "template": "blue",
    "title": {
      "content": "表格组件（依赖端版本 7.4+)",
      "tag": "plain_text"
    }
  },
  "elements": [
    {
      "tag": "table",
      "page_size": 5,
      "row_height": "low",
      "header_style": {
        "text_align": "left",
        "text_size": "normal",
        "background_style": "none",
        "text_color": "grey",
        "bold": true,
        "lines": 1
      },
      "columns": [
        {
          "name": "customer_name",
          "display_name": "客户名称",
          "data_type": "text",
          "horizontal_align": "left",
          "vertical_align": "top",
          "width": "auto"
        },
        {
          "name": "customer_scale",
          "display_name": "客户规模",
          "data_type": "options",
          "horizontal_align": "left",
          "vertical_align": "top",
          "width": "auto"
        },
        {
          "name": "customer_arr",
          "display_name": "ARR(万元)",
          "data_type": "number",
          "format": {
            "symbol": "¥",
            "precision": 2,
            "separator": true
          },
          "width": "auto"
        },
        {
          "name": "customer_poc",
          "display_name": "跟进人",
          "data_type": "persons",
          "horizontal_align": "left",
          "vertical_align": "top",
          "width": "auto"
        },
        {
          "name": "customer_date",
          "display_name": "签约日期",
          "data_type": "date",
          "date_format": "YYYY/MM/DD",
          "width": "auto"
        },
        {
          "name": "customer_link",
          "display_name": "相关链接",
          "data_type": "lark_md",
          "width": "auto"
        },
        {
            "name": "company_image",
            "display_name": "企业图片",
            "data_type": "markdown"
        }
      ],
      "rows": [
        {
          "customer_name": "飞书科技",
          "customer_date": 1699341315000,
          "customer_scale": [
            {
              "text": "S2",
              "color": "blue"
            }
          ],
          "customer_arr": 168,
          "customer_poc": [
            "ou_14a32f1a02e64944cf19207aa43abcef",
            "ou_e393cf9c22e6e617a4332210d2aabcef"
          ],
          "customer_link": "[飞书科技](/document-mod/index?fullPath=/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)",
          "company_image": ""
        },
        {
          "customer_name": "飞书科技_01",
          "customer_date": 1606101072000,
          "customer_scale": [
            {
              "text": "S1",
              "color": "red"
            }
          ],
          "customer_arr": 168.23,
          "customer_poc": "ou_14a32f1a02e64944cf19207aa43abcef",
          "customer_link": "[飞书科技_01](/document-mod/index?fullPath=/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)",
          "company_image": ""
        },
        {
          "customer_name": "飞书科技_02",
          "customer_date": 1606101072000,
          "customer_scale": [
            {
              "text": "S3",
              "color": "orange"
            }
          ],
          "customer_arr": 168.23,
          "customer_poc": "ou_14a32f1a02e64944cf19207aa43abcef",
          "customer_link": "[飞书科技_02](/document-mod/index?fullPath=/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)",
          "company_image": ""
        },
        {
          "customer_name": "飞书科技_03",
          "customer_date": 1606101072000,
          "customer_scale": [
            {
              "text": "S2",
              "color": "blue"
            }
          ],
          "customer_arr": 168.23,
          "customer_poc": "ou_14a32f1a02e64944cf19207aa43abcef",
          "customer_link": "[飞书科技_03](/document-mod/index?fullPath=/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)",
          "company_image": ""
        }
      ]
    }
  ]
}
```
