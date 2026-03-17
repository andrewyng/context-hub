# 审批概述

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/approval-overview
Updated: 2025-04-14

# 审批概述

飞书审批通过提供一站式、高效率的审批解决方案，帮助企业解决各种审批难题，轻松解锁高效愉悦的审批人体验。飞书审批可以快速建立企业内部审批流程，如请假、出差等。审批开放接口（API）可以对审批实例进行查询和创建，可用于企业原有平台与审批打通。飞书开放平台提供了一系列安全、可靠的 API，来方便你对审批信息进行操作。

## 功能简介

飞书审批提供了飞书原生的审批系统，以及对接三方审批系统的能力。企业可以选择直接在飞书内建立审批系统，也可以把正在使用的三方审批数据接入飞书审批，在飞书内完成三方审批处理。在飞书内处理审批，可结合飞书的对话框消息推送、一键转发聊天、每日待办提醒、效率看板等功能，从审批发起、处理到统计全面提升审批效率。两类审批的介绍如下表：

类型 | 说明 | 接入指南
---|---|---
原生审批 | 飞书原生审批是指在飞书的审批中心构建企业所需的全部审批流程。管理员定义审批流、员工发起审批、审批流转以及管理员处理审批等操作均在飞书内完成，为企业提供高效便捷的审批体验。 | [原生审批接入指南](https://open.feishu.cn/document/ukTMukTMukTM/uIjN4UjLyYDO14iM2gTN)
三方审批 | 飞书审批提供了三方审批系统的数据接入能力，如果企业正在使用一个或多个飞书外的三方审批系统，可以将三方审批系统的数据同步到飞书审批内，通过飞书审批查阅审批数据、处理审批任务，并将数据同步回三方审批系统进行流转。<br>**注意事项**： | [三方审批接入指南](https://open.feishu.cn/document/ukTMukTMukTM/uAzNyYjLwcjM24CM3IjN)

在调用审批 API 之前，建议你先了解飞书审批的相关操作，详情参见[快速上手飞书审批](https://www.feishu.cn/hc/zh-CN/articles/570749215104)。

## 基础概念

本章节介绍审批功能中的审批定义、审批实例以及审批任务等基础概念介绍。

### 审批定义

定义某一类审批中的表单信息和审批流程。例如，请假审批的表单内具有日期控件和文本控件，日期控件用于设置请假时间，文本控件用于设置请假事由。

审批定义由唯一编码（Approval Code）、表单（Form）和审批流程（Process）组成，企业创建审批定义后，员工发起审批时将根据定义填写表单控件值，并形成审批实例。

#### 唯一编码（Approval Code）

审批定义的唯一编码，在编辑审批时从浏览器 url 中找到。点击以下链接进入审批管理后台，其中 `devMode=on` 表示进入开发者模式，该模式下可以指定控件和节点的自定义 ID，方便后续的开发工作。

<https://www.feishu.cn/approval/admin/approvalList?devMode=on>

进入审批管理后台后，找到某一审批并点击如下图所示的编辑按钮，进入审批编辑页面，然后在浏览器地址栏中可获取Approval Code，参数格式为：`definitionCode=E3254848-D172-4169-B03E-744E7CD11F06`

<md-alert type="warn">使用审批定义的 Approval Code 可以获取审批定义下的所有数据，以及可以订阅该定义下所有审批实例的变更事件，因此需要注意妥善保管审批定义的 Approval Code，避免因 Approval Code 泄露导致的数据安全风险。

#### 表单（Form）

企业管理员在创建审批定义时需要设计提交审批用的表单（如下图，对应审批编辑页面的 **表单设计** 页签），在表单内可选择一个或多个控件构建完整的表单配置，后续员工发起审批时需要填写该表单。

- 审批控件（Widget）：一个表单由一个或多个控件组成，每个控件都有基础属性。了解各个控件的属性描述参考[控件字段说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/create#1812d5fd)。
- 控件自定义 ID：在[审批管理后台](https://www.feishu.cn/approval/admin/approvalList?devMode=on)的开发者模式（`devMode=on`）下，支持编辑各个控件的自定义 ID，该 ID 在表单内不能重复设置，用来标识唯一的控件。

目前表单内支持的控件清单如下：

- 单行文本（input）：用于填写一个单行文本。
- 多行文本（textarea）：用于填写一个多行文本。
- 数字（number）：用于填写一个数字。
- 金额（amount）：用于填写审批金额数量及单位，默认单位为 CNY。
- 日期（date）：用于填写详细时间。
- 日期区间（dateInterval）：用于填写一个日期区间，包括有开始时间、结束时间以及持续时间。
- 单选（radio, radioV2）：用于选择单个选择。
- 多选框（checkbox, checkboxV2）：用于选择多个选择。
- 地址（address）：用于填写一个地址。
- 联系人（contact）：用于在审批中添加联系人。
- 说明（text）：用于在审批定义中添加说明（如填写规范、注意事项），在发起审批时不可编辑。
- 明细（fieldList）：用于填写明细信息，在明细中可以添加其他控件比如数字、金额等。在创建审批定义时设计一个明细控件表示明细的一个条目中包括哪些控件，发起人可以根据自身需求增加条目，每一个条目都和创建审批定义时所设明细控件一致。
- 计算公式（formula）：在创建审批定义时设计计算方式，表示该控件的值依赖于其他控件（数字、金额）计算得出。
- 图片（image, imageV2）：用于在审批中添加图片。
- 附件（attachment, attachmentV2）：用于在审批中添加附件，如文件等。
- 关联（connect）：用于在当前审批中关联其他审批，使审批人能够在审批时查看所关联审批的概况。
- 请假（leaveGroup）：用于填写请假审批的相关内容，包括选择请假类型（如病假、产假等，请假类型需要管理员提前在假期管理中设置并在创建审批定义时选择当前审批定义发起实例时可选种类有哪些），填写请假开始时间，填写请假结束时间以及请假时长。
- 加班（workGroup）：用于填写加班申请的相关内容，包括选择加班类型（比如调休、带薪、不带薪等，由管理员在创建审批定义时设定），填写加班开始/结束时间和时长以及填写加班原因。
- 换班（shiftGroup）：用于填写换班审批的相关内容，包括填写换班时间以及填写换班原因。
- 出差（tripGroup）：用于填写出差审批的相关内容，包括填写行程（一段行程中包括行程开始时间、行程结束时间、行程时长、出发地、目的地、交通方式、单程/往返以及备注，其中行程时长以自然日为单位计算，并且倘若出差有多段行程，可以由发起人手动增加新的一段行程），出差总时长，出差原因以及同行人。
- 补卡（remedyGroup）：用于填写补卡审批的相关内容，包括填写补卡时间和填写补卡原因。

#### 审批流程（Process）

企业管理员在创建审批定义时需设计一个审批流转方式（如下图，对应审批编辑页面的 **流程设计** 页签）。流转方式由固定的 **提交** 节点开始，由固定的 **结束** 节点收尾，中间可添加多个 **审批** 节点，后续员工创建审批实例后，将按照审批节点从 **提交** 到 **结束** 的顺序进行流转。

审批节点可设置为自动通过或者自动拒绝，也可以设置为人工审批，人工审批需要指定审批人，或者设置为审批提交人自选审批人，后续当员工发起审批时必须手动指定审批人。

- 人工审批时的审批方式说明：

	- 会签（AND）：表示当前节点需要所有选择的审批人都同意后才被认作同意，进入下一节点
	- 或签（OR）：表示当前节点只需要有一个审批人同意后就可被认作同意，进入下一节点
- 自动通过（AUTO_PASS）：表示当前节点系统会自动同意该审批，进入下一节点
- 自动拒绝（AUTO_REJECT）：表示当前节点系统会自动拒绝该审批

在[审批管理后台](https://www.feishu.cn/approval/admin/approvalList?devMode=on)的开发者模式（`devMode=on`）下，支持编辑各个审批节点的自定义 ID，该 ID 在流程设计内不能重复设置，用来标识唯一的节点。

### 审批实例

员工发起审批时产生的审批流对象，在实例内将按照审批定义的流程依次流转到各个审批节点，最终完成审批实例的处理。根据流转动态，实例可能处于不同的状态，部分状态说明如下：

- 进行中（PENDING）：表示当前审批实例还在流转中，没有最终结果
- 已同意（APPROVED）：表示当前审批实例已被通过
- 已拒绝（REJECTED）：表示当前审批实例已被拒绝
- 已撤回（CANCELED）：表示当前审批实例已被发起人撤回
- 已删除（DELETED）：表示当前审批实例正在流程中，但是由于管理员停用或删除了当前审批定义，导致该审批实例变为已删除状态
**注意事项**：### 审批任务

审批任务依赖于审批节点存在，当审批实例流转到新的节点时，会创建该节点的审批任务。每一个节点内对应一个或多个审批人，当流程流转到指定节点时，节点内的审批人需要完成各自的审批任务。审批任务的状态由各自审批人决定（例如 **同意** 或者 **拒绝**），如果某一节点有多个审批任务，某些任务的状态可能会因为其他任务状态的改变而改变。例如，一个 **或签** 节点对应多个审批任务，当其中一个任务通过之后，其他任务会自动变为已完成状态，不再需要其他审批人进行操作。审批任务状态说明：

- 进行中（PENDING）：表示当前审批任务正在进行中，没有最终结果
- 已同意（APPROVED）：表示当前审批任务审批人已经同意
- 已拒绝（REJECTED）：表示当前审批任务审批人已经拒绝
- 已转交（TRANSFERRED）：表示当前审批任务审批人已经转交，交给其他人审批
- 已完成（DONE）：表示当前审批任务已经完成

### 审批动态

记录某一审批实例从创建开始到当前时间所发生的所有操作及状态改变，用于追踪实例的变化。例如，调用[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口，在响应参数 timeline 可获取审批实例的动态。

## 典型场景

开放平台提供了包含审批业务的集成方案，详情可参见：[深度融合企业系统，飞书审批让流程更轻松](https://open.feishu.cn/solutions/detail/approval)

## 接入流程

审批 API 的基本接入流程如下图所示，如需了解详细的 API 接入流程，参见[流程概述](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)。

同时你可以监听审批事件，获知审批状态的变化。详情参见[功能介绍](https://open.feishu.cn/document/ukTMukTMukTM/ugDNyUjL4QjM14CO0ITN)。

## 资源介绍

审批业务的资源关系图如下，企业需要先创建审批定义，统一规定审批的表单内容与流程，然后由员工根据业务需要创建审批实例，最后由各个审批人处理审批任务，完成审批。

审批业务支持飞书内原生审批，也支持将外部三方审批系统的数据接入飞书审批内进行流转。资源定义如下：

资源 | 资源定义
---|---
[审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/overview-of-approval-resources) | 用来定义某一类审批中的表单信息和审批流程。例如，请假审批的表单内具有日期控件和文本控件，日期控件用于设置请假时间，文本控件用于设置请假事由。后续员工需要请假时即可提交该请假审批，形成一个[审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/overview-approval-instance)。
[审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/overview-approval-instance) | 员工发起审批时产生的审批流，例如，某一员工通过审批功能发起了请假审批，则该员工本次的请假审批即是一个审批实例。在审批实例内：<br>- 根据审批定义内的节点信息，可能存在一个或多个[审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/introduction)。<br>- 如果审批定义的表单内有图片或者附件控件时，支持上传[审批文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/file/overview)。<br>- 审批过程中，员工可在审批实例内提交[审批评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/overview)。
[审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/introduction) | 审批任务是指员工提交审批后，流转到各个审批人的任务。在创建审批实例后，实例根据审批定义的审批流程形成多个审批节点，每一个节点内对应一个或多个审批人，当流程流转到指定节点时，节点内的审批人需要完成各自的审批任务。
[审批评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/overview) | 在审批实例内，员工可进行评论或评论回复。
[审批文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/file/overview) | 当审批表单中有图片或附件控件时，开发者需在创建审批实例前通过审批的[上传文件](https://open.feishu.cn/document/ukTMukTMukTM/uUDOyUjL1gjM14SN4ITN)接口将文件上传到审批系统。
[三方审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_approval/overview) | 三方审批定义包括指定审批名称、图标、描述、分组等基础信息。外部第三方审批系统将根据三方审批定义来创建和同步[三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/overview)。
[三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/overview) | 三方审批系统的审批流转仍在三方系统内，开放平台审批业务提供了校验和同步接口，用来校验三方审批实例的数据是否是最新的，并同步三方审批实例数据到飞书审批。
[三方审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_task/overview) | 用来获取三方审批任务的状态。

## 方法列表

以下提供审批业务域所包含的所有 API 与事件列表。
<md-alert>
文中表格涉及的 **商店** 是指商店应用，**自建** 是指企业自建应用。应用类型说明参见[应用类型简介](https://open.feishu.cn/document/home/app-types-introduction/overview)。

### 审批定义

#### API 列表

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** | 商店 | 自建
---|---|---|---|---
[创建审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/create)<br>`POST` /open-apis/approval/v4/approval | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除原生审批定义相关信息(approval:definition) | `tenant_access_token` | **✓** | **✓**
[查看指定审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/get)<br>`GET` /open-apis/approval/v4/approvals/:approval_code | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>查看、创建、更新、删除原生审批定义相关信息(approval:definition) | `tenant_access_token` | **✓** | **✓**

### 审批实例

#### API 列表

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** | 商店 | 自建
---|---|---|---|---
[创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)<br>`POST` /open-apis/approval/v4/instances | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除原生审批实例相关信息(approval:instance) | `tenant_access_token` | **✓** | **✓**
[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)<br>`GET` /open-apis/approval/v4/instances/:instance_id | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>查看、创建、更新、删除原生审批实例相关信息(approval:instance) | `tenant_access_token` | **✓** | **✓**
[批量获取审批实例ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/list)<br>`GET` /open-apis/approval/v4/instances | 访问审批应用(approval:approval:readonly) | `tenant_access_token` | **✓** | **✓**
[预览审批流程](https://open.feishu.cn/document/ukTMukTMukTM/ukTM5UjL5ETO14SOxkTN/approval-preview)<br>`POST` /open-apis/approval/v4/instances/preview | 访问审批应用(approval:approval:readonly) | `tenant_access_token` | **✓** | **✓**
[抄送审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/cc)<br>`POST` /open-apis/approval/v4/instances/cc | 访问审批应用(approval:approval:readonly) | `tenant_access_token` | **✓** | **✓**
[撤回审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/cancel)<br>`POST` /open-apis/approval/v4/instances/cancel | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>查看、创建、更新、删除原生审批实例相关信息(approval:instance) | `tenant_access_token` | **✓** | **✓**

### 审批任务

#### API 列表

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** | 商店 | 自建
---|---|---|---|---
[同意审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/approve)<br>`POST` /open-apis/approval/v4/tasks/approve | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>同意、拒绝、退回、加签等原生审批任务操作(approval:task) | `tenant_access_token` | **✓** | **✓**
[拒绝审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/reject)<br>`POST` /open-apis/approval/v4/tasks/reject | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>同意、拒绝、退回、加签等原生审批任务操作(approval:task) | `tenant_access_token` | **✓** | **✓**
[转交审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/transfer)<br>`POST` /open-apis/approval/v4/tasks/transfer | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>同意、拒绝、退回、加签等原生审批任务操作(approval:task) | `tenant_access_token` | **✓** | **✓**
[退回审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/specified_rollback)<br>`POST` /open-apis/approval/v4/tasks/specified_rollback | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>同意、拒绝、退回、加签等原生审批任务操作(approval:task) | `tenant_access_token` | **✓** | **✓**
[加签审批任务](https://open.feishu.cn/document/ukTMukTMukTM/ukTM5UjL5ETO14SOxkTN/approval-task-addsign)<br>`POST` /open-apis/approval/v4/tasks/add_sign | 访问审批应用(approval:approval:readonly) | `tenant_access_token` | **✓** | **✓**
[重新提交审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/resubmit)<br>`POST` /open-apis/approval/v4/tasks/resubmit | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>同意、拒绝、退回、加签等原生审批任务操作(approval:task) | `tenant_access_token` | **✓** | **✓**

### 审批文件

#### API 列表

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** | 商店 | 自建
---|---|---|---|---
[上传文件](https://open.feishu.cn/document/ukTMukTMukTM/uUDOyUjL1gjM14SN4ITN)<br>`POST` /approval/openapi/v2/file/upload | 访问审批应用(approval:approval:readonly) | `tenant_access_token` | **✓** | **✓**

### 审批评论
#### API 列表

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** | 商店 | 自建
---|---|---|---|---
[创建评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/create)<br>`POST` /open-apis/approval/v4/instances/:instance_id/comments | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除原生审批评论相关信息(approval:instance.comment) | `tenant_access_token` | **✓** | **✓**
[获取评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/list)<br>`GET` /open-apis/approval/v4/instances/:instance_id/comments | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>查看、创建、更新、删除原生审批评论相关信息(approval:instance.comment) | `tenant_access_token` | **✓** | **✓**
[删除评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/delete)<br>`DELETE` /open-apis/approval/v4/instances/:instance_id/comments/:comment_id | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除原生审批评论相关信息(approval:instance.comment) | `tenant_access_token` | **✓** | **✓**
[清空评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/remove)<br>`POST` /open-apis/approval/v4/instances/:instance_id/comments/remove | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除原生审批评论相关信息(approval:instance.comment) | `tenant_access_token` | **✓** | **✓**

### 三方审批定义

#### API 列表

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** | 商店 | 自建
---|---|---|---|---
[创建三方审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_approval/create)<br>`POST` /open-apis/approval/v4/external_approvals | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除三方审批定义相关信息(approval:external_approval) | `tenant_access_token` | **✓** | **✓**
[查看指定三方审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_approval/get)<br>`GET` /open-apis/approval/v4/external_approvals/:approval_code | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除三方审批定义相关信息(approval:external_approval) | `tenant_access_token` | **✓** | **✓**

### 三方审批实例

#### API 列表

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** | 商店 | 自建
---|---|---|---|---
[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)<br>`POST` /open-apis/approval/v4/external_instances | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除三方审批实例相关信息(approval:external_instance) | `tenant_access_token` | **✓** | **✓**
[校验三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/check)<br>`POST` /open-apis/approval/v4/external_instances/check | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>查看、创建、更新、删除三方审批实例相关信息(approval:external_instance) | `tenant_access_token` | **✓** | **✓**

### 三方审批任务

#### API 列表

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** | 商店 | 自建
---|---|---|---|---
[获取三方审批任务状态](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_task/list)<br>`GET` /open-apis/approval/v4/external_tasks | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>访问审批应用(approval:approval:readonly)<br>查看、创建、更新、删除三方审批任务相关信息(approval:external_task) | `tenant_access_token` | **✓** | **✓**

### 审批 Bot 消息

使用飞书审批 Bot 推送消息给指定用户，用来主动提醒用户处理审批相关的工作。

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** | 商店 | 自建
---|---|---|---|---
[发送审批 Bot 消息](https://open.feishu.cn/document/ukTMukTMukTM/ugDNyYjL4QjM24CO0IjN)<br>`POST` /open-apis/approval/v1/message/send | 访问审批应用(approval:approval:readonly) | `tenant_access_token` | **✓** | **✓**
[更新审批 Bot 消息](https://open.feishu.cn/document/ukTMukTMukTM/uAjNyYjLwYjM24CM2IjN)<br>`POST` /open-apis/approval/v1/message/update | 访问审批应用(approval:approval:readonly) | `tenant_access_token` | **✓** | **✓**

### 审批查询

#### API 列表

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** | 商店 | 自建
---|---|---|---|---
[查询实例列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/query)<br>`POST` /open-apis/approval/v4/instances/query | 查询审批列表(approval:approval.list:readonly) | `tenant_access_token` | **×** | **✓**
[查询抄送列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/search_cc)<br>`POST` /open-apis/approval/v4/instances/search_cc | 查询审批列表(approval:approval.list:readonly) | `tenant_access_token` | **×** | **✓**
[查询任务列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/search)<br>`POST` /open-apis/approval/v4/tasks/search | 访问审批应用(approval:approval:readonly)<br>查询审批列表(approval:approval.list:readonly) | `tenant_access_token` | **✓** | **✓**
[查询用户的任务列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/query)<br>`GET` /open-apis/approval/v4/tasks/query | 访问审批应用(approval:approval:readonly)<br>从用户维度查看审批任务(approval:task:list_by_user) | `tenant_access_token`<br>`user_access_token` | **✓** | **✓**
[查询审批 ID（专用）](https://open.feishu.cn/document/ukTMukTMukTM/uEDN5UjLxQTO14SM0kTN)<br>`GET` /open-apis/approval/v4/tasks/query | \- | `tenant_access_token` | **✓** | **✓**

### 审批事件

#### API 列表

**[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** | 商店 | 自建
---|---|---|---|---
[订阅审批事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/subscribe)<br>`POST` /open-apis/approval/v4/:approval_code/subscribe | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除原生审批定义相关信息(approval:definition) | `tenant_access_token` | **✓** | **✓**
[取消订阅审批事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/unsubscribe)<br>`POST` /open-apis/approval/v4/:approval_code/unsubscribe | 查看、创建、更新、删除审批应用相关信息(approval:approval)<br>查看、创建、更新、删除原生审批定义相关信息(approval:definition) | `tenant_access_token` | **✓** | **✓**

#### 事件列表

**[事件（Event）](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)** | 权限要求 | 触发时机
---|---|---
[审批定义更新](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/custom-approval-event)<br>> 当审批定义发生变化时触发该事件。 | 访问审批应用(approval:approval:readonly)<br>查看、创建、更新、删除审批应用相关信息(approval:approval) | approval.approval.updated_v4
[审批实例状态变更](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/common-event/approval-instance-event)<br>> 当审批实例状态发生变化时触发该事件。 | 访问审批应用(approval:approval:readonly)<br>查看、创建、更新、删除审批应用相关信息(approval:approval) | approval_instance
[审批任务状态变更](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/common-event/approval-task-event)<br>> 当审批任务状态发生变化时触发该事件。 | 访问审批应用(approval:approval:readonly)<br>查看、创建、更新、删除审批应用相关信息(approval:approval) | approval_task
[审批抄送状态变更](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/common-event/approval-cc-event)<br>> 当审批抄送状态发生变化时触发该事件。 | 访问审批应用(approval:approval:readonly)<br>查看、创建、更新、删除审批应用相关信息(approval:approval) | approval_task
[请假审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/leave)<br>> 「审批」应用的表单里如果包含请假控件组，则在此表单审批通过后触发此事件。 | 访问审批应用(approval:approval:readonly) | leave_approvalV2
[加班审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/overtime)<br>> 「审批」应用的表单里如果包含加班控件组，则在此表单审批通过后触发此事件。 | 访问审批应用(approval:approval:readonly) | work_approval
[换班审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/shift-change)<br>> 「审批」应用的表单包含换班控件组的，换班申请审批通过后触发此事件。 | 访问审批应用(approval:approval:readonly) | shift_approval
[补卡审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/attendance-record-correction)<br>> 补卡申请审批通过后触发此事件。你可以在「打卡」应用里提交补卡申请。 | 访问审批应用(approval:approval:readonly) | remedy_approval_v2
[出差审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/business-trip)<br>> 「审批」应用的表单里如果包含出差控件组，则在此表单审批通过后触发此事件。 | 访问审批应用(approval:approval:readonly) | approval.instance.trip_group_update_v4
[外出审批](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/out-of-office)<br>> 「审批」应用的表单里如果包含外出控件组，则在此表单审批通过后触发此事件。 | 访问审批应用(approval:approval:readonly) | out_approval
