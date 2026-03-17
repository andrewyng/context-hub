# 更新订阅状态

Source URL: https://open.feishu.cn/document/server-docs/docs/docs-assistant/file-subscription/patch
Updated: 2023-12-29

# 更新订阅状态

根据订阅ID更新订阅状态

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/drive/v1/files/:file_token/subscriptions/:subscription_id
HTTP Method | PATCH
接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 订阅云文档和更新云文档订阅状态(docs:document.subscription)<br>查看、评论、编辑和管理云空间中所有文件(drive:drive)<br>查看、评论和下载云空间中所有文件(drive:drive:readonly)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `user_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 路径参数

名称 | 类型 | 描述
---|---|---
file_token | string | 文档token<br>**示例值**："doxcnxxxxxxxxxxxxxxxxxxxxxx"
subscription_id | string | 订阅关系ID<br>**示例值**："1234567890987654321"

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
is_subscribe | boolean | 是 | 是否订阅<br>**示例值**：true
file_type | string | 是 | 文档类型<br>**示例值**："docx"<br>**可选值有**：<br>- doc：文档<br>- docx：新版文档<br>- wiki：知识库wiki

### 请求体示例
```json
{
    "is_subscribe": true,
    "file_type": "docx"
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
subscription_id | string | 订阅关系ID
subscription_type | string | 订阅类型<br>**可选值有**：<br>- comment_update：评论更新
is_subcribe | boolean | 是否订阅
file_type | string | 文档类型<br>**可选值有**：<br>- doc：旧版文档<br>- docx：新版文档<br>- wiki：知识库

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "subscription_id": "1234567890987654321",
        "subscription_type": "comment_update",
        "is_subcribe": true,
        "file_type": "docx"
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 1064000 | Illegal parameter | 检查参数有效性
403 | 1064030 | Permission denied | 检查文档权限，订阅评论至少需要阅读的权限
404 | 1064040 | Token not exist | 检查文档是否能正常访问
500 | 1065000 | Internal Server Error | 重试，若稳定失败请联系相关业务方oncall人员
