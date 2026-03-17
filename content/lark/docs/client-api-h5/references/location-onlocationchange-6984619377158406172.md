# onLocationChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/location/onlocationchange
Updated: 2025-09-02

# onLocationChange(function callback)
监听实时地理位置变化事件

此方法在调用 [startLocationUpdate](https://open.feishu.cn/document/uYjL24iN/uMTOuMTOuMTO/startlocationupdate) 后地址位置更新时触发回调
**注意事项**：注意事项：
- 调用前需要用户授权 `scope.userLocation`。了解如何授权，可查看[API 权限](https://open.feishu.cn/document/uYjL24iN/uITMuITMuITM)。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V4.3.0+ | V4.3.0+ | **X** | V7.35.0+ | 预览
网页应用 | V5.2.0+ | V5.2.0+ | **X** | V7.35.0+ | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 是 | &nbsp; | 该事件的回调函数

## 输出
回调函数返回对象的属性：

名称 | 数据类型 | 描述
---|---|---
latitude | number | 纬度，范围为-90~90，正数表示北，负数表示南
longitude | number | 经度，范围为-180~180，正数表示东，负数表示西
accuracy | number | 位置的精确度，单位 m<br>**注意事项**：- iOS 返回水平精确度与垂直精确度中较大的值<br>- Android 返回水平精确度值
verticalAccuracy | number | 垂直精度，单位 m<br>**注意事项**：安卓无法获取此值，返回 0
horizontalAccuracy | number | 水平精度，单位 m
timestamp | number | 定位时间戳，单位 ms
type | string | 坐标系类型。可能值：<br>- `wgs84`：wgs84 坐标系。<br>- `gcj02`：gcj02 坐标系。

## 示例代码

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

tt.onLocationChange(function(res) {
    console.log(JSON.stringify(res));
});
```

回调函数返回对象示例：
```json
{
    "longitude": 120.02278184678819,
    "latitude": 30.28898898654514
    "accuracy": 148,
    "verticalAccuracy": 11.42357063293457,
    "horizontalAccuracy": 148,
    "timestamp": 1637497698313,
}
```
