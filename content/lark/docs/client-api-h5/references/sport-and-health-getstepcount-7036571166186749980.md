# getStepCount

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/sport-and-health/getstepcount
Updated: 2025-03-12

# getStepCount

调用 getStepCount(Object object) 获取设备中的步数信息。

## 注意事项

维度 | 内容
---|---
权限相关 | - 调用该接口前需要用户授权 `scope.runData`。如何授权参见[API 权限](https://open.feishu.cn/document/uYjL24iN/uITMuITMuITM)。<br>- 该接口需要用户在手机系统中，为飞书客户端授予以下相应的权限：<br>- Android 端：健身运动（不同厂商设备的权限名称可能有所差异）<br>- iOS 端：运动与健身<br>- Harmony 端：运动数据
数据来源相关 | 该接口在 Android、iOS和Harmony 端获取数据来源时存在一定差异：<br>- Android V5.31.0 及以前的版本<br>获取传感器设备中的当前总步数。如果设备重启，设备传感器中的步数会被清零。如果未能获取到步数信息，请检查设备是否支持 TYPE_STEP_COUNTER 传感器以及传感器是否正常工作。<br>- Android V5.32.0 及以后的版本<br>- 在小米系列手机上，从小米运动中获取设备当天 0 点至当前时间的步数信息。相关信息参见[小米运动文档](https://dev.mi.com/console/doc/detail?pId=2487)。<br>- 在非小米系列手机上，获取传感器设备内的当前总步数。如果设备重启，设备传感器中的步数不会被清零，运动步数会一直累加。如果未能获取到步数信息，请检查设备是否支持 TYPE_STEP_COUNTER 传感器以及传感器是否正常工作。<br>- iOS<br>- iOS 返回的是 iPhone 传感器当天的步数数据，健康 App 的步数是 iPhone 传感器和 Apple Watch 等设备传感器步数的和，因此 getStepCount 和 iOS 运动里的步数可能不一致。<br>- 如果未能获取到步数信息, 请检查设备是否支持 TYPE_STEP_COUNTER 传感器以及传感器是否正常工作。<br>- Harmony V7.39.0 及以后的版本<br>获取传感器设备内的当前总步数。如果设备重启，设备传感器中的步数不会被清零，运动步数会一直累加。如果未能获取到步数信息，请检查设备是否支持 PEDOMETER 传感器以及传感器是否正常工作。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.1.0+ | V5.1.0+ | **X** | V7.39.0+ | 预览
网页应用 | V5.1.0+ | V5.1.0+ | **X** | V7.39.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`success` 返回对象的扩展属性如下所示。

名称 | 数据类型 | 描述
---|---|---
stepCount | number | 设备当前步数。

## 示例代码

调用示例：

```js
tt.getStepCount({ 
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`getStepCount fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "stepCount": 8,
    "errMsg": "getStepCount:ok"
}
```

## 错误码

`fail` 返回对象中可能包含 errCode 属性和 errno 属性，均代表错误码。

**errCode 错误码**

错误码 | 描述 | 排查建议
---|---|---
1717201 | step count not available | 计步功能不可用，当前设备可能不支持该功能。
1717202 | already start | 之前获取步数还未结束，请确保上次调用已经完成。

**errno 错误码**

关于 Errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
