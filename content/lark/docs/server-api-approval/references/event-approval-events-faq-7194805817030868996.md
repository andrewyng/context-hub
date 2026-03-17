# 审批事件 FAQ

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/event/approval-events-faq
Updated: 2025-03-24

# 审批事件 FAQ

本文提供审批事件的相关问题与解决方案，供你参考。

## 订阅了审批事件，但是却没有收到事件是因为什么？

可能原因：

- 如果你订阅的多个事件全部接收不到，可能是在订阅事件时某一步骤出错。你需要按照以下步骤依次检查各项配置是否正常：

	1. 在开发者后台的指定应用中，配置事件订阅方式、订阅事件并开通事件所需的权限。事件订阅详细步骤说明参见[事件概述](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)。

	2. 发布应用，使各项配置生效。具体操作参见：

    	- [发布企业自建应用](https://open.feishu.cn/document/home/introduction-to-custom-app-development/self-built-application-development-process#baf09c7d)
    	- [发布商店应用](https://open.feishu.cn/document/uMzNwEjLzcDMx4yM3ATM/uYjMyUjL2IjM14iNyITN)

	3. 调用[订阅审批事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/subscribe)接口，订阅指定的审批定义 Code，订阅后应用才可以接收到该审批定义相关的事件数据。

- 如果是订阅的多个事件中，仅有某一条收不到，可以到通过[日志检索](https://open.feishu.cn/document/tools-and-resources/open-api-log-query)功能排查问题，可能是回调地址无法访问导致的。

- 同一个审批事件在一个审批实例内是有序触发的，你的服务端接收事件消息后，需要及时响应事件，否则开放平台不会继续发送同类型的事件。详情参考[事件推送](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM#521f7631)。

	例如，监听审批事件后，如果收到了审批实例 A 的 **审批实例状态变更** 事件（状态变更为 PENDING），当服务端未及时响应时，开放平台将不会继续发送审批实例 A 的其他 **审批实例状态变更** 事件消息。

- 如果同时开发配置了多个应用（例如测试应用和线上应用），则有可能只在测试应用订阅了事件，未在线上应用订阅事件。请自行排查。

## 请假、换班等审批通过，但是考勤应用数据并没有变化是什么原因？

可能是审批定义的表单内，未包含对应的控件组。你可以登录[飞书审批管理后台](https://www.feishu.cn/approval/admin/approvalList?devMode=on)并[设计审批表单](https://www.feishu.cn/hc/zh-CN/articles/360036162633-%E7%AE%A1%E7%90%86%E5%91%98%E8%AE%BE%E8%AE%A1%E5%AE%A1%E6%89%B9%E8%A1%A8%E5%8D%95)，设计请假、换班等控件组。
