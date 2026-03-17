# 原生审批实例概述

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/instance/overview-approval-instance
Updated: 2025-04-21

# 原生审批实例概述

原生审批实例是指基于某一原生审批定义发起的审批流。企业管理员在审批中心创建并发布审批定义后，员工即可在飞书客户端的 **工作台** > **审批** 功能发起审批申请，发起申请时需要根据审批定义的表单填写数据，发起申请后审批会按照审批定义的流程进行流转。审批业务将原生审批实例的相关操作封装为开放能力，你可调用原生审批实例 API 完成原生审批实例的创建、撤回或查询等管理操作。

## 基础概念

在正式开始使用原生审批实例 API 之前，请务必了解以下基本概念。

### 审批定义

审批实例是基于审批定义创建的，因此在创建审批实例之前，需要先创建审批定义，定义发起审批所需的表单内容以及审批流程。详细介绍参见[原生审批定义概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/overview-of-approval-resources)。

你需要了解审批定义中的 **表单** 与 **流程**，在后续创建审批实例时需要：

- 根据审批定义的表单设计，依次为表单内的控件传值。
- 根据审批定义的流程设计，完成节点的审批人、抄送人等配置。

### 审批实例唯一标识 Instance Code

每一个审批实例都有一个唯一标识（Instance Code），在开发过程中如需使用指定的审批实例，则需要通过 Instance Code 定位审批实例。获取方式说明：

- 成功调用[创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)接口后，可在返回结果中获取当前审批实例的 Instance Code。

- 调用[批量获取审批实例 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/list)、[查询实例列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/query)，可查询存量的审批实例 Instance Code。

### 审批实例状态

审批实例在流转过程中状态会发生变化（包括 **审批中**、**通过**、**拒绝**、**撤回**、**删除** 等），你可以根据审批实例的当前状态判断审批进展，例如：

- 新建的审批实例初始状态为 **审批中**。
- 审批人同意审批后，审批实例会变更为 **通过** 状态。
- 审批发起人撤回审批后，审批实例会变更为 **撤回** 状态。

## 字段说明

