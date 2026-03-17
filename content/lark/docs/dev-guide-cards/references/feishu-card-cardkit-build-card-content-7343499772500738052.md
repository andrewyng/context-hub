# 搭建卡片

Source URL: https://open.feishu.cn/document/feishu-cards/feishu-card-cardkit/build-card-content
Updated: 2025-05-07

# 构建卡片内容

本文档介绍如何使用可视化搭建工具构建卡片内容。你也可选择直接撰写卡片 JSON 代码构建卡片。详情参考[卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)。

## 步骤一：创建卡片

你可以基于搭建工具提供的参考案例快速构建一张卡片，也可以创建空白卡片自行构建内容。

### 方式一：通过参考案例库创建卡片

1. 登录[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_build_card_content)。
1. 在 **我的卡片** 页面，点击 **参考案例库**。
1. 在 **参考案例库** 对话框，选择左侧案例分类。
   推荐你选择 **新版专区** 的卡片案例，可体验局部多语言设置、流式输出、精细化配置布局等新版卡片特性。了解新版卡片与旧版卡片区别，参考[飞书卡片搭建工具概述](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/feishu-cardkit-overview)。

   

1. 在 **从参考案例创建卡片** 对话框内，输入卡片名称，并点击 **创建**。

   你将进入卡片的编辑页面。

### 方式二：创建空白卡片

1. 登录[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_build_card_content)。
1. 在 **我的卡片** 页面，点击 **创建空白卡片**。
1. 在 **创建空白卡片** 对话框，填写卡片名称，选择卡片版本，并点击 **创建**。
   推荐你选择 **新版卡片**，可体验局部多语言设置、流式输出、精细化配置布局等新版卡片特性。了解新版卡片与旧版卡片区别，参考[飞书卡片搭建工具概述](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/feishu-cardkit-overview)。

    

    你将进入卡片的编辑页面。

## 步骤二：添加卡片组件

本小节介绍如何在飞书卡片搭建工具中搭配合适的组件，构建卡片内容。要了解各个组件的描述和组件的 JSON 结构，参考[组件概述](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/component-overview)。

1. 进入卡片编辑页面。
1. 添加 **标题** 组件，并填写标题内容。

   
1. 添加 **分栏** 组件，将卡片内容分割为左右两列，并设置列宽比例。

    
1. 选中 **分栏** 组件的第一列，添加 **普通文本** 组件，并填写文本内容。

     
1. 选中 **分栏** 组件的第二列，添加 **图片** 组件，并通过点击 **上传图片** 的方式，直接上传一张示例图片。

    
1. 在 **分栏** 组件下方，添加 **分割线** 组件。

    
1. 在 **分割线** 组件下方，添加另一个 **分栏** 组件（保持默认配置），并在第一列中添加 **按钮** 组件。

   
1. 为 **按钮** 组件设置 **打开链接** 的交互能力，并通过拖拽的方式调整按钮位置。

    
1. 在搭建工具顶部菜单栏，点击 **向我发送预览**，预览卡片内容。

    

   预览效果如下图所示。你已成功搭建一张卡片并为其添加了内容。

   

## 常见问题

### Q：如何在搭建工具中删除某个组件？

如下图，你可以在搭建工具左侧导航栏中，切换至 **大纲树** 一栏，在卡片的大纲树中选中指定组件删除。

## 后续操作

- 你可以在卡片组件内绑定卡片变量，后续在同类型业务场景中只需要为卡片变量赋值，便可得到不同内容的飞书卡片。详情参考[配置卡片变量](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/configure-card-variables)。
- 你可为卡片添加协作者，邀请他人共同编辑卡片；也可为卡片添加应用或自定义机器人，为其开通发送卡片权限。详情参考[管理卡片权限](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/manage-card-template)。
- 如何预览与发布卡片，参考[预览与发布卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/preview-and-publish-cards)。
- 如何导入导出卡片实现跨租户同步卡片数据，参考[导入导出卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/import-and-export-cards)。
- 交互组件的交互方式分为 **打开链接**、**请求回调**，了解如何配置不同的卡片交互方式，参考[配置卡片交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions)。
