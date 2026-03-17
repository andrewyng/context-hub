# offLocationChangeError

Source URL: https://open.feishu.cn/document/web-app/gadget-api/location/offlocationchangeerror
Updated: 2025-09-02

# offLocationChangeError

取消监听持续定位接口返回失败时触发。

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V5.21.0+ | V5.21.0+ | **X** | V7.35.0+ | 预览
网页应用 | V5.21.0+ | V5.21.0+ | **X** | V7.35.0+ | 预览

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 否 | &nbsp; | 需要取消监听的回调函数

## 输出
无

## 示例代码
**注意事项**：注意：
- `offLocationChangeError`的参数需要和 `onLocationChangeError`的参数是同一个`function`的引用，否则无法移除相应`onLocationChangeError`的事件监听。
- 如果不传递`offLocationChangeError`的参数，会移除所有的`onLocationChangeError`事件监听。
```js
const callback = (res) => {
	console.log(res);
};

tt.onLocationChangeError(callback);

//传递 callback 值，只移除对应的 callback 事件。
tt.offLocationChangeError(callback);

//不传递 callback 值，则会移除监听所有的事件监听回调
//tt.offLocationChangeError();
```

回调函数返回对象示例：
```json
{}
```
