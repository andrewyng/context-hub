# FileSystemManager.readdirSync

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_read_dir_sync
Updated: 2025-01-21

# Array<string> FileSystemManager.readdirSync(string dirPath)

读取本地目录内文件列表。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | **X** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
dirPath | string | 是 | &nbsp; | 要读取的目录路径

## 输出
继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`success`返回对象的扩展属性：

名称 | 数据类型 | 描述
---|---|---
files | Array<string\> | 指定目录下的文件名数组

## 代码示例

```js
const fileSystemManager = tt.getFileSystemManager();

try {
  const files = fileSystemManager.readdirSync("ttfile://user/");
  console.log("调用成功", files);
} catch (err) {
  console.log("调用失败", err);
}
```