名称 | 类型 | 描述
---|---|---
instance_code | string | 审批实例 Code
approval_name | string | 审批名称
approval_code | string | 审批定义 Code
start_time | string | 审批创建时间，毫秒时间戳
end_time | string | 审批结束时间，毫秒时间戳
user_id | string | 审批发起人的 user_id，了解用户 ID 参见[用户身份概述](https://open.feishu.cn/document/home/user-identity-introduction/introduction)
open_id | string | 审批发起人的 open_id，了解用户 ID 参见[用户身份概述](https://open.feishu.cn/document/home/user-identity-introduction/introduction)
serial_number | string | 审批单编号
department_id | string | 审批发起人所属的[部门 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/field-overview#9c02ed7a)
status | string | 审批实例状态<br>**可选值有**：<br>- PENDING：审批中<br>- APPROVED：通过<br>- REJECTED：拒绝<br>- CANCELED：撤回<br>- DELETED：删除
uuid | string | 审批实例的 uuid，用于幂等操作，避免误操作重复创建审批实例
form | string | 审批实例填写的表单数据，JSON 序列化后的字符串
task_list | instance_task\[\] | 审批任务列表
id | string | 审批任务 ID
user_id | string | 审批人的 user_id，自动通过、自动拒绝时该参数返回值为空
open_id | string | 审批人的 open_id，自动通过、自动拒绝时该参数返回值为空
status | string | 任务状态<br>**可选值有**：<br>- PENDING：审批中<br>- APPROVED：同意<br>- REJECTED：拒绝<br>- TRANSFERRED：已转交<br>- DONE：完成
node_id | string | 审批任务所属的审批节点 ID
node_name | string | 审批任务所属的审批节点名称
custom_node_id | string | 审批任务所属的审批节点的自定义 ID。如果没设置自定义 ID，则不返回该参数值
type | string | 审批方式<br>**可选值有**：<br>- AND：会签<br>- OR：或签<br>- AUTO_PASS：自动通过<br>- AUTO_REJECT：自动拒绝<br>- SEQUENTIAL：按顺序
start_time | string | 审批任务的开始时间，毫秒时间戳
end_time | string | 审批任务的完成时间，毫秒时间戳，未完成时返回 0
comment_list | instance_comment\[\] | 评论列表
id | string | 评论 ID
user_id | string | 发表评论的用户 user_id
open_id | string | 发表评论的用户 open_id
comment | string | 评论内容
create_time | string | 评论时间，毫秒时间戳
timeline | instance_timeline\[\] | 审批动态
type | string | 动态类型，不同类型 ext 内的 user_id_list 含义不一样<br>**可选值有**：<br>- START：审批开始<br>- PASS：通过<br>- REJECT：拒绝<br>- AUTO_PASS：自动通过<br>- AUTO_REJECT：自动拒绝<br>- REMOVE_REPEAT：去重<br>- TRANSFER：转交<br>- ADD_APPROVER_BEFORE：前加签<br>- ADD_APPROVER：并加签<br>- ADD_APPROVER_AFTER：后加签<br>- DELETE_APPROVER：减签<br>- ROLLBACK_SELECTED：指定回退<br>- ROLLBACK：全部回退<br>- CANCEL：撤回<br>- DELETE：删除<br>- CC：抄送
create_time | string | 发生时间，毫秒时间戳
user_id | string | 产生该动态的用户 user_id
open_id | string | 产生该动态的用户 open_id
user_id_list | string\[\] | 被抄送人列表，列表内包含的是用户 user_id
open_id_list | string\[\] | 被抄送人列表，列表内包含的是用户 open_id
task_id | string | 产生动态关联的任务 ID
comment | string | 理由
cc_user_list | instance_cc_user\[\] | 抄送人列表
user_id | string | 抄送人的 user_id
cc_id | string | 审批实例内抄送唯一标识
open_id | string | 抄送人的 open_id
ext | string | 其他信息，JSON 格式，目前包括 user_id_list, user_id，open_id_list，open_id
node_key | string | 产生审批任务的节点 key
modified_instance_code | string | 修改的原实例 Code，仅在查询修改实例时显示该字段
reverted_instance_code | string | 撤销的原实例 Code，仅在查询撤销实例时显示该字段
reverted | boolean | 单据是否被撤销

## 数据示例
```json
{
        "approval_name": "Payment",
        "start_time": "1564590532967",
        "end_time": "1564590532967",
        "user_id": "f3ta757q",
        "open_id": "ou_3cda9c969f737aaa05e6915dce306cb9",
        "serial_number": "202102060002",
        "department_id": "od-8ec33ffec336c3a39a278bc25e931676",
        "status": "PENDING",
        "uuid": "1234567",
        "form": "[{\"id\": \"widget1\",\"custom_id\": \"user_info\",\"name\": \"Item application\",\"type\": \"textarea\",\"value\":\"aaaa\"}]",
        "task_list": [
            {
                "id": "1234",
                "user_id": "f7cb567e",
                "open_id": "ou_123457",
                "status": "PENDING",
                "node_id": "46e6d96cfa756980907209209ec03b64",
                "node_name": "开始",
                "custom_node_id": "manager",
                "type": "AND",
                "start_time": "1564590532967",
                "end_time": "0"
            }
        ],
        "comment_list": [
            {
                "id": "1234",
                "user_id": "f7cb567e",
                "open_id": "ou_123456",
                "comment": "ok",
                "create_time": "1564590532967"
            }
        ],
        "timeline": [
            {
                "type": "PASS",
                "create_time": "1564590532967",
                "user_id": "f7cb567e",
                "open_id": "ou_123456",
                "user_id_list": [
                    "Eeea5gefe"
                ],
                "open_id_list": [
                    "ou_123456"
                ],
                "task_id": "1234",
                "comment": "ok",
                "cc_user_list": [
                    {
                        "user_id": "eea5gefe",
                        "cc_id": "123445",
                        "open_id": "ou_12345"
                    }
                ],
                "ext": "{\"user_id\":\"62d4a44c\",\"open_id\":\"ou_123456\"}",
                "node_key": "APPROVAL_240330_4058663"
            }
        ],
        "modified_instance_code": "81D31358-93AF-92D6-7425-01A5D67C4E71",
        "reverted_instance_code": "81D31358-93AF-92D6-7425-01A5D67C4E71",
        "approval_code": "7C468A54-8745-2245-9675-08B7C63E7A85",
        "reverted": false
}
```
