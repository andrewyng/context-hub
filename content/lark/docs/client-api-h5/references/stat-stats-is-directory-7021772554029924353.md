# Stats.isDirectory

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/file/stat/stats_is_directory
Updated: 2025-03-12

# Stats.isDirectory()

判断当前文件是否一个目录。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V4.11.0+ | V4.11.0+ | **X** | V7.39.0+ | 预览
网页应用 | V4.11.0+ | V4.11.0+ | **X** | V7.39.0+ | 预览

## 输入
无

## 输出

返回值：boolean

## 示例代码

```js
const fileSystemManager = tt.getFileSystemManager();
fileSystemManager.stat({
    path: "ttfile://temp",
    success(res) {
      console.log(res.stat.isDirectory());
    },
    fail(res) {
      console.log(`stat fail: ${JSON.stringify(res)}`);
    }
});
```
返回值示例：

```json
true
```
