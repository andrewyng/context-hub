# 多维表格字段变更

Source URL: https://open.feishu.cn/document/server-docs/docs/drive-v1/event/list/bitable_field_changed
Updated: 2025-11-17

# 多维表格字段变更

多维表格字段变更事件。被订阅的多维表格字段发生变更时，将会触发此事件。了解事件订阅的配置流程和使用场景，参考[事件概述](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)。

**注意事项**：被订阅的多维表格字段发生变更时，也将同时触发[文件编辑](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/event/file-edited)事件。

## 注意事项

若应用是以应用身份（`tenant_access_token`） 订阅的事件，在接收事件时需要同时申请应用和用户两个身份接收事件的权限。换言之，要订阅本事件，你需要在开发者后台，为应用同时开通 **应用身份** 和 **用户身份** 的 `bitable:app` 或 `drive:drive` 权限。

## 前提条件

添加该事件之前，你需确保已调用[订阅云文档事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/subscribe)接口。

## 事件

基本 | &nbsp;
---|---
事件类型 | drive.file.bitable_field_changed_v1
支持的应用类型 | 自建应用、商店应用
权限要求<br>**订阅该事件所需的权限，开启其中任意一项权限即可订阅**<br>开启任一权限即可 | 获取字段信息(base:field:read)<br>查看、评论、编辑和管理多维表格(bitable:app)<br>查看、评论、编辑和管理云空间中所有文件(drive:drive)
字段权限要求 | **注意事项**：该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户 user ID(contact:user.employee_id:readonly)
推送方式 | [Webhook](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)

### 事件体

名称 | 类型 | 描述
---|---|---
schema | string | 事件模式
header | event_header | 事件头
event_id | string | 事件 ID
event_type | string | 事件类型
create_time | string | 事件创建时间戳（单位：毫秒）
token | string | 事件 Token
app_id | string | 应用 ID
tenant_key | string | 租户 Key
event | \- | \-
file_type | string | 云文档类型
file_token | string | 多维表格 token
table_id | string | 多维表格数据表 ID
operator_id | user_id | 用户 ID
union_id | string | 用户的 union id
user_id | string | 用户的 user id<br>**字段权限要求**：<br>获取用户 user ID(contact:user.employee_id:readonly)
open_id | string | 用户的 open id
action_list | bitable.table.field_action\[\] | 字段变更操作类型列表
action | string | 字段变更类型。枚举值有：<br>- field_added：新增字段<br>- field_edited：修改字段<br>- field_deleted：删除字段
field_id | string | 字段 ID
before_value | bitable.table.field_action.value | 操作前的字段值
id | string | 字段 ID
name | string | 字段名字
type | int | 字段类型
description | string | 字段描述
property | bitable.table.field_action.value.property | 字段属性
formatter | string | 数字、公式字段的显示格式
date_formatter | string | 日期、创建时间、最后更新时间字段的显示格式
auto_fill | boolean | 日期字段中新纪录自动填写创建时间
multiple | boolean | 人员字段中允许添加多个成员，单向关联、双向关联中允许添加多个记录
table_id | string | 单向关联、双向关联字段中关联的数据表的ID
table_name | string | 单向关联、双向关联字段中关联的数据表的名字
back_field_name | string | 双向关联字段中关联的数据表中对应的双向关联字段的名字
input_type | string | 地理位置输入限制
back_field_id | string | 双向关联字段中关联的数据表中对应的双向关联字段的id
auto_serial | bitable.table.field_action.value.property.auto_serial | 自动编号类型
type | string | 自动编号类型
options | bitable.table.field_action.value.property.auto_serial.options\[\] | 自动编号规则列表
type | string | 自动编号的可选规则项类型
value | string | 与类型相对应的取值
options | bitable.table.field_action.value.property.option\[\] | 单选、多选字段的选项信息
name | string | 选项名
id | string | 选项 ID
color | int | 选项颜色
formula_expression | string | 公式字段的公式表达式
after_value | bitable.table.field_action.value | 操作后的字段值
id | string | 字段 ID
name | string | 字段名字
type | int | 字段类型
description | string | 字段描述
property | bitable.table.field_action.value.property | 字段属性
formatter | string | 数字、公式字段的显示格式
date_formatter | string | 日期、创建时间、最后更新时间字段的显示格式
auto_fill | boolean | 日期字段中新纪录自动填写创建时间
multiple | boolean | 人员字段中允许添加多个成员，单向关联、双向关联中允许添加多个记录
table_id | string | 单向关联、双向关联字段中关联的数据表的ID
table_name | string | 单向关联、双向关联字段中关联的数据表的名字
back_field_name | string | 双向关联字段中关联的数据表中对应的双向关联字段的名字
input_type | string | 地理位置输入限制
back_field_id | string | 双向关联字段中关联的数据表中对应的双向关联字段的id
auto_serial | bitable.table.field_action.value.property.auto_serial | 自动编号类型
type | string | 自动编号类型
options | bitable.table.field_action.value.property.auto_serial.options\[\] | 自动编号规则列表
type | string | 自动编号的可选规则项类型
value | string | 与类型相对应的取值
options | bitable.table.field_action.value.property.option\[\] | 单选、多选字段的选项信息
name | string | 选项名
id | string | 选项 ID
color | int | 选项颜色
formula_expression | string | 公式字段的公式表达式
revision | int | 多维表格数据表的版本号
subscriber_id_list | user_id\[\] | 订阅用户 ID 列表
union_id | string | 订阅者的 Union ID
user_id | string | 订阅者的 User ID
open_id | string | 订阅者的 Open ID
update_time | int | 字段变更时间

