# 原生审批定义概述

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/approval/overview-of-approval-resources
Updated: 2025-04-21

# 原生审批定义概述

根据企业业务需要在飞书审批中心创建审批定义，用来定义一类审批的表单与流程，后续员工发起审批时，需要填写定义的表单，审批的流转也会按照定义的流程进行。例如，创建一个「请假」审批定义，定义提交审批时需要在表单内填写请假时间、请假理由、请假类型，且审批需要依次流转到员工的直属上级、人事进行审批。

## 基础概念

在正式开始使用原生审批定义 API 之前，请务必了解以下基本概念。

### 审批定义唯一编码 Approval Code

每一个审批定义都有一个唯一标识（Approval Code），在开发过程中如需使用指定的审批定义，则需要通过 Approval Code 定位审批定义。该标识可以在审批中心内查看，具体操作如下：

1. 进入审批管理后台的开发者模式（URL 后的 `?devMode=on` 参数表示开发者模式）。访问链接如下：

    [https://www.feishu.cn/approval/admin/approvalList?devMode=on](https://www.feishu.cn/approval/admin/approvalList?devMode=on)

2. 点击某一审批定义的编辑按钮，进入审批定义详情页。

	

3. 在浏览器地址栏获取 `definitionCode` 参数值，该值即为当前审批定义的 Approval Code。

	

### 审批表单 Form

审批表单用来定义员工在发起审批时需要填写的数据，表单内包括一个或多个控件，如文本控件、选项控件、日期控件等。通过 API 定义审批表单时，涉及的概念说明如下所述。

#### 审批控件 Widget

定义表单时需要依次定义各个控件，每个控件都有一个基础属性。

```
struct{
	String Id; //标识在一个审批定义中某一个控件的唯一 ID，由系统自动生成。
	String CustomId; //自定义控件 ID，标识在一个审批定义中某一个控件的唯一 ID，在审批中心开发者模式下自定义设置。
	String Name; //该控件的名称。
	String Type; //该控件的类型。
} 
```

#### 控件自定义 ID

1. 进入审批管理后台的开发者模式（URL 后的 `?devMode=on` 参数表示开发者模式）。访问链接如下：

    [https://www.feishu.cn/approval/admin/approvalList?devMode=on](https://www.feishu.cn/approval/admin/approvalList?devMode=on)

2. 在编辑某一审批定义的表单控件时，指定自定义 ID。

		

#### 控件类型

|控件类型|说明|
|-|-|
|单行文本|用于填写一个单行文本|
|多行文本|用于填写一个多行文本|
|数字|用于填写一个数字|
|金额|用于填写审批金额数量及单位，默认单位为CNY|
|日期|用于填写详细时间|
|日期区间|用于填写一个日期区间，包括有开始时间、结束时间以及持续时间|
|单选|用于选择单个选择|
|多选框|用于选择多个选择|
|地址|用于填写一个地址|
|联系人|用于在审批中添加联系人|
|说明|用于在审批定义中添加说明（如填写规范、注意事项），在发起审批时不可编辑|
|明细|用于填写明细信息，在明细中可以添加其他控件比如数字、金额等。在创建审批定义时设计一个明细控件表示明细的一个条目中包括哪些控件，发起人可以根据自身需求增加条目，每一个条目都和创建审批定义时所设明细控件一致|
|计算公式|在创建审批定义时设计计算方式，表示该控件的值依赖于其他控件（数字、金额）计算得出|
|图片|用于在审批中添加图片|
|附件|用于在审批中添加附件，如文件等|
|关联|用于在当前审批中关联其他审批，使审批人能够在审批时查看所关联审批的概况|
|请假|用于填写请假审批的相关内容，包括选择请假类型（如病假、产假等，请假类型需要管理员提前在假期管理中设置并在创建审批定义时选择当前审批定义发起实例时可选种类有哪些），填写请假开始时间，填写请假结束时间以及请假时长|
|加班|用于填写加班申请的相关内容，包括选择加班类型（比如调休、带薪、不带薪等，由管理员在创建审批定义时设定），填写加班开始/结束时间和时长以及填写加班原因|
|换班|用于填写换班审批的相关内容，包括填写换班时间以及填写换班原因|
|出差|用于填写出差审批的相关内容，包括填写行程（一段行程中包括行程开始时间、行程结束时间、行程时长、出发地、目的地、交通方式、单程/往返以及备注，其中行程时长以自然日为单位计算，并且倘若出差有多段行程，可以由发起人手动增加新的一段行程），出差总时长，出差原因以及同行人|
|补卡|用于填写补卡审批的相关内容，包括填写补卡时间和填写补卡原因

### 审批流程 Process

一个审批定义对应一个审批流程，一个审批流程对应多个审批节点。当员工发起审批实例后，审批将按照定义好的审批流程进行流转。在定义审批流程时，你需要指定流程中每一步（即审批节点）的审批操作，包括指定审批人或者设置为自动通过或自动拒绝。相关概念说明如下所述。

#### 审批节点

一个审批流程由多个审批节点构成，其中流程开头固定节点为 **提交** 节点，流程结束固定节点为 **结束** 节点，在流程中间允许设置一个或多个审批节点，审批流程将按照节点的顺序依次流转。

#### 节点自定义 ID

1. 进入审批管理后台的开发者模式（URL 后的 `?devMode=on` 参数表示开发者模式）。访问链接如下：

    [https://www.feishu.cn/approval/admin/approvalList?devMode=on](https://www.feishu.cn/approval/admin/approvalList?devMode=on)

2. 在编辑某一审批定义的流程节点时，指定节点的自定义 ID。

	

#### 审批方式

每一个节点均可以设置审批方式。支持的方式如下：

- **人工审批**：设置指定的审批人，当流程流转到该节点时，系统会为审批人生成审批任务，只有当审批人人工处理任务后，流程才会继续流转。
- **自动通过**：当流程流转到该节点时自动通过。
- **自动拒绝**：当流程流转到该节点时自动拒绝。

## 字段说明

名称 | 类型 | 描述
---|---|---
approval_name | string | 审批名称的国际化文案 Key，以 @i18n@ 开头，长度不得少于 9 个字符。<br>**示例值**："@i18n@approval_name"
approval_code | string | 审批定义的唯一编码。创建定义时，传空值表示新建定义、传已有的 code 表示更新定义。<br>**示例值**："7C468A54-8745-2245-9675-08B7C63E7A85"
description | string | 审批描述的国际化文案 Key，以 @i18n@ 开头，长度不得少于 9 个字符。<br>**示例值**：@i18n@description
viewers | approval_create_viewers\[\] | 指定哪些成员可以从审批应用的前台发起该审批。<br>- 当 viewer_type 为 USER 时，需要在 viewer_user_id 填写用户 ID ，用于指定对哪个用户可见。<br>- 当 viewer_type 为 DEPARTMENT 时，需要在 viewer_department_id 填写部门 ID，用于指定对哪个部门可见。
viewer_type | string | 可见人类型<br>**示例值**："USER"<br>**可选值有**：<br>- TENANT：租户内可见<br>- DEPARTMENT：指定部门<br>- USER：指定用户<br>- NONE：任何人都不可见
viewer_user_id | string | 当 view_type 是 USER 时，需要填写指定的用户 ID。<br>**示例值**：19a294c2
viewer_department_id | string | 当 view_type 为DEPARTMENT，需要填写指定的部门 ID。<br>**示例值**："od-ac9d697abfa990b715dcc33d58a62a9d"
form | approval_form | 审批定义的表单
form_content | string | 表单内容，JSON 数组格式，数组内由一个或多个表单控件组成。<br>**示例值**："[{"id":"user_name", "type": "input", "required":true, "name":"@i18n@widget1"}]"
node_list | approval_node\[\] | 审批定义节点，即审批流程。流程的开始和结束有两个固定节点，因此该参数传值时，需要将开始节点作为 list 第一个元素，结束节点作为 list 最后一个元素。
id | string | 节点 ID。开始节点的 ID 为 START，结束节点的 ID 为 END，开始和结束节点不需要指定 name、node_type 以及 approver 参数值。<br>**示例值**："START"
name | string | 节点名称的国际化文案 Key，以 @i18n@ 开头，长度不得少于 9 个字符。<br>**示例值**："@i18n@node_name"
node_type | string | 审批类型枚举，当 node_type 为依次审批（SEQUENTIAL）时，审批人 approval.type 必须为发起人自选（Free）。<br>**示例值**："AND"<br>**可选值有**：<br>- AND：会签<br>- OR：或签<br>- SEQUENTIAL：依次审批
approver | approval_approver_ccer\[\] | 审批人列表
type | string | 审批节点上的审批人。<br>- 当 type 为 Supervisor、SupervisorTopDown、DepartmentManager、DepartmentManagerTopDown 这 4 种时，需要在 level 中填写对应的级数，例如：由下往上三级主管审批，level 取值为 3。<br>- 当 type 为 Personal 时，需要填写 user_id，用于指定用户。<br>- 当 type 为 Free 时，不需要指定 user_id、level 参数值。<br>**示例值**："Supervisor"<br>**可选值有**：<br>- Supervisor：主管审批（由下往上）<br>- SupervisorTopDown：主管审批（从上往下）<br>- DepartmentManager：部门负责人审批（由下往上）<br>- DepartmentManagerTopDown：部门负责人审批（从上往下）<br>- Personal：指定成员<br>- Free：发起人自选
user_id | string | 用户 ID<br>**示例值**："f7cb567e"
level | string | 审批级数，当 type 为 Supervisor、SupervisorTopDown、DepartmentManager 、DepartmentManagerTopDown 这 4 种时，需要在 level 中填写对应的级数，例如：由下往上三级主管审批，level 取值 3。<br>**示例值**："3"
ccer | approval_approver_ccer\[\] | 抄送人列表
type | string | 节点的抄送人。<br>- 当 type 为 Supervisor、SupervisorTopDown、DepartmentManager 、DepartmentManagerTopDown 这 4 种时，需要在 level 中填写对应的级数，例如：抄送由下往上三级主管，level 取值 3。<br>- 当 type 为 Personal 时，需要填写 user_id，用于指定用户。<br>- 抄送人不支持设置为发起人自选。<br>**示例值**："Supervisor"<br>**可选值有**：<br>- Supervisor：主管审批（由下往上）<br>- SupervisorTopDown：主管审批（从上往下）<br>- DepartmentManager：部门负责人审批（由下往上）<br>- DepartmentManagerTopDown：部门负责人审批（从上往下）<br>- Personal：指定成员
user_id | string | 用户 ID<br>**示例值**："f7cb567e"
level | string | 抄送人级数，当 type 为 Supervisor、SupervisorTopDown、DepartmentManager 、DepartmentManagerTopDown 这 4 种时，需要在 level 中填写对应的级数，例如：抄送由下往上三级主管，level 取值 3。<br>**示例值**："3"
privilege_field | field_group | 表单项的控件权限
writable | string\[\] | 可写权限的表单项的 ID 列表<br>**示例值**：9293493
readable | string\[\] | 可读权限的表单项的 ID 列表<br>**示例值**：9293493
settings | approval_setting | 审批定义其他设置
revert_interval | int | 审批实例通过后允许撤回的时间，以秒为单位。默认 31 天，0 为不可撤回。<br>**示例值**：0
revert_option | int | 是否支持审批通过第一个节点后撤回，默认为1。<br>- 0：不支持<br>- 1：支持<br>**示例值**：0
config | approval_config | 审批定义配置项，用于配置对应审批定义是否可以由用户在审批后台进行修改。
can_update_viewer | boolean | 是否允许用户修改可见范围<br>**示例值**：false
can_update_form | boolean | 是否允许用户更新表单<br>**示例值**：false
can_update_process | boolean | 是否允许用户更新流程定义<br>**示例值**：false
can_update_revert | boolean | 是否允许用户更新撤回设置<br>**示例值**：false
help_url | string | 帮助文档链接<br>**示例值**："https://www.baidu.com"
icon | int | 审批图标枚举，默认为 0。下图从左至右，从上到下依次为 0~24 号图标。<br><br>**示例值**：0<br>**默认值**：`0`
i18n_resources | i18n_resource\[\] | 国际化文案
locale | string | 语言可选值有<br>**示例值**："zh-CN"<br>**可选值有**：<br>- zh-CN：中文<br>- en-US：英文<br>- ja-JP：日文
texts | i18n_resource_text\[\] | 文案的 key，value 值，i18n key 以 @i18n@ 开头。该字段主要用于做国际化，允许用户同时传多个语言的文案，审批中心会根据用户当前的语音环境使用对应的文案，如果没有传用户当前语音环境的文案，则会使用默认的语言文案。
key | string | 文案的 key，国际化文案 key 以 @i18n@ 开头。<br>**示例值**："@i18n@1"
value | string | 文案内容<br>**示例值**："people"
is_default | boolean | 当前文案是否为默认语言。默认语言需要包含所有 key，非默认语言如果 key 不存在会使用默认语言代替。<br>**示例值**：true

## 数据示例

```json
{
    "approval_name": "@i18n@approval_name",
    "approval_code": "813718CE-F38D-45CA-A5C1-ACF4F564B526",
    "viewers":[
        {
            "viewer_type":"TENANT",
            "viewer_user_id":""
        }
    ],
    "form": {
        "form_content": "[{\"id\":\"111\",\"name\":\"@i18n@event_name\",\"required\":true,\"type\":\"input\"},{\"id\":\"222\",\"name\":\"@i18n@time_interval\",\"required\":true,\"type\":\"dateInterval\",\"value\":{\"format\":\"YYYY-MM-DD hh:mm\",\"intervalAllowModify\":false}},{\"id\":\"333\",\"name\":\"@i18n@event_type\",\"type\":\"radioV2\",\"value\":[{\"key\":\"1\",\"text\":\"@i18n@recurrence_event\"},{\"key\":\"2\",\"text\":\"@i18n@single_event\"}]},{\"id\":\"444\",\"name\":\"@i18n@attende_count\",\"required\":true,\"type\":\"number\"},{\"id\":\"555\",\"name\":\"@i18n@apply_reason\",\"required\":true,\"type\":\"textarea\"}]"
        },

    "node_list": [{
          "id": "START",
          "privilege_field":{ 
				 "writable": ["111","222"],
				 "readable": ["111","222"]
		  }
        },{
          "id": "7106864726566",
          "privilege_field":{ 
				 "writable": ["111","222"],
				 "readable": ["111","222"]
		  },
          "name": "@i18n@node_name",
          "node_type": "AND",
          "approver": [
            {
              "type": "Personal",
              "user_id": "59a92c4a"
            }
          ],
          "ccer": [
            {
              "type": "Supervisor",
              "level": "2"
            }
          ]
        },{
          "id": "END"
        }],
    "settings" : {
          "revert_interval":0
        },
    "config" : {
          "can_update_viewer": false,
          "can_update_form": true,
          "can_update_process": true,
          "can_update_revert": true,
          "help_url":"https://www.baidu.com"
        },
    "icon": 1,
    "i18n_resources" : [{
          "locale": "zh-CN",
          "texts" : [
              {"key":"@i18n@approval_name","value":"审批名称"},
              {"key":"@i18n@event_name","value":"日程名称"},
              {"key":"@i18n@node_name","value":"审批"},
              {"key":"@i18n@time_interval","value":"日程名称"},
              {"key":"@i18n@event_type","value":"日程类型"},
              {"key":"@i18n@recurrence_event","value":"重复性日程"},
              {"key":"@i18n@single_event","value":"单次日程"},
              {"key":"@i18n@attende_count","value":"参与人数量"},
              {"key":"@i18n@apply_reason","value":"申请原因"}
            ],
          "is_default": true
        }]
}
```
