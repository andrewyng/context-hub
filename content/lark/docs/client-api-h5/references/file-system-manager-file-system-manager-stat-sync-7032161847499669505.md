# FileSystemManager.statSync

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/file_system_manager/file_system_manager_stat_sync
Updated: 2025-01-21

# Stats FileSystemManager.statSync(string path)

获取本地文件 Stats 对象。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.23.0+ | V5.23.0+ | **X** | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
path | string | 是 | &nbsp; | 本地文件路径<br>**示例值**：ttfile://temp

## 输出

返回对象的扩展属性与方法：
**注意事项**：点击下表中的方法名，查看对应API的支持说明、调用方法

名称 | 数据类型 | 描述
---|---|---
stat | object | Stats 对象
&emsp;<br>∟<br>&nbsp;<br>mode | number | 文件的类型和存取的权限，对应 POSIX stat.st_mode
&emsp;<br>∟<br>&nbsp;<br>size | number | 文件大小，单位：B，对应 POSIX stat.st_size
&emsp;<br>∟<br>&nbsp;<br>lastAccessedTime | number | 文件最近一次被存取或被执行的时间，UNIX 时间戳，对应 POSIX stat.st_atime
&emsp;<br>∟<br>&nbsp;<br>lastModifiedTime | number | 文件最后一次被修改的时间，UNIX 时间戳，对应 POSIX stat.st_mtime
&emsp;<br>∟<br>&nbsp;<br>[isDirectory()](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/stat/stats_is_directory) | function | 判断当前文件是否一个目录
&emsp;<br>∟<br>&nbsp;<br>[isFile()](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/stat/stats_is_file) | function | 判断当前文件是否一个普通文件

## 代码示例

```js
const fileSystemManager = tt.getFileSystemManager();

tt.chooseImage({
  success(res) {
    const tempFile = res.tempFilePaths[0];
    try {
      const stat = fileSystemManager.statSync(tempFile);
      console.log("是否是目录:", res.stat.isDirectory());
      console.log("是否是文件:", res.stat.isFile());
    } catch (err) {
      console.log("调用失败", err);
    }
  },
});
```
