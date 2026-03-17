# FileSystemManager.access

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_access
Updated: 2025-01-21

# FileSystemManager.access(Object object)

判断文件/目录是否存在。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | V5.23.0+ | V7.35.0+ | 预览
网页应用 | V5.23.0+ | V5.23.0+ | V5.23.0+ | V7.35.0+ | 预览

## 输入
继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性描述：

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
path | string | 是 | &nbsp; | 要判断是否存在的文件/目录路径（包目录/临时目录/用户目录）

## 输出
继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 代码示例

```js
const fileSystemManager = tt.getFileSystemManager();
const path = `ttfile://temp/some_path`; // 判断的地址

fileSystemManager.access({
  path,
  success(_res) {
    console.log(`${path} 地址存在`);
  },
  fail(res) {
    console.log(`${path} 地址不存在或其他错误`, res.errMsg);
  },
});
```
