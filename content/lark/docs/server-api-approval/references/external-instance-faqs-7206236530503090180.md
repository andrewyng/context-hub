# 三方审批实例常见问题

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/external_instance/faqs
Updated: 2025-04-27

# 三方审批实例常见问题

本文提供三方审批实例同步相关的常见问题与解决方案。

## 实例的同步方式有何区别？

[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)时，需要选择同步方式（update_mode），包括全量同步（REPLACE）和增量同步（UPDATE），通过了解同步方式的区别，可以帮助你确认不同同步方式是否成功同步了数据。

- **增量同步（UPDATE）**

	该同步方式适用于不影响历史同步请求，仅需对审批单据新增数据更新的场景。例如，审批节点增加了审批人（加签），或者审批流程流转到了下一个审批节点的审批人时，通过增量同步的方式，将发生变化的审批实例、任务、抄送等数据同步至飞书审批即可。

    - 优点：每次只需传入有变动的审批数据，可通过更少的参数完成局部更新，也更符合常规的审批流程数据同步。
	- 缺点：会有较多限制。例如：

  		- 会校验 update_time 参数，系统会对每次同步时传入的 update_time 和上一次同步请求时传入的 update_time 作对比，时间需要大于上次同步的时间。warning
          这里会对多个 update_time 参数进行比较，分别需要大于上一次同步请求时传入的 update_time 才能成功更新。

		  - 请求参数最外层的 update_time 对应的是实例更新时间。
		  - task_list 中的 update_time 对应的是任务更新时间。
		  - cc_list 中的 update_time 对应的是抄送更新时间。

		  系统会分别比较实例、任务、抄送本次同步的 update_time 和上次同步的 update_time。如果本次同步的 update_time 小于上次同步的 update_time，则对应的数据不更新。例如，task_list 中的 update_time 小于上次同步的 update_time，则对应的任务不更新。

        - 部分字段无法更新，包括：

			- approval_code
			- instance_id
			- department_id
			- department_name
			- task_list
				- task_id
				- user_id
				- open_id
				- create_time
				- node_id
				- node_name
            - cc_list
            	- cc_id
            	- user_id
            	- open_id
            	- create_time

- **全量同步（REPLACE）**

	该同步方式会将整个审批单据修改为当前请求内传输的参数的对应状态，不包含在本次请求的数据，如实例、任务、抄送以及节点等信息，会被清空，替换为本次参数所包含的最新数据，该方式适用于需要对审批单据进行全量替换，或者将三方审批系统数据初始化同步到飞书审批的场景。

	- 优点：可更新除了 approval_code 和 instance_id 之外的所有参数，不校验 update_time，对审批单据进行全量替换。

	- 缺点：属于一次性的同步处理，非正常的节点变更流程，每次需要传入审批单据的所有数据，来对审批单据进行全量更新。

## 同步时出现异常如何排查？

1. 查询目前用户的待办状态。

	调用[查询用户的任务列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/query)接口，获取用户当前的任务列表，检查异常的审批任务是否在列表内，以及对应的状态是否正确。

2. 校验三方审批同步的时间，和历史同步请求记录进行对比，确保当前传入的同步时间是最新的时间。

	调用[校验三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/check)接口，提交实例最新更新时间进行校验。如果服务端不存在该实例，或者服务端实例更新时间不是最新的，则返回对应实例 ID。

    [校验三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/check)接口校验逻辑说明：

    1. 传入接口所需请求参数后，系统首先校验审批实例 ID 是否存在。

		- 存在，进行下一条判断。
		- 不存在，则校验异常，返回不存在的实例 ID，且因为实例不存在，不会返回任务信息。

	2. 校验任务 ID 是否存在。

		- 存在，进行下一条判断。
		- 不存在，则校验异常，返回实例 ID、实例最近生效的 update_time、任务 ID（任务的 update_time 为 0）。

    3. 校验任务的 update_time 是否为当前任务最新一次同步时间。

		- 是，进行下一条判断。
		- 否，则校验异常，返回实例 ID、最近生效的 update_time、任务 ID、任务最近生效的 update_time。

	4. 校验实例的 update_time 是否为当前实例最新一次同步时间。

		- 是，校验结束，无异常数据返回。
		- 否，则校验异常，返回实例 ID、实例最近生效的 update_time、任务数据为空。

	返回结果示例：

    - 校验正常时，接口调用成功但不返回数据。

		```json
        {
          "code": 0,
          "data": {
            "diff_instances": []
          },
          "msg": "success"
        }
		```
	- 校验异常时，返回异常数据。如三方审批实例不存在，则返回实例 ID。

		```json
        {
          "code": 0,
          "data": {
            "diff_instances": [
              {
                "instance_id": "B9414177-4ED4-4A05-A634-3E95F534E863-xxxxx", 
                "tasks": [],
                "update_time": "0"
              }
            ]
          },
          "msg": "success"
        }
		```

## 如何及时发现未同步的三方审批实例？

通过设置定时任务，每间隔一段时间（例如 5 分钟）调用[校验三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/check)接口，将最近 5 分钟产生的实例通过该接口进行对比。如果数据在服务端不存在或者不是最新，则可以根据本接口返回的实例 ID、任务 ID，前往[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)。

## 如何清理所有的异常数据、历史数据？warning
该方式会将所有的审批实例、任务、抄送全部清除，新同步的审批也会置为已同意且不属于任何用户（所有用户无法通过 API 或审批列表查看到），且操作后数据不会恢复。因此，建议你先在[测试企业](https://open.feishu.cn/document/home/introduction-to-custom-app-development/testing-enterprise-and-personnel-functions)进行调试，符合预期后（如确认该操作后不会影响实际线上的审批业务）再应用于正式环境。

1. （可选）调用[查询用户的任务列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/query)接口，基于用户 ID 获取用户下所有的审批定义 Code 和审批实例 ID。

    清理所有数据必须使用审批定义 Code 与审批实例 ID，如果你本地保存了可用的审批定义与实例信息，则无需调用当前接口进行查询。

2. 调用[同步三方审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/external_instance/create)接口，完成以下参数配置，清理所有数据。

	- 传入已获取的审批定义 Code（approval_code）、审批实例 ID（instance_id）。
	- update_mode 传入 REPLACE，表示全量更新。
	- status 传入 APPROVED，将审批置为已结束，结果为同意。
	- user_id 不传值，表示审批不属于任何用户。

	这样同步后，会将所有的审批数据都覆盖掉，且因为当前请求包含的审批不属于任何用户，也没有用户可以看到这些审批。

## 相关链接

- 更多审批相关常见问题，参见[常见问题](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval-related-faqs)。
- 如遇问题始终无法解决，请请咨询[技术支持](https://applink.feishu.cn/TLJpeNdW)。