### 事件体示例
```json
{
    "schema": "2.0",
    "header": {
        "event_id": "5e3702a84e847582be8db7fb73283c02",
        "event_type": "drive.file.bitable_field_changed_v1",
        "create_time": "1608725989000",
        "token": "rvaYgkND1GOiu5MM0E1rncYC6PLtF7JV",
        "app_id": "cli_9f5343c580712544",
        "tenant_key": "2ca1d211f64f6438"
    },
    "event": {
        "file_type": "bitable",
        "file_token": "bascntUPmnoH9kZbGJ8RWeabcef",
        "table_id": "tblWXe2d0I0abcef",
        "operator_id": {
            "union_id": "on_8ed6aa67826108097d9ee143816345",
            "user_id": "e33ggbyz",
            "open_id": "ou_84aad35d084aa403a838cf73ee18467"
        },
        "action_list": [
            {
                "action": "field_edited",
                "field_id": "fldmj5qNii",
                "before_value": {
                    "id": "fldmj5qNii",
                    "name": "field name",
                    "type": 20,
                    "description": "description",
                    "property": {
                        "formatter": "1,000",
                        "date_formatter": "yyyyMMdd",
                        "auto_fill": true,
                        "multiple": true,
                        "table_id": "tblIniLz0Ic8oXyN",
                        "table_name": "table name",
                        "back_field_name": "field name",
                        "input_type": "only_mobile",
                        "back_field_id": "fldmj5qNii",
                        "auto_serial": {
                            "type": "custom",
                            "options": [
                                {
                                    "type": "created_time",
                                    "value": "yyyyMMdd"
                                }
                            ]
                        },
                        "options": [
                            {
                                "name": "option name",
                                "id": "optabcef",
                                "color": 3
                            }
                        ],
                        "formula_expression": "bitable::$table[tblIniLz0Ic8oXyN].$field[fldqatAwxx]*6+333"
                    }
                },
                "after_value": {
                    "id": "fldmj5qNii",
                    "name": "field name",
                    "type": 20,
                    "description": "description",
                    "property": {
                        "formatter": "1,000",
                        "date_formatter": "yyyyMMdd",
                        "auto_fill": true,
                        "multiple": true,
                        "table_id": "tblIniLz0Ic8oXyN",
                        "table_name": "table name",
                        "back_field_name": "field name",
                        "input_type": "only_mobile",
                        "back_field_id": "fldmj5qNii",
                        "auto_serial": {
                            "type": "custom",
                            "options": [
                                {
                                    "type": "created_time",
                                    "value": "yyyyMMdd"
                                }
                            ]
                        },
                        "options": [
                            {
                                "name": "option name",
                                "id": "optabcef",
                                "color": 3
                            }
                        ],
                        "formula_expression": "bitable::$table[tblIniLz0Ic8oXyN].$field[fldqatAwxx]*6+333"
                    }
                }
            }
        ],
        "revision": 10,
        "subscriber_id_list": [
            {
                "union_id": "on_876b570a984d02ab1c0906a49e4abcef",
                "user_id": "638474b8",
                "open_id": "ou_9bc587355789fc049904ae7c736abcef"
            }
        ],
        "update_time": 1663727688
    }
}
```

