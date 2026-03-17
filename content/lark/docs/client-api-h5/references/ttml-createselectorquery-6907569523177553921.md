# createSelectorQuery

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/ttml/createselectorquery
Updated: 2025-01-21

# createSelectorQuery

调用 createSelectorQuery() 返回一个 [SelectorQuery](https://open.feishu.cn/document/uYjL24iN/uUjN24SN2YjL1YjN/selectorquery/selectorquery) 对象实例。

## 支持说明

该接口仅支持小程序调用，对应的客户端版本支持情况如下所示。

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V2.2.0+ | V2.2.0+ | V2.2.0+ | V7.35.0+ | 预览
网页应用 | **X** | **X** | **X** | **X** | /

## 输入
无

## 输出

返回值 [SelectorQuery](https://open.feishu.cn/document/uYjL24iN/uUjN24SN2YjL1YjN/selectorquery/selectorquery)，该对象的方法列表如下。

方法 | 介绍
---|---
[SelectorQuery.in](https://open.feishu.cn/document/uYjL24iN/uUjN24SN2YjL1YjN/selectorquery/in) | 将选择器的选取范围更改为自定义组件 component 内（初始时，选择器仅选取页面范围的节点，不会选取任何自定义组件中的节点）。
[SelectorQuery.select](https://open.feishu.cn/document/uYjL24iN/uUjN24SN2YjL1YjN/selectorquery/select) | 在当前页面下选择第一个匹配选择器 selector 的节点，返回一个 NodesRef 对象实例，可以用于获取节点信息。<br>selector 类似于 CSS 的选择器，其中移动端只支持 ID 选择器。
[SelectorQuery.selectAll](https://open.feishu.cn/document/uYjL24iN/uUjN24SN2YjL1YjN/selectorquery/selectall) | 在当前页面下选择匹配选择器 selector 的所有节点，返回一个 NodesRef 对象实例，可以用于获取节点信息。<br>selector 类似于 CSS 的选择器，同 select。
[SelectorQuery.selectViewport](https://open.feishu.cn/document/uYjL24iN/uUjN24SN2YjL1YjN/selectorquery/selectviewport) | 选择显示区域。可用于获取显示区域的尺寸、滚动位置等信息。
[SelectorQuery.exec](https://open.feishu.cn/document/uYjL24iN/uUjN24SN2YjL1YjN/selectorquery/exec) | 执行所有的请求。请求结果按请求次序构成数组，在 callback 的第一个参数中返回。

## 示例代码

```js
const query = tt.createSelectorQuery()
query.select('#the-id').boundingClientRect()
query.selectViewport().scrollOffset()
query.exec(function(res){
  res[0].top       // #the-id 节点的上边界坐标
  res[1].scrollTop // 显示区域的竖直滚动位置
})
```
