# 简介

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/development-guide/approval-access-guide
Updated: 2025-02-21

# 简介

审批是飞书套件为企业提供的官方应用，可以快速建立企业内部审批流程（例如请假、出差等）。开放平台审批业务提供了丰富的审批 OpenAPI 以及事件，你可以使用审批开放能力在飞书内搭建原生审批系统，也可以将外部三方审批系统的数据接入飞书审批，通过飞书一站式完成企业内的各个审批流程。

## 接入指引

操作 | 说明
---|---
了解审批功能 | 飞书审批业务提供了丰富的 OpenAPI 与事件，为避免你在正式接入审批功能时不了解相应的功能概念，建议你在接入前，了解审批相关的概念与开放能力，详情参见[审批概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval-overview)。
构建飞书原生审批 | 如果你需要在飞书内搭建原生审批系统，企业的请假、出差、采购、权限等审批流程都集中在飞书审批内流转，具体操作参考[原生审批接入指南](https://open.feishu.cn/document/ukTMukTMukTM/uIjN4UjLyYDO14iM2gTN)。
三方审批接入审批中心 | -   **通过飞书审批提供的开放能力接入**<br>如果企业之前使用的自研或第三方审批系统，可以参考[三方审批接入指南](https://open.feishu.cn/document/ukTMukTMukTM/uAzNyYjLwcjM24CM3IjN)，将三方审批数据同步到飞书审批内，通过飞书一站式完成企业内所有的审批流程。<br>- **通过官方连接器接入**<br>为满足客户快速集成的诉求，三方审批接入方式除了 OpenAPI 之外，审批业务还提供了 **审批官方连接器**，通过连接器可以低成本、高效的完成三方审批接入。目前已支持的三方审批系统以及官方连接器的介绍，参考[审批官方连接器](https://open.feishu.cn/document/ukTMukTMukTM/ukjNyYjL5YjM24SO2IjN/official-approval-connector)。
