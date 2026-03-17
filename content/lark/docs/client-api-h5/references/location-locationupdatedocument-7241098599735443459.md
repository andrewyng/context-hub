# 新版获取地理位置 API 适配指南

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/location/locationUpdateDocument
Updated: 2025-01-22

# 新版获取地理位置 API 适配指南

为满足《中华人民共和国测绘法》(2017 修订) 与相关测绘合规要求，飞书开放平台不再提供坐标系转换服务。当应用调用 [getLocation](https://open.feishu.cn/document/uYjL24iN/uUTOz4SN5MjL1kzM)、[chooseLocation](https://open.feishu.cn/document/uYjL24iN/uUDN1EjL1QTNx4SN0UTM)和[startLocationUpdate](https://open.feishu.cn/document/uYjL24iN/uMTOuMTOuMTO/startlocationupdate) API 时，接口将根据用户所在的位置，返回对应的坐标系。例如，中国大陆境内只会返回 **GCJ02** 的坐标系。当你使用新版 API 时，由于返回的坐标类型和请求时传递的坐标系类型可能不一致，进而影响现有的业务逻辑，因此需要你对应用进行适配。

## 名词解释

阅读以下关于坐标系 **WGS84** 和 **GCJ02** 的解释，可以更好的帮助你理解适配新版 API 的背景。

- **WGS84**：世界大地测量系统（World Geodetic System）是一种用于地图学、大地测量学以及导航（包括全球定位系统）的大地测量系统标准。
- **GCJ02**：出于国家安全考虑，中华人民共和国对在中国大陆境内进行地理测绘有专门限制，俗称火星坐标系、国测局坐标。对于中国大陆地理位置，未按 **GCJ02** 做适配的地图程序卫星图与街道地图之间，将存在一定偏移。
**WGS84** 和 **GCJ02** 坐标系混用会产生中国大陆地理位置偏移的问题，该问题源自 **WGS84** 和 **GCJ02** 坐标系的数据偏差。例如，GPS 的经纬度坐标使用的是 **WGS84** 标准，当应用到使用 **GCJ02** 标准的中国大陆路网图上时，会造成距离在 500 m 左右的显著偏差。

## 变更说明

新版 API 主要变更为，删除了 API 输入参数的 type 字段，新增了输出参数的 type 字段，该字段表示当前返回的坐标系类型。该变更的 API 影响范围如下：

- [getLocation](https://open.feishu.cn/document/uYjL24iN/uUTOz4SN5MjL1kzM)
- [startLocationUpdate](https://open.feishu.cn/document/uYjL24iN/uMTOuMTOuMTO/startlocationupdate)
- [stopLocationUpdate](https://open.feishu.cn/document/uYjL24iN/uMTOuMTOuMTO/stoplocationupdate)
- [onLocationChange](https://open.feishu.cn/document/uYjL24iN/uMTOuMTOuMTO/onlocationchange)
- [chooseLocation](https://open.feishu.cn/document/uYjL24iN/uUDN1EjL1QTNx4SN0UTM)

### 注意事项

- 旧版 API 将不再进行新功能迭代以及能力优化，后续的迭代与优化工作仅针对新版 API 生效。同时，开放平台会在  2025 年 6 月 30 日后，将定位相关的 API 自动切换至新版本。
- 关于 `getLocation` 和 `startLocationUpdate` 接口的能力说明如下。如果你的业务对地理位置信息有强依赖，则建议你将获取位置信息的方式从 `getLocation` 迁移为 `startLocationUpdate`。
	- `getLocation`：该接口用于单次地理定位，会在指定的超时时间（timeout）内，考虑精确度和更新时间等多方面因素，返回一个定位结果。
	- `startLocationUpdate`：该接口用于持续地理定位，开启后会通过 `onLocationChange` 实时回调位置信息。

### API 不兼容变更

API 名称 | 变更前参数情况 | 变更后参数情况 | 影响及兼容说明
---|---|---|---
getLocation | - **入参**：存在 `type` 字段，该字段非必填，取值范围如下所示。<br>- `wgs84`（默认值）：WGS84 坐标系。<br>- `gcj02`：GCJ02 坐标系。<br>- **出参**：无 `type` 字段。 | - **入参**：删除了 `type` 字段。<br>- **出参**：增加了 `type` 字段，可能值如下所示。<br>- `wgs84`：WGS84 坐标系。<br>- `gcj02`：GCJ02 坐标系。 | 传入的 `type` 将不再生效，**你需要关注返回值中的 `type`，根据此`type`来适配业务场景** 。
startLocationUpdate | **入参**：存在 `type` 字段，该字段非必填，取值范围如下所示。<br>- `wgs84`（默认值）：WGS84 坐标系。<br>- `gcj02`：GCJ02 坐标系。 | **入参**：删除了 `type` 字段。 | 传入的 `type` 将不再生效。
onLocationChange | **出参**：无 `type` 字段。 | **出参**：增加了 `type` 字段，可能值如下所示。<br>- `wgs84`：WGS84 坐标系。<br>- `gcj02`：GCJ02 坐标系。 | **你需要关注返回值中的 `type`，根据此`type`来适配业务场景**。
chooseLocation | - **入参**：存在 `type` 字段，该字段非必填，取值范围如下所示。<br>- `wgs84`（默认值）：WGS84 坐标系。<br>- `gcj02`：GCJ02 坐标系。<br>- **出参**：无 `type` 字段。 | - **入参**：删除了 `type` 字段。<br>- **出参**：增加了 `type` 字段，可能值如下所示。<br>- `wgs84`：WGS84 坐标系。<br>- `gcj02`：GCJ02 坐标系。 | **你需要关注返回值中的 `type`，根据此`type`来适配业务场景**。

### API 新增 errno/errString

新版 API 在保留原有 errCode 的基础上，新增了多端一致的 errno 错误码，以帮助你更好的解决开发调试或线上版本应用的异常问题。关于 errno 以及 errString 的详细介绍，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。

调用 Errno 错误码的示例代码配置如下：

```js
tt.API({
  success (res) {
	console.log('API 调用成功');
  },
  fail (res) {
	console.log(res.errno);
  }
});
```

## 适配方案
- 新版本的 API 默认情况下未启用，因此，你在适配时需要先启用新版 API。
- 新版 API 的适配代码，仅在飞书客户端 V5.22 及以上版本生效。如果你的飞书客户端版本低于 V5.22，则仍使用的是旧版 API 的地理定位方式。

### 步骤一：启用新版 API

本章节分别介绍在小程序、uni-app 以及网页应用中如何启用新版 API。

#### 小程序 

在小程序项目的 app.json 配置文件中，添加以下配置，以启用新版 API。

```js
"apiConfig": {
	// 如果需要使用 getLocation，则进行以下配置，否则不需要配置。
	"getLocation": {
		"version": 2 // 取值 2 代表启用 getLocation 的新版 API。
	},
	// 如果需要使用 startLocationUpdate，则进行以下配置，否则不需要配置。
	"startLocationUpdate": {
		"version": 2 // 取值 2 代表启用 startLocationUpdate 的新版 API。
	},
	// 如果需要使用 stopLocationUpdate，则进行以下配置，否则不需要配置。
	"stopLocationUpdate": {
		"version": 2 // 取值 2 代表启用 stopLocationUpdate 的新版 API。
	},
	// 如果需要使用 chooseLocation，则进行以下配置，否则不需要配置。
	"chooseLocation": {
		"version": 2 // 取值 2 代表启用 chooseLocation 的新版 API。
	}  
}
```

示例配置如下图所示：

#### uni-app 特殊配置

在 uni-app 应用中，需要进行特殊配置，详情可参见 [uni-app 飞书特殊配置](https://zh.uniapp.dcloud.io/collocation/manifest.html#)。打开引用文档后，查阅如下图所示的特有配置。

#### 网页应用

在调用适配 API（每个页面调用一次即可）前，调用 `tt.setAPIConfig` 启用新版 API。示例代码配置如下所示。
你需要确保 [H5 JSSDK](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/introduction#818efa2e) 版本已升级到 1.5.20 及以上版本。

```js
tt.setAPIConfig({
    "apiConfig": {
        // 如果需要使用 getLocation，则进行以下配置，否则不需要配置。
        "getLocation": {
            "version": 2 // 取值 2 代表启用 getLocation 的新版 API。
        },
        // 如果需要使用 startLocationUpdate，则进行以下配置，否则不需要配置。
        "startLocationUpdate": {
            "version": 2 // 取值 2 代表启用 startLocationUpdate 的新版 API。
        },
        // 如果需要使用 stopLocationUpdate，则进行以下配置，否则不需要配置。
        "stopLocationUpdate": {
            "version": 2 // 取值 2 代表启用 stopLocationUpdate 的新版 API。
        },
        // 如果需要使用 chooseLocation，则进行以下配置，否则不需要配置。
        "chooseLocation": {
            "version": 2 // 取值 2 代表启用 chooseLocation 的新版 API。
        }
    }
})
```

### 步骤二（可选）：进行代码适配
你可以根据自己业务的实际情况，评估是否需要进行代码适配。在以下场景中，可以忽略本步骤的代码适配操作。
- 在使用的地理位置 API 中，输入参数 type 字段与输出参数 type 一致。例如，在中国大陆定位时，输入参数 type 取值 `gcj02`，相应的输出参数 type 取值也为 `gcj02`。
- 在使用的地理位置 API 中，输入输出参数中的 type 字段取值不一致，但不影响业务逻辑与功能实现。

#### getLocaiton 接口适配

为兼容新老版本 API，你需要根据出参 `type` 和入参 `type` 判断真正生效的 `type`。示例代码配置如下：

```js
var type = 'gcj02';
tt.getLocation({
    "type": type,  // 新版本中废弃此参数。
    "timeout": 5,
    "cacheTimeout": 30,
    "accuracy": "best",
    success(res) {
         // 新版本会在 res 中返回 type，这个是实际定位结果的经纬度类型。如果没有返回，则说明是老版本，此时需要使用入参的 type。
        var aType = res.type === undefined ? type : res.type
        console.log(aType)
        console.log(JSON.stringify(res));
    },
    fail(res) {
        console.log(res.errno);
        console.log(`getLocation fail: ${JSON.stringify(res)}`);
    }
});
```

#### startLocationUpdate 与 onLocationChange 接口适配

为兼容新老版本 API，你需要根据出参 `type` 和入参 `type` 判断真正生效的 `type`。示例代码配置如下：

```js
var type = 'gcj02';
tt.onLocationChange(function(res) {
    // 新版本会在 res 中返回 type，这个是实际定位结果的经纬度类型。如果没有返回，则说明是老版本，此时需要使用入参的 type。
    var aType = res.type === undefined ? type : res.type
    console.log(aType)
    console.log(JSON.stringify(res));
});
tt.startLocationUpdate({
    "type": type,  // 新版本中废弃此参数。
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(res.errno);
      console.log(`startLocationUpdate fail: ${JSON.stringify(res)}`);
    }
});
```

#### chooseLocation 接口适配

为兼容新老版本 API，你需要根据出参 `type` 和入参 `type` 判断真正生效的 `type`。示例代码配置如下：

```js
var type = 'gcj02';
tt.chooseLocation({
    "type": type,  // 新版本中废弃此参数。
    success(res) {
         // 新版本会在 res 中返回 type，这个是实际定位结果的经纬度类型。如果没有返回，则说明是老版本，此时需要使用入参的 type。
        var aType = res.type === undefined ? type : res.type
        console.log(aType)
        console.log(JSON.stringify(res));
    },
    fail(res) {
        console.log(res.errno);
        console.log(`chooseLocation fail: ${JSON.stringify(res)}`);
    }
});
```

### 步骤三：验证适配结果

当你的业务代码调用 `tt.getLocation` 或 `tt.onLocationChange` 后，在 `success` 返回的定位信息中包含了 `type` 字段，即表示适配成功。`success` 返回对象示例如下：

```js
{
    "latitude":40.014043,
    "errMsg":"getLocationV2:ok",
    "longitude":116.35321,
    "accuracy":30,
    "horizontalAccuracy":30,
    "verticalAccuracy":0,
    "timestamp":1685501770000，
    "type":"gcj02" // 新版本将会返回这个参数，老版本则没有。
}
```
