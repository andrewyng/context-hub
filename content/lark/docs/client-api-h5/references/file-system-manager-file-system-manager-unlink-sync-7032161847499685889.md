# FileSystemManager.unlinkSync

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_unlink_sync
Updated: 2025-01-21

# FileSystemManager.unlinkSync(string filePath)

删除本地文件。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | **X** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
filePath | string | 是 | &nbsp; | 要删除的文件路径 (本地路径)

## 输出
继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 代码示例

```js
const fileSystemManager = tt.getFileSystemManager();

tt.chooseImage({
  success(res) {
    // 保存临时文件到 用户目录
    const savedFilePath = fileSystemManager.saveFileSync(res.tempFilePaths[0]);

    try {
      // 删除文件
      fileSystemManager.unlinkSync(savedFilePath);
      console.log("删除成功");
    } catch (err) {
      console.log("删除失败", err);
    }
  },
});
```
