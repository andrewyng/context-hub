# FileSystemManager.appendFile

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/appendfile
Updated: 2025-01-21

# FileSystemManager.appendFile(Object object)

在文件结尾追加内容。

## 注意事项

单次追加文件大小不能超过 10M。文件总大小不能超过用户目录总大小 200M。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | V5.24.0+ | V7.35.0+ | 预览
网页应用 | V5.23.0+ | V5.23.0+ | V5.24.0+ | V7.35.0+ | 预览

## 输入
继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性描述：

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
filePath | string | 是 | &nbsp; | 本地文件路径
data | string/ArrayBuffer | 是 | &nbsp; | 要写入的文本或二进制数据
encoding | string | 否 | utf8 | 指定写入文件的字符编码，默认值仅在data为string类型时生效

### encoding 的合法值

| 值                          | 说明         |Android|iOS|PC|
| --------------------------- | ------------ |------|---|--|
| ascii                       |              |支持|支持|不支持|
| base64                      |              |支持|支持|不支持|
| binary                      |              |支持|支持|不支持|
| hex                         |              |支持|支持|支持|
| ucs2/ucs-2/utf16le/utf-16le | 以小端序读取   |支持|支持|不支持|
| utf-8/utf8                  |              |支持|支持|支持|
| latin1                      |              |支持|支持|不支持|

## 输出
继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性

## 代码示例

```js
const fileSystemManager = tt.getFileSystemManager();

const filePath = `ttfile://user/example.txt`;

fileSystemManager.appendFile({
  filePath,
  encoding: "utf8",
  data: "example append content",
  success(_res) {
    console.log("调用成功");
  },
  fail(res) {
    console.log("调用失败", res.errMsg);
  },
});
```
## 已知问题

- `encoding`参数与`data`的实际编码需要保持一致，否则可能会无法写入成功
