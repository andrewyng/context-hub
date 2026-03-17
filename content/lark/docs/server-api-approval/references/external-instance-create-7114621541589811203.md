# 同步三方审批实例

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/external_instance/create
Updated: 2025-07-18

# 同步三方审批实例

审批中心不负责审批的流转，审批的流转在三方系统。本接口用于把三方系统在审批流转后生成的审批实例、审批任务、审批抄送数据同步到审批中心。

## 实现效果

调用本接口同步三方审批实例后，企业员工可以在审批中心浏览同步过来的审批实例、任务、抄送信息，并可以跳转回三方系统查看和操作审批，其中，实例信息在审批中心的 **已发起** 列表、任务信息在 **待办** 和 **已办** 列表、抄送信息在 **抄送我** 列表。

[创建三方审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_approval/create)时如果设置了三方审批回调 URL，对于审批任务，可以配置[三方快捷审批回调](https://open.feishu.cn/document/ukTMukTMukTM/ukjNyYjL5YjM24SO2IjN/quick-approval-callback)，这样审批人可以在审批中心直接进行审批操作，审批中心会将审批结果回调至三方系统，三方系统收到回调后更新任务信息，并将新的任务信息同步回审批中心，形成闭环。

## 注意事项

需确保审批实例内各类实体（实例、任务、抄送） ID 在审批实例内的唯一性，不属于同一实体之间的 ID 也要确保唯一性。如果实例 ID、任务 ID、抄送 ID 重复，则会导致在审批中心任务看不到对应的审批数据。

## 请求

基本 | &nbsp;
---|---
HTTP URL | https://open.feishu.cn/open-apis/approval/v4/external_instances
HTTP Method | POST
接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN)
支持的应用类型 | 自建应用、商店应用
权限要求<br>**调用该 API 所需的权限。开启其中任意一项权限即可调用**<br>开启任一权限即可 | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除三方审批实例相关信息(approval:external_instance)

### 请求头

名称 | 类型 | 必填 | 描述
---|---|---|---
Authorization | string | 是 | `tenant_access_token`<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use)
Content-Type | string | 是 | **固定值**："application/json; charset=utf-8"

### 请求体

