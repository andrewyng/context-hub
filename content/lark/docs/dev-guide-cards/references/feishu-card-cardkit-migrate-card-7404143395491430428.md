# 搭建工具一键迁移说明

Source URL: https://open.feishu.cn/document/feishu-cards/feishu-card-cardkit/migrate-card
Updated: 2025-01-16

# 搭建工具一键迁移说明

飞书卡片搭建工具提供了一键迁移能力，支持将[旧版消息卡片搭建工具](https://open.feishu.cn/tool/cardbuilder)上的卡片数据迁移到新版工具上。一键迁移后，源卡片 ID 不变，不影响已有卡片在线上的使用。在一键迁移之前，你需参考本文档了解注意事项。

## 功能入口

你可以在新版[飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_migration)的首页顶部横幅处看到一键迁移入口。

## 注意事项

- 完成迁移后，你将无法继续在旧工具上创建新的卡片、保存和发布当前卡片。在旧工具中将仅允许编辑卡片、导出卡片和点击 **向我发送预览**。但旧工具导出的卡片支持导入新工具中，详情参考[导入导入卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/import-and-export-cards#3d5877b2)。

  

- 若旧版工具中有变量占位符，你需确保你已在旧版工具中声明了变量。即你需要在旧版工具中 **创建变量** 并添加 **模拟数据**。否则变量在新版工具中将失效。

   
- 若旧版工具中有「循环对象数组」变量类型，你需确保你已在「循环对象数组」的模拟数据中填充了子变量数据（如下图），否则绑定了「循环对象数组」的分栏将在新版工具中渲染异常。新版工具会将旧版工具的「循环对象数组」变量转换为「对象数组」变量，并根据旧版工具模拟数据中声明的 `key-value` 创建相应类型的子变量。

    在旧版搭建工具中「循环对象数组」的模拟数据中填充了子变量数据：

   

    迁移后对象数组变量效果：

    

- 新版搭建工具不支持对 URL 链接的**部分参数**绑定变量。如下 JSON 示例，在旧版搭建工具中，query 参数将被替换为变量 `from_docs`；但在新版搭建工具中，仅支持对整体链接绑定变量。

  ```json
  {
      "tag": "button",
      "text": {
          "tag": "plain_text",
          "content": "主按钮"
      },
      "url": "https://open.larkoffice.com?q=${query}",
      "type": "primary"
  }

  // 传入变量
  {
     query: "from_docs"
  }
  ```

    

## 了解更多

- 新版卡片搭建工具提供了更丰富的卡片模板、组件类型和更友好的搭建体验，详情参考[飞书卡片文档](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/feishu-cardkit-overview)。
- 要了解旧版卡片搭建工具使用说明，参考[历史版本卡片文档](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/message-card-builder)。
