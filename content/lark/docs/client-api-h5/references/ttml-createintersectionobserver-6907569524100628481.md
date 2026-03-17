# createIntersectionObserver

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/ttml/createintersectionobserver
Updated: 2025-01-21

# createIntersectionObserver

createIntersectionObserver(object instance,object option) 用于创建并返回一个 IntersectionObserver 对象实例，以观察目标元素与另一参照元素（或视口）的重叠状态。在页面或自定义组件中，可以使用 `this.createIntersectionObserver([options])`代替该接口。

## 支持说明

该接口仅支持小程序调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V2.3.0+ | V2.3.0+ | V2.3.0+ | V7.35.0+ | 预览
网页应用 | **✕** | **✕** | **X** | **✕** | /

## 输入

名称 | 数据类型 | 是否必填 | 默认值 | 描述
---|---|---|---|---
instance | object | 是 | \- | 页面或组件实例。
option | object | 否 | \- | 创建选项。
&emsp;<br>∟<br>&nbsp;<br>thresholds | number[] | 否 | [0] | 一个数值数组，包含所有阈值。
&emsp;<br>∟<br>&nbsp;<br>initialRatio | number | 否 | 0 | 初始的相交比例，如果调用时检测到的相交比例与这个值不相等且达到阈值，则会触发一次监听器的回调函数。
&emsp;<br>∟<br>&nbsp;<br>observeAll | boolean | 否 | false | 是否同时观测多个目标节点（而非一个），如果设为 true ，observe 的 targetSelector 将选中多个节点。<br>**注意事项**：**注意**：同时选中过多节点将影响渲染性能。

## 输出

返回值 `intersectionObserver`，该对象的方法列表如下所示。
在下表中点击方法名，可查看对应 API 的支持说明、调用方法。

方法 | 介绍
---|---
[IntersectionObserver.observe](https://open.feishu.cn/document/uYjL24iN/uUjN24SN2YjL1YjN/intersectionobserver/observe) | 指定目标节点并开始监听相交状态变化情况。
[IntersectionObserver.relativeTo](https://open.feishu.cn/document/uYjL24iN/uUjN24SN2YjL1YjN/intersectionobserver/relativeto) | 使用选择器指定一个节点，作为参照区域之一。
[IntersectionObserver.relativeToViewport](https://open.feishu.cn/document/uYjL24iN/uUjN24SN2YjL1YjN/intersectionobserver/relativetoviewport) | 指定页面显示区域作为参照区域之一。
[IntersectionObserver.disconnect](https://open.feishu.cn/document/uYjL24iN/uUjN24SN2YjL1YjN/intersectionobserver/disconnect) | 停止监听，回调函数将不再触发。

## 示例代码

```js
//也可以使用 this.createIntersectionObserver({selectAll}) 来创建
tt.createIntersectionObserver(this, {
    selectAll: true
})
.relativeTo('.container')
.observe('.ball', res => {
    res.intersectionRect  // 相交区域
    res.intersectionRect.left  // 相交区域的左边界坐标
    res.intersectionRect.top  // 相交区域的上边界坐标
    res.intersectionRect.width  // 相交区域的宽度
    res.intersectionRect.height  // 相交区域的高度
});
```
