# 多维表格记录变更

Source URL: https://open.feishu.cn/document/docs/bitable-v1/events/bitable_record_changed
Updated: 2025-11-17

# 多维表格记录变更

多维表格记录变更事件。被订阅的多维表格记录发生变更时，将会触发此事件。了解事件订阅的配置流程和使用场景，参考[事件概述](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)。

**注意事项**：- 多维表格中公式字段的值变化不会触发事件。
- 多维表格记录变更时，事件体中不含公式字段的值。
- 被订阅的多维表格字段发生变更时，也将同时触发[文件编辑](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/event/file-edited)事件。

## 注意事项

若应用是以应用身份（`tenant_access_token`） 订阅的事件，在接收事件时需要同时申请应用和用户两个身份接收事件的权限。换言之，要订阅本事件，你需要在开发者后台，为应用同时开通 **应用身份** 和 **用户身份** 的 `bitable:app` 或 `drive:drive` 权限。

## 前提条件

添加该事件之前，你需确保已调用[订阅云文档事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/subscribe)接口。

## 事件

基本 | &nbsp;
---|---
事件类型 | drive.file.bitable_record_changed_v1
支持的应用类型 | 自建应用、商店应用
权限要求<br>**订阅该事件所需的权限，开启其中任意一项权限即可订阅**<br>开启任一权限即可 | 检索特定记录(base:record:read)<br>查看、评论、编辑和管理多维表格(bitable:app)<br>查看、评论、编辑和管理云空间中所有文件(drive:drive)
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
file_type | string | 文件类型，即 bitable
file_token | string | 多维表格 token
table_id | string | 发生变更的数据表 ID
revision | int | 多维表格数据表的版本号
operator_id | user_id | 操作人 ID
union_id | string | 用户的 union id
user_id | string | 用户的 user id<br>**字段权限要求**：<br>获取用户 user ID(contact:user.employee_id:readonly)
open_id | string | 用户的 open id
action_list | bitable.table.record_action\[\] | 行变更操作列表
record_id | string | 发生变更的记录 ID
action | string | 支持的记录变更类型。枚举值有：<br>- record_added：新增行记录<br>- record_deleted：删除行记录<br>- record_edited：修改行记录
before_value | bitable.table.record_action.field\[\] | 发生变更前的记录值
field_id | string | 发生变更的字段 ID
field_value | string | 发生变更后的字段值。该字段为 JSON 序列化后的字符串，序列化前的结构请参考 [数据结构](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/bitable/development-guide/bitable-structure)。
field_identity_value | bitable.table.record_action.field.identity | 人员字段补充信息。有人员、创建人、修改人类型字段变更时返回
users | bitable.table.record_action.field.identity.user\[\] | 用户列表
user_id | user_id | 用户的 User ID
union_id | string | 用户的 union id
user_id | string | 用户的 user id<br>**字段权限要求**：<br>获取用户 user ID(contact:user.employee_id:readonly)
open_id | string | 用户的 open id
name | string | 用户名称
en_name | string | 用户英文名称
avatar_url | string | 用户头像 URL
after_value | bitable.table.record_action.field\[\] | 发生变更后的字段
field_id | string | 发生变更的字段 ID
field_value | string | 发生变更后的字段值。该字段为 JSON 序列化后的字符串，序列化前的结构请参考 [数据结构](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/bitable/development-guide/bitable-structure)。
field_identity_value | bitable.table.record_action.field.identity | 人员字段补充信息。有人员、创建人、修改人类型字段变更时返回
users | bitable.table.record_action.field.identity.user\[\] | 用户列表
user_id | user_id | 用户的 User ID
union_id | string | 用户的 union id
user_id | string | 用户的 user id<br>**字段权限要求**：<br>获取用户 user ID(contact:user.employee_id:readonly)
open_id | string | 用户的 open id
name | string | 用户名称
en_name | string | 用户英文名称
avatar_url | string | 用户头像 URL
subscriber_id_list | user_id\[\] | 订阅的用户列表
union_id | string | 订阅者的 Union ID
user_id | string | 订阅者的 User ID
open_id | string | 订阅者的 Open ID
update_time | int | 编辑时间（格式：时间戳；单位：秒）

