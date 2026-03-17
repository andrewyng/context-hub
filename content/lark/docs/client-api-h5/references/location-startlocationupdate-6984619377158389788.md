# startLocationUpdate

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/location/startlocationupdate
Updated: 2025-09-02

# startLocationUpdate

startLocationUpdate(Object object) 用于在开启小程序或网页应用，且程序处于前台时，接收位置更新消息。

## 注意事项

- 调用前需要用户授权 `scope.userLocation`。如何授权可参见 [API 权限](https://open.feishu.cn/document/uYjL24iN/uITMuITMuITM)。
- 该 API 需要用户在系统设置内对飞书授予地理位置权限后方可调用，位置精度和调用耗时会因设备而异。
- 当程序在后台时，会暂停定位，切回前台后，会恢复定位。  
- 该 API 会调用设备 GPS、蜂窝定位等能力，长时间开启可能会引起设备过热、耗电量增加。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V4.3.0+ | V4.3.0+ | **X** | V7.35.0+ | 预览
网页应用 | V5.2.0+ | V5.2.0+ | **X** | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性。

## 示例代码

调用示例：

```js
tt.startLocationUpdate({
    "type": "gcj02",
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`startLocationUpdate fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "startLocationUpdate:ok"
}
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
