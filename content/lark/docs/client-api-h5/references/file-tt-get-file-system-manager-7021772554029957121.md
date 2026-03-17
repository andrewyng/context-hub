# getFileSystemManager

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/tt_get_file_system_manager
Updated: 2025-01-21

# getFileSystemManager()

获取全局唯一的文件管理器。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V4.11.0+ | V4.11.0+ | V4.11.0+ | V7.35.0+ | 预览
网页应用 | V4.11.0+ | V4.11.0+ | V4.11.0+ | V7.35.0+ | 预览

## 目录说明

小程序文件系统分为以下 3 个部分

### 用户目录

以 `ttfile://user` 开头，开发者拥有读写权限

### 临时目录

以 `ttfile://temp` 开头，开发者拥有读权限，删权限，无写权限

### 包目录

小程序包体目录，开发者拥有读权限，无删权限，无写权限

包目录路径支持格式包括 `a/b/c`, `/a/b/c`, `./a/b/c` 且仅支持这三种格式。 例如读取包内 `app.js` 文件。

```js

const fileSystemManager = tt.getFileSystemManager();

fileSystemManager.readFile({
  filePath: "app.js",// "/app.js", "./app.js"
  encoding: "utf8",
  success(res) {
    // app.js 文件内容
    console.log(res.data);
  },
  fail(res) {
    console.error("读取失败", res.errMsg);
  },
});

```

## 输入
无

## 输出

返回值：`FileSystemManager`，该对象的方法列表参见下表：
**注意事项**：点击下表中的方法名，查看对应API的支持说明、调用方法

方法 | 介绍
---|---
[access(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_access) | 判断本地文件/目录是否存在
[accessSync](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/access_sync) | 同步判断本地文件文件/目录是否存在
[saveFile(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_save_file) | 保存临时文件到用户目录
[saveFileSync](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_save_file_sync) | 同步保存临时文件到用户目录
[getFileInfo(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_get_file_info) | 获取本地文件信息
[getSavedFileList()](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_get_saved_file_list) | 获取用户目录文件列表
[removeSavedFile(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_remove_saved_file) | 删除用户目录文件
[copyFile(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_copy_file) | 复制本地文件
[copyFileSync](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_copy_file_sync) | 同步复制本地文件
[mkdir(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_mkdir) | 创建本地目录
[mkdirSync](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_mkdir_sync) | 同步创建本地目录
[readdir(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_read_dir) | 读取本地目录内文件列表
[readdirSync](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_read_dir_sync) | 同步读取本地目录内文件列表
[readFile(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_read_file) | 读取本地文件内容
[readFileSync](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_read_file_sync) | 同步读取本地文件内容
[rename(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_rename) | 重命名本地文件
[renameSync](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_rename_sync) | 同步重命名本地文件
[rmdir(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_rmdir) | 删除本地目录
[rmdirSync](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_rmdir_sync) | 同步删除本地目录
[stat(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_stat) | 获取本地文件 Stats 对象
[statSync](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_stat_sync) | 同步获取本地文件 Stats 对象
[unlink(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_unlink) | 删除本地文件
[unlinkSync](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_unlink_sync) | 同步删除本地文件
[writeFile(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_write_file) | 写入本地文件
[writeFileSync](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_write_file_sync) | 同步写入本地文件
<!--<br>[unzip(Object object)](https://open.feishu.cn/document/uYjL24iN/uETOuETOuETO/file_system_manager/file_system_manager_unzip) | 解压zip文件到用户目录。
-->

## 示例代码

```js
try {
    let result = tt.getFileSystemManager();
    console.log(`getFileSystemManager success: ${JSON.stringify(result)}`);
} catch (error) {
    console.log(`getFileSystemManager fail: ${JSON.stringify(error)}`);
}
```
