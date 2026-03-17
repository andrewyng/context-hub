# FileSystemManager.copyFileSync

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_copy_file_sync
Updated: 2025-01-21

# FileSystemManager.copyFileSync(string srcPath, string destPath)

复制本地文件/目录。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | **X** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
srcPath | string | 是 | &nbsp; | 源文件路径
destPath | string | 是 | &nbsp; | 目标文件路径

## 输出
继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 代码示例

```js
const fileSystemManager = tt.getFileSystemManager();
const srcPath = `ttfile://temp/some_path`;
const destPath = `ttfile://temp/some_path_copy`;

try {
  // 拷贝文件, destPath 目录必须以 `ttfile://user` 开头
  fileSystemManager.copyFileSync(
    srcPath,
    destPath
  );
  console.log("拷贝成功");
} catch (err) {
  console.log("拷贝失败", err);
}
```
