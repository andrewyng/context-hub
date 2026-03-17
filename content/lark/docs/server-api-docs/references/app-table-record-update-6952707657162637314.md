# 更新记录

Source URL: https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/update
Updated: 2025-07-21

# 更新记录

更新多维表格数据表中的一条记录。

## 前提条件

调用此接口前，请确保当前调用身份（tenant_access_token 或 user_access_token）已有多维表格的编辑等文档权限，否则接口将返回 HTTP 403 或 400 状态码。了解更多，参考[如何为应用或用户开通文档权限](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a)。

## 注意事项

- 从其它数据源同步的数据表，不支持对记录进行增加、删除、和修改操作。
- 更新记录为增量更新，仅更新传入的字段。如果想对记录中的某个字段值置空，可将字段设为 null，例如：
```json
{
  "fields": {
    "文本字段": null
  }
}
```

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id
HTTP Method | PUT
接口频率限制 | [50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 更新记录(base:record:update)<br>查看、评论、编辑和管理多维表格(bitable:app)
字段权限要求 | **注意事项**：该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户基本信息(contact:user.base:readonly)<br>获取用户 user ID(contact:user.employee_id:readonly)<br>以应用身份访问通讯录(contact:contact:access_as_app)<br>读取通讯录(contact:contact:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>或<br>`user_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 路径参数

名称 | 类型 | 描述
---|---|---
app_token | string | 多维表格 App 的唯一标识。不同形态的多维表格，其 app_token 的获取方式不同：<br>- 如果多维表格的 URL 以 ==**feishu.cn/base**== 开头，该多维表格的 app_token 是下图高亮部分：<br><br>- 如果多维表格的 URL 以 ==**feishu.cn/wiki**== 开头，你需调用知识库相关[获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)接口获取多维表格的 app_token。当 obj_type 的值为 bitable 时，obj_token 字段的值才是多维表格的 app_token。<br>了解更多，参考[多维表格 app_token 获取方式](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview#-752212c)。<br>**示例值**："appbcbWCzen6D8dezhoCH2RpMAh"
table_id | string | 多维表格数据表的唯一标识。获取方式：<br>- 你可通过多维表格 URL 获取 `table_id`，下图高亮部分即为当前数据表的 `table_id`<br>- 也可通过[列出数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list)接口获取 `table_id`<br><br>**示例值**："tblsRc9GRRXKqhvW"
record_id | string | 数据表中一条记录的唯一标识。通过[查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)接口获取。<br>**示例值**："recqwIwhc6"

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
user_id_type | string | 否 | 用户 ID 类型<br>**示例值**：open_id<br>**可选值有**：<br>- open_id：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。[了解更多：如何获取 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>- union_id：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。[了解更多：如何获取 Union ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>- user_id：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。[了解更多：如何获取 User ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>**默认值**：`open_id`<br>**当值为 `user_id`，字段权限要求**：<br>获取用户 user ID(contact:user.employee_id:readonly)
ignore_consistency_check | boolean | 否 | 是否忽略一致性读写检查，默认为 false，即在进行读写操作时，系统将确保读取到的数据和写入的数据是一致的。可选值：<br>- true：忽略读写一致性检查，提高性能，但可能会导致某些节点的数据不同步，出现暂时不一致<br>- false：开启读写一致性检查，确保数据在读写过程中一致<br>**示例值**：true

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
fields | map&lt;string, union&gt; | 是 | 要更新的记录的数据。你需先指定数据表中的字段（即指定列），再传入正确格式的数据作为一条记录。<br>**注意**：<br>该接口支持的字段类型及其描述如下所示：<br>- 文本：原值展示，不支持 markdown 语法<br>- 数字：填写数字格式的值<br>- 单选：填写选项值，对于新的选项值，将会创建一个新的选项<br>- 多选：填写多个选项值，对于新的选项值，将会创建一个新的选项。如果填写多个相同的新选项值，将会创建多个相同的选项<br>- 日期：填写毫秒级时间戳<br>- 复选框：填写 true 或 false<br>- 条码<br>- 人员：填写用户的 open_id、union_id 或 user_id，类型需要与 user_id_type 指定的类型一致<br>- 电话号码：填写文本内容<br>- 超链接：参考以下示例，text 为文本值，link 为 URL 链接<br>- 附件：填写附件 token，需要先调用[上传素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all)或[分片上传素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_prepare)接口将附件上传至该多维表格中<br>- 单向关联：填写被关联表的记录 ID<br>- 双向关联：填写被关联表的记录 ID<br>- 地理位置：填写经纬度坐标<br>不同类型字段的数据结构请参考[数据结构概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/bitable/development-guide/bitable-structure)。<br>**示例值**：{"文本":"HelloWorld"}

### 请求体示例
```json
{
    "fields": {
        "索引": "索引列文本类型",
        "文本": "文本内容",
        "条码":"qawqe",
        "数字": 100,
        "单选": "选项3",
        "多选": [
            "选项1",
            "选项2"
        ],
        "货币":3,
        "评分":3,
        "进度":0.25,
        "日期": 1674206443000,
        "复选框": true,
        "人员": [
            {
                "id": "ou_2910013f1e6456f16a0ce75ede950a0a"
            },
            {
                "id": "ou_e04138c9633dd0d2ea166d79f548ab5d"
            }
        ],
        "群组":[
            {
                "id": "oc_cd07f55f14d6f4a4f1b51504e7e97f48"
            }
        ],
        "电话号码": "13026162666",
        "超链接": {
            "text": "飞书多维表格官网",
            "link": "https://www.feishu.cn/product/base"
        },
        "附件": [
            {
                "file_token": "Vl3FbVkvnowlgpxpqsAbBrtFcrd"
            }
        ],
        "单向关联": [
            "recHTLvO7x",
            "recbS8zb2m"
        ],
        "双向关联": [
            "recHTLvO7x",
            "recbS8zb2m"
        ],
        "地理位置": "116.397755,39.903179"
    }
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
record | app.table.record | 记录更新后的内容
fields | map&lt;string, union&gt; | 成功更新的记录的数据
record_id | string | 更新记录的 ID
created_by | person | 该记录的创建人。本接口不返回该参数
id | string | 用户 ID，ID 类型与 `user_id_type` 所指定的类型一致
name | string | 用户的中文名称
en_name | string | 用户的英文名称
email | string | 用户的邮箱
avatar_url | string | 头像链接<br>**字段权限要求（满足任一）**：<br>获取用户基本信息(contact:user.base:readonly)<br>以应用身份访问通讯录(contact:contact:access_as_app)<br>读取通讯录(contact:contact:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)
created_time | int | 该记录的创建时间。本接口不返回该参数
last_modified_by | person | 该记录最新一次更新的修改人。本接口不返回该参数
id | string | 用户 ID，ID 类型与 `user_id_type` 所指定的类型一致
name | string | 用户的中文名称
en_name | string | 用户的英文名称
email | string | 用户的邮箱
avatar_url | string | 头像链接<br>**字段权限要求（满足任一）**：<br>获取用户基本信息(contact:user.base:readonly)<br>以应用身份访问通讯录(contact:contact:access_as_app)<br>读取通讯录(contact:contact:readonly)<br>以应用身份读取通讯录(contact:contact:readonly_as_app)
last_modified_time | int | 该记录最近一次的更新时间。本接口不返回该参数
shared_url | string | 记录分享链接。本接口不返回该参数，批量获取记录接口将返回该参数
record_url | string | 记录链接，本接口不返回该参数，查询记录接口将返回该参数

### 响应体示例
```json
{
    "code": 0,
    "data": {
        "record": {
            "fields": {
                "人员": [
                    {
                        "id": "ou_2910013f1e6456f16a0ce75ede950a0a"
                    },
                    {
                        "id": "ou_e04138c9633dd0d2ea166d79f548ab5d"
                    }
                ],
                "群组": [
                    {
                        "id": "oc_cd07f55f14d6f4a4f1b51504e7e97f48"
                    }
                ],
                "单向关联": [
                    "recHTLvO7x",
                    "recbS8zb2m"
                ],
                "单选": "选项3",
                "双向关联": [
                    "recHTLvO7x",
                    "recbS8zb2m"
                ],
                "地理位置": "116.397755,39.903179",
                "复选框": true,
                "多行文本": "多行文本内容",
                "多选": [
                    "选项1",
                    "选项2"
                ],
                "数字": 100,
                "日期": 1674206443000,
                "条码": "qawqe",
                "电话号码": "13026162666",
                "索引": "索引列多行文本类型",
                "超链接": {
                    "link": "https://www.feishu.cn/product/base",
                    "text": "飞书多维表格官网"
                },
                "附件": [
                    {
                        "file_token": "Vl3FbVkvnowlgpxpqsAbBrtFcrd"
                    }
                ],
                "评分": 3,
                "货币": 3,
                "进度": 0.25
            },
            "id": "reclAqylTN",
            "record_id": "reclAqylTN"
        }
    },
    "msg": "success"
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
200 | 1254000 | WrongRequestJson | 请求体错误
200 | 1254001 | WrongRequestBody | 请求体错误
200 | 1254002 | Fail | 内部错误，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)
200 | 1254003 | WrongBaseToken | app_token 错误
200 | 1254004 | WrongTableId | table_id 错误
200 | 1254005 | WrongViewId | view_id 错误
200 | 1254006 | WrongRecordId | 检查 record_id
200 | 1254007 | EmptyValue | 空值
200 | 1254008 | EmptyView | 空视图
200 | 1254009 | WrongFieldId | 字段 id 错误
200 | 1254010 | ReqConvError | 请求错误
400 | 1254015 | Field types do not match. | 字段类型不匹配，请检查传入的记录内容是否符合对应字段类型的格式要求
403 | 1254027 | UploadAttachNotAllowed | 附件未挂载, 禁止上传
200 | 1254030 | TooLargeResponse | 响应体过大
400 | 1254036 | Base is copying, please try again later. | 多维表格副本复制中，稍后重试
200 | 1254040 | BaseTokenNotFound | app_token 不存在
200 | 1254041 | TableIdNotFound | table_id 不存在
200 | 1254042 | ViewIdNotFound | view_id 不存在
200 | 1254043 | RecordIdNotFound | record_id 不存在
200 | 1254044 | FieldIdNotFound | field_id  不存在
200 | 1254045 | FieldNameNotFound | 字段名字不存在
200 | 1254060 | TextFieldConvFail | 多行文本字段错误
200 | 1254061 | NumberFieldConvFail | 数字字段错误
200 | 1254062 | SingleSelectFieldConvFail | 单选字段错误，出现这个错误的两种情况为：<br>- 单选字段的值类型不是字符串 string<br>- 单选字段设置的关联选项不支持更新
200 | 1254063 | MultiSelectFieldConvFail | 多选字段错误，出现这个错误的两种情况为：<br>- 多选字段的值类型不是字符串 string<br>- 多选字段设置的关联选项不支持更新
200 | 1254064 | DatetimeFieldConvFail | 日期字段错误
200 | 1254065 | CheckboxFieldConvFail | 复选框字段错误
200 | 1254066 | UserFieldConvFail | 人员字段有误。原因可能是：<br>- `user_id_type` 参数指定的 ID 类型与传入的 ID 类型不匹配<br>- 传入了不识别的类型或结构，目前只支持填写 `id` 参数，且需要传入数组<br>- 跨应用传入了 `open_id`。如果跨应用传入 ID，建议使用 `user_id`。不同应用获取的 `open_id` 不能交叉使用
200 | 1254067 | LinkFieldConvFail | 关联字段错误
200 | 1254068 | URLFieldConvFail | 超链接字段错误
200 | 1254069 | AttachFieldConvFail | 附件字段错误
200 | 1254072 | InvalidPhoneNumber | 转换手机号码格式失败，请检查传入的手机号码格式是否正确
400 | 1254074 | DuplexLinkFieldConvFail | 参数无效，需要使用字符串数组
200 | 1254100 | TableExceedLimit | 数据表或仪表盘数量超限。每个多维表格中，数据表加仪表盘的数量最多为 100 个
200 | 1254101 | ViewExceedLimit | 视图数量超限, 限制200个
200 | 1254102 | FileExceedLimit | 文件数量超限
200 | 1254103 | RecordExceedLimit | 记录数量超限, 限制20,000条
200 | 1254104 | RecordAddOnceExceedLimit | 单次添加记录数量超限, 限制500条
200 | 1254105 | ColumnExceedLimit | 字段数量超限
200 | 1254106 | AttachExceedLimit | 附件过多
200 | 1254112 | TooManyRequestInSingleBase | /
200 | 1254130 | TooLargeCell | 格子内容过大
200 | 1254290 | TooManyRequest | 请求过快，稍后重试
200 | 1254291 | Write conflict | 同一个数据表(table) 不支持并发调用写接口，请检查是否存在并发调用写接口。写接口包括：新增、修改、删除记录；新增、修改、删除字段；修改表单；修改视图等。
200 | 1254301 | OperationTypeError | 多维表格未开启高级权限或不支持开启高级权限
200 | 1254303 | The attachment does not belong to this base. | 附件无权限
200 | 1255001 | InternalError | 内部错误，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)
200 | 1255002 | RpcError | 内部错误，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)
200 | 1255003 | MarshalError | 序列化错误，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)
200 | 1255004 | UmMarshalError | 反序列化错误
200 | 1255005 | ConvError | 内部错误，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)
504 | 1255040 | Request timed out, please try again later. | 请求超时，请进行重试
400 | 1254607 | Data not ready, please try again later | 该报错一般是由于前置操作未执行完成，或本次操作数据太大，服务器计算超时导致。遇到该错误码时，建议等待一段时间后重试。通常有以下几种原因：<br>- **编辑操作频繁**：开发者对多维表格的编辑操作非常频繁。可能会导致由于等待前置操作处理完成耗时过长而超时的情况。多维表格底层对数据表的处理基于版本维度的串行方式，不支持并发。因此，并发请求时容易出现此类错误，不建议开发者对单个数据表进行并发请求。<br>- **批量操作负载重**：开发者在多维表格中进行批量新增、删除等操作时，如果数据表的数据量非常大，可能会导致单次请求耗时过长，最终导致请求超时。建议开发者适当降低批量请求的 page_size 以减少请求耗时。<br>- **资源分配与计算开销**：资源分配是基于单文档维度的，如果读接口涉及公式计算、排序等计算逻辑，会占用较多资源。例如，并发读取一个文档下的多个数据表也可能导致该文档阻塞。
403 | 1254302 | Permission denied. | 无访问权限，常由表格开启了高级权限造成。请确保当前调用身份具有高级权限或多维表格的管理权限：<br>- 对于应用身份，你需要通过云文档网页页面右上方 「**...**」->「**...更多**」-> 「**添加文档应用**」入口添加并授予应用可管理权限，或在高级权限设置中添加一个包含应用的群组，给予这个群读写权限<br>- 对于用户身份，你需要通过云文档网页的「**分享**」入口授予用户管理权限<br>了解更多，参考[如何为应用或用户开通云文档权限](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a)。
403 | 1254304 | Permission denied. | 权限不足。请检查多维表格是否开启了高级权限，如果开启高级权限，调用身份需要有多维表格的可管理权限。详情参考[如何为应用或用户开通文档权限](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a)
403 | 1254608 | ReqRecommited | 请求重复，请检查本次请求的请求参数和上一次是否完全相同
