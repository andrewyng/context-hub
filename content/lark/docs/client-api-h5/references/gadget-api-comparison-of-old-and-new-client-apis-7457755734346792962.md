# 新旧版客户端API映射

Source URL: https://open.feishu.cn/document/web-app/gadget-api/comparison-of-old-and-new-client-apis
Updated: 2025-09-02

# 新旧版客户端API映射
  旧版三段式客户端API由于安全合规原因将不在鸿蒙上适配，未来Android和iOS也将下线旧版三段式客户端API。新版一段式客户端[JSAPI](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/)提供了更全面的能力，若应用中使用了旧版三段式客户端API，请尽快迁移至新版一段式客户端JSAPI。
说明：如果你的网页（Web）应用需要调用 [JSAPI](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/)，为了数据安全，飞书需要先验证网页应用有权限访问的 JSAPI 范围，此过程称为[网页应用鉴权](https://open.feishu.cn/document/uYjL24iN/uEzM4YjLxMDO24SMzgjN)。如果是网页应用场景，迁移前需要先做网页应用鉴权再调API。

客户端 API 的调用方式统一从三段式升级为一段式。本文以表格形式列出了旧版三段式客户端 API 和新版一段式客户端 JSAPI 的映射详情。

新版客户端API | 旧版客户端API
---|---
[openSchema](https://open.feishu.cn/document/uYjL24iN/ukzN4IjL5cDOy4SO3gjM) | biz.util.openLink
[previewImage](https://open.feishu.cn/document/uYjL24iN/uMDOx4yM4EjLzgTM) | biz.util.previewImage
[scanCode](https://open.feishu.cn/document/uYjL24iN/uYzNx4iN3EjL2cTM) | biz.util.scan
[shareWebContent](https://open.feishu.cn/document/uYjL24iN/uQjMuQjMuQjM/share/sharewebcontent) | biz.util.share
[getSystemInfo](https://open.feishu.cn/document/uYjL24iN/uQjNx4CN2EjL0YTM) | device.base.getSystemInfo
[getConnectedWifi](https://open.feishu.cn/document/uYjL24iN/ugjNx4CO2EjL4YTM) | device.connection.getConnectedWifi
[getNetworkType](https://open.feishu.cn/document/uYjL24iN/uYjNx4iN2EjL2YTM) | device.connection.getNetworkType
[getLocation](https://open.feishu.cn/document/uYjL24iN/uUTOz4SN5MjL1kzM) | device.geolocation.get
[showToast](https://open.feishu.cn/document/uYjL24iN/ugzMy4COzIjL4MjM) | device.notification.toast
[vibrateLong](https://open.feishu.cn/document/uYjL24iN/uEDOx4SM4EjLxgTM) | device.notification.vibrate
[showModal](https://open.feishu.cn/document/uYjL24iN/ugDNy4CO0IjL4QjM) | device.notification.alert
[showModal](https://open.feishu.cn/document/uYjL24iN/ugDNy4CO0IjL4QjM) | device.notification.confirm
[showLoading](https://open.feishu.cn/document/uYjL24iN/uMDNy4yM0IjLzQjM) | device.notification.showPreloader
[hideLoading](https://open.feishu.cn/document/uYjL24iN/uYDNy4iN0IjL2QjM) | device.notification.hidePreloader
[setClipboardData](https://open.feishu.cn/document/uYjL24iN/ugzNx4CO3EjL4cTM) | biz.util.copyText
[openDocument](https://open.feishu.cn/document/uYjL24iN/ukTN24SO1YjL5UjN) | biz.util.openDocument
[getStepCount](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/sport-and-health/getstepcount) | device.health.getStepCount
