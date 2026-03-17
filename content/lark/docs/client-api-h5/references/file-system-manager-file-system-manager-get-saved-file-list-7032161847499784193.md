# FileSystemManager.getSavedFileList

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_get_saved_file_list
Updated: 2025-01-21

# FileSystemManager.getSavedFileList(Object object)

获取用户目录内文件列表。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | V5.23.0+ | V7.35.0+ | 预览
网页应用 | V5.23.0+ | V5.23.0+ | V5.23.0+ | V7.35.0+ | 预览

## 输入

继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性

## 输出

`success`返回对象参数的扩展属性：

名称 | 数据类型 | 描述
--|--|--|--|--
| fileList   | Array<FileItem\> | 文件数组，每一项是一个 `FileItem`

`FileItem` 的属性如下：

| 属性       | 类型   | 说明                                                          | 
| ---------- | ------ | ------------------------ | ------------ |
| filePath   | string | 文件路径                   |
| size       | number | 本地文件大小，以字节为单位    |
| createTime | number | 文件保存时的时间戳，从 `1970/01/01 08:00:00` 到当前时间的秒数 |

## 代码示例

```js
const fileSystemManager = tt.getFileSystemManager();

fileSystemManager.getSavedFileList({
  success(res) {
    res.fileList.forEach((item) => {
      console.log(item.filePath, item.createTime, item.size);
    });
  },
  fail(res) {
    console.log("获取失败", res.errMsg);
  },
});
```