### 事件订阅示例代码

事件订阅流程可参考：[事件订阅概述](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)，新手入门可参考：[教程](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-an-echo-bot/introduction)

  **

  

    
package main

import (
	"context"
	"fmt"

	larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
	larkevent "github.com/larksuite/oapi-sdk-go/v3/event"
	"github.com/larksuite/oapi-sdk-go/v3/event/dispatcher"
	"github.com/larksuite/oapi-sdk-go/v3/service/drive/v1"
	larkws "github.com/larksuite/oapi-sdk-go/v3/ws"
)

// SDK 使用说明 SDK user guide：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/golang-sdk-guide/preparations
func main() {
	// 注册事件 Register event
	eventHandler := dispatcher.NewEventDispatcher("", "").
		OnP2FileBitableFieldChangedV1(func(ctx context.Context, event *larkdrive.P2FileBitableFieldChangedV1) error {
			fmt.Printf("[ OnP2FileBitableFieldChangedV1 access ], data: %s\n", larkcore.Prettify(event))
			return nil
		})

	// 构建 client Build client
	cli := larkws.NewClient("YOUR_APP_ID", "YOUR_APP_SECRET",
		larkws.WithEventHandler(eventHandler),
		larkws.WithLogLevel(larkcore.LogLevelDebug),
	)

	// 建立长连接 Establish persistent connection
	err := cli.Start(context.Background())

	if err != nil {
		panic(err)
	}
}

    

    
# SDK 使用说明 SDK user guide：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/preparations-before-development
import lark_oapi as lark

def do_p2_drive_file_bitable_field_changed_v1(data: lark.drive.v1.P2DriveFileBitableFieldChangedV1) -> None:
    print(f'[ do_p2_drive_file_bitable_field_changed_v1 access ], data: {lark.JSON.marshal(data, indent=4)}')

# 注册事件 Register event
event_handler = lark.EventDispatcherHandler.builder("", "") \
    .register_p2_drive_file_bitable_field_changed_v1(do_p2_drive_file_bitable_field_changed_v1) \
    .build()

def main():
    # 构建 client Build client
    cli = lark.ws.Client("APP_ID", "APP_SECRET",
                        event_handler=event_handler, log_level=lark.LogLevel.DEBUG)
    # 建立长连接 Establish persistent connection
    cli.start()

if __name__ == "__main__":
    main()

    

    

package com.example.sample;

import com.lark.oapi.core.utils.Jsons;
import com.lark.oapi.service.drive.DriveService;
import com.lark.oapi.service.drive.v1.model.P2FileBitableFieldChangedV1;
import com.lark.oapi.event.EventDispatcher;
import com.lark.oapi.ws.Client;

// SDK 使用说明 SDK user guide：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/java-sdk-guide/preparations
public class Sample {
    // 注册事件 Register event
    private static final EventDispatcher EVENT_HANDLER = EventDispatcher.newBuilder("", "")
            .onP2FileBitableFieldChangedV1(new DriveService.P2FileBitableFieldChangedV1Handler() {
                @Override
                public void handle(P2FileBitableFieldChangedV1 event) throws Exception {
                    System.out.printf("[ onP2FileBitableFieldChangedV1 access ], data: %s\n", Jsons.DEFAULT.toJson(event.getEvent()));
                }
            })
            .build();

    public static void main(String[] args) {
        // 构建 client Build client
        Client client = new Client.Builder("APP_ID", "APP_SECRET")
                .eventHandler(EVENT_HANDLER)
                .build();
        // 建立长连接 Establish persistent connection
        client.start();
    }
}
    

    
// SDK 使用说明 SDK user guide：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/nodejs-sdk/preparation-before-development
import * as Lark from '@larksuiteoapi/node-sdk';
const baseConfig = {
    appId: 'APP_ID',
    appSecret: 'APP_SECRET'
}
// 构建 client Build client
const wsClient = new Lark.WSClient(baseConfig);
// 建立长连接 Establish persistent connection
wsClient.start({
    // 注册事件 Register event
    eventDispatcher: new Lark.EventDispatcher({}).register({
        'drive.file.bitable_field_changed_v1': async (data) => {
            console.log(data);
        }
    })
});
    

  
  

    
package main

