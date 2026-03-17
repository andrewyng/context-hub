# reverseGeocode

Source URL: https://open.feishu.cn/document/web-app/gadget-api/location/reversegeocode
Updated: 2025-01-21

# reverseGeocode

reverseGeocode(Object object) 用于逆地理编码，根据传入的经纬度，获取相应的位置信息。
**注意事项**：注意事项：
- 在Android端传递海外经纬度时，逆地理编码会失败，返回1700008错误。
- 手机网络不好时，也会导致逆地理编码失败，返回1700008错误。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V6.6.0+ | V6.6.0+ | **X** | V7.35.0+ | 预览
网页应用 | V6.6.0+ | V6.6.0+ | **X** | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，扩展属性如下所示。

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
latitude | number | 是 | \- | 纬度。范围为 `-90` ~ `90`，正数表示北，负数表示南。
longitude | number | 是 | \- | 经度。范围为 `-180` ~ `180`，正数表示东，负数表示西。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`success` 返回对象的扩展属性如下所示。

名称 | 数据类型 | 描述
---|---|---
country | string | 国家。
province | string | 省/直辖市。
city | string | 市。
district | string | 区。
township | string | 乡/镇/街道。
neighborhood | string | 社区。
building | string | 建筑。
address | string | 地址。

## 示例代码

调用示例：

```js
tt.reverseGeocode({
     latitude:  40.014053,
     longitude: 116.353211,
     success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`reverseGeocode fail: ${JSON.stringify(res)}`);
    }
    });
```

`success`返回对象示例：
```json
{
   "address":"北京市海淀区学院路街道学清嘉创大厦B座",
   "building":"",
   "city":"北京市",
   "country":"中国",
   "district":"海淀区",
   "neighborhood":"",
   "province":"北京市",
   "township":"学院路街道",
   "errMsg":"reverseGeocode:ok"
}
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
