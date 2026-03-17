# 审批常见问题

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/approval-related-faqs
Updated: 2025-04-21

# 审批常见问题

本文汇总了飞书审批相关的常见问题与解决方案，供你参考。

## 原生审批定义相关

### [查看指定审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/get)中返回的 node_list 参数怎么使用？

该参数主要用于对审批节点设置了发起人自选的情况（非发起人自选的节点不需要关心，会自动流转），其中：

- need_approver 参数表示是否需要发起人自选审批人，如果需要发起人自选（need_approver 取值为 true），则在创建审批实例时需要指定节点对应的审批人。
- 系统自动生成的 node_id 或者自定义的 custom_node_id 均可作为节点 ID 来使用。

### 关联外部选项说明文档中的 token 怎么写？

token 值是自定义的，用于校验请求是否为合法来源，建议生成一个唯一 ID 来使用。

### 设置控件 ID 时是否可以使用控件的自定义 ID？

可以

### 审批表单的单选控件使用外部数据时，为什么显示超时？

该配置下，大概 4s 左右才能响应数据。

### 是否支持 API 方式修改审批定义？

不支持，只能在后台修改。

### 审批表单设计上，有没有可以点击链接的富文本的文本框？

暂无

### 外部数据没办法加入审批流的分支条件吗？

不是所有的字段都可以作为条件，目前可以作为条件的字段：

- 发起人
- 部分控件：单选、多选、数字、金额、计算公式、日期区间、明细汇总
- 请假控件组中的假期类型、请假时长
- 加班控件组中的加班类型、加班时长
- 外出控件组中的外出类型、外出时长
- 出差控件组中的出发地、目的地、交通工具、出差时长

### [获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口返回的部门有部门路径吗？

暂无

## 原生审批实例相关

### [创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)时报错“控件值不合法或者为空”如何处理？

- 问题现象：创建审批实例失败，返回 60006、1390001 之类的错误码，并提示“控件值不合法或者为空。控件=xxx”。

	

- 解决方案：

	- 错误信息中 `控件=xxx` 是具体出现错误的表单控件 ID 或自定义 ID。如果实际报错中包含 `控件=xxx`，则可以根据该信息检查对应的控件是否传入了值、传入的值是否正确。
	- [创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)文档中提供了暂不支持创建的控件类型，如果审批定义包含了 **创建审批实例** API 不支持的控件，则在调用 **创建审批实例** API 时，会因控件不支持导致报错。此时建议你通过飞书客户端的审批中心发起审批。

### 如何获取审批实例的访问链接？

通过 AppLink 获取，具体参考[打开飞书审批](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/applink-protocol/supported-protocol/open-an-approval-page)。

### [创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)时，单选或多选控件关联了外部选项，如何传值？