名称 | 类型 | 必填 | 描述
---|---|---|---
approval_code | string | 是 | 审批定义 Code。[创建三方审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_approval/create)的返回值，用来指定当前实例属于的审批定义。<br>**说明**：如果在当前接口设置了 title 参数，则审批实例名称按照 title 展示。如果未设置 title，审批实例的标题取自对应审批定义（approval_code）的 name 参数。<br>**示例值**："81D31358-93AF-92D6-7425-01A5D67C4E71"
status | string | 是 | 审批实例状态<br>**示例值**："PENDING"<br>**可选值有**：<br>- PENDING：审批中<br>- APPROVED：审批流程结束，结果为同意<br>- REJECTED：审批流程结束，结果为拒绝<br>- CANCELED：审批发起人撤回<br>- DELETED：审批被删除<br>- HIDDEN：状态隐藏（不显示状态）<br>- TERMINATED：审批终止
extra | string | 否 | 审批实例扩展参数，JSON 格式，传值时需要压缩转义为字符串。单据编号通过传 business_key 参数来实现。<br>**注意**：以下示例值未转义，使用时请注意转义。你可查看请求体示例中转义后的 extra 示例值。<br>**示例值**："{\"xxx\":\"xxx\",\"business_key\":\"xxx\"}"
instance_id | string | 是 | 审批实例唯一标识，自定义设置。需确保证在当前企业和应用内唯一。<br>**示例值**："24492654"
links | external_instance_link | 是 | 审批实例链接信息。设置的链接用于在审批中心 **已发起** 列表内点击跳转，跳回三方审批系统查看审批详情。
pc_link | string | 是 | PC 端的三方审批实例跳转链接。<br>**说明**：      <br>- 当用户使用飞书 PC 端查看实例详情时，通过该链接进行跳转。<br>- pc_link 和 mobile_link 至少填一个。<br>**示例值**："https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc/pages/detail?id=1234"
mobile_link | string | 否 | 移动端的三方审批实例跳转链接。<br>**说明**：      <br>- 当用户使用飞书移动端查看实例详情时，通过该链接进行跳转。<br>- pc_link 和 mobile_link 至少填一个。<br>**示例值**："https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages/detail?id=1234"
title | string | 否 | 审批展示名称。<br>**说明**：<br>- 如果填写了该参数，则审批列表中的审批名称使用该参数。如果不填该参数，则审批名称使用审批定义的名称。<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 @i18n@ 开头。<br>**示例值**："@i18n@1"
form | external_instance_form\[\] | 否 | 用户提交审批时填写的表单数据，用于所有审批列表中展示。可传多个值，最多展示前 3 个，长度不超过 2048 字符。<br><br>**示例值**：[{ "name": "@i18n@2", "value": "@i18n@3" }]
name | string | 否 | 表单字段名称。<br>**说明**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 @i18n@ 开头。<br>**示例值**："@i18n@2"
value | string | 否 | 表单值。<br>**说明**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 @i18n@ 开头。<br>**示例值**："@i18n@3"
user_id | string | 否 | 审批发起人 user_id。发起人可在审批中心的 **已发起** 列表中看到所有已发起的审批。在 **待办**、**已办**、**抄送我** 列表中，该字段用来展示审批的发起人。获取方式参见[如何获取用户的 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)。<br>**注意**：审批发起人的 open_id 和 user_id 需至少传入一个。<br>**示例值**："a987sf9s"
user_name | string | 否 | 审批发起人的用户名。如果发起人不是真实的用户（例如是某个部门），没有 user_id，则可以使用该参数传入一个名称。<br>**说明**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 @i18n@ 开头。<br>**示例值**："@i18n@9"
open_id | string | 否 | 审批发起人 open_id。发起人可在审批中心的 **已发起** 列表中看到所有已发起的审批。在 **待办**、**已办**、**抄送我** 列表中，该字段用来展示审批的发起人。获取方式参见[如何获取用户的 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)。<br>**注意**：审批发起人的 open_id 和 user_id 需至少传入一个。<br>**示例值**："ou_be73cbc0ee35eb6ca54e9e7cc14998c1"
department_id | string | 否 | 发起人的部门 ID，用于在审批中心列表中展示发起人的所属部门，不传值则不展示。获取方式参见[部门 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/field-overview#9c02ed7a)。<br>**说明**：如果用户没加入任何部门，传 `""`，默认展示企业名称。如果传入 department_name 参数，则展示对应的部门名称。<br>**示例值**："od-8ec33278bc2"
department_name | string | 否 | 审批发起人的部门名称。如果发起人不是真实的用户或没有部门，则可以使用该参数传入部门名称。<br>**说明**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 @i18n@ 开头。<br>**示例值**："@i18n@10"
start_time | string | 是 | 审批发起时间，Unix 毫秒时间戳。<br>**示例值**："1556468012678"
end_time | string | 是 | 审批实例结束时间。未结束的审批为 0，Unix 毫秒时间戳。<br>**示例值**："1556468012678"
update_time | string | 是 | 审批实例最近更新时间，Unix 毫秒时间戳，用于推送数据版本控制。如果 update_mode 值为 UPDATE，则仅当传过来的 update_time 有变化时（变大），才会更新审批中心中的审批实例信息。<br>**说明**：使用该参数主要用来避免并发时，旧数据更新了新数据。<br>**示例值**："1556468012678"
display_method | string | 否 | 列表页打开审批实例的方式。<br>**示例值**："BROWSER"<br>**可选值有**：<br>- BROWSER：跳转系统默认浏览器打开<br>- SIDEBAR：飞书中侧边抽屉打开<br>- NORMAL：飞书内嵌页面打开<br>- TRUSTEESHIP：以托管打开（即托管在飞书审批中心打开）
update_mode | string | 否 | 更新方式。<br>- 当 update_mode 取值为 REPLACE 时，每次都以当前推送的数据为最终数据，会删掉审批中心中，不在本次推送数据中的多余的任务、抄送数据。<br>- 当 update_mode 取值为 UPDATE 时，不会删除审批中心的数据，而只进行新增、更新实例与任务数据。<br>**默认值**：REPLACE<br>**示例值**："UPDATE"<br>**可选值有**：<br>- REPLACE：全量替换<br>- UPDATE：增量更新
task_list | external_instance_task_node\[\] | 否 | 任务列表<br>**数据校验规则**：<br>- 最大长度：`300`
task_id | string | 是 | 审批实例内，审批任务的唯一标识，用于更新审批任务时定位数据。<br>**示例值**："112534"
user_id | string | 否 | 审批人 user_id，获取方式参见[如何获取用户的 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)。<br>**说明**：<br>- 该任务会出现在审批人的飞书审批中心 **待办** 或 **已办** 的列表中。<br>- user_id 与 open_id 需至少传入一个。<br>**示例值**："a987sf9s"
open_id | string | 否 | 审批人 open_id，获取方式参见[如何获取用户的 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)。<br>**说明**：<br>- 该任务会出现在审批人的飞书审批中心 **待办** 或 **已办** 的列表中。<br>- user_id 与 open_id 需至少传入一个。<br>**示例值**："ou_be73cbc0ee35eb6ca54e9e7cc14998c1"
title | string | 否 | 审批任务名称。<br>**说明**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 @i18n@ 开头。<br>**示例值**："@i18n@4"
links | external_instance_link | 是 | 在审批中心 **待办**、**已办** 中使用的三方审批跳转链接，用于跳转回三方审批系统查看任务详情。
pc_link | string | 是 | PC 端的跳转链接。<br>**说明**：<br>- 当用户使用飞书 PC 端查看任务详情时，通过该链接进行跳转。<br>- pc_link 和 mobile_link 至少填一个。<br>**示例值**："https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc/pages/detail?id=1234"
mobile_link | string | 否 | 移动端的跳转链接。<br>**说明**：<br>- 当用户使用飞书移动端查看任务详情时，通过该链接进行跳转。<br>- pc_link 和 mobile_link 至少填一个。<br>**示例值**："https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages/detail?id=1234"
status | string | 是 | 任务状态<br>**示例值**："PENDING"<br>**可选值有**：<br>- PENDING：待审批<br>- APPROVED：任务同意<br>- REJECTED：任务拒绝<br>- TRANSFERRED：任务转交<br>- DONE：任务通过但审批人未操作。审批人看不到该任务时，如需查看可抄送至该审批人。
extra | string | 否 | 扩展字段。JSON 格式，传值时需要压缩转义为字符串。<br>任务结束原因需传 complete_reason 参数，枚举值说明：<br>- approved：同意<br>- rejected：拒绝<br>- node_auto_reject：因逻辑判断产生的自动拒绝<br>- specific_rollback：退回（包括退回到发起人、退回到中间任一审批人）<br>- add：并加签（添加新审批人，与我一起审批）<br>- add_pre：前加签（添加新审批人，在我之前审批）<br>- add_post：后加签（添加新审批人，在我之后审批）<br>- delete_assignee：减签<br>- forward: 手动转交<br>- forward_resign：离职自动转交<br>- recall：撤销（撤回单据，单据失效）<br>- delete ：删除审批单<br>- admin_forward：管理员在后台操作转交<br>- system_forward：系统自动转交<br>- auto_skip：自动通过<br>- manual_skip：手动跳过<br>- submit_again：重新提交任务<br>- restart：重新启动流程<br>- others：其他<br>**示例值**："{\"xxx\":\"xxx\",\"complete_reason\":\"approved\"}"
create_time | string | 是 | 任务创建时间，Unix 毫秒时间戳。<br>**示例值**："1556468012678"
end_time | string | 是 | 任务完成时间。未结束的审批为 0，Unix 毫秒时间戳。<br>**示例值**："1556468012678"
update_time | string | 否 | 任务最近更新时间，Unix 毫秒时间戳，用于推送数据版本控制。如果 update_mode 值为 UPDATE，则仅当传过来的 update_time 有变化时（变大），才会更新审批中心中的审批任务信息。<br>**示例值**："1556468012678"
action_context | string | 否 | 操作上下文。当用户操作审批时，回调请求中会包含该参数，用于传递该任务的上下文数据。<br>**示例值**："123456"
action_configs | action_config\[\] | 否 | 任务级别的快捷审批操作配置。<br>**注意**：快捷审批目前仅支持在飞书移动端操作。
action_type | string | 是 | 操作类型。每个任务都可以配置两个操作（同意、拒绝或任意中的两个），操作会展示审批列表中。当用户操作时，回调请求会包含该字段，三方审批可接受到审批人的操作数据。<br>**可选值有**：<br>- APPROVE：同意<br>- REJECT：拒绝<br>- {KEY}：任意字符串。如果使用任意字符串，则需要提供 action_name<br>**示例值**："APPROVE"
action_name | string | 否 | 操作名称。如果 action_type 不等于 APPROVAL 或 REJECT，则必须提供该字段，用于展示特定的操作名称。<br>**说明**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 @i18n@ 开头。<br>**示例值**："@i18n@5"
is_need_reason | boolean | 否 | 是否需要审批意见。取值为 true 时，审批人在审批中心操作任务后，还需要跳转填写审批意见。<br>**示例值**：false
is_reason_required | boolean | 否 | 审批意见是否必填<br>**示例值**：false
is_need_attachment | boolean | 否 | 审批意见是否支持上传附件<br>**示例值**：false
display_method | string | 否 | 审批中心列表页打开审批任务的方式。<br>**示例值**："BROWSER"<br>**可选值有**：<br>- BROWSER：跳转系统默认浏览器打开<br>- SIDEBAR：飞书中侧边抽屉打开<br>- NORMAL：飞书内嵌页面打开<br>- TRUSTEESHIP：以托管模式打开
exclude_statistics | boolean | 否 | 三方审批任务是否不纳入效率统计。可选值有：<br>- true：不纳入效率统计<br>- false：纳入效率统计<br>**示例值**：false<br>**默认值**：`false`
node_id | string | 否 | 审批节点 ID。必须同时满足：<br>- 一个审批流程内，每个节点 ID 唯一。例如，一个流程下直属上级、隔级上级等节点的 node_id 均不一样。<br>- 同一个三方审批定义内，不同审批实例中的相同节点，node_id 要保持不变。例如，用户 A 和用户 B 分别发起了请假申请，这两个审批实例中的直属上级节点的 node_id 应该保持一致。<br>**示例值**："node"
node_name | string | 否 | 节点名称。<br>**说明**：<br>- 这里传入的是国际化文案 Key（即 i18n_resources.texts 参数中的 Key），还需要在 i18n_resources.texts 参数中以 Key:Value 格式进行赋值。<br>- Key 需要以 @i18n@ 开头。<br>**示例值**："i18n@name"
generate_type | string | 否 | 任务生成类型，可不填， 但是不要填空字符串<br>**示例值**："EXTERNAL_CONSIGN"<br>**可选值有**：<br>- EXTERNAL_CONSIGN：给代理人生成的任务<br>- DEFAULT：系统生成的默认任务
cc_list | cc_node\[\] | 否 | 抄送列表<br>**数据校验规则**：<br>- 最大长度：`200`
cc_id | string | 是 | 审批实例内抄送唯一标识。<br>**示例值**："123456"
user_id | string | 否 | 抄送人的 user_id。获取方式参见[如何获取用户的 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)。<br>**注意**：抄送人的 open_id 和 user_id 需至少传入一个。<br>**示例值**："12345"
open_id | string | 否 | 抄送人的 open_id。获取方式参见[如何获取用户的 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)。<br>**注意**：抄送人的 open_id 和 user_id 需至少传入一个。<br>**示例值**："ou_be73cbc0ee35eb6ca54e9e7cc14998c1"
links | external_instance_link | 是 | 审批抄送跳转链接。设置的链接用于在审批中心 **抄送我** 列表内点击跳转，跳回三方审批系统查看审批抄送详情。
pc_link | string | 是 | PC 端的三方审批实例跳转链接。<br>**说明**：      <br>- 当用户使用飞书 PC 端查看审批抄送时，通过该字段进行跳转。<br>- pc_link 和 mobile_link 至少填一个。<br>**示例值**："https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc/pages/detail?id=1234"
mobile_link | string | 否 | 移动端的三方审批实例跳转链接。<br>**说明**：      <br>- 当用户使用飞书移动端查看审批抄送时，通过该字段进行跳转。<br>- pc_link 和 mobile_link 至少填一个。<br>**示例值**："https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages/detail?id=1234"
read_status | string | 是 | 抄送人的阅读状态<br>**示例值**："READ"<br>**可选值有**：<br>- READ：已读<br>- UNREAD：未读
extra | string | 否 | 扩展字段。JSON 格式，传值时需要压缩转义为字符串。<br>**示例值**："{\"xxx\":\"xxx\"}"
title | string | 否 | 抄送任务名称。<br>**示例值**："xxx"
create_time | string | 是 | 抄送发起时间，Unix 毫秒时间戳。<br>**示例值**："1556468012678"
update_time | string | 是 | 抄送最近更新时间，Unix 毫秒时间戳，用于推送数据版本。如果 update_mode 值为 UPDATE，则仅当传过来的 update_time 有变化时（变大），才会更新审批中心中的审批实例信息。<br>**示例值**："1556468012678"
display_method | string | 否 | 列表页打开审批任务的方式。<br>**示例值**："BROWSER"<br>**可选值有**：<br>- BROWSER：跳转系统默认浏览器打开<br>- SIDEBAR：飞书中侧边抽屉打开<br>- NORMAL：飞书内嵌页面打开<br>- TRUSTEESHIP：以托管模式打开
i18n_resources | i18n_resource\[\] | 是 | 国际化文案
locale | string | 是 | 语言<br>**示例值**："zh-CN"<br>**可选值有**：<br>- zh-CN：中文<br>- en-US：英文<br>- ja-JP：日文<br>- zh-HK：繁体中文（中国香港）<br>- zh-TW：繁体中文（中国台湾）<br>- de-DE：德语<br>- es-ES：西班牙语<br>- fr-FR：法语<br>- id-ID：印度尼西亚语<br>- it-IT：意大利语<br>- ko-KR：韩语<br>- pt-BR：葡萄牙语<br>- th-TH：泰语<br>- vi-VN：越南语<br>- ms-MY：马来语<br>- ru-RU：俄语
texts | i18n_resource_text\[\] | 是 | 文案的 Key:Value。Key 需要以 @i18n@ 开头，并按照各个参数的要求传入 Value。该字段主要用于做国际化，允许用户同时传多个语言的文案，审批中心会根据用户当前的语言环境使用对应的文案，如果没有传用户当前的语言环境文案，则会使用默认的语言文案。<br>**示例值**：{ "@i18n@1": "权限申请", "@i18n@2": "OA审批", "@i18n@3": "Permission" }
key | string | 是 | 文案 Key，需要和各个参数 Key 相匹配。<br>**示例值**："@i18n@1"
value | string | 是 | 文案 Value，即文案 Key 对应的参数值。<br>**示例值**："people"
is_default | boolean | 是 | 是否为默认语言。默认语言需要包含所有所需的文案 Key，非默认语言如果 Key 不存在，则会使用默认语言代替。<br>**示例值**：true
trusteeship_url_token | string | 否 | 单据托管认证 token，托管回调会附带此 token，帮助业务认证。<br>**示例值**："788981c886b1c28ac29d1e68efd60683d6d90dfce80938ee9453e2a5f3e9e306"
trusteeship_user_id_type | string | 否 | 用户的类型，会影响请求参数用户标识域的选择，包括加签操作回传的目标用户， 目前仅支持 user_id。<br>**示例值**："user_id"
trusteeship_urls | trusteeship_urls | 否 | 单据托管回调接入方的接口 URL 地址。
form_detail_url | string | 否 | 获取表单 schema 相关数据的 URL 地址。<br>**示例值**："https://#{your_domain}/api/form_detail"
action_definition_url | string | 否 | 表示获取审批操作区数据的 URL 地址。<br>**示例值**："https://#{your_domain}/api/action_definition"
approval_node_url | string | 否 | 获取审批记录相关数据的 URL 地址。<br>**示例值**："https://#{your_domain}/api/approval_node"
action_callback_url | string | 否 | 进行审批操作时回调的 URL 地址。<br>**示例值**："https://#{your_domain}/api/action_callback"
pull_business_data_url | string | 否 | 获取托管动态数据 URL 地址。使用该接口时，必须要保证历史托管单据的数据中都同步了该接口地址。如果历史单据中没有该接口，需要重新同步历史托管单据的数据来更新该 URL。该接口用于飞书审批前端和业务进行交互使用，只有使用审批前端的特定组件（由飞书审批前端提供的组件，并且需要和业务进行接口交互的组件）才会需要。<br>**示例值**："https://#{your_domain}/api/pull_business_data"
trusteeship_cache_config | trusteeship_instance_cache_config | 否 | 托管预缓存策略。
form_policy | string | 否 | 托管预缓存策略。<br>**示例值**："DISABLE"<br>**可选值有**：<br>- DISABLE：不启用，默认<br>- IMMUTABLE：表单不会随流程进行改变<br>- BY_NODE：跟随流程节点变更更新缓存<br>- BY_USER：对于每个待办任务存储一份
form_vary_with_locale | boolean | 否 | 表单是否随国际化改变。<br>**示例值**：false
form_version | string | 否 | 当前使用的表单版本号，保证表单改变后，版本号增加，实际值为 int64 整数。<br>**示例值**："1"
resource_region | string | 否 | 资源所在地区， 内部统计用字段， 不需要填<br>**示例值**："cn"

### 请求体示例
```json
{
    "approval_code": "81D31358-93AF-92D6-7425-01A5D67C4E71",
    "status": "PENDING",
    "extra": "{\"xxx\":\"xxx\",\"business_key\":\"xxx\"}",
    "instance_id": "24492654",
    "links": {
        "pc_link": "https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc/pages/detail?id=1234",
        "mobile_link": "https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages/detail?id=1234"
    },
    "title": "@i18n@1",
    "form": [
        {
            "name": "@i18n@2",
            "value": "@i18n@3"
        }
    ],
    "user_id": "a987sf9s",
    "user_name": "@i18n@9",
    "open_id": "ou_be73cbc0ee35eb6ca54e9e7cc14998c1",
    "department_id": "od-8ec33278bc2",
    "department_name": "@i18n@10",
    "start_time": "1556468012678",
    "end_time": "1556468012678",
    "update_time": "1556468012678",
    "display_method": "BROWSER",
    "update_mode": "UPDATE",
    "task_list": [
        {
            "task_id": "112534",
            "user_id": "a987sf9s",
            "open_id": "ou_be73cbc0ee35eb6ca54e9e7cc14998c1",
            "title": "@i18n@4",
            "links": {
                "pc_link": "https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc/pages/detail?id=1234",
                "mobile_link": "https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages/detail?id=1234"
            },
            "status": "PENDING",
            "extra": "{\"xxx\":\"xxx\",\"complete_reason\":\"approved\"}",
            "create_time": "1556468012678",
            "end_time": "1556468012678",
            "update_time": "1556468012678",
            "action_context": "123456",
            "action_configs": [
                {
                    "action_type": "APPROVE",
                    "action_name": "@i18n@5",
                    "is_need_reason": false,
                    "is_reason_required": false,
                    "is_need_attachment": false
                }
            ],
            "display_method": "BROWSER",
            "exclude_statistics": false,
            "node_id": "node",
            "node_name": "i18n@name",
            "generate_type": "EXTERNAL_CONSIGN"
        }
    ],
    "cc_list": [
        {
            "cc_id": "123456",
            "user_id": "12345",
            "open_id": "ou_be73cbc0ee35eb6ca54e9e7cc14998c1",
            "links": {
                "pc_link": "https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc/pages/detail?id=1234",
                "mobile_link": "https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages/detail?id=1234"
            },
            "read_status": "READ",
            "extra": "{\"xxx\":\"xxx\"}",
            "title": "xxx",
            "create_time": "1556468012678",
            "update_time": "1556468012678",
            "display_method": "BROWSER"
        }
    ],
    "i18n_resources": [
        {
            "locale": "zh-CN",
            "texts": [
                {
                    "key": "@i18n@1",
                    "value": "people"
                }
            ],
            "is_default": true
        }
    ],
    "trusteeship_url_token": "788981c886b1c28ac29d1e68efd60683d6d90dfce80938ee9453e2a5f3e9e306",
    "trusteeship_user_id_type": "user_id",
    "trusteeship_urls": {
        "form_detail_url": "https://#{your_domain}/api/form_detail",
        "action_definition_url": "https://#{your_domain}/api/action_definition",
        "approval_node_url": "https://#{your_domain}/api/approval_node",
        "action_callback_url": "https://#{your_domain}/api/action_callback",
        "pull_business_data_url": "https://#{your_domain}/api/pull_business_data"
    },
    "trusteeship_cache_config": {
        "form_policy": "DISABLE",
        "form_vary_with_locale": false,
        "form_version": "1"
    },
    "resource_region": "cn"
}
```

## 响应

### 响应体

名称 | 类型 | 描述
---|---|---
code | int | 错误码，非 0 表示失败
msg | string | 错误描述
data | \- | \-
data | external_instance | 同步的实例数据
approval_code | string | 审批定义 Code
status | string | 审批实例状态<br>**可选值有**：<br>- PENDING：审批中<br>- APPROVED：审批流程结束，结果为同意<br>- REJECTED：审批流程结束，结果为拒绝<br>- CANCELED：审批发起人撤回<br>- DELETED：审批被删除<br>- HIDDEN：状态隐藏（不显示状态）<br>- TERMINATED：审批终止
extra | string | 审批实例扩展 JSON。单据编号通过传 business_key 字段来实现。
instance_id | string | 审批实例唯一标识，与请求时传入的 instance_id 一致。
links | external_instance_link | 审批实例链接信息。设置的链接用于在审批中心 **已发起** 列表内点击跳转，跳回三方审批系统查看审批详情。
pc_link | string | PC 端的三方审批实例跳转链接。当用户使用飞书 PC 端查看实例详情时，通过该链接进行跳转。
mobile_link | string | 移动端的三方审批实例跳转链接。当用户使用飞书移动端查看实例详情时，通过该链接进行跳转。
title | string | 审批展示名称。<br>**说明**：<br>- 如果请求时传入了 title 参数，则审批列表中的审批名称使用该参数值。如果请求时未传入 title 参数，则审批名称使用审批定义的名称。<br>- 这里返回的是 i18n_resources.texts 参数的 key，对应的取值需要参见返回的 i18n_resources.texts.value。
form | external_instance_form\[\] | 用户提交审批时填写的表单数据，用于所有审批列表中展示。可传多个值，最多展示前 3 个。
name | string | 表单字段名称。这里返回的是 i18n_resources.texts 参数的 key，对应的取值需要参见返回的 i18n_resources.texts.value。
value | string | 表单值。这里返回的是 i18n_resources.texts 参数的 key，对应的取值需要参见返回的 i18n_resources.texts.value。
user_id | string | 审批发起人 user_id。发起人可在审批中心的 **已发起** 列表中看到所有已发起的审批。在 **待办**、**已办**、**抄送我** 列表中，该字段用来展示审批的发起人。
user_name | string | 审批发起人的用户名。如果发起人不是真实的用户（例如是某个部门），没有 user_id，则可以使用该参数传入一个名称。<br>**说明**：这里返回的是 i18n_resources.texts 参数的 key，对应的取值需要参见返回的 i18n_resources.texts.value。
open_id | string | 审批发起人 open_id。发起人可在审批中心的 **已发起** 列表中看到所有已发起的审批。在 **待办**、**已办**、**抄送我** 列表中，该字段用来展示审批的发起人。
department_id | string | 发起人的部门 ID，用于在审批中心列表中展示发起人的所属部门，不传值则不展示。<br>**说明**：如果用户没加入任何部门，请求时传 `""` 默认展示企业名称。如果请求时传入 department_name 参数，则展示对应的部门名称。
department_name | string | 审批发起人的部门名称。如果发起人不是真实的用户或没有部门，则可以使用该参数传入部门名称。<br>**说明**：这里返回的是 i18n_resources.texts 参数的 key，对应的取值需要参见返回的 i18n_resources.texts.value。
start_time | string | 审批发起时间，Unix 毫秒时间戳。
end_time | string | 审批实例结束时间。未结束的审批为 0，Unix 毫秒时间戳。
update_time | string | 审批实例最近更新时间，Unix 毫秒时间戳，用于推送数据版本控制。如果 update_mode 值为 UPDATE，则仅当传过来的 update_time 有变化时（变大），才会更新审批中心中的审批实例信息。<br>**说明**：使用该参数主要用来避免并发时，旧数据更新了新数据。
display_method | string | 列表页打开审批实例的方式<br>**可选值有**：<br>- BROWSER：跳转系统默认浏览器打开<br>- SIDEBAR：飞书中侧边抽屉打开<br>- NORMAL：飞书内嵌页面打开<br>- TRUSTEESHIP：以托管打开
update_mode | string | 更新方式。<br>- 当 update_mode 取值为 REPLACE 时，每次都以当前推送的数据为最终数据，会删掉审批中心中，不在本次推送数据中的多余的任务、抄送数据。<br>- 当 update_mode 取值为 UPDATE 时，不会删除审批中心的数据，而只进行新增、更新实例与任务数据。<br>**可选值有**：<br>- REPLACE：全量替换<br>- UPDATE：增量更新
task_list | external_instance_task_node\[\] | 任务列表
task_id | string | 审批实例内，审批任务的唯一标识，用于更新审批任务时定位数据。
user_id | string | 审批人 user_id，该任务会出现在审批人的飞书审批中心 **待办** 或 **已办** 的列表中。
open_id | string | 审批人 open_id，该任务会出现在审批人的飞书审批中心 **待办** 或 **已办** 的列表中。
title | string | 审批任务名称。这里返回的是 i18n_resources.texts 参数的 key，对应的取值需要参见返回的 i18n_resources.texts.value。
links | external_instance_link | 在审批中心 **待办**、**已办** 中使用的三方审批跳转链接，用于跳转回三方审批系统查看任务详情。
pc_link | string | PC 端的跳转链接。当用户使用飞书 PC 端查看任务详情时，通过该链接进行跳转。
mobile_link | string | 移动端的跳转链接。当用户使用飞书移动端查看任务详情时，通过该链接进行跳转。
status | string | 任务状态<br>**可选值有**：<br>- PENDING：待审批<br>- APPROVED：任务同意<br>- REJECTED：任务拒绝<br>- TRANSFERRED：任务转交<br>- DONE：任务通过但审批人未操作。审批人看不到该任务时，如需查看可抄送至该审批人。
extra | string | 扩展字段。JSON 格式，传值时需要压缩转义为字符串。<br>任务结束原因需传 complete_reason 参数，枚举值说明：<br>- approved：同意<br>- rejected：拒绝<br>- node_auto_reject：因逻辑判断产生的自动拒绝<br>- specific_rollback：退回（包括退回到发起人、退回到中间任一审批人）<br>- add：并加签（添加新审批人，与我一起审批）<br>- add_pre：前加签（添加新审批人，在我之前审批）<br>- add_post：后加签（添加新审批人，在我之后审批）<br>- delete_assignee：减签<br>- forward: 手动转交<br>- forward_resign：离职自动转交<br>- recall：撤销（撤回单据，单据失效）<br>- delete ：删除审批单<br>- admin_forward：管理员在后台操作转交<br>- system_forward：系统自动转交<br>- auto_skip：自动通过<br>- manual_skip：手动跳过<br>- submit_again：重新提交任务<br>- restart：重新启动流程<br>- others：其他
create_time | string | 任务创建时间，Unix 毫秒时间戳。
end_time | string | 任务完成时间。未结束的审批为 0，Unix 毫秒时间戳。
update_time | string | 任务最近更新时间，Unix 毫秒时间戳，用于推送数据版本控制。如果 update_mode 值为 UPDATE，则仅当传过来的 update_time 有变化时（变大），才会更新审批中心中的审批任务信息。
action_context | string | 操作上下文。当用户操作审批时，回调请求中会包含该参数，用于传递该任务的上下文数据。
action_configs | action_config\[\] | 任务级别的快捷审批操作配置。<br>**注意**：快捷审批目前仅支持在飞书移动端操作。
action_type | string | 操作类型。每个任务都可以配置两个操作（同意、拒绝或任意中的两个），操作会展示审批列表中。当用户操作时，回调请求会包含该字段，三方审批可接受到审批人的操作数据。<br>**可能值有**：<br>- APPROVE：同意<br>- REJECT：拒绝<br>- {KEY}：任意字符串。如果使用任意字符串，则需要提供 action_name
action_name | string | 操作名称。如果 action_type 不等于 APPROVAL 或 REJECT，则必须提供该字段，用于展示特定的操作名称。<br>**说明**：这里返回的是 i18n_resources.texts 参数的 key，对应的取值需要参见返回的 i18n_resources.texts.value。
is_need_reason | boolean | 是否需要审批意见。取值为 true 时，审批人在审批中心操作任务后，还需要跳转填写审批意见。
is_reason_required | boolean | 审批意见是否必填
is_need_attachment | boolean | 意见是否支持上传附件
display_method | string | 列表页打开审批任务的方式<br>**可选值有**：<br>- BROWSER：跳转系统默认浏览器打开<br>- SIDEBAR：飞书中侧边抽屉打开<br>- NORMAL：飞书内嵌页面打开<br>- TRUSTEESHIP：以托管模式打开
exclude_statistics | boolean | 三方审批任务是否不纳入效率统计。可能值有：<br>- true：不纳入效率统计<br>- false：纳入效率统计
node_id | string | 审批节点 ID。必须同时满足：<br>- 一个审批流程内，每个节点 ID 唯一。例如，一个流程下直属上级、隔级上级等节点的 node_id 均不一样。<br>- 同一个三方审批定义内，不同审批实例中的相同节点，node_id 要保持不变。例如，用户 A 和用户 B 分别发起了请假申请，这两个审批实例中的直属上级节点的 node_id 应该保持一致。
node_name | string | 节点名称，这里返回的是 i18n_resources.texts 参数的 key，对应的取值需要参见返回的 i18n_resources.texts.value。
generate_type | string | 任务生成类型<br>**可选值有**：<br>- EXTERNAL_CONSIGN：给代理人生成的任务<br>- DEFAULT：默认情况，可不填， 但是不要填空字符串
cc_list | cc_node\[\] | 抄送列表
cc_id | string | 审批实例内抄送唯一标识
user_id | string | 抄送人的 user_id
open_id | string | 抄送人的 open_id
links | external_instance_link | 审批抄送跳转链接。设置的链接用于在审批中心 **抄送我** 列表内点击跳转，跳回三方审批系统查看审批抄送详情。
pc_link | string | PC 端的三方审批实例跳转链接。当用户使用飞书 PC 端查看审批抄送时，通过该字段进行跳转。
mobile_link | string | 移动端的三方审批实例跳转链接。当用户使用飞书移动端查看审批抄送时，通过该字段进行跳转。
read_status | string | 抄送人的阅读状态<br>**可选值有**：<br>- READ：已读<br>- UNREAD：未读
extra | string | 扩展字段 JSON
title | string | 抄送任务名称
create_time | string | 抄送发起时间，Unix 毫秒时间戳。
update_time | string | 抄送最近更新时间，Unix 毫秒时间戳，用于推送数据版本。如果 update_mode 值为 UPDATE，则仅当传过来的 update_time 有变化时（变大），才会更新审批中心中的审批实例信息。
display_method | string | 列表页打开审批任务的方式<br>**可选值有**：<br>- BROWSER：跳转系统默认浏览器打开<br>- SIDEBAR：飞书中侧边抽屉打开<br>- NORMAL：飞书内嵌页面打开<br>- TRUSTEESHIP：以托管模式打开
i18n_resources | i18n_resource\[\] | 国际化文案
locale | string | 语言<br>**可选值有**：<br>- zh-CN：中文<br>- en-US：英文<br>- ja-JP：日文<br>- zh-HK：繁体中文（中国香港）<br>- zh-TW：繁体中文（中国台湾）<br>- de-DE：德语<br>- es-ES：西班牙语<br>- fr-FR：法语<br>- id-ID：印度尼西亚语<br>- it-IT：意大利语<br>- ko-KR：韩语<br>- pt-BR：葡萄牙语<br>- th-TH：泰语<br>- vi-VN：越南语<br>- ms-MY：马来语<br>- ru-RU：俄语
texts | i18n_resource_text\[\] | 文案的 Key:Value。Key 需要以 @i18n@ 开头，并按照各个参数的要求传入 Value。该字段主要用于做国际化，允许用户同时传多个语言的文案，审批中心会根据用户当前的语音环境使用对应的文案，如果没有传用户当前的语音环境文案，则会使用默认的语言文案。
key | string | 文案 Key，和各个参数 Key 相匹配。
value | string | 文案 Value，即文案 Key 对应的参数值。
is_default | boolean | 是否为默认语言。默认语言需要包含所有所需的文案 Key，非默认语言如果 Key 不存在，则会使用默认语言代替。
trusteeship_url_token | string | 单据托管认证 token，托管回调会附带此 token，帮助业务认证。
trusteeship_user_id_type | string | 用户的类型，会影响请求参数用户标识域的选择，包括加签操作回传的目标用户， 目前仅支持 user_id。
trusteeship_urls | trusteeship_urls | 单据托管回调接入方的接口 URL 地址
form_detail_url | string | 获取表单 schema 相关数据的 URL 地址
action_definition_url | string | 表示获取审批操作区数据的 URL 地址
approval_node_url | string | 获取审批记录相关数据的 URL 地址
action_callback_url | string | 进行审批操作时回调的 URL 地址
pull_business_data_url | string | 获取托管动态数据 URL 地址。使用该接口时，必须要保证历史托管单据的数据中都同步了该接口地址。如果历史单据中没有该接口，需要重新同步历史托管单据的数据来更新该 URL。该接口用于飞书审批前端和业务进行交互使用，只有使用审批前端的特定组件（由飞书审批前端提供的组件，并且需要和业务进行接口交互的组件）才会需要。
trusteeship_cache_config | trusteeship_instance_cache_config | 托管预缓存策略
form_policy | string | 托管预缓存策略<br>**可选值有**：<br>- DISABLE：不启用，默认<br>- IMMUTABLE：表单不会随流程进行改变<br>- BY_NODE：跟随流程节点变更更新缓存<br>- BY_USER：对于每个待办任务存储一份
form_vary_with_locale | boolean | 表单是否随国际化改变
form_version | string | 当前使用的表单版本号，保证表单改变后，版本号增加，实际值为 int64 整数。
resource_region | string | 资源所在地区， 内部统计用字段， 不需要填

### 响应体示例
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "data": {
            "approval_code": "81D31358-93AF-92D6-7425-01A5D67C4E71",
            "status": "PENDING",
            "extra": "{\"xxx\":\"xxx\",\"business_key\":\"xxx\"}",
            "instance_id": "24492654",
            "links": {
                "pc_link": "https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc/pages/detail?id=1234",
                "mobile_link": "https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages/detail?id=1234"
            },
            "title": "@i18n@1",
            "form": [
                {
                    "name": "@i18n@2",
                    "value": "@i18n@3"
                }
            ],
            "user_id": "a987sf9s",
            "user_name": "@i18n@9",
            "open_id": "ou_be73cbc0ee35eb6ca54e9e7cc14998c1",
            "department_id": "od-8ec33278bc2",
            "department_name": "@i18n@10",
            "start_time": "1556468012678",
            "end_time": "1556468012678",
            "update_time": "1556468012678",
            "display_method": "BROWSER",
            "update_mode": "UPDATE",
            "task_list": [
                {
                    "task_id": "112534",
                    "user_id": "a987sf9s",
                    "open_id": "ou_be73cbc0ee35eb6ca54e9e7cc14998c1",
                    "title": "i18n1",
                    "links": {
                        "pc_link": "https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc/pages/detail?id=1234",
                        "mobile_link": "https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages/detail?id=1234"
                    },
                    "status": "PENDING",
                    "extra": "{\"xxx\":\"xxx\",\"complete_reason\":\"approved\"}",
                    "create_time": "1556468012678",
                    "end_time": "1556468012678",
                    "update_time": "1556468012678",
                    "action_context": "123456",
                    "action_configs": [
                        {
                            "action_type": "APPROVE",
                            "action_name": "@i18n@5",
                            "is_need_reason": false,
                            "is_reason_required": false,
                            "is_need_attachment": false
                        }
                    ],
                    "display_method": "BROWSER",
                    "exclude_statistics": false,
                    "node_id": "node",
                    "node_name": "i18n@name",
                    "generate_type": "EXTERNAL_CONSIGN"
                }
            ],
            "cc_list": [
                {
                    "cc_id": "123456",
                    "user_id": "12345",
                    "open_id": "ou_be73cbc0ee35eb6ca54e9e7cc14998c1",
                    "links": {
                        "pc_link": "https://applink.feishu.cn/client/mini_program/open?mode=appCenter&appId=cli_9c90fc38e07a9101&path=pc/pages/detail?id=1234",
                        "mobile_link": "https://applink.feishu.cn/client/mini_program/open?appId=cli_9c90fc38e07a9101&path=pages/detail?id=1234"
                    },
                    "read_status": "READ",
                    "extra": "{\"xxx\":\"xxx\"}",
                    "title": "xxx",
                    "create_time": "1556468012678",
                    "update_time": "1556468012678",
                    "display_method": "BROWSER"
                }
            ],
            "i18n_resources": [
                {
                    "locale": "zh-CN",
                    "texts": [
                        {
                            "key": "@i18n@1",
                            "value": "people"
                        }
                    ],
                    "is_default": true
                }
            ],
            "trusteeship_url_token": "788981c886b1c28ac29d1e68efd60683d6d90dfce80938ee9453e2a5f3e9e306",
            "trusteeship_user_id_type": "user_id",
            "trusteeship_urls": {
                "form_detail_url": "https://#{your_domain}/api/form_detail",
                "action_definition_url": "https://#{your_domain}/api/action_definition",
                "approval_node_url": "https://#{your_domain}/api/approval_node",
                "action_callback_url": "https://#{your_domain}/api/action_callback",
                "pull_business_data_url": "https://#{your_domain}/api/pull_business_data"
            },
            "trusteeship_cache_config": {
                "form_policy": "DISABLE",
                "form_vary_with_locale": false,
                "form_version": "1"
            },
            "resource_region": "cn"
        }
    }
}
```

### 错误码

HTTP状态码 | 错误码 | 描述 | 排查建议
---|---|---|---
400 | 1390001 | param is invalid | 参数错误。排查方案：<br>- 根据接口文档的参数说明，检查请求时传入的参数是否正确。<br>- 如果传入的有表单参数（form），则需要检查该参数内传入的表单控件数据是否正确。如果报错信息内包含控件 ID（如 `控件= widget17261088448220001`），可以调用[查看指定审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/get)或者[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口，获取响应参数 form 值，检索有问题的控件 ID，然后检查该控件的配置是否正确。
400 | 1395001 | There have been some errors. Please try again later | 服务出现错误。排查方案：<br>1. 参考接口文档的参数说明，检查请求时传入的参数是否正确。如果传入的有表单参数（form），则需要检查传入的表单控件数据是否正确。<br>2. 降低请求频率，短时间内不要同步相同的审批实例，请稍后重试。如果重试仍然报错，请联系[技术支持](https://applink.feishu.cn/TLJpeNdW)。
400 | 1390014 | tenant_id not found | 未找到指定租户。

更多错误码信息，参见[通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。
