# 部门群转为普通群

Source URL: https://open.feishu.cn/document/server-docs/contact-v3/department/unbind_department_chat
Updated: 2024-07-05

# 部门群转为普通群

调用该接口将指定部门的部门群转为普通群。

## 注意事项

应用的通讯录权限范围内需要包含当前操作的部门。了解权限范围，参见[权限范围资源介绍](https://open.feishu.cn/document/ukTMukTMukTM/uETNz4SM1MjLxUzM/v3/guides/scope_authority)。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/contact/v3/departments/unbind_department_chat
HTTP Method | POST
接口频率限制 | [20 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用** | 更新通讯录(contact:contact)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 查询参数

名称 | 类型 | 必填 | 描述
---|---|---|---
department_id_type | string | 否 | 此次调用中的部门 ID 类型。关于部门 ID 的详细介绍，可参见[部门 ID 说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/field-overview#23857fe0)。<br>**默认值**：open_department_id<br>**示例值**：open_department_id<br>**可选值有**：<br>- department_id：支持用户自定义配置的部门 ID。自定义配置时可复用已删除的 department_id，因此在未删除的部门范围内 department_id 具有唯一性。<br>- open_department_id：由系统自动生成的部门 ID，ID 前缀固定为 `od-`，在租户内全局唯一。

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
department_id | string | 是 | 部门 ID，ID 类型需要与查询参数 department_id_type 的取值保持一致。ID 获取方式说明：<br>- 调用[创建部门](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/create)接口后，可从返回结果中获取到部门 ID 信息。<br>- 部门 API 提供了多种获取其他部门 ID 的方式，如[获取子部门列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/children)、[获取父部门信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/parent)、[搜索部门](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/search)，你可以选择合适的 API 进行查询。<br>**示例值**："D096"

### 请求体示例
```json
{
    "department_id": "D096"
}
```

**Go 请求示例**
```go
import (
	"context"

	"github.com/larksuite/oapi-sdk-go/v3"
	"github.com/larksuite/oapi-sdk-go/v3/service/contact/v3"
)

func main() {
	// 创建 Client
	client := lark.NewClient("appID", "appSecret")

	// 创建请求对象
	req := larkcontact.NewUnbindDepartmentChatDepartmentReqBuilder().
		Body(larkcontact.NewUnbindDepartmentChatDepartmentReqBodyBuilder().
			DepartmentId(`D096`).
			Build()).
		Build()

	// 发起请求
	resp, err := client.Contact.Department.UnbindDepartmentChat(context.Background(), req)
}
```

**Java 请求示例**
```java
import com.lark.oapi.Client;
import com.lark.oapi.service.contact.v3.model.*;
import com.lark.oapi.core.request.RequestOptions;

public class Main {

    public static void main(String arg[]) throws Exception {
        // 构建client
        Client client = Client.newBuilder("appId", "appSecret").build();

        // 创建请求对象
        UnbindDepartmentChatDepartmentReq req = UnbindDepartmentChatDepartmentReq.newBuilder()
                .unbindDepartmentChatDepartmentReqBody(UnbindDepartmentChatDepartmentReqBody.newBuilder()
                        .departmentId("D096")
                        .build())
                .build();

        // 发起请求
        UnbindDepartmentChatDepartmentResp resp = client.contact().department().unbindDepartmentChat(req, RequestOptions.newBuilder().build());
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

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {}
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 40002 | process root dept error | 不支持对根部门进行操作。请检查是否在请求参数部门 ID 中传入了根部门 ID `0`。
400 | 40003 | internal error | 内部错误，请获取请求的 X-Request-Id，并向[技术支持](https://applink.feishu.cn/TLJpeNdW)进行反馈。
403 | 40004 | no dept authority error | 当前操作涉及的部门，需在应用通讯录权限范围中，了解更多可参见[权限范围资源介绍](https://open.feishu.cn/document/ukTMukTMukTM/uETNz4SM1MjLxUzM/v3/guides/scope_authority)。
403 | 40020 | department do not has a chat error | 操作的部门没有部门群。你可以调用[获取单个部门信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/get)接口，查询指定部门的详细信息，以确保当前操作的部门是你需要转换群组类型的部门。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