### 事件体示例
```json
{
    "schema": "2.0",
    "header": {
        "event_id": "5e3702a84e847582be8db7fb73283c02",
        "event_type": "drive.file.bitable_record_changed_v1",
        "create_time": "1608725989000",
        "token": "rvaYgkND1GOiu5MM0E1rncYC6PLtF7JV",
        "app_id": "cli_9f5343c580712544",
        "tenant_key": "2ca1d211f64f6438"
    },
    "event": {
        "file_type": "bitable",
        "file_token": "bascnItn6oHUSEL8RDUdF6abcef",
        "table_id": "tblOaqBWfGeabcef",
        "revision": 41,
        "operator_id": {
            "union_id": "on_8ed6aa67826108097d9ee143816345",
            "user_id": "e33ggbyz",
            "open_id": "ou_84aad35d084aa403a838cf73ee18467"
        },
        "action_list": [
            {
                "record_id": "rec9sabcef",
                "action": "record_edited",
                "before_value": [
                    {
                        "field_id": "fld9Eabcef",
                        "field_value": "666",
                        "field_identity_value": {
                            "users": [
                                {
                                    "user_id": {
                                        "union_id": "on_8ed6aa67826108097d9ee143816345",
                                        "user_id": "e33ggbyz",
                                        "open_id": "ou_84aad35d084aa403a838cf73ee18467"
                                    },
                                    "name": "张敏",
                                    "en_name": "Zhangmin",
                                    "avatar_url": "https://internal-api-lark-file.feishu.cn/static-resource/v1/v2_q86-fcb6-4f18-85c7-87ca8881e50j~?image_size=72x72&amp;cut_type=default-face&amp;quality=&amp;format=jpeg&amp;sticker_format=.webp"
                                }
                            ]
                        }
                    }
                ],
                "after_value": [
                    {
                        "field_id": "fld9Eabcef",
                        "field_value": "666",
                        "field_identity_value": {
                            "users": [
                                {
                                    "user_id": {
                                        "union_id": "on_8ed6aa67826108097d9ee143816345",
                                        "user_id": "e33ggbyz",
                                        "open_id": "ou_84aad35d084aa403a838cf73ee18467"
                                    },
                                    "name": "张敏",
                                    "en_name": "Zhangmin",
                                    "avatar_url": "https://internal-api-lark-file.feishu.cn/static-resource/v1/v2_q86-fcb6-4f18-85c7-87ca8881e50j~?image_size=72x72&amp;cut_type=default-face&amp;quality=&amp;format=jpeg&amp;sticker_format=.webp"
                                }
                            ]
                        }
                    }
                ]
            }
        ],
        "subscriber_id_list": [
            {
                "union_id": "on_876b570a984d02ab1c0906a49e4abcef",
                "user_id": "638474b8",
                "open_id": "ou_9bc587355789fc049904ae7c736abcef"
            }
        ],
        "update_time": 1717040601
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
		OnP2FileBitableRecordChangedV1(func(ctx context.Context, event *larkdrive.P2FileBitableRecordChangedV1) error {
			fmt.Printf("[ OnP2FileBitableRecordChangedV1 access ], data: %s\n", larkcore.Prettify(event))
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

def do_p2_drive_file_bitable_record_changed_v1(data: lark.drive.v1.P2DriveFileBitableRecordChangedV1) -> None:
    print(f'[ do_p2_drive_file_bitable_record_changed_v1 access ], data: {lark.JSON.marshal(data, indent=4)}')

# 注册事件 Register event
event_handler = lark.EventDispatcherHandler.builder("", "") \
    .register_p2_drive_file_bitable_record_changed_v1(do_p2_drive_file_bitable_record_changed_v1) \
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
import com.lark.oapi.service.drive.v1.model.P2FileBitableRecordChangedV1;
import com.lark.oapi.event.EventDispatcher;
import com.lark.oapi.ws.Client;

// SDK 使用说明 SDK user guide：https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/java-sdk-guide/preparations
public class Sample {
    // 注册事件 Register event
    private static final EventDispatcher EVENT_HANDLER = EventDispatcher.newBuilder("", "")
            .onP2FileBitableRecordChangedV1(new DriveService.P2FileBitableRecordChangedV1Handler() {
                @Override
                public void handle(P2FileBitableRecordChangedV1 event) throws Exception {
                    System.out.printf("[ onP2FileBitableRecordChangedV1 access ], data: %s\n", Jsons.DEFAULT.toJson(event.getEvent()));
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
        'drive.file.bitable_record_changed_v1': async (data) => {
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
		OnP2FileBitableRecordChangedV1(func(ctx context.Context, event *larkdrive.P2FileBitableRecordChangedV1) error {
			fmt.Printf("[ OnP2FileBitableRecordChangedV1 access ], data: %s\n", larkcore.Prettify(event))
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

def do_p2_drive_file_bitable_record_changed_v1(data: lark.drive.v1.P2DriveFileBitableRecordChangedV1) -> None:
    print(f'[ do_p2_drive_file_bitable_record_changed_v1 access ], data: {lark.JSON.marshal(data, indent=4)}')

# 注册事件 Register event
event_handler = lark.EventDispatcherHandler.builder("", "") \
    .register_p2_drive_file_bitable_record_changed_v1(do_p2_drive_file_bitable_record_changed_v1) \
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
import com.lark.oapi.service.drive.v1.model.P2FileBitableRecordChangedV1;
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
            .onP2FileBitableRecordChangedV1(new DriveService.P2FileBitableRecordChangedV1Handler() {
                @Override
                public void handle(P2FileBitableRecordChangedV1 event) throws Exception {
                    System.out.printf("[ onP2FileBitableRecordChangedV1 access ], data: %s\n", Jsons.DEFAULT.toJson(event.getEvent()));
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
    'drive.file.bitable_record_changed_v1': async (data) => {
        console.log(data);
        return 'success';
    },
});

const server = http.createServer();
// 创建路由处理器 Create route handler
server.on('request', lark.adaptDefault('/webhook/event', eventDispatcher));
server.listen(3000);
