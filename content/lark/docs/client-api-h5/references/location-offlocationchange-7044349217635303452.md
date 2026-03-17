# offLocationChange

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/location/offlocationchange
Updated: 2025-01-21

# offLocationChange(function callback)
取消监听实时地理位置变化事件
**注意事项**：注意事项：
- 调用前需要用户授权 `scope.userLocation`。了解如何授权，可查看[API 权限](https://open.feishu.cn/document/uYjL24iN/uITMuITMuITM)。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V4.9.0+ | V4.9.0+ | **X** | V7.35.0+ | 预览
网页应用 | V5.2.0+ | V5.2.0+ | **X** | V7.35.0+ | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 否 | &nbsp; | 需要取消监听的回调函数

## 输出
无

## 示例代码
**注意事项**：注意：
- `offLocationChange`的参数需要和 `onLocationChange`的参数是同一个`function`的引用，否则无法移除相应`onLocationChange`的事件监听。
- 如果不传递`offLocationChange`的参数，会移除所有的`onLocationChange`事件监听。
```js
const callback = (res) => {
	console.log(res);
};

tt.onLocationChange(callback);

//传递 callback 值，只移除对应的 callback 事件。
tt.offLocationChange(callback);

//不传递 callback 值，则会移除监听所有的事件监听回调
//tt.offLocationChange();
```

回调函数返回对象示例：
```json
{}
```
