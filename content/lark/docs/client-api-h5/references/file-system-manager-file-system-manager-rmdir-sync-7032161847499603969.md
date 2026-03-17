# FileSystemManager.rmdirSync

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_rmdir_sync
Updated: 2025-01-21

# FileSystemManager.rmdirSync(string dirPath, boolean recursive)

删除本地目录。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | **X** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
dirPath | string | 是 | &nbsp; | 本地目录路径
recursive | boolean | 否 | false | 是否需要递归删除指定的目录

## 输出
继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 代码示例

```js
const fileSystemManager = tt.getFileSystemManager();
// 必须以 "ttfile://user" 开头
const exmaplePath = "ttfile://user/example-dir";
try {
  fileSystemManager.mkdirSync(exmaplePath, false);
  console.log("成功");
} catch (err) {
  console.log("失败", err);
}
try {
  fileSystemManager.rmdirSync(exmaplePath);
  console.log("成功");
} catch (err) {
  console.log("失败", err);
}
```
