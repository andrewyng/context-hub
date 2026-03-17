# 记录筛选参数填写说明

Source URL: https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide
Updated: 2025-11-20

# 记录筛选参数填写说明

在多维表格部分接口中，可以通过请求参数 `filter` 等设置筛选条件，筛选出你需要的记录。本文档介绍如何填写筛选参数。

## 筛选参数结构说明

筛选参数的描述和结构如下所示。

参数名称 | 数据类型 | 描述
---|---|---
filter | filter_info | 包含条件筛选信息的对象。
└ conjunction | string | 表示条件之间的逻辑连接词，可以是 "and" 或 "or"。
└ conditions | condition[] | 筛选条件集合。
└ └  field_name | string | 条件字段的名称。
└ └  operator | string | 条件运算符。其可选值有：<br>- is：等于<br>- isNot：不等于（不支持日期字段）<br>- contains：包含（不支持日期字段）<br>- doesNotContain：不包含（不支持日期字段）<br>- isEmpty：为空<br>- isNotEmpty：不为空<br>- isGreater：大于<br>- isGreaterEqual：大于等于（不支持日期字段）<br>- isLess：小于<br>- isLessEqual：小于等于（不支持日期字段）<br>- like：LIKE 运算符。暂未支持<br>- in：IN 运算符。暂未支持
└ └ value | string[] | 条件的值，可以是单个值或多个值的数组。不同字段类型和不同的 operator 可填的值不同。详情参考下文字段目标值（value）填写说明。

 `filter` 的数据结构如下所示：
```json
{
  "filter": {
    "conjunction": "and",
    "conditions": [
      {
        "field_name": "字段1",
        "operator": "is",
        "value": [
          "文本内容"
        ]
      }
    ]
  }
}
```

## filter 使用示例

如下为一个员工销售额表。本小节根据该表格提供使用 `filter` 参数示例。
|  员工名称	| 职位  	| 销售额 	|
|---	|---	|---	|
| 张小一 	| 初级销售员 	| 10000.0 	|
| 张小二 	| 初级销售员 	| 15000.0 	|
| 张小三 	| 初级销售员 	| 20000.0 	|
| 张小四 	| 高级销售员 	| 30000.0 	|
| 张小五 	| 高级销售员 	| 50000.0 	|
| 张小六 	| 销售经理 	| 100000.0 	|

- 要筛选出职位为"初级销售员"，**且**销售额大于 10000 的记录，filter 参数示例如下所示：

  ```JSON
  {
    "filter": {
      "conjunction": "and",
      "conditions": [
        {
          "field_name": "职位",
          "operator": "is",
          "value": [
            "初级销售员"
          ]
        },
        {
          "field_name": "销售额",
          "operator": "isGreater",
          "value": [
            "10000.0"
          ]
        }
      ]
    }
  }
  ```

- 要筛选职位为"高级销售员"，或者销售额大于 20000 的记录，filter 参数示例如下所示：

    ```JSON
    {
      "filter": {
        "conjunction": "or",
        "conditions": [
          {
            "field_name": "职位",
            "operator": "is",
            "value": [
              "高级销售员"
            ]
          },
          {
            "field_name": "销售额",
            "operator": "isGreater",
            "value": [
              "20000.0"
            ]
          }
        ]
      }
    }
    ```

- 要筛选出职位为"初级销售员" **或**“高级销售员”，**且** 销售额为 10000 **或** 20000 的记录，filter 参数示例如下所示：
如下示例，目前仅支持使用一层 children 参数，不支持再次嵌套使用。
  ```json
  {
    "filter": {
      "conjunction": "and",
      "children": [
        {
          "conjunction": "or",
          "conditions": [
            {
              "field_name": "职位",
              "operator": "is",
              "value": [
                "高级销售员"
              ]
            },
            {
              "field_name": "职位",
              "operator": "is",
              "value": [
                "初级销售员"
              ]
            }
          ]
        },
        {
          "conjunction": "or",
          "conditions": [
            {
              "field_name": "销售额",
              "operator": "is",
              "value": [
                "10000.0"
              ]
            },
            {
              "field_name": "销售额",
              "operator": "is",
              "value": [
                "20000.0"
              ]
            }
          ]
        }
      ]
    }
  }
  ```

## 字段目标值（value）填写说明
多维表格支持以下类型的字段作为筛选条件。目前暂不支持公式或查找引用的字段类型作为筛选条件。
**注意事项**：当 value 填空值 [] 时，请确保按照 `"value":[]` 格式传入 value，否则将报缺失 value 值的错误。

