# 鸿蒙适配指南

Source URL: https://open.feishu.cn/document/web-app/gadget-api/harmonyos-adaptation-guide
Updated: 2025-08-01

# 鸿蒙适配指南

本文将介绍网页应用、普通网页、小程序在鸿蒙系统中如何使用飞书 JSAPI。

## 注意事项
- 旧版三段式客户端API由于安全合规原因将不在鸿蒙上适配，若应用中使用了旧版三段式客户端API，请尽快迁移至新版一段式客户端JSAPI。详情参见
[新旧版客户端API映射](https://open.larkoffice.com/document/uYjL24iN/uAjMuAjMuAjM/comparison-of-old-and-new-client-apis)

## 1、飞书中的网页应用和普通网页适配说明

## 步骤一：升级 JSSDK 到最新版本
如果你是直接引用的飞书 JSSDK，且版本大于 1.5.11，这步可以省略，你可以直接在鸿蒙上使用，无需改动。

如果你引用的 JSSDK，是放在了自己的服务器，非飞书官方的 cdn 源；或者你引用了飞书的源，但是版本低于或等于 1.5.11；则需要你改成引用飞书提供的最新的 JSSDK 版本。可前往[网页应用概述-开放接口（H5 JSAPI）](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/introduction#818efa2e)获取最新 JSSDK。

## 步骤二：检查 JSAPI 兼容性

在鸿蒙上使用飞书（版本 7.35+）测试你的系统，使用到的 API 若不支持将返回错误码 103，errString 为 “API not available”，飞书将在未来版本尽快支持。在每个 API 文档中， 你也可以找到当前 API 支持情况。

已完全支持的 API 已标记具体支持的鸿蒙版本。

## 步骤三：适配客户端特殊逻辑

通过 navigator.userAgent 判断是否鸿蒙系统
```
const isHarmony = /OpenHarmony/i.test(navigator.userAgent)
```

## 2、小程序适配说明

## 步骤一：检查 JSAPI 兼容性

在鸿蒙上使用飞书（版本 7.35+）测试你的系统，使用到的 API 若不支持将返回错误码 103，errString 为 “API not available”，飞书将在未来版本尽快支持。在每个 API 文档中， 你也可以找到当前 API 支持情况。

已完全支持的 API 已标记具体支持的鸿蒙版本。

## 步骤二：适配客户端特殊逻辑

小程序中通过读取 [getSystemInfo](https://open.feishu.cn/document/uYjL24iN/uQjNx4CN2EjL0YTM) 中的 platform 来判断是否鸿蒙系统。
```
 // 小程序通过读取getSystemInfo中的platform来判断是否鸿蒙系统。 
const systemInfo = tt.getSystemInfoSync();
const isHarmony = systemInfo.platform === 'openharmony';
```

## 3、支持情况

以下罗列出暂未支持的API，对使用到未支持的API需做好兼容。其中API具体的支持情况可跳转至对应文档查看。未支持的API飞书将会在未来版本尽快迭代，请关注最新版客户端发布。

模块 | 接口 | 支持情况
---|---|---
开放接口-聊天 | getBlockActionSourceDetail / getTriggerContext / onChatBadgeChange / offChatBadgeChange | 不支持。
开放接口-聊天 | chooseChat | 部分不支持，不支持参数如下：<br>- allowCreateGroup
开放接口-联系人 | chooseContact | 部分不支持，不支持参数如下：<br>- externalContact<br>- enableChooseDepartment<br>- showRelatedOrganizations
开放接口-分享 | share | 不支持。
开放接口-应用角标 | updateBadge / onServerBadgePush / offServerBadgePush | 不支持。
界面-交互反馈 | showToast / showLoading | 部分不支持，不支持参数如下：<br>- mask：透明蒙层未生效
界面-Customized Input | getCustomizedInput / CustomizedInput | 部分不支持，不支持API如下：<br>- CustomizedInput.onPicSelect<br>- CustomizedInput.onModelSelect
界面-Pad | togglePadFullScreen / getPadDisplayScaleMode | 不支持。
界面-DarkMode | onThemeChange / offThemeChange | 不支持。
设备-扫码 | scanCode | 部分不支持，不支持参数如下：<br>- barCodeInput
文件 | filePicker | 部分不支持：<br>当前仅支持系统文件选择器，传入参数不生效。
文件 | openDocument | 部分不支持，不支持参数如下：<br>- fileType<br>- showMenu<br>仅支持pdf和云文档预览。
媒体-图片 | getImageInfo | 部分不支持：<br>仅支持本地图片。
媒体-视频 | chooseMedia | 部分不支持，不支持参数如下：<br>- maxDuration<br>- sizeType
媒体-音频 | createInnerAudioContext / InnerAudioContext | 部分不支持，不支持参数如下：<br>- onWaiting<br>- offWaiting
媒体-背景音频 | getBackgroundAudioManager / BackgroundAudioManager | 不支持。
媒体-相机 | createCameraContext / CameraErrno / CameraContext | 不支持。
更新 | getUpdateManager / UpdateManager | 不支持。
性能 | getPerformanceRecorder / PerformanceRecorder | 不支持。
