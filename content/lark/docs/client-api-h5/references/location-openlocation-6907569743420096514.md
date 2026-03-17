# openLocation

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/location/openlocation
Updated: 2025-04-15

# openLocation

调用 openLocation(Object object) 通过客户端内置地图查看位置。

## 注意事项
- 调用前需要用户授权 `scope.userLocation`。如何授权可参见 [API 权限](https://open.feishu.cn/document/uYjL24iN/uITMuITMuITM)。
- 因系统地图框架问题，该 API 在 iOS 12 不支持。
- 该 API 有一定性能消耗，请注意不要频繁调用以防设备过热和耗电过快。小程序框架也会做相应的节流处理。
- Harmony端暂不支持在地图上显示当前位置标识

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | **✓** | **✓** | **X** | V7.35.0+ | 预览
网页应用 | V3.44.0+ | V3.44.0+ | **X** | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性如下所示。

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
latitude | number | 是 | \- | 纬度。取值范围为 `-90` ~ `90`，正数表示北，负数表示南。示例值：30.492121
longitude | number | 是 | \- | 经度。取值范围为 `-180` ~ `180`，正数表示东，负数表示西。示例值：114.410324
name | string | 否 | \- | 位置名。示例值：保利国际中心
address | string | 否 | \- | 地址的详细说明。示例值：武汉市洪山区关山大道
scale | number | 否 | 18 | 缩放比例。取值范围 `5` ~ `18`。示例值：12
type | string | 否 | \- | 坐标系类型。可选值：<br>- `wgs84`：传入 wgs84 坐标系下的经纬度。 <br>- `gcj02`：传入 gcj02 坐标系下的经纬度。<br>**注意事项**：**注意**：<br>- 飞书 [V5.2.0](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/version-compatibility) 及以上版本支持设置该字段。<br>- 如果不传值，则按照手机设备默认的坐标系处理，对于中国大陆坐标系默认为 `gcj02`。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，无扩展属性。

## 示例代码

调用示例：

```js
tt.openLocation({
    "latitude": 30.492121,
    "longitude": 114.410324,
    "scale": 12,
    "name": "保利国际中心",
    "address": "武汉市洪山区关山大道",
    success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`openLocation fail: ${JSON.stringify(res)}`);
    }
});
```

`success`返回对象示例：
```json
{
    "errMsg": "openLocation:ok"
}
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
