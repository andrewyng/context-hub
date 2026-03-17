# 原生审批接入指南

Source URL: https://open.feishu.cn/document/server-docs/approval-v4/development-guide/native-approval-access-guide
Updated: 2025-02-21

# 原生审批接入指南

通过本文你可以体验如何使用审批 API 构建原生审批并处理审批，帮助你快速了解原生审批 API 的接入操作。
本文使用 [API 调试台](https://open.feishu.cn/document/tools-and-resources/api-explorer-guide)调用审批 API。

## 流程概览

基于审批 API 的原生审批接入流程图如下所示。

首先企业管理员需要创建一个用于审批的应用，并将需要使用审批功能的员工加入应用的可用范围，然后根据企业内不同成员角色的分工，依次使用审批 API 完成各自的业务处理，角色与分工如下表所示。

角色 | 分工
---|---
企业管理员 | 企业管理员需要先在企业内创建审批定义定义审批表单内容以及审批流程。
审批提交人 | 企业成员根据实际情况，选择并发起一个审批流，系统会对应创建一个审批实例，审批流程在该实例内流转。
任务审批人 | 审批流程内包含多个审批节点，当流程流转到不同节点时，会生成审批任务（一个节点内的一个审批人对应一个审批任务），相应审批人需要处理自己手里的审批任务。

本文示例操作中，为了便于体验原生审批接入流程，以上管理员、提交人、审批人均在一个用户账号内完成。操作涉及的 API 与事件如下表，了解审批业务域下所有 API 与事件参考[审批概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval-overview)。

资源 | 详情
---|---
API | - [订阅审批事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/subscribe) <br>- [查看指定审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/get)<br>- [创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)<br>- [获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)<br>- [同意审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/approve)
事件 | [审批实例状态变更](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/common-event/approval-instance-event)

## 步骤一：创建并配置应用

本章节以企业自建应用为例进行介绍。
企业自建应用与商店应用的介绍参见[应用类型](https://open.feishu.cn/document/home/app-types-introduction/overview#c3c7ad51)。各应用的开发指南参考：

- [企业自建应用开发流程](https://open.feishu.cn/document/home/introduction-to-custom-app-development/self-built-application-development-process)
- [商店应用开发流程](https://open.feishu.cn/document/uMzNwEjLzcDMx4yM3ATM/ugzNwEjL4cDMx4CO3ATM)

1. 登录[开发者后台](https://open.feishu.cn/app)。
2. 自定义设置应用名称、描述、图标，创建一个企业自建应用。

    

3. 进入应用详情页，在 **开发配置** > **权限管理** > **API 权限** 功能页，开通 **查看、创建、更新、删除审批应用相关信息（approval:approval）** 权限。
    **说明**：需要开通什么 API 权限取决于应用需要调用哪些接口，不同接口所需的不同权限请参考各个接口文档，例如[创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)。

    

4. （可选）在 **开发配置** > **事件与回调** > **事件配置** 功能页，配置事件订阅并订阅 **审批实例状态变更（approval_instance）** 事件。
    **说明**：

    - 订阅事件后，你可以实时接收审批数据变化情况，并及时做出业务处理。如需配置事件订阅你需要先在本地准备公网可访问的服务器，通过服务器请求地址接收事件。具体操作参见[事件概述](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)。

    - 不配置事件订阅也不影响体验当前示例流程，你可以选择跳过本步骤。

    

5. 在 **应用发布** > **版本管理与发布** 页面，点击 **创建版本**。

    

6. 在 **版本详情** 页面，设置版本号（首个应用版本号一般为 1.0.0）与更新说明，然后在页面底部单击 **保存**。

7. 在 **确认提交发布申请** 对话框，单击 **申请线上发布**。

    需要等待企业管理员完成应用审核，使以上配置生效，然后再进行后续操作。

## 步骤二：创建审批定义

不建议你通过 API 的方式创建审批定义，建议在审批管理后台创建审批定义。区别：

- 通过[审批管理后台](https://www.feishu.cn/approval/admin/approvalList?devMode=on)创建的审批定义支持删除。
- 通过[创建审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/create) API 创建的审批定义无法删除，API 方式一般应用于商店应用创建审批定义。

**操作步骤**

1. 登录[审批管理后台](https://www.feishu.cn/approval/admin/approvalList?devMode=on)。
2. 在页面右侧点击 **创建审批**，然后选择 **创建自定义审批**。

    你也可以直接选择模板库里的模版创建审批定义。

    

3. 依次在 **基础信息**、**表单设计**、**流程设计**、**更多设置** 功能页完成配置。

    本示例创建如下审批定义，具体操作说明参见[管理员创建审批](https://www.feishu.cn/hc/zh-CN/articles/360040241113)。

    1. 在 **基础信息** 界面，完成以下配置。

        - **名称**：测试审批
        - **分组**：行政
        - **谁可以提交该审批**：全员
        - **流程管理员**：本示例将当前登录用户设置为流程管理员

    2. 在 **表单设计** 界面，添加一个 **单行文本** 控件。

        

    3. 在 **流程设计** 界面，将 **审批** 节点内的审批人设置为指定成员，并添加审批人。

        本示例将当前登录用户设置为审批人。

        

    4. 在 **更多设置** 界面，保持默认配置即可。

4. 在页面右上角点击 **发布**。

5. 返回审批列表找到刚创建的审批定义，并点击编辑图标。

    

6. 在当前审批定义页面的浏览器地址栏，复制 `definitionCode` 参数值。
7. 
**注意事项**：使用审批定义的 Approval Code 可以获取审批定义下所有数据，以及可以订阅该定义下所有审批实例的变更事件，因此需要注意妥善保管审批定义的 Approval Code，避免因 Approval Code 泄露导致的数据安全风险。

该值即是当前审批定义的唯一编码（Approval Code），将在后续调用 API 时使用。

## 步骤三（可选）：订阅审批事件

本文的操作中，已经在 **步骤一** 为应用订阅了审批相关的事件，还需要调用 [订阅审批事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/subscribe) 接口订阅本示例创建的审批定义，这样后续应用才可以接收相应的审批事件。

1. 登录 [API 调试台](https://open.feishu.cn/api-explorer)。

2. 在页面右上角将应用切换为 **步骤一** 创建的应用，并获取应用的 tenant_access_token。

    

3. 在 API 列表中搜索并选择 **订阅审批事件** 接口。

    

4. 在 **路径参数** 页签内，将 **步骤二** 复制的 `definitionCode` 参数值粘贴进 `approval_code` 输入框。

5. 在页面右上角点击 **开始调试**，并查看响应结果。

    返回 **success** 表示成功订阅。

## 步骤四：查看审批定义

1. 在 API 列表中搜索并选择[查看指定审批定义](https://open.larkoffice.com/document/server-docs/approval-v4/approval/get)接口。

    

2. 在 **路径参数** 页签内，将 **步骤二** 复制的 `definitionCode` 参数值粘贴进 `approval_code` 输入框。

3. 在页面右上角点击 **开始调试**，并查看响应结果。

    具体参数说明参见[查看指定审批定义](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval/get)，本示例中，你需要保存以下参数值：

    - `form`：审批定义中的表单数据，后续创建审批实例时需要参考该数据设置对应的表单 JSON 内容。

    - `node_list.name` ：审批节点的 `node_id` 值，后续处理审批任务时需要使用该 ID。

    

## 步骤五：创建审批实例

1. 在 API 列表中搜索并选择[创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)接口。

2. 在 **请求体** 界面，将原有的 JSON 内容替换为以下内容。

    - `approval_code`：审批定义的唯一编码，取值来自 **步骤二** 获取的 `definitionCode` 参数值。
    - `form`：当前实例内的表单 JSON 内容，各类型控件的 JSON 内容参考[控件值说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create#4fd9fac6)，请求 API 时需要将 JSON 压缩并转义为 String 类型再传入 `from` 参数。本示例的 **单行文本** 控件 JSON 参数说明如下：
        - `id`：在 **步骤四** 保存的 `form` 参数值中提取控件的 `id`
        - `type`：**单行文本** 控件取值为 input
        - `value`：自定义内容。例如：申请打扫工位卫生

    - `open_id`：发起审批的用户 open_id，调用[通过手机号或邮箱获取用户 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/batch_get_id) 接口获取。

    ```
    {
      "approval_code": "931E3E80-AA96-4370-8859-0E7FA27EB251",
      "form": "{"id":"widget01","type":"input","value":"申请打扫工位卫生"}",
      "open_id": "ou_87046964ad62bc2216e7d56bde931234"
    }
    ```
<br>

3. 在页面右上角点击 **开始调试**。

    调用成功后将返回审批实例的唯一编码 `instance_code`，你需要保存该参数值，后续调用 API 时使用。

    

## 步骤六：获取单个审批实例详情

1. 在 API 列表中搜索并选择[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口。

2. 在 **路径参数** 页签内，将 **步骤四** 获取到的 `instance_code` 传入 `instance_id` 输入框内。

    

3. 其他配置项保持默认值，并在页面右上角点击 **开始调试**。

    调用成功后，你需要在响应结果内获取并保存审批任务 ID（`task_list.id`）参数值，后续处理审批任务时需要使用该参数值。其他参数说明参见[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)。

    

## 步骤七：处理审批任务

1. 在 API 列表中搜索并选择[同意审批任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/task/approve)接口。

2. 在 **查询参数** 界面，`user_id_type` 选择 **open_id**，并点击 **选择成员**，选择复制当前登录用户的 open_id。

    在创建审批定义时，将审批人设置为了当前登录用户，因此这里需要获取当前登录用户的 open_id。实际应用场景中，审批人是谁就需要获取谁的用户 ID。

    

3. 在 **请求体** 界面，将默认 JSON 内容替换为以下内容。

    - `approval_code`：审批定义的唯一编码，取值来自 **步骤二** 获取的 `definitionCode` 参数值。
    - `instance_code`：审批实例的唯一编码，取值来自 **步骤四五**获取的 `instance_code` 参数值。
    - `user_id`：任务操作人的 ID，取值来自上一步复制的 open_id。
    - `comment`：审批意见，本示例取值为 **OK**。
    - `task_id`：审批任务 ID，取值来自 **步骤六** 获取的 `task_list.id` 参数值。

    ```
    {
      "approval_code": "931E3E80-AA96-4370-8859-0E7FA27EB251",
      "instance_code": "AD990292-E4FB-4FAA-8B31-1C014B5F4827",
      "user_id": "ou_87046964ad62bc2216e7d56bde936384",
      "comment": "OK",
      "task_id": "7429295951359934468"
    }
    ```
<br>

4. 在页面右上角点击 **开始调试**。

    调用成功如下图所示。

    

## 操作结果

当审批实例内所有审批任务都处理完成后，该审批实际便处理完成了，你可以通过以下任一方式获取审批结果。

- 方式一：如果应用已经订阅了[审批实例状态变更](https://open.feishu.cn/document/ukTMukTMukTM/uIDO24iM4YjLygjN/event/common-event/approval-instance-event)事件，则你可以在本地服务器内接收到事件数据。同意审批后，事件体内包含的实例状态（`status` 参数）取值为 **APPROVED**，即已批准。
- 方式二：调用[获取单个审批实例详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/get)接口，查询当前审批实例详细信息。同意审批后，实例状态（`status` 参数）取值为 **APPROVED**，即已批准。
- 方式三：登录飞书客户端，在 **工作台** > **审批** > **已办** 功能页，查看对应的审批处理结果。

   

## 相关操作

### 添加审批相关附件或图片

调用[上传文件](https://open.feishu.cn/document/ukTMukTMukTM/uUDOyUjL1gjM14SN4ITN)接口，支持把文件上传到审批业务并从返回结果中获取文件标识码（code）和 URL 地址（url）。

应用场景：

- 调用[创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create) API 时，如果表单包含 **图片/视频**、**附件** 控件，则对应的 JSON 内容需要传入文件标识码，以 **附件** 控件为例，以下的 `D93653C3-2609-4EE0-8041-61DC1D84F0B5` 为附件的标识码。

    ```
    {
        "id":"widget1",
        "type":"attachmentV2",
        "value": ["D93653C3-2609-4EE0-8041-61DC1D84F0B5"]
    }
    ```

- 调用[创建评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/create) API 时，评论内容 content 支持添加附件或图片，添加时需要传入文件的 URL 地址。例如在以下示例 `content` 值内，`url` 值需要替换为真实的图片地址。

    ```
    {"text":"评论有附件","files":[{"url":"xxx","fileSize":155149,"title":"9a9fedc5cfb01a4a20c715098.png","type":"image","extra":""}]}
    ```

### 在审批内评论

调用[创建评论](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance-comment/create) API，支持在指定审批实例内评论，评论支持回复，记录审批相关的关键信息或者进行业务讨论。

### 将审批抄送给他人

调用[抄送审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/cc) API，可以将审批实例抄送给需要关注该审批流的员工，被抄送人可查看审批实例的数据。