字段类型 | 目标值示例 | 描述 | 限制
---|---|---|---
多行文本 | <code>["文本内容"]</code> | 填写对应的文本内容 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`
条码 | <code>["条码内容"]</code> | 填写对应的条码内容 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`
数字 | <code>["23.4"]</code> | 填写对应数字的字符串形式 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`
货币 | <code>["23.4"]</code> | 填写对应数字的字符串形式 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`
进度 | <code>["0.34"]</code> | 填写对应数字的字符串形式 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`
评分 | <code>["1"]</code> | 填写对应数字的字符串形式 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`
单选 | <code>["a","b"]</code> | 列表中填写选项内容 | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素
多选 | <code>["a","b"]</code> | 包含多个选项名字符串的数组 | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素
日期 | <code>["ExactDate","1702449755000"]</code> | Unix 时间戳，单位是毫秒 | 列表中可能存在多个元素，具体参考下文**日期字段填写说明**
复选框 | <code>["true"]</code> 或 <code>["false"]</code> | 元素填写对应的布尔内容 | 列表只能有一个元素，operator 仅支持 `is`
人员 | <code>["ou_9a971ded01b4ca66f4798549878abcef"]</code> | 填写对应的用户 ID。用户 ID 类型需与[查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)中 `user_id_type`<br>参数指定的类型一致，默认类型为 open_id | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素
电话号码 | <code>["131xxxx6666"]</code> | 填写对应的电话号码 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`
超链接 | <code>["链接显示名称"]</code> | 填写对应的超链接名称 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`
附件 | <code>[]</code> | 仅支持`isEmpty`或`isNotEmpty` | 需填空值 `[]`
单向关联 | <code>["recnVYsuqV"]</code> | 填写对应的记录 ID | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素
双向关联 | <code>["recnVYsuqV"]</code> | 填写对应的记录 ID | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素
地理位置 | <code>["天安门广场，北京市东城区东长安街"]</code> | 填写对应的地址 | 列表只能有一个元素或零个元素，operator为`isEmpty`或`isNotEmpty`填空值[]
群组 | <code>["oc_cd07f55f14d6f4a4f1b51504e7e97f48"]</code> | 填写对应的群组 ID | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素
创建时间 | <code>["ExactDate","1702449755000"]</code> | Unix 时间戳，单位是毫秒 | 列表中可能存在多个元素，具体参考下文**日期字段填写说明**
最后更新时间 | <code>["ExactDate","1702449755000"]</code> | Unix 时间戳，单位是毫秒 | 列表中可能存在多个元素，具体参考下文**日期字段填写说明**
创建人 | <code>["ou_9a971ded01b4ca66f4798549878abcef"]</code> | 填写对应的用户 ID。用户 ID 类型需与[查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)中 `user_id_type`<br>参数指定的类型一致，默认类型为 open_id | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素
修改人 | <code>["ou_9a971ded01b4ca66f4798549878abcef"]</code> | 填写对应的用户 ID。用户 ID 类型需与[查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)中 `user_id_type`<br>参数指定的类型一致，默认类型为 open_id | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素
自动编号 | <code>["1"]</code> | 填写对应的自动编号值 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`

## 日期字段填写说明
日期筛选时，operator 仅支持 `is`、`isEmpty`、`isNotEmpty`、`isGreater`、`isLess` 五个值。

当 operator 为 `isEmpty`或`isNotEmpty` 时，value 需填空值 `"value":[]`。

当 operator 为 `is`、`isGreater` 或 `isLess` 时，参考下表填写日期字段。

value 元素可选值 | 描述 | value 目标值示例 | 注意事项
---|---|---|---
<code>ExactDate</code> | 具体日期 | <code>["ExactDate","1702449755000"]</code> | - 需要填写 2 个元素。第二个元素需要填写具体日期的时间戳。<br>- 第二个元素虽然是时间戳，但是实际筛选时，会被转为文档时区当天的零点。
<code>Today</code> | 今天 | <code>["Today"]</code> | 需要填写 1 个元素
<code>Tomorrow</code> | 明天 | <code>["Tomorrow"]</code> | 需要填写 1 个元素
<code>Yesterday</code> | 昨天 | <code>["Yesterday"]</code> | 需要填写 1 个元素
<code>CurrentWeek</code> | 本周 | <code>["CurrentWeek"]</code> | - 需要填写 1 个元素<br>- operator 仅支持 `is`
<code>LastWeek</code> | 上周 | <code>["LastWeek"]</code> | - 需要填写 1 个元素<br>- operator 仅支持 `is`
<code>CurrentMonth</code> | 本月 | <code>["CurrentMonth"]</code> | - 需要填写 1 个元素<br>- operator 仅支持 `is`
<code>LastMonth</code> | 上个月 | <code>["LastMonth"]</code> | - 需要填写 1 个元素<br>- operator 仅支持 `is`
<code>TheLastWeek</code> | 过去七天内 | <code>["TheLastWeek"]</code> | - 需要填写 1 个元素<br>- operator 仅支持 <code>is</code>
<code>TheNextWeek</code> | 未来七天内 | <code>["TheNextWeek"]</code> | - 需要填写 1 个元素<br>- operator 仅支持 <code>is</code>
<code>TheLastMonth</code> | 过去三十天内 | <code>["TheLastMonth"]</code> | - 需要填写 1 个元素<br>- operator 仅支持 <code>is</code>
<code>TheNextMonth</code> | 未来三十天内 | <code>["TheNextMonth"]</code> | - 需要填写 1 个元素<br>- operator 仅支持 <code>is</code>
