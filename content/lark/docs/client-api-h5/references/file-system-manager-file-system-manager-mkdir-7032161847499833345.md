# FileSystemManager.mkdir

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_mkdir
Updated: 2025-01-21

# FileSystemManager.mkdir(Object object)

创建本地目录。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | V5.23.0+ | V7.35.0+ | 预览
网页应用 | V5.23.0+ | V5.23.0+ | V5.23.0+ | V7.35.0+ | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
dirPath | string | 是 | &nbsp; | 创建的目录路径, 必须 ttfile://user 开头
recursive | boolean | 否 | false | 是否递归创建该目录的上级目录后再创建该目录。

## 输出
继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 代码示例

```js
const fileSystemManager = tt.getFileSystemManager();

fileSystemManager.mkdir({
  dirPath: "ttfile://user/example-dir",
  recursive: false,
  success(_res) {
    console.log("ttfile://user/example-dir 创建成功");
  },
  fail(res) {
    console.log("ttfile://user/example-dir 创建失败", res.errMsg);
  },
});
```
