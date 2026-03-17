# 接入 NFC

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/nfc/nfc-development-guide
Updated: 2024-04-19

# 接入 NFC

开放平台的网页应用或小程序支持接入近场通信（Near Field Communication，简称 NFC） 技术。通过本文你可以了解开放平台 NFC 功能的使用限制，以及接入 NFC 的基本步骤。

## 使用限制

维度 | 说明
---|---
客户端版本 | 支持 NFC 读写（即手机作为读卡器使用）能力的飞书版本范围如下：<br>- Android 端：飞书客户端 V3.38 及以上版本。<br>- iOS 端：飞书客户端 V5.25.0 及以上版本。
读写模式 | 支持 Reader/Writer（读取器/写入器）模式，即支持 NFC 设备读取、写入被动 NFC 标签和贴纸。
适用机型 | - iPhone：iPhone 7 及以后推出的、搭载 iOS 13.0 及以上系统的手机。<br>- Android：支持 NFC 功能，且系统版本为 Android 5.0 及以上的手机。
适用范围 | - Android：<br>- 支持 NFC-A (ISO 14443-3A) 标准的读写。<br>- 支持 NFC-V (ISO 15693) 标准的读写（V5.14.0+）。<br>- 支持 NFC-B (ISO 14443-3B) 标准的读写（V7.15.0+）。<br>- 支持 ISO-DEP (ISO 14443-4) 标准的读写（V7.15.0+）。<br>- （部分 Android 手机）支持 MIFARE Classic/MIFARE Ultralight 标签的读写。<br>- 支持对 NDEF 格式的 NFC 标签上的 NDEF 数据的读写。<br>- iOS：<br>- 支持 NFC-A (ISO 14443-3A) 标准的读写（V5.25.0+）。<br>- 支持 NFC-B (ISO 14443-3B) 标准的读写（V7.15.0+）。

## 基本步骤

本文以 NFC-A 卡片指令为例，介绍接入 NFC 的基本步骤。

1. 调用 [tt.getNFCAdapter()](https://open.feishu.cn/document/uYjL24iN/ukzM4YjL5MDO24SOzgjN) 获取 NFC 适配器实例。

2. 调用 [NFCAdapter.onDiscovered(function callback)](https://open.feishu.cn/document/uYjL24iN/uUDN4YjL1QDO24SN0gjN) 注册贴卡监听回调。

3. 调用 [NFCAdapter.startDiscovery(Object object)](https://open.feishu.cn/document/uYjL24iN/uIDN4YjLyQDO24iM0gjN) 开始监听贴卡。

4. 贴卡，进行 onDiscovered 回调。

    1. 根据 onDiscovered 回调 res 对象的 techs 字段，匹配到卡片支持 NFC-A 标准。
	2. 通过 [NFCAdapter.getNfcA()](https://open.feishu.cn/document/uYjL24iN/ugzM4YjL4MDO24COzgjN) 获取 NfcA 实例。

5. 使用 NfcA 实例进行读写。

	1. 调用 [NfcA.connect()](https://open.feishu.cn/document/uYjL24iN/ucDN4YjL3QDO24yN0gjN) 和 NFC 卡片建立连接。
	2. 调用 [NfcA.transceive(Object object)](https://open.feishu.cn/document/uYjL24iN/uITN4YjLyUDO24iM1gjN) 往 NFC 卡片写入指令，并接收卡片返回数据。
	3. 读写完毕，调用 [NfcA.close()](https://open.feishu.cn/document/uYjL24iN/uYDN4YjL2QDO24iN0gjN) 断开连接。

6. 调用 [NFCAdapter.stopDiscovery(Object object)](https://open.feishu.cn/document/uYjL24iN/uMDN4YjLzQDO24yM0gjN) 结束监听贴卡。
