# FileSystemManager.readFileSync

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_read_file_sync
Updated: 2025-01-21

# FileSystemManager.readFileSync

FileSystemManager.readFileSync(string filePath, string encoding, number position, number length) 用于读取本地文件内容。

## 注意事项

- `encoding`参数与文件内容的实际编码需要保持一致，否则可能会无法读取成功。
- `length`参数应当合理设置，过大可能会导致性能问题。
- 单次读取最大为 10M； 在 PC 上读取总大小为 40M，在移动设备上没有这个限制。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | **X** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | 预览

## 输入

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
filePath | string | 是 | \- | 要读取的本地文件路径。
encoding | string | 否 | \- | 指定读取文件的字符编码。如果不传 encoding，则以 ArrayBuffer 格式读取文件的二进制内容。取值可参见下文的 encoding 合法值表。
position | number | 否 | 0 | 从文件指定位置开始读。如果不指定，则从文件头开始读。读取范围为左闭右开区间 [position, position+length)。有效范围：[0, fileLength - 1]。单位：byte。
length | number | 否 | fileLength - position | 指定读取的长度。如果不指定，则读到文件末尾，如果可读长度小于指定长度，则返回可读长度。有效范围：[0, fileLength]。单位：byte。

### encoding 的合法值

值 | 说明 | Android | iOS | PC
---|---|---|---|---
ascii | \- | 支持 | 支持 | 不支持
base64 | \- | 支持 | 支持 | 支持
binary | \- | 支持 | 支持 | 不支持
hex | \- | 支持 | 支持 | 支持
ucs2/ucs-2/utf16le/utf-16le | 以小端序读取 | 支持 | 支持 | 不支持
utf-8/utf8 | \- | 支持 | 支持 | 支持
latin1 | \- | 支持 | 支持 | 不支持

## 输出

名称 | 数据类型 | 描述
---|---|---
data | string | ArrayBuffer | 数据信息。

## 代码示例

```js
const fileSystemManager = tt.getFileSystemManager();

tt.chooseImage({
  success(res) {
    try {
      const data = fileSystemManager.readFileSync(res.tempFilePaths[0]);
      console.log("调用成功", data);
    } catch (err) {
      console.log("调用失败", err);
    }
  },
});
```
