# 版本兼容说明

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/version-compatibility
Updated: 2024-04-24

# 版本兼容说明
小程序和网页应用的功能不断的增加，但是旧版本的飞书客户端并不支持新功能，所以在使用这些新能力的时候需要做兼容。

开发者可以通过以下方式进行低版本的兼容：

## 小程序兼容
### 1. 版本号比较
可以选择通过飞书客户端版本号和小程序基础库版本号进行兼容性比对。
**注意事项**：- **飞书客户端版本号**：表示飞书应用本身版本，与应用商店版本号一致，例如 `5.0.2`，风格为 Major.Minor.Patch（主版本号.次版本号.修订版本号），可以通过 [tt.getSystemInfo()](https://open.feishu.cn/document/uYjL24iN/uQjNx4CN2EjL0YTM) 返回的`version` 字段获取。
- **小程序基础库版本号**：表示小程序基础库版本，该版本跟随客户端版本号同步更新，例如 `1.9.55.2`，风格为 Major.subMajor.Minor.Patch（基础版本号.次基础版本号.客户端对应版本号.修订版本号），可以通过 [tt.getSystemInfo()](https://open.feishu.cn/document/uYjL24iN/uQjNx4CN2EjL0YTM)返回的 `SDKVersion` 字段获取。

文档中会在组件，API等页面描述中带上各个功能所要求的最低**飞书客户端版本号**。

开发者可以在小程序中通过调用 [tt.getSystemInfo()](https://open.feishu.cn/document/uYjL24iN/uQjNx4CN2EjL0YTM) 或者 [tt.getSystemInfoSync()](https://open.feishu.cn/document/uYjL24iN/uUjNx4SN2EjL1YTM) 获取到当前小程序运行的客户端版本号，通过版本号比较的方式进行运行低版本兼容逻辑。

版本号比较适用于所有情况。部分场景下也可以使用后面提到的方法完成。

**注意：不要直接使用字符串比较的方法进行版本号比较。**

版本号比较可以参考以下代码：

```js
function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

compareVersion('1.11.0', '1.9.9') // 1
```

```js
const version = tt.getSystemInfoSync().version

if (compareVersion(version, '3.38') >= 0) {
  let adapter = tt.getNFCAdapter()
  // TODO
} else {
  // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
  tt.showModal({
    title: '提示',
    content: '当前飞书版本过低，无法使用该功能，请升级到最新飞书版本后重试。'
  })
}
```

### 2. API 存在判断
对于新增的 API，可以通过判断该API是否存在来判断是否支持用户使用的基础库版本。例如：

```js
if (tt.getNFCAdapter) {
  let adapter = tt.getNFCAdapter()
} else {
  // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
  tt.showModal({
    title: '提示',
    content: '当前飞书版本过低，无法使用该功能，请升级到最新飞书版本后重试。'
  })
}
```

## 网页应用兼容
网页应用开发者需要同时关注 `H5SDK` 版本和客户端版本。
**注意事项**：**H5SDK 版本号**：表示网页应用 sdk 版本，例如 `1.5.11`，风格为 Major.Minor.Patch（主版本号.次版本号.修订版本号），可以通过[开发网页应用](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/introduction)中的 src 获取。

  如下链接中的 sdk 版本号即`1.5.11`。

   ```https://lf1-cdn-tos.bytegoofy.com/goofy/ee/lark/h5jssdk/lark/js_sdk/h5-js-sdk-1.5.11.js```
* **客户端版本**请通过网页应用 UA（navigator.userAgent） 判断，也可以通过 [JSAPI总览](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/) 中的 [getSystemInfo](https://open.feishu.cn/document/uYjL24iN/uQjNx4CN2EjL0YTM)接口获取
* H5SDK 版本即引入的链接中包含的版本。建议开发者始终使用[最新版本的 H5SDK](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/introduction) 来确保最新功能可用。
