# FileSystemManager.renameSync

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_rename_sync
Updated: 2025-01-21

# FileSystemManager.renameSync(string oldPath, string newPath)

重命名本地文件/目录

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | **X** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
oldPath | string | 是 | &nbsp; | 源文件路径
newPath | string | 是 | &nbsp; | 新文件路径

## 输出
继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 代码示例

```js
// 将所有保存的文件移除拓展标识
const fileSystemManager = tt.getFileSystemManager();

fileSystemManager.getSavedFileList({
  success(res) {
    res.fileList.forEach(removeExt);
  },
  fail(res) {
    console.log("获取失败", res.errMsg);
  },
});

function removeExt(fileItem) {
  console.log(`移除 ${fileItem.filePath} 的 ext`);
  const newPath = fileItem.filePath.replace(/(\..+)?$/, "");

  try {
    fileSystemManager.renameSync(fileItem.filePath, newPath);
    console.log("重命名成功");
  } catch (err) {
    console.log("重命名失败", err);
  }
}
```
