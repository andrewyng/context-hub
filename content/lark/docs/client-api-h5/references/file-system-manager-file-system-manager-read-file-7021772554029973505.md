# FileSystemManager.readFile

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_read_file
Updated: 2025-01-21

# FileSystemManager.readFile

FileSystemManager.readFile(Object object) 用于读取本地文件内容。

## 注意事项

- `encoding` 参数与文件内容的实际编码需要保持一致，否则可能会无法读取成功。
- `length` 参数应当合理设置，过大可能会导致性能问题。
- 单次读取最大为 10M； 在 PC 上读取总大小为 40M，在移动设备上没有这个限制。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V4.11.0+ | V4.11.0+ | V5.23.0+ | V7.35.0+ | 预览
网页应用 | V4.11.0+ | V4.11.0+ | V5.23.0+ | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性如下所示。

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
filePath | string | 是 | \- | 要读取的本地文件路径。示例值：`ttfile://temp/test.jpg`
encoding | string | 否 | \- | 指定读取文件的字符编码。如果不传 encoding，则以 ArrayBuffer 格式读取文件的二进制内容。取值可参见下文的 encoding 合法值表。
position | number | 否 | 0 | 从文件指定位置开始读。如果不指定，则从文件头开始读。<br>读取范围为左闭右开区间 [position, position+length)。有效范围：[0, fileLength - 1]。单位：byte。<br>示例值：5
length | number | 否 | \- | 指定读取的长度。如果不指定，则读到文件末尾。如果可读长度小于指定长度，则返回可读长度。有效范围：[0, fileLength]。单位：byte。<br>单次读取最大为 10 * 1024 *1024<br>示例值：10

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

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`success` 返回对象的扩展属性如下所示。

名称 | 数据类型 | 描述
---|---|---
data | string | ArrayBuffer | 数据信息。

## 示例代码

调用示例：

```js
const fileSystemManager = tt.getFileSystemManager();
fileSystemManager.readFile({
    filePath: "ttfile://temp/test.jpg",
    encoding: "base64",
    position: 5,
    length: 10,
    success(res) {
      console.log(res);
    },
    fail(res) {
      console.log(`readFile fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：

  - `data` 为 string 类型
    ```json
    {
      data: 'EEpGSUYAAQEAAA==',
      errMsg: 'readFile:ok'
    }
    ```

  - `data` 为 arraybuffer 类型
    ```json
    {
      errMsg: 'readFile:ok',
      data: ArrayBuffer(10)
    }
    ```

### 分片读取示例

```js
function readFileBySlice(path, position, total, slice, uint8Buffer, callback) {
    if (position >= total) {
        callback(uint8Buffer)
        return
    }
    if (slice > 1024 * 1024) {
        slice = 1024 * 1024 // 建议每一片不要超过1M，否则可能引起性能问题
    }
    tt.getFileSystemManager().readFile({
        filePath: path,
        position: position,
        length: slice < total ? slice : total,
        success(res) {
            // 输出读取的文件内容
            const srcUint8 = new Uint8Array(res.data)
            uint8Buffer.set(srcUint8, position)
            const nextPosition = position + srcUint8.buffer.byteLength;
            readFileBySlice(path, nextPosition, total, slice, uint8Buffer, callback)
        },
        fail(res) {
            console.log("调用失败", res.errMsg);
        }
    });
}

const slice = 1024 * 1024 // 1M
const filePath = "your file path";
const fileSize = "your file size";
const uint8Buffer = new Uint8Array(new ArrayBuffer(fileSize))
readFileBySlice(filePath, 0, fileSize, slice, uint8Buffer, (uint8Buffer) => {
  //todo
})
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