单选或多选控件的 value 参数传入[关联外部选项说明](https://open.feishu.cn/document/ukTMukTMukTM/uADM4QjLwADO04CMwgDN)中的 options.id 参数值。

**注意**：如果审批定义中存在多个单选或多选控件，且关联了多个外部数据源，需要确保多个外部数据源之间的 id-value 参数值全局固定且唯一，否则可能出现选项错乱，或者在表单中显示异常等问题。

### 如何将审批实例的发起人或者审批人设置为应用机器人？

- **发起人**

	[创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)时，发起人的 open_id 参数传入机器人的 open_id，即可把审批发起人设置为对应的机器人。机器人的 open_id 可调用[获取机器人信息](https://open.feishu.cn/document/ukTMukTMukTM/uAjMxEjLwITMx4CMyETM)接口，从返回结果中获取机器人的 open_id。

- **审批人**

	1. 创建或编辑审批定义时，将审批节点的审批人设置为 **提交人自选**。

		

    2. [创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)时，提交人自选参数（node_approver_open_id_list）中，传入机器人的 open_id。机器人的 open_id 可调用[获取机器人信息](https://open.feishu.cn/document/ukTMukTMukTM/uAjMxEjLwITMx4CMyETM)接口，从返回结果中获取机器人的 open_id。

### 创建审批实例时，接口是否会校验表单控件的必填规则？

不会，必填的控件即使不传值也不会报错，仍可以成功调用 **创建审批实例** 接口。warning
不传必填控件时，该控件的完整 JSON 参数均不能传入。一旦传入控件 JSON，就必须设置参数 value，如果传入了控件 JSON，但没有设置 value，接口就会报错。

必填控件是指审批定义的表单设计中，带有 * 号标识的控件。

### [获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口返回的 url 为什么打不开？

检查 url 的参数中是否包含 `\\u0026`，是因为 `&` 被转义成了 `\\u0026`，只需要将 `\\u0026` 替换成 `&` 符号即可打开。

### 撤销操作回调的数据里状态是“REVERTED”，为什么调[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口返回的状态是“CANCELED”？

接口不会返回“REVERTED”，但是事件会有区分。

- 如果审批未审完就取消，则是“CANCELED”。
- 审批结束，此时取消，返回的是“REVERTED”。

### [创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)接口 department_id 字段能填根部门吗？

不能，不支持填写根部门。

### 单个实例详情里面 task_list 参数是返回全部审批任务，还是只返回当前审批人的审批任务？

返回全部审批任务。

### 可以通过 OpenAPI 的方式实现审批流中节点的回退操作吗（能够审批回退重新发起新的审批）？

不支持

### [创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)接口失败时，相同的请求参数在 1 秒内调用两次，会不会产生两个审批流？

不会，只会更新。

### 审批实例中可以选择多人，使用接口可以获取到实例内多人的信息吗？

可以通过[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口获取。

### [创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)接口的 form 参数值要转义吗？

需要，需要将 JSON 数据压缩转义为字符串进行传值。

### 是否只有发起人可以撤回审批实例，其他人没有撤回权限？

是的

### [创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)时 uuid 相同会有什么效果？

首次设置 uuid 成功创建审批实例后，后续传相同的 uuid 继续创建，接口会报错。

### [获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口返回的审批单编号（serial_number）是否唯一？能否根据编号获取审批实例详情？

审批单编号在企业内唯一，按审批提交顺序自动生成。登录[审批管理后台](https://www.feishu.cn/approval/admin)，在 **数据管理** > **数据查看** 功能页可以查询到对应的申请编号。

目前暂不支持通过审批单编号获取审批实例详情。

### 提交审批前[预览审批流程](https://open.feishu.cn/document/ukTMukTMukTM/ukTM5UjL5ETO14SOxkTN/approval-preview)报错“审批流程预览失败”如何处理？

调用[获取单个用户信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/get)接口，确认审批发起人所属的部门为一个还是多个。

- 如果审批发起人所属部门为多个，则在调用 **预览审批流程** 接口时，请求参数 department_id 必须传入审批发起人所属的其中一个部门。

- 如果审批发起人所属部门只有一个，则在调用 **预览审批流程** 接口时，请求参数 department_id 可以不填。

### 抄送人需要处理审批吗？

不需要，只可以看到审批的信息。

### 创建飞书审批的时候，外部关联的单选字段在飞书卡片里面没有显示是什么原因？

由于用户侧发起请求的时候外部数据源返回接口报错，所以获取选项失败，需要接口的开发者检查其开发的接口是否有问题。

### 审批事件监听的 uuid 是在创建审批实例传入的 uuid 吗？

事件的 uuid 是自动生成的，标识事件的唯一性，和创建审批时自定义的 uuid 没关系。

### 审批单据编号是否唯一？

审批单据编号在租户内唯一，不区分审批定义，按照审批提交顺序生成。你可以进入[审批管理后台](https://www.feishu.cn/approval/admin/approvalList?devMode=on)，在 **数据管理** > **数据查看** > **数据管理** 功能页，查看当天发起的审批的编号。

### 是否有接口可根据编号查询审批实例详情？

暂未提供。

## 原生审批任务相关

### [同意审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/approve)接口返回 “task not found” 报错如何处理？

任务未找到报错，排查方案：

1. 调用[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)，从返回结果中确认当前审批任务的状态是否为已通过，如果是已通过的任务，重复同意会报错。
2. 如果审批任务未通过，则需要检查传入的任务 ID 以及审批人 ID 是否正确。

### [同意审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/approve)接口返回 “no operation permission” 报错如何处理？

没有操作权限报错。审批任务对应固定的审批人，因此需要检查接口传入的审批任务 ID 与审批人 ID 是否相匹配。你可以调用[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口，从返回结果中确认审批任务 ID 与审批人 ID 的对应关系。

### 审批任务被驳回后，重新提交审批编号会变吗？

会，相当于重新提交了一个新的，只是内容和之前的一样。

## 三方审批相关问题

### 三方服务页面请求头能否带 x-frame-options？

不能，如果带 x-frame-options 会导致后面请求始终命中前面的缓存，造成页面始终打不开，同时还可能出现删掉 x-frame-options 后，若客户端不主动清除一次缓存、服务端未生成新版本资源，就始终无法打开的情况。

### 调用[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)同步审批单，三方审批同意后为什么审批还在待办列表里（即审批任务未同步）？

一般有两种情况：

- 确认最新同步的日志信息，是否携带最新状态，可能三方系统中操作了审批，但是任务没有同步给飞书审批。
- 使用了 update 模式进行同步（即 [同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create) 的参数 update_mode 取值 UPDATE），不仅要确保最外层的 update_time 大于上次同步的 update_time，还要确保 task_list 和 cc_list 的 update_time 大于上次同步的 update_time，如果外层的 update_time 小于上一次更新的，则整个数据不更新；如果 task_list 内的 update_time 小于上一次更新时间，则只是对应的任务不更新。如果 update_mode 取值 REPLACE，则不比较 update_time，会将整个请求的数据覆盖为审批系统中的最新数据。

### 调用[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)成功，新增任务没有出现在审批人待办列表是什么原因？

- 新增任务没有出现在审批人待办列表，先确认下用户 ID 是否正确，如果用户 ID 传错了，则不会出现在期望的用户待办列表。
- 确认租户 Token 信息是否与用户匹配，即多租户场景，用户是否存在该租户。

### 调用[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)成功，待办列表任务删不掉或者删除任务仍存在审批待办列表是什么原因？

- 可能是同步到审批的数据在业务方系统被删除，且同步失败或者信息丢失。可以查询用户的 [待办任务列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/query) 或者 [查询任务列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/search)，获取到审批实例的信息后，调用 [同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create) 的接口删除数据。
- update 模式下，update_time 要大于上一次同步的时间，不然会被忽略掉，两次审批任务的 update_time 一样时，也不会更新数据。

### 审批任务同步了，但是没有同意或拒绝按钮是什么原因？

调用[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)时，需要同步 action_config 参数，用来设置快捷审批操作。

### 三方审批无法及时同步至待办状态是什么原因？

update 模式下，update_time 要大于上一次同步的时间，不然会被忽略掉，两次审批任务的 update_time 一样时，也不会更新数据。

### 同步三方审批实例接口的必填字段过多，能否只更新审批状态？

暂不支持

### 如何清理历史三方审批流程？

调用[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)接口同步数据时，将 `update_mode` 取值 `REPLACE`，这表示数据同步时会以当前调用接口推送的数据为最终数据，其他不在当前推送数据中的审批任务、抄送数据均会在审批中心内清除。详细介绍参见[三方审批实例常见问题](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/faqs#-787372)

### 点击三方快捷审批的“同意”或“拒绝”后，提示提交失败是什么原因？

一般是审批定义中配置的 action_callback_url 不正确，该 URL 需要是一个能够请求成功的接口，并按照三方审批快捷审批回调接口中的返回格式进行返回，请检查[创建三方审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_approval/create)请求中携带的 action_callback_url 是否正确。

## 审批 Bot 相关

### 发送 Bot 消息成功，但是用户并没有收到是什么原因？

可能是发送 Bot 请求参数中的 uuid 重复，请修改后再尝试。
