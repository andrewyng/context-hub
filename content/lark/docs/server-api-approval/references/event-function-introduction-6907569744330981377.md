# 审批事件概述

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/event/function-introduction
Updated: 2025-03-24

# 审批事件概述

创建审批实例后，在一个审批单的生命周期里，有很多信息可能需要开发者关注。开发者可以订阅审批事件，在审批单发生数据状态变更时，及时收到通知，并根据数据变化做出相应的业务处理。

## 功能简介

审批事件是飞书开放平台众多事件中的一项，了解飞书开放平台事件订阅功能可参考[事件概述](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)。通过事件订阅，开发者可以实时、自动接收到审批资源的状态变化，而无需轮训审批查询接口获取审批资源的最新状态。降低了开发复杂度，节省了接口查询消耗。

审批事件包括：

- 公用事件：[审批实例状态变更](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/common-event/approval-instance-event)、[审批任务状态变更](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/common-event/approval-task-event)、[审批抄送状态变更](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/common-event/approval-cc-event)、[审批定义更新](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/custom-approval-event)。
- 特殊事件：[外出审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/out-of-office)、[出差审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/business-trip)、[补卡审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/attendance-record-correction)、[换班审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/shift-change)、[加班审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/overtime)、[请假审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/leave)。

## 订阅流程

订阅流程如下图所示。流程解析：

1. 首先需要登录飞书开发者后台，在应用内配置加密策略（Encrypt Key、Verification Token）、配置事件订阅方式、添加事件并为事件申请所需的权限。这些操作是订阅事件所必须的通用操作，详细介绍可参见[事件订阅流程](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM#69f86198)。

2. 在飞书开发者后台完成应用事件订阅后，还不能直接接收并处理事件。必须先调用审批业务域的[订阅审批事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/subscribe)接口，订阅指定的审批定义 Code，订阅后应用才可以接收到该审批定义相关的事件数据。

例如，当你为应用订阅[审批实例状态变更](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/common-event/approval-instance-event)事件后，需要先调用[订阅审批事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/subscribe)接口，订阅指定审批实例对应的审批定义 Code。后续当该审批定义下创建的审批实例发生状态变更时（例如审批实例由`PENDING`状态变更为`APPROVED`状态），开放平台会按照你在应用设置的事件订阅请求方式，向服务端推送事件消息。warning
- 用于接收事件消息的服务端，在收到事件消息请求时，需要在 3 秒内响应该请求，否则会触发超时重推机制。因此，建议在服务端先存储事件消息，再进行业务处理，避免响应超时。
- 事件消息可能会重复，你可以根据事件消息中的 `event_id` 或者 `uuid` 参数做幂等。不同的事件类型幂等 key 不一样，请根据具体事件的结构体来确定，也可以根据自己的业务做幂等。

## 事件推送周期和频次

订阅的事件发生时，飞书将会通过 HTTP POST 请求发送 JSON 格式的事件数据到预先配置的[订阅方式](https://open.feishu.cn/document/ukTMukTMukTM/uYDNxYjL2QTM24iN0EjN/event-subscription-configure-/request-url-configuration-case)。

应用接收到包含事件数据的请求（向开发者服务器发送的 HTTP POST 请求，或是通过服务端 SDK 长连接接收到请求）时，需要在 3 秒内以 HTTP 200 状态码响应该请求。否则飞书开放平台认为本次推送失败，并以 15秒、5分钟、1小时、6小时 的间隔重新推送事件，最多重试 4 次。

从上述描述可以看出，事件重发的最长时间窗口约为 7.1 小时，请检查和处理在 7.1 小时内的重复事件。可以使用如下方式判断事件唯一性：

对于 1.0 版本的事件，通过事件结构中的 uuid 字段判断事件唯一性。
对于 2.0 版本的事件，通过事件结构中的 event_id 字段判断事件唯一性。下面对事件结构进行了详细介绍。

## 事件推送顺序

为了保证用户的事件可用性以及内外部数据变化一致性，对于部分事件，开放平台使用了有序事件的形式进行推送。即在用户对前一事件接收成功后，才会推送下一事件。

对于有序事件，用户需要保证相应前后事件的正常消费，避免造成事件的阻塞或收到事件不及时。即当有序事件发生阻塞时，后续投递的事件会直接进入重试队列排队，等前一事件成功后才会开始重试投递队首的排队事件，开始第一次重试。

例如，审批实例的事件依次为：创建实例 > 审批任务A > 审批任务B > 完成实例，如果依次触发了多个事件，如果接收事件消息的服务端没有对创建实例事件进行响应，则开放平台将不会推送后续的审批任务A事件，即流程中的任一事件被阻碍，都会影响后续事件的执行。