import (
	"context"
	"fmt"
	"net/http"

	larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
	"github.com/larksuite/oapi-sdk-go/v3/core/httpserverext"
	larkevent "github.com/larksuite/oapi-sdk-go/v3/event"
	"github.com/larksuite/oapi-sdk-go/v3/event/dispatcher"
	"github.com/larksuite/oapi-sdk-go/v3/service/drive/v1"
)

// SDK 使用说明 SDK user guide：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/golang-sdk-guide/preparations
func main() {
	// 注册事件 Register event
	eventHandler := dispatcher.NewEventDispatcher("", "").
		OnP2FileBitableFieldChangedV1(func(ctx context.Context, event *larkdrive.P2FileBitableFieldChangedV1) error {
			fmt.Printf("[ OnP2FileBitableFieldChangedV1 access ], data: %s\n", larkcore.Prettify(event))
			return nil
		})

	// 创建路由处理器 Create route handler
	http.HandleFunc("/webhook/event", httpserverext.NewEventHandlerFunc(handler, larkevent.WithLogLevel(larkcore.LogLevelDebug)))

	err := http.ListenAndServe(":7777", nil)

	if err != nil {
		panic(err)
	}
}

    

    
# SDK 使用说明 SDK user guide：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/preparations-before-development
from flask import Flask
from lark_oapi.adapter.flask import *
import lark_oapi as lark

app = Flask(__name__)

def do_p2_drive_file_bitable_field_changed_v1(data: lark.drive.v1.P2DriveFileBitableFieldChangedV1) -> None:
    print(f'[ do_p2_drive_file_bitable_field_changed_v1 access ], data: {lark.JSON.marshal(data, indent=4)}')

# 注册事件 Register event
event_handler = lark.EventDispatcherHandler.builder("", "") \
    .register_p2_drive_file_bitable_field_changed_v1(do_p2_drive_file_bitable_field_changed_v1) \
    .build()

# 创建路由处理器 Create route handler
@app.route("/webhook/event", methods=["POST"])
def event():
    resp = event_handler.do(parse_req())
    return parse_resp(resp)

if __name__ == "__main__":
    app.run(port=7777)

    

    

package com.lark.oapi.sample.event;

import com.lark.oapi.core.utils.Jsons;
import com.lark.oapi.service.drive.DriveService;
import com.lark.oapi.service.drive.v1.model.P2FileBitableFieldChangedV1;
import com.lark.oapi.sdk.servlet.ext.ServletAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// SDK 使用说明 SDK user guide：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/java-sdk-guide/preparations
@RestController
public class EventController {

    // 注册事件 Register event
    private static final EventDispatcher EVENT_HANDLER = EventDispatcher.newBuilder("verificationToken", "encryptKey")
            .onP2FileBitableFieldChangedV1(new DriveService.P2FileBitableFieldChangedV1Handler() {
                @Override
                public void handle(P2FileBitableFieldChangedV1 event) throws Exception {
                    System.out.printf("[ onP2FileBitableFieldChangedV1 access ], data: %s\n", Jsons.DEFAULT.toJson(event.getEvent()));
                }
            })
            .build();

    // 注入 ServletAdapter 实例 Inject ServletAdapter instance
    @Autowired
    private ServletAdapter servletAdapter;

    // 创建路由处理器 Create route handler
    @RequestMapping("/webhook/event")
    public void event(HttpServletRequest request, HttpServletResponse response)
            throws Throwable {
        // 回调扩展包提供的事件回调处理器 Callback handler provided by the extension package
        servletAdapter.handleEvent(request, response, EVENT_DISPATCHER);
    }
}
    

    
// SDK 使用说明 SDK user guide：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/nodejs-sdk/preparation-before-development
import http from 'http';
import * as lark from '@larksuiteoapi/node-sdk';

// 注册事件 Register event
const eventDispatcher = new lark.EventDispatcher({
    encryptKey: '',
    verificationToken: '',
}).register({
    'drive.file.bitable_field_changed_v1': async (data) => {
        console.log(data);
        return 'success';
    },
});

const server = http.createServer();
// 创建路由处理器 Create route handler
server.on('request', lark.adaptDefault('/webhook/event', eventDispatcher));
server.listen(3000);
