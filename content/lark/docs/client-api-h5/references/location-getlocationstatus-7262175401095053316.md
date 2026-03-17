# getLocationStatus

Source URL: https://open.feishu.cn/document/web-app/gadget-api/location/getlocationstatus
Updated: 2025-01-21

# getLocationStatus

getLocationStatus(Object object) 用于获取 GPS 开关状态。当 GPS 开关打开且获取到系统定位权限和用户定位权限时，返回 `on`，否则返回 `off`。

## 支持说明

该接口支持小程序和网页应用调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V6.10.0+ | V6.10.0+ | **X** | V7.35.0+ | 预览
网页应用 | V6.10.0+ | V6.10.0+ | **X** | V7.35.0+ | 预览

## 输入

该接口继承[标准对象输入](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM)，无扩展属性。

## 输出

该接口继承[标准对象输出](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#8c92acb8)，`success` 返回对象的扩展属性如下所示。

名称 | 数据类型 | 描述
---|---|---
gpsStatus | string | GPS开关状态。可能值：<br>- `on`：打开<br>- `off`：关闭

## 示例代码

调用示例：

```js
tt.getLocationStatus({
     success(res) {
      console.log(JSON.stringify(res));
    },
    fail(res) {
      console.log(`getLocationStatus fail: ${JSON.stringify(res)}`);
    }
    });
```

`success`返回对象示例：
```json
{
   "gpsStatus":"on",
   "errMsg": "getLocationStatus:ok"
}
```

## 错误码

`fail` 返回对象中可能包含 errno 属性，表示错误码。关于 errno 错误码的详细说明以及通用错误码列表，可参见[Errno 错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)。
