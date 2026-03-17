# FileSystemManager.saveFile

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_save_file
Updated: 2025-01-21

# FileSystemManager.saveFile

FileSystemManager.saveFile(Object object) 用于保存临时文件到本地用户目录。

## 注意事项

该 API 会把临时文件移动到本地用户目录（目录最大 200M），所以在调用成功后原文件路径将访问失败。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | V5.23.0+ | V7.35.0+ | 预览
网页应用 | V5.23.0+ | V5.23.0+ | V5.23.0+ | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性如下所示。

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
tempFilePath | string | 是 | \- | 文件临时路径。示例值：ttfile://temp/5c5fdd01-03bd-42cf-9938-31fb8b769a19-2863810ed1844e79f1b9bb880acbxxxx.png
filePath | string | 否 | \- | 本地用户文件路径。格式示例：`ttfile://user/feishu.png`, 其中 `ttfile://user/` 为固定格式，`feishu.png` 为文件名。如果不填则会给出随机路径。<br>**注意事项**：**注意**：不支持网络地址。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`success` 返回对象的扩展属性如下所示。

名称 | 数据类型 | 描述
---|---|---
savedFilePath | string | 保存后的文件路径。

## 示例代码

调用示例：

```js
const fileSystemManager = tt.getFileSystemManager();
tt.chooseImage({
  success(res) {
    const tempFilePath = res.tempFilePaths[0];
    fileSystemManager.saveFile({
      tempFilePath,
      filePath: "ttfile://user/feishu.png",
      success(res) {
        console.log(`${JSON.stringify(res)}`);
      },
      fail(res) {
        console.log(`saveFile fail: ${JSON.stringify(res)}`);
      },
    });
  },
});
```

`success`返回对象示例：

```json
{
    "savedFilePath": "ttfile://user/feishu.png",
    "errMsg": "saveFile:ok"
}
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
