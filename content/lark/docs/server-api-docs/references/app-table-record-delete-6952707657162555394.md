# 删除记录

Source URL: https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/delete
Updated: 2026-02-02

# 删除记录

删除多维表格数据表中的一条记录。

## 前提条件

调用此接口前，请确保当前调用身份（tenant_access_token 或 user_access_token）已有多维表格的编辑等文档权限，否则接口将返回 HTTP 403 或 400 状态码。了解更多，参考[如何为应用或用户开通文档权限](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a)。

## 注意事项

从其它数据源同步的数据表，不支持对记录进行增加、删除、和修改操作。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id
HTTP Method | DELETE
接口频率限制 | [50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 删除记录(base:record:delete)<br>查看、评论、编辑和管理多维表格(bitable:app)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>或<br>`user_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 路径参数

名称 | 类型 | 描述
---|---|---
app_token | string | 多维表格 App 的唯一标识。不同形态的多维表格，其 `app_token` 的获取方式不同：<br>- 如果多维表格的 URL 以 ==**feishu.cn/base**== 开头，该多维表格的 `app_token` 是下图高亮部分：<br><br>- 如果多维表格的 URL 以 ==**feishu.cn/wiki**== 开头，你需调用知识库相关[获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)接口获取多维表格的 app_token。当 `obj_type` 的值为 `bitable` 时，`obj_token` 字段的值才是多维表格的 `app_token`。<br>了解更多，参考[多维表格 app_token 获取方式](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview#-752212c)。<br>**示例值**："appbcbWCzen6D8dezhoCH2RpMAh"
table_id | string | 多维表格数据表的唯一标识。获取方式：<br>- 你可通过多维表格 URL 获取 `table_id`，下图高亮部分即为当前数据表的 `table_id`<br>- 也可通过[列出数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list)接口获取 `table_id`<br><br>**示例值**："tblsRc9GRRXKqhvW"
record_id | string | 数据表中一条记录的唯一标识。通过[查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)接口获取。<br>**示例值**："recpCsf4ME"

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
ignore_consistency_check | boolean | 否 | 是否忽略一致性读写检查，默认为 false，即在进行读写操作时，系统将确保读取到的数据和写入的数据是一致的。可选值：<br>- true：忽略读写一致性检查，提高性能，但可能会导致某些节点的数据不同步，出现暂时不一致<br>- false：开启读写一致性检查，确保数据在读写过程中一致<br>**示例值**：false

### 请求体示例
```json
curl -i -X DELETE 'https://fsopen.bytedance.net/open-apis/bitable/v1/apps/appbcbWCzen6D8dezhoCH2RpMAh/tables/tblsRc9GRRXKqhvW/records/recpCsf4ME' \
-H 'Authorization: Bearer t-7f1b******8e560'
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | delete_record | \-
deleted | boolean | 是否成功删除
record_id | string | 删除的记录 ID

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "deleted": true,
        "record_id": "recpCsf4ME"
    }
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
200 | 1254030 | TooLargeResponse | 响应体过大
400 | 1254036 | Base is copying, please try again later. | 多维表格副本复制中，稍后重试
200 | 1254040 | BaseTokenNotFound | app_token 不存在
200 | 1254041 | TableIdNotFound | table_id 不存在
200 | 1254042 | ViewIdNotFound | view_id 不存在
200 | 1254043 | RecordIdNotFound | record_id 不存在
200 | 1254044 | FieldIdNotFound | field_id  不存在
200 | 1254060 | TextFieldConvFail | 多行文本字段错误
200 | 1254061 | NumberFieldConvFail | 数字字段错误
200 | 1254062 | SingleSelectFieldConvFail | 单选字段错误
200 | 1254063 | MultiSelectFieldConvFail | 多选字段错误
200 | 1254064 | DatetimeFieldConvFail | 日期字段错误
200 | 1254065 | CheckboxFieldConvFail | 复选框字段错误
200 | 1254066 | UserFieldConvFail | 人员字段有误。原因可能是：<br>- `user_id_type` 参数指定的 ID 类型与传入的 ID 类型不匹配<br>- 传入了不识别的类型或结构，目前只支持填写 `id` 参数，且需要传入数组<br>- 跨应用传入了 `open_id`。如果跨应用传入 ID，建议使用 `user_id`。不同应用获取的 `open_id` 不能交叉使用
200 | 1254067 | LinkFieldConvFail | 关联字段错误
200 | 1254072 | InvalidPhoneNumber | 转换手机号码格式失败，请检查传入的手机号码格式是否正确
200 | 1254100 | TableExceedLimit | 数据表或仪表盘数量超限。每个多维表格中，数据表加仪表盘的数量最多为 100 个
200 | 1254101 | ViewExceedLimit | 视图数量超限, 限制200个
200 | 1254102 | FileExceedLimit | 文件数量超限
200 | 1254103 | RecordExceedLimit | 记录数量超限, 限制20,000条
200 | 1254104 | RecordAddOnceExceedLimit | 单次添加记录数量超限, 限制500条
200 | 1254130 | TooLargeCell | 格子内容过大
200 | 1254290 | TooManyRequest | 请求过快，稍后重试
200 | 1254291 | Write conflict | 同一个数据表(table) 不支持并发调用写接口，请检查是否存在并发调用写接口。写接口包括：新增、修改、删除记录；新增、修改、删除字段；修改表单；修改视图等。
200 | 1254301 | OperationTypeError | 多维表格未开启高级权限或不支持开启高级权限
200 | 1255001 | InternalError | 内部错误，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)
200 | 1255002 | RpcError | 内部错误，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)
200 | 1255003 | MarshalError | 序列化错误，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)
200 | 1255004 | UmMarshalError | 反序列化错误
200 | 1255005 | ConvError | 内部错误，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)
504 | 1255040 | Request timed out, please try again later. | 请求超时，请进行重试
400 | 1254607 | Data not ready, please try again later | 该报错一般是由于前置操作未执行完成，或本次操作数据太大，服务器计算超时导致。遇到该错误码时，建议等待一段时间后重试。通常有以下几种原因：<br>- **编辑操作频繁**：开发者对多维表格的编辑操作非常频繁。可能会导致由于等待前置操作处理完成耗时过长而超时的情况。多维表格底层对数据表的处理基于版本维度的串行方式，不支持并发。因此，并发请求时容易出现此类错误，不建议开发者对单个数据表进行并发请求。<br>- **批量操作负载重**：开发者在多维表格中进行批量新增、删除等操作时，如果数据表的数据量非常大，可能会导致单次请求耗时过长，最终导致请求超时。建议开发者适当降低批量请求的 page_size 以减少请求耗时。<br>- **资源分配与计算开销**：资源分配是基于单文档维度的，如果读接口涉及公式计算、排序等计算逻辑，会占用较多资源。例如，并发读取一个文档下的多个数据表也可能导致该文档阻塞。
403 | 1254302 | Permission denied. | 无访问权限，常由表格开启了高级权限造成。请确保当前调用身份具有高级权限或多维表格的管理权限：<br>- 对于应用身份，你需要通过云文档网页页面右上方 「**...**」->「**...更多**」-> 「**添加文档应用**」入口添加并授予应用可管理权限，或在高级权限设置中添加一个包含应用的群组，给予这个群读写权限<br>- 对于用户身份，你需要通过云文档网页的「**分享**」入口授予用户管理权限<br>了解更多，参考[如何为应用或用户开通云文档权限](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a)。
403 | 1254304 | Permission denied. | 权限不足。请检查多维表格是否开启了高级权限，如果开启高级权限，调用身份需要有多维表格的可管理权限
403 | 1254608 | ReqRecommited | 请求重复，请检查本次请求的请求参数和上一次是否完全相同
