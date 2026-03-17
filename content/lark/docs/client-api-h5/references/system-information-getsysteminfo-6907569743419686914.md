# getSystemInfo

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/system-information/getsysteminfo
Updated: 2025-08-01

# getSystemInfo(Object object)

getSystemInfo(Object object) 用于获取系统信息。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **✓** | V7.35.0+ | 预览
网页应用 | V3.43.0+ | V3.43.0+ | V3.47.0+ | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`success` 返回对象的扩展属性如下所示。

名称 | 数据类型 | 描述
---|---|---
system | string | 操作系统版本。
platform | string | 操作系统类型。可能值：<br>- iOS 端：`ios`<br>- Android 端：`android`<br>- PC 端：`darwin/windows_nt`（`darwin` 代表 Mac、`windows_nt` 代表 Windows)<br>- Harmony 端：`openharmony`
brand | string | 手机品牌。PC 端值为 `PC`。
model | string | 手机型号。PC 端值为 `PC`。<br>**注意事项**：**注意**：有少量 iOS 设备的 `model` 字段返回如 `iPod7,1` 等这类值。
version | string | 飞书 App 版本号。
SDKVersion | string | 客户端基础库版本。
screenWidth | number | 屏幕宽度。
screenHeight | number | 屏幕高度。
windowWidth | number | 可使用窗口的宽度。
windowHeight | number | 可使用窗口高度。
pixelRatio | number | 设备像素比。
pageOrientation | string | 页面方向。可能值：<br>- `portrait`：竖屏<br>- `landscape`：横屏正方向，以 HOME 键在屏幕右侧为正方向<br>- `landscapeReverse`：横屏反方向，以HOME键在屏幕左侧为反方向<br>**注意事项**：**注意**：<br>- Android/iOS 端：<br>- 小程序：飞书 [V5.26.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持输出该字段。<br>- 网页应用：不支持输出该字段。<br>- PC 端：不支持输出该字段。<br>- Harmony 端：不支持输出该字段。
statusBarHeight | number | 状态栏高度。<br>**注意事项**：**注意**：<br>- PC 端：网页应用不支持输出该字段。<br>- Harmony 端：飞书 [V7.39.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持输出该字段。
language | string | 飞书内设置的语言。格式为 language_region。例如：<br>- 简体中文：zh_CN<br>- 繁体中文（中国香港）：zh_HK<br>- 繁体中文（中国台湾）：zh_TW<br>- 英语：en_US
fontSizeSetting | number | 用户字体大小。
appName | string | 宿主 App 名字。<br>**注意事项**：**注意**：飞书 [V3.5.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持输出该字段。
safeArea | object | 在竖屏正方向下的安全区域。<br>**注意事项**：**注意**：<br>- 如需使用 `safeArea` 和 `navigationBarSafeArea` 字段，需要在页面渲染完成后（[onReady](https://open.feishu.cn/document/uYjL24iN/ugjNzUjL4YzM14CO2MTN)）使用该 API 进行获取，否则可能无法获取正确的值。<br>- PC 端：网页应用不支持输出该字段。<br>- Harmony 端：飞书 [V7.39.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持输出该字段。
&emsp;<br>∟<br>&nbsp;<br>left | number | 安全区域左上角的横坐标。
&emsp;<br>∟<br>&nbsp;<br>right | number | 安全区域右上角的横坐标。
&emsp;<br>∟<br>&nbsp;<br>top | number | 安全区域左上角的纵坐标。
&emsp;<br>∟<br>&nbsp;<br>bottom | number | 安全区域左下角的纵坐标。
&emsp;<br>∟<br>&nbsp;<br>width | number | 安全区域的宽度。
&emsp;<br>∟<br>&nbsp;<br>height | number | 安全区域的高度。
navigationBarSafeArea | object | 导航栏的安全区域坐标，当页面配置了自定义导航时返回该字段，方便应用在该区域内进行自定义元素的布局。<br>**注意事项**：**注意**：<br>- 如需使用 `safeArea` 和 `navigationBarSafeArea` 字段，需要在页面渲染完成后（[onReady](https://open.feishu.cn/document/uYjL24iN/ugjNzUjL4YzM14CO2MTN)）使用该 API 进行获取，否则可能无法获取正确的值。<br>- Android/iOS 端：飞书 [V3.33.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持输出该字段。<br>- PC 端：<br>- 小程序：飞书 [V3.35.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持输出该字段。<br>- 网页应用：不支持输出该字段。<br>- Harmony 端不支持输出该字段
&emsp;<br>∟<br>&nbsp;<br>left | number | 导航栏的安全区域左上角横坐标。
&emsp;<br>∟<br>&nbsp;<br>right | number | 导航栏的安全区域右上角的横坐标。
&emsp;<br>∟<br>&nbsp;<br>top | number | 导航栏的安全区域左上角的纵坐标。
&emsp;<br>∟<br>&nbsp;<br>bottom | number | 导航栏的安全区域右下角的纵坐标。
&emsp;<br>∟<br>&nbsp;<br>width | number | 导航栏的安全区域宽度。
&emsp;<br>∟<br>&nbsp;<br>height | number | 导航栏的安全区域高度。
theme | string | 当前系统主题，在[小程序支持 DarkMode](https://open.feishu.cn/document/uYjL24iN/uQTM5UjL0ETO14CNxkTN/darkmode) 的时候才会返回该字段。可能值：<br>- `light`：浅色主题<br>- `dark`：深色主题<br>**注意事项**：**注意**：<br>- 飞书 [V5.3.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持输出该字段。<br>- 网页应用：不支持输出该字段。<br>- Harmony：不支持输出该字段。
deviceType | string | 设备类型。可能值：<br>- `phone`：手机<br>- `tablet`：平板<br>- `pc`：PC<br>- `other`：其它设备<br>**注意事项**：**注意**：<br>- Android/iOS/Harmony 端：飞书 [V7.47.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持输出该字段。<br>- PC 端：不支持输出该字段。

## 示例代码

调用示例：

```js
tt.getSystemInfo({ 
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`getSystemInfo fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：

```json
{
  "errMsg": "getSystemInfo:ok",
  "system": "11.4.0",
  "platform": "darwin",
  "appName": "Feishu",
  "version": "5.1.0",
  "language": "zh_CN",
  "SDKVersion": "1.9.56",
  "screenWidth": 1322,
  "screenHeight": 913,
  "windowWidth": 1322,
  "windowHeight": 913,
  "pixelRatio": 2,
  "pageOrientation": "portrait",
  "statusBarHeight": 0,
  "safeArea": {
    "left": 0,
    "right": 1322,
    "top": 0,
    "bottom": 913,
    "width": 1322,
    "height": 913
  },
  "navigationBarSafeArea": {
    "left": 0,
    "right": 1268,
    "top": 0,
    "bottom": 36,
    "width": 1268,
    "height": 36
  },
  "brand": "PC",
  "model": "PC",
  "fontSizeSetting": 12,
  "theme": "light",
  "deviceType": "phone"
}
``` 

## model 说明

iOS 设备在 iPhone12（包含）后续更新机型，model 字段会返回系统机型标识。iPhone12 之前的系列机型会显示系统机型标识的映射名字，具体设备及返回结果参考下表。
```json
{
    "iPhone 2G":"iPhone 2G",
    "iPhone 3G":"iPhone 3G",
    "iPhone 3GS":"iPhone 3GS",
    "iPhone 4":"iPhone 4",
    "iPhone 4S":"iPhone 4S",
    "iPhone 5":"iPhone 5",
    "iPhone 5c":"iPhone 5c",
    "iPhone 5s":"iPhone 5s",
    "iPhone 6 Plus":"iPhone 6 Plus",
    "iPhone 6":"iPhone 6",
    "iPhone 6s":"iPhone 6s",
    "iPhone 6s Plus":"iPhone 6s Plus",
    "iPhone SE":"iPhone SE",
    "iPhone 7":"iPhone 7",
    "iPhone 7 Plus":"iPhone 7 Plus",
    "iPhone 8":"iPhone 8",
    "iPhone 8 Plus":"iPhone 8 Plus",
    "iPhone X":"iPhone X",
    "iPhone XS":"iPhone XS",
    "iPhone XS Max":"iPhone XS Max",
    "iPhone XR":"iPhone XR",
    "iPhone 11":"iPhone 11",
    "iPhone 11 Pro":"iPhone 11 Pro",
    "iPhone 11 Pro Max":"iPhone 11 Pro Max",
    "iPhone SE2" : "iPhone12,8",
    "iPhone 12 mini":"iPhone13,1",
    "iPhone 12": "iPhone13,2",
    "iPhone 12 Pro":"iPhone13,3",
    "iPhone 12 Pro Max":"iPhone13,4"
}
``` 

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
