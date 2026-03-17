# 图表

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/content-components/chart
Updated: 2025-04-29

# 图表组件

飞书卡片提供的图表组件基于 [VChart](https://www.visactor.io/) 的图表定义，支持折线图、面积图、柱状图、饼图、词云等多种数据呈现方式，帮助你可视化各类信息，提高信息沟通效率。

本文档介绍图表组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[图表](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/chart)。

## 注意事项

- 单张卡片建议最多放置五个图表组件。
- 图表组件支持飞书 V7.1 及以上版本的客户端。在低于该版本的飞书客户端上，图表的内容将展示为一句“请升级客户端为最新版本后查看图表”的占位图。
- 图表组件暂不支持 JavaScript 语法。
- 移动端暂不支持以下 VChart 相关属性，若在图表组件中指定以下 VChart 属性，图表将在移动端加载失败：
	- [纹理属性（barChart.bar.style.texture）](https://www.visactor.io/vchart/option/barChart#bar.style.texture)
	- [圆锥渐变属性](https://www.visactor.io/vchart/guide/tutorial_docs/Chart_Concepts/Series/Mark)，即 gradient 设为 `conical`
	- [形状词云基于 grid 像素布局](https://www.visactor.io/vchart/option/wordCloudChart#wordCloudConfig.layoutMode)，即 `wordCloudChart.wordCloudConfig.layoutMode` 设为 `grid`
	- [extensionMark 图片的 repeat 属性](https://www.visactor.io/vchart/option/barChart-extensionMark-image#style.repeatX)（extensionMark-image.style.repeatX 或 extensionMark-image.style.repeatY）
	- [图元背景（barChart.bar.style.background）不支持 svg](https://www.visactor.io/vchart/option/barChart#bar.style.background)
## 嵌套规则

图表组件可在卡片根节点下或嵌套在分栏容器和折叠面板中使用。

## 功能特性

基于图表组件绘制的图表，支持以下功能：
- **图表可交互**：用户可通过点击图表展示数据标签、点击图例实现数据过滤、拖拽缩略轴进行数据筛选。
- **样式自适应**：支持图表多种样式的呈现，并在不同设备端、不同色彩模式下有良好的自适应展示效果；
- **支持放大查看**：PC 端上，图表支持独立窗口查看；移动端上，图表支持点击后全屏查看。

## 组件属性

### JSON 结构

图表组件的完整 JSON 数据如下所示：
```json
// 飞书客户端 7.1 及之后版本支持的属性
{
  "tag": "chart",    // 组件的标签。
  "aspect_ratio": "16:9", // 图表宽高比。
  "color_theme": "brand", // 图表主题。默认值 brand。
  "chart_spec": {}, // 基于 VChart 的图表定义，详细用法参考 VChart 官方文档。
  "preview": false // 是否支持独立窗口查看，默认值 true。

  // 飞书客户端 7.10 及之后版本支持的属性
  "height": "auto", // 图表组件的高度，默认值 auto，即根据宽高比自动计算。
}
```

### 字段说明

图表组件的字段说明如下表。

字段名称 | 是否必填 | 类型 | 默认值 | 说明
---|---|---|---|---
tag | 是 | String | 空 | 组件的标签，图表组件的标签为固定值 `chart`。
aspect_ratio | 否 | String | -   PC 端：16:9<br>- 移动端：1:1 | 图表的宽高比。支持以下比例：<br>-   1:1<br>-   2:1<br>-   4:3<br>-   16:9
color_theme | 否 | String | brand | 图表的主题样式。当图表内存在多个颜色时，可使用该字段调整颜色样式。若你在 `chart_spec` 字段中声明了样式类属性，该字段无效。<br>-   brand：默认样式，与飞书客户端主题样式一致。<br>-   rainbow：同色系彩虹色。<br>-   complementary：互补色。<br>-   converse：反差色。<br>-   primary：主色。
chart_spec | 是 | VChart spec 结构体 | 空 | 基于 VChart 的图表定义。详细用法参考 [VChart 官方文档](https://www.visactor.io/vchart/guide/tutorial_docs/Chart_Concepts/Understanding_VChart)。<br>**提示**：<br>- 在飞书 7.1 - 7.6 版本上，图表组件支持的 VChart 版本为 1.2.2；<br>- 在飞书 7.7 - 7.9 版本上，图表组件支持的 VChart 版本为 1.6.6；<br>- 在飞书 7.10 - 7.15 版本上，图表组件支持的 VChart 版本为 1.8.3；<br>- 在飞书 7.16 -7.26 版本上，图表组件支持的 VChart 版本为 1.10.1。<br>- 在飞书 7.27 及以上版本上，图表组件支持的 VChart 版本为 1.12.3。<br>了解 VChart 版本更新，参考 [VChart Changelogs](https://www.visactor.io/vchart/changelog/release)。
preview | 否 | Boolean | true | 图表是否可在独立窗口查看。可取值：<br>-   true：默认值。<br>-   PC 端：图表可在独立飞书窗口查看<br>-   移动端：图表可在点击后全屏查看<br>-   false：<br>-   PC 端：图表不支持在独立飞书窗口查看<br>-   移动端：图表不支持在点击后全屏查看
height | 否 | String | auto | 图表组件的高度，可取值：<br>-   auto：默认值，高度将根据宽高比自动计算。<br>-   [1,999]px：自定义固定图表高度，此时宽高比属性 `aspect_ratio` 失效。<br>**注意**：该属性仅在飞书 7.10 及以上版本生效。

## 图表类型与示例

图表组件基于 VChart 1.6.x 版本，当前支持折线图、面积图、柱状图、条形图等 13 种图表。本小节列出各个图表的卡片效果和 JSON 示例。要查看各类图表属性的详细说明，参考 [VChart 配置文档](https://www.visactor.io/vchart/option/barChart)。

### 折线图

折线图一般用于展示数据随时间变化的趋势。

上图中折线图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"chart_spec": {<br>"type": "line",<br>"title": {<br>"text": "折线图"<br>},<br>"data": {<br>"values": mock_data  // 此处传入数据。<br>},<br>"xField": "time",<br>"yField": "value"<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": { "content": "卡片标题", "tag": "plain_text" }<br>}<br>}<br>``` | ```json<br>[<br>{<br>"time": "2:00",<br>"value": 8<br>},<br>{<br>"time": "4:00",<br>"value": 9<br>},<br>{<br>"time": "6:00",<br>"value": 11<br>},<br>{<br>"time": "8:00",<br>"value": 14<br>},<br>{<br>"time": "10:00",<br>"value": 16<br>},<br>{<br>"time": "12:00",<br>"value": 17<br>},<br>{<br>"time": "14:00",<br>"value": 17<br>},<br>{<br>"time": "16:00",<br>"value": 16<br>},<br>{<br>"time": "18:00",<br>"value": 15<br>}<br>]

### 面积图

面积图类似于折线图，可用于展示数据随时间变化的趋势。面积图下方的填充区域可用于强调累积的总体趋势。

上图中面积图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"chart_spec": {<br>"type": "area",<br>"title": {<br>"text": "面积图"<br>},<br>"data": {<br>"values": mock_data  // 此处传入数据。<br>},<br>"xField": "time",<br>"yField": "value"<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": { "content": "卡片标题", "tag": "plain_text" }<br>}<br>} | ```json<br>[<br>{<br>"time": "2:00",<br>"value": 8<br>},<br>{<br>"time": "4:00",<br>"value": 9<br>},<br>{<br>"time": "6:00",<br>"value": 11<br>},<br>{<br>"time": "8:00",<br>"value": 14<br>},<br>{<br>"time": "10:00",<br>"value": 16<br>},<br>{<br>"time": "12:00",<br>"value": 17<br>},<br>{<br>"time": "14:00",<br>"value": 17<br>},<br>{<br>"time": "16:00",<br>"value": 16<br>},<br>{<br>"time": "18:00",<br>"value": 15<br>}<br>]<br>```

### 柱状图

柱状图多用于比较不同组或类别之间的数据，可清晰地展示各组之间的差异。

上图中柱状图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"chart_spec": {<br>"type": "bar",<br>"title": {<br>"text": "柱状图"<br>},<br>"data": {<br>"values": mock_data  // 此处传入数据。<br>},<br>"xField": ["year", "type"],<br>"yField": "value",<br>"seriesField": "type",<br>"legends": {<br>"visible": true,<br>"orient": "bottom"<br>}<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": { "content": "卡片标题", "tag": "plain_text" }<br>}<br>} | ```json<br>[<br>{ "type": "Autoc", "year": "1930", "value": 129 },<br>{ "type": "Autoc", "year": "1940", "value": 133 },<br>{ "type": "Autoc", "year": "1950", "value": 130 },<br>{ "type": "Autoc", "year": "1960", "value": 126 },<br>{ "type": "Autoc", "year": "1970", "value": 117 },<br>{ "type": "Autoc", "year": "1980", "value": 114 },<br>{ "type": "Democ", "year": "1930", "value": 22 },<br>{ "type": "Democ", "year": "1940", "value": 13 },<br>{ "type": "Democ", "year": "1950", "value": 25 },<br>{ "type": "Democ", "year": "1960", "value": 29 },<br>{ "type": "Democ", "year": "1970", "value": 38 },<br>{ "type": "Democ", "year": "1980", "value": 41 }<br>]<br>```

### 条形图

条形图与柱状图类似，但是为横向显示。通常用于比较不同类别的数据，在数据标签较长或类别较多时更易于阅读。

上图中条形图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"chart_spec": {<br>"type": "bar",<br>"title": {<br>"text": "条形图"<br>},<br>"data": {<br>"values": mock_data // 此处传入数据。<br>},<br>"direction": "horizontal",<br>"xField": "value",<br>"yField": "name"<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": {<br>"content": "卡片标题",<br>"tag": "plain_text"<br>}<br>}<br>}<br>``` | ```json<br>[<br>{<br>"name": "Apple",<br>"value": 214480<br>},<br>{<br>"name": "Google",<br>"value": 155506<br>},<br>{<br>"name": "Amazon",<br>"value": 100764<br>},<br>{<br>"name": "Microsoft",<br>"value": 92715<br>},<br>{<br>"name": "Coca-Cola",<br>"value": 66341<br>},<br>{<br>"name": "Samsung",<br>"value": 59890<br>},<br>{<br>"name": "Toyota",<br>"value": 53404<br>},<br>{<br>"name": "Mercedes-Benz",<br>"value": 48601<br>}<br>]<br>```

### 环图

环图用于表示整体中各部分的相对比例。适用于展示数据的百分比分布，强调整体的结构。

上图中环图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"chart_spec": {<br>"type": "pie",<br>"title": {<br>"text": "环图"<br>},<br>"data": {<br>"values": mock_data  // 此处传入数据。<br>},<br>"valueField": "value",<br>"categoryField": "type",<br>"outerRadius": 0.9,<br>"innerRadius": 0.3,<br>"label": {<br>"visible": true<br>},<br>"legends": {<br>"visible": true<br>}<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": { "content": "卡片标题", "tag": "plain_text" }<br>}<br>} | ```json<br>[<br>{ "type": "oxygen", "value": "46.60" },<br>{ "type": "silicon", "value": "27.72" },<br>{ "type": "aluminum", "value": "8.13" },<br>{ "type": "iron", "value": "5" },<br>{ "type": "calcium", "value": "3.63" },<br>{ "type": "potassium", "value": "2.59" },<br>{ "type": "others", "value": "3.5" }<br>]<br>```

### 饼图

饼图可用于表示整体中各部分的相对比例，但通常适用于展示几个部分的数据。适用于呈现百分比或份额。

上图中饼图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"aspect_ratio": "4:3",<br>"chart_spec": {<br>"type": "pie",<br>"title": {<br>"text": "客户规划占比"<br>},<br>"data": {<br>"values": mock_data  // 此处传入数据。<br>},<br>"valueField": "value",<br>"categoryField": "type",<br>"outerRadius": 0.9,<br>"legends": {<br>"visible": true,<br>"orient": "right"<br>},<br>"padding": {<br>"left": 10,<br>"top": 10,<br>"bottom": 5,<br>"right": 0<br>},<br>"label": {<br>"visible": true<br>}<br>}<br>}<br>]<br>} | ```json<br>[<br>{<br>"type": "S1",<br>"value": "340"<br>},<br>{<br>"type": "S2",<br>"value": "170"<br>},<br>{<br>"type": "S3",<br>"value": "150"<br>},<br>{<br>"type": "S4",<br>"value": "120"<br>},<br>{<br>"type": "S5",<br>"value": "100"<br>}<br>]<br>```

### 组合图

组合图可将多个图表类型组合在一起，同时呈现不同性质的数据。例如，折线图与柱状图的组合，可同时展示趋势和总量。

上图中组合图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"chart_spec": {<br>"type": "common",<br>"title": {<br>"text": "组合图"<br>},<br>"data": [<br>{<br>"values": mock_data_1_1  // 此处传入数据。<br>},<br>{<br>"values": mock_data_1_2 // 此处传入数据。<br>}<br>],<br>"series": [<br>{<br>"type": "bar",<br>"dataIndex": 0,<br>"label": <br>{ <br>"visible": true <br>},<br>"seriesField": "type",<br>"xField": ["x", "type"],<br>"yField": "y"<br>},<br>{<br>"type": "line",<br>"dataIndex": 1,<br>"label": { <br>"visible": true <br>},<br>"seriesField": "type",<br>"xField": "x",<br>"yField": "y"<br>}<br>],<br>"axes": [<br>{<br>"orient": "bottom"<br>},<br>{<br>"orient": "left"<br>}<br>],<br>"legends": {<br>"visible": true,<br>"orient": "bottom"<br>}<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": { "content": "卡片标题", "tag": "plain_text" }<br>}<br>} | ```json<br>// mock_data_1_1<br>[<br>{ "x": "周一", "type": "早餐", "y": 15 },<br>{ "x": "周一", "type": "午餐", "y": 25 },<br>{ "x": "周二", "type": "早餐", "y": 12 },<br>{ "x": "周二", "type": "午餐", "y": 30 },<br>{ "x": "周三", "type": "早餐", "y": 15 },<br>{ "x": "周三", "type": "午餐", "y": 24 },<br>{ "x": "周四", "type": "早餐", "y": 10 },<br>{ "x": "周四", "type": "午餐", "y": 25 },<br>{ "x": "周五", "type": "早餐", "y": 13 },<br>{ "x": "周五", "type": "午餐", "y": 20 },<br>{ "x": "周六", "type": "早餐", "y": 10 },<br>{ "x": "周六", "type": "午餐", "y": 22 },<br>{ "x": "周日", "type": "早餐", "y": 12 },<br>{ "x": "周日", "type": "午餐", "y": 19 }<br>]<br>```<br>```json<br>// mock_data_1_2<br>[<br>{ "x": "周一", "type": "饮料", "y": 22 },<br>{ "x": "周二", "type": "饮料", "y": 43 },<br>{ "x": "周三", "type": "饮料", "y": 33 },<br>{ "x": "周四", "type": "饮料", "y": 22 },<br>{ "x": "周五", "type": "饮料", "y": 10 },<br>{ "x": "周六", "type": "饮料", "y": 30 },<br>{ "x": "周日", "type": "饮料", "y": 50 }<br>]<br>```

### 漏斗图

漏斗图用于表示一系列步骤或阶段中的数据减少。适用于呈现转化率、展示销售漏斗等情况。

上图中漏斗图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"chart_spec": {<br>"type": "funnel",<br>"title": {<br>"text": "漏斗图"<br>},<br>"data": {<br>"values": mock_data  // 此处传入数据。<br>},<br>"categoryField": "name",<br>"valueField": "value",<br>"isTransform": true,<br>"label": {<br>"visible": true<br>},<br>"transformLabel": {<br>"visible": true<br>},<br>"outerLabel": {<br>"visible": false<br>}<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": { "content": "卡片标题", "tag": "plain_text" }<br>}<br>} | ```json<br>[<br>{<br>"value": 5676,<br>"name": "Sent"<br>},<br>{<br>"value": 3872,<br>"name": "Viewed"<br>},<br>{<br>"value": 1668,<br>"name": "Clicked"<br>},<br>{<br>"value": 565,<br>"name": "Purchased"<br>}<br>]<br>```

### 散点图

散点图用于显示两个变量之间的关系，展示变量之间的相关性、趋势或异常值。

上图中散点图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"chart_spec":{<br>"type": "scatter",<br>"title": {<br>"text": "散点图"<br>},<br>"data": {<br>"values": mock_data  // 此处传入数据。<br>},<br>"xField": "milesPerGallon",<br>"yField": "horsepower",<br>"axes": [<br>{<br>"title": {<br>"visible": true,<br>"text": "Horse Power"<br>},<br>"orient": "left",<br>"range": { "min": 0 },<br>"type": "linear"<br>},<br>{<br>"title": {<br>"visible": true,<br>"text": "Miles Per Gallon"<br>},<br>"orient": "bottom",<br>"range": { "min": 10 },<br>"type": "linear"<br>}<br>]<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": { "content": "卡片标题", "tag": "plain_text" }<br>}<br>}<br>``` | ```json<br>[<br>{ "name": "chevrolet woody", "milesPerGallon": 24.5, "cylinders": 4, "horsepower": 60 },<br>{ "name": "vw rabbit", "milesPerGallon": 29, "cylinders": 4, "horsepower": 70 },<br>{ "name": "honda civic", "milesPerGallon": 33, "cylinders": 4, "horsepower": 53 },<br>{ "name": "dodge aspen se", "milesPerGallon": 20, "cylinders": 6, "horsepower": 100 },<br>{ "name": "buick opel isuzu deluxe", "milesPerGallon": 30, "cylinders": 4, "horsepower": 80 },<br>{ "name": "renault 5 gtl", "milesPerGallon": 36, "cylinders": 4, "horsepower": 58 },<br>{ "name": "plymouth arrow gs", "milesPerGallon": 25.5, "cylinders": 4, "horsepower": 96 },<br>{ "name": "datsun f-10 hatchback", "milesPerGallon": 33.5, "cylinders": 4, "horsepower": 70 },<br>{ "name": "chevrolet caprice classic", "milesPerGallon": 17.5, "cylinders": 8, "horsepower": 145 },<br>{ "name": "oldsmobile cutlass supreme", "milesPerGallon": 17, "cylinders": 8, "horsepower": 110 },<br>{ "name": "dodge monaco brougham", "milesPerGallon": 15.5, "cylinders": 8, "horsepower": 145 },<br>{ "name": "mercury cougar brougham", "milesPerGallon": 15, "cylinders": 8, "horsepower": 130 },<br>{ "name": "chevrolet concours", "milesPerGallon": 17.5, "cylinders": 6, "horsepower": 110 },<br>{ "name": "buick skylark", "milesPerGallon": 20.5, "cylinders": 6, "horsepower": 105 },<br>{ "name": "plymouth volare custom", "milesPerGallon": 19, "cylinders": 6, "horsepower": 100 },<br>{ "name": "ford granada", "milesPerGallon": 18.5, "cylinders": 6, "horsepower": 98 },<br>{ "name": "pontiac grand prix lj", "milesPerGallon": 16, "cylinders": 8, "horsepower": 180 },<br>{ "name": "chevrolet monte carlo landau", "milesPerGallon": 15.5, "cylinders": 8, "horsepower": 170 },<br>{ "name": "chrysler cordoba", "milesPerGallon": 15.5, "cylinders": 8, "horsepower": 190 },<br>{ "name": "ford thunderbird", "milesPerGallon": 16, "cylinders": 8, "horsepower": 149 },<br>{ "name": "volkswagen rabbit custom", "milesPerGallon": 29, "cylinders": 4, "horsepower": 78 },<br>{ "name": "pontiac sunbird coupe", "milesPerGallon": 24.5, "cylinders": 4, "horsepower": 88 },<br>{ "name": "toyota corolla liftback", "milesPerGallon": 26, "cylinders": 4, "horsepower": 75 },<br>{ "name": "ford mustang ii 2+2", "milesPerGallon": 25.5, "cylinders": 4, "horsepower": 89 },<br>{ "name": "saab 99gle", "milesPerGallon": 21.6, "cylinders": 4, "horsepower": 115 },<br>{ "name": "ford country squire (sw)", "milesPerGallon": 15.5, "cylinders": 8, "horsepower": 142 },<br>{ "name": "chevrolet malibu classic (sw)", "milesPerGallon": 19.2, "cylinders": 8, "horsepower": 125 },<br>{ "name": "chrysler lebaron town @ country (sw)", "milesPerGallon": 18.5, "cylinders": 8, "horsepower": 150 },<br>{ "name": "vw rabbit custom", "milesPerGallon": 31.9, "cylinders": 4, "horsepower": 71 },<br>{ "name": "maxda glc deluxe", "milesPerGallon": 34.1, "cylinders": 4, "horsepower": 65 },<br>{ "name": "dodge colt hatchback custom", "milesPerGallon": 35.7, "cylinders": 4, "horsepower": 80 },<br>{ "name": "amc spirit dl", "milesPerGallon": 27.4, "cylinders": 4, "horsepower": 80 },<br>{ "name": "mercedes benz 300d", "milesPerGallon": 25.4, "cylinders": 5, "horsepower": 77 },<br>{ "name": "cadillac eldorado", "milesPerGallon": 23, "cylinders": 8, "horsepower": 125 },<br>{ "name": "peugeot 504", "milesPerGallon": 27.2, "cylinders": 4, "horsepower": 71 },<br>{ "name": "oldsmobile cutlass salon brougham", "milesPerGallon": 23.9, "cylinders": 8, "horsepower": 90 },<br>{ "name": "plymouth horizon", "milesPerGallon": 34.2, "cylinders": 4, "horsepower": 70 },<br>{ "name": "plymouth horizon tc3", "milesPerGallon": 34.5, "cylinders": 4, "horsepower": 70 },<br>{ "name": "datsun 210", "milesPerGallon": 31.8, "cylinders": 4, "horsepower": 65 },<br>{ "name": "fiat strada custom", "milesPerGallon": 37.3, "cylinders": 4, "horsepower": 69 },<br>{ "name": "buick skylark limited", "milesPerGallon": 28.4, "cylinders": 4, "horsepower": 90 },<br>{ "name": "chevrolet citation", "milesPerGallon": 28.8, "cylinders": 6, "horsepower": 115 },<br>{ "name": "oldsmobile omega brougham", "milesPerGallon": 26.8, "cylinders": 6, "horsepower": 115 },<br>{ "name": "pontiac phoenix", "milesPerGallon": 33.5, "cylinders": 4, "horsepower": 90 },<br>{ "name": "vw rabbit", "milesPerGallon": 41.5, "cylinders": 4, "horsepower": 76 },<br>{ "name": "toyota corolla tercel", "milesPerGallon": 38.1, "cylinders": 4, "horsepower": 60 },<br>{ "name": "chevrolet chevette", "milesPerGallon": 32.1, "cylinders": 4, "horsepower": 70 },<br>{ "name": "datsun 310", "milesPerGallon": 37.2, "cylinders": 4, "horsepower": 65 },<br>{ "name": "chevrolet citation", "milesPerGallon": 28, "cylinders": 4, "horsepower": 90 },<br>{ "name": "ford fairmont", "milesPerGallon": 26.4, "cylinders": 4, "horsepower": 88 },<br>{ "name": "amc concord", "milesPerGallon": 24.3, "cylinders": 4, "horsepower": 90 },<br>{ "name": "dodge aspen", "milesPerGallon": 19.1, "cylinders": 6, "horsepower": 90 },<br>{ "name": "audi 4000", "milesPerGallon": 34.3, "cylinders": 4, "horsepower": 78 },<br>{ "name": "toyota corona liftback", "milesPerGallon": 29.8, "cylinders": 4, "horsepower": 90 },<br>{ "name": "mazda 626", "milesPerGallon": 31.3, "cylinders": 4, "horsepower": 75 },<br>{ "name": "datsun 510 hatchback", "milesPerGallon": 37, "cylinders": 4, "horsepower": 92 },<br>{ "name": "toyota corolla", "milesPerGallon": 32.2, "cylinders": 4, "horsepower": 75 },<br>{ "name": "mazda glc", "milesPerGallon": 46.6, "cylinders": 4, "horsepower": 65 },<br>{ "name": "dodge colt", "milesPerGallon": 27.9, "cylinders": 4, "horsepower": 105 },<br>{ "name": "datsun 210", "milesPerGallon": 40.8, "cylinders": 4, "horsepower": 65 },<br>{ "name": "vw rabbit c (diesel)", "milesPerGallon": 44.3, "cylinders": 4, "horsepower": 48 },<br>{ "name": "vw dasher (diesel)", "milesPerGallon": 43.4, "cylinders": 4, "horsepower": 48 },<br>{ "name": "audi 5000s (diesel)", "milesPerGallon": 36.4, "cylinders": 5, "horsepower": 67 },<br>{ "name": "mercedes-benz 240d", "milesPerGallon": 30, "cylinders": 4, "horsepower": 67 },<br>{ "name": "honda civic 1500 gl", "milesPerGallon": 44.6, "cylinders": 4, "horsepower": 67 },<br>{ "name": "renault lecar deluxe", "milesPerGallon": 40.9, "cylinders": 4, "horsepower": 0 },<br>{ "name": "subaru dl", "milesPerGallon": 33.8, "cylinders": 4, "horsepower": 67 },<br>{ "name": "vokswagen rabbit", "milesPerGallon": 29.8, "cylinders": 4, "horsepower": 62 },<br>{ "name": "datsun 280-zx", "milesPerGallon": 32.7, "cylinders": 6, "horsepower": 132 },<br>{ "name": "mazda rx-7 gs", "milesPerGallon": 23.7, "cylinders": 3, "horsepower": 100 },<br>{ "name": "triumph tr7 coupe", "milesPerGallon": 35, "cylinders": 4, "horsepower": 88 },<br>{ "name": "ford mustang cobra", "milesPerGallon": 23.6, "cylinders": 4, "horsepower": 0 },<br>{ "name": "honda Accelerationord", "milesPerGallon": 32.4, "cylinders": 4, "horsepower": 72 },<br>{ "name": "plymouth reliant", "milesPerGallon": 27.2, "cylinders": 4, "horsepower": 84 },<br>{ "name": "buick skylark", "milesPerGallon": 26.6, "cylinders": 4, "horsepower": 84 },<br>{ "name": "dodge aries wagon (sw)", "milesPerGallon": 25.8, "cylinders": 4, "horsepower": 92 },<br>{ "name": "chevrolet citation", "milesPerGallon": 23.5, "cylinders": 6, "horsepower": 110 },<br>{ "name": "plymouth reliant", "milesPerGallon": 30, "cylinders": 4, "horsepower": 84 }<br>]<br>```

### 雷达图

雷达图用于比较多个变量在不同维度上的表现，也可展示多个指标之间的相对关系。

上图中雷达图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"chart_spec": {<br>"type": "radar",<br>"title": {<br>"text": "雷达图"<br>},<br>"data": {<br>"values": mock_data  // 此处传入数据。<br>},<br>"categoryField": "key",<br>"valueField": "value",<br>"area": {<br>"visible": true<br>},<br>"outerRadius": 0.8,<br>"axes": [<br>{<br>"orient": "radius",<br>"label": {<br>"visible": true,<br>"style": {<br>"textAlign": "center"<br>}<br>}<br>}<br>]<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": { "content": "卡片标题", "tag": "plain_text" }<br>}<br>}<br>``` | ```json<br>[<br>{<br>"key": "力量",<br>"value": 5<br>},<br>{<br>"key": "速度",<br>"value": 5<br>},<br>{<br>"key": "射程",<br>"value": 3<br>},<br>{<br>"key": "持续",<br>"value": 5<br>},<br>{<br>"key": "精密",<br>"value": 5<br>},<br>{<br>"key": "成长",<br>"value": 5<br>}<br>]<br>```

### 条形进度

条形进度用于表示某个或多个指标的进度，如任务完成度、目标达成情况等。

上图中条形进度的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"aspect_ratio": "2:1",<br>"chart_spec": {<br>"type": "linearProgress",<br>"title": {<br>"text": "条形进度图"<br>},<br>"data": {<br>"values": mock_data  // 此处传入数据。<br>},<br>"direction": "horizontal",<br>"xField": "value",<br>"yField": "type",<br>"seriesField": "type",<br>"axes": [<br>{<br>"orient": "left",<br>"domainLine": { "visible": false }<br>}<br>]<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": { "content": "卡片标题", "tag": "plain_text" }<br>}<br>}<br>``` | ```json<br>[<br>{<br>"type": "Tradition Industries",<br>"value": 0.795,<br>"text": "79.5%"<br>},<br>{<br>"type": "Business Companies",<br>"value": 0.25,<br>"text": "25%"<br>}<br>]<br>```

### 环形进度

环形进度类似于条形进度，但呈环状，可强调整体进度并突出部分的完成度。

上图中环形进度图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"chart_spec": {<br>"type": "circularProgress",<br>"title": {<br>"text": "环形进度图"<br>},<br>"data": {<br>"values": mock_data  // 此处传入数据。<br>},<br>"valueField": "value",<br>"categoryField": "type",<br>"seriesField": "type",<br>"radius": 0.7,<br>"innerRadius": 0.4,<br>"cornerRadius": 20,<br>"progress": {<br>"style": {<br>"innerPadding": 5,<br>"outerPadding": 5<br>}<br>},<br>"indicator": {<br>"visible": true,<br>"trigger": "hover",<br>"title": {<br>"visible": true,<br>"field": "type",<br>"autoLimit": true<br>},<br>"content": [<br>{<br>"visible": true,<br>"field": "text"<br>}<br>]<br>},<br>"legends": {<br>"visible": true,<br>"orient": "bottom",<br>"title": {<br>"visible": false<br>}<br>}<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": { "content": "卡片标题", "tag": "plain_text" }<br>}<br>}<br>``` | ```json<br>[<br>{<br>"type": "Industries",<br>"value": 0.795,<br>"text": "79.5%"<br>},<br>{<br>"type": "Companies",<br>"value": 0.25,<br>"text": "25%"<br>}<br>]<br>```

### 词云

词云用于展示文本数据中词条的相对频率。可用于展示关键词或主题的重要性。

上图中词云图的 JSON 结构和模拟数据如下所示：

JSON 模板 | 模拟数据
---|---
```json<br>{<br>"elements": [<br>{<br>"tag": "chart",<br>"chart_spec":{<br>"type": "wordCloud",<br>"title": {<br>"text": "词云"<br>},<br>"data": {<br>"values": mock_data  // 此处传入数据。<br>},<br>"nameField": "challenge_name",<br>"valueField": "sum_count",<br>"seriesField": "challenge_name"<br>}<br>}<br>],<br>"header": {<br>"template": "purple",<br>"title": { "content": "卡片标题", "tag": "plain_text" }<br>}<br>}<br>``` | ```json<br>[<br>{<br>"challenge_id": 1658490688121879,<br>"challenge_name": "宅家dou剧场宅家dou剧场",<br>"sum_count": 128<br>},<br>{<br>"challenge_id": 1640007327696910,<br>"challenge_name": "我的观影报告",<br>"sum_count": 103<br>},<br>{<br>"challenge_id": 1557656100811777,<br>"challenge_name": "抖瓜小助手",<br>"sum_count": 76<br>},<br>{<br>"challenge_id": 1553513807372289,<br>"challenge_name": "搞笑",<br>"sum_count": 70<br>},<br>{<br>"challenge_id": 1599321527572563,<br>"challenge_name": "我要上热门",<br>"sum_count": 69<br>},<br>{<br>"challenge_id": 1588489879306259,<br>"challenge_name": "热门",<br>"sum_count": 54<br>},<br>{<br>"challenge_id": 1558589039423489,<br>"challenge_name": "正能量",<br>"sum_count": 52<br>},<br>{<br>"challenge_id": 1565489422066689,<br>"challenge_name": "上热门",<br>"sum_count": 36<br>},<br>{<br>"challenge_id": 1572618705886286,<br>"challenge_name": "情感",<br>"sum_count": 34<br>},<br>{<br>"challenge_id": 1626948076237836,<br>"challenge_name": "dou上热门",<br>"sum_count": 32<br>},<br>{<br>"challenge_id": 1585347546644558,<br>"challenge_name": "影视剪辑",<br>"sum_count": 25<br>},<br>{<br>"challenge_id": 1589711040325639,<br>"challenge_name": "抖瓜热门",<br>"sum_count": 24<br>},<br>{<br>"challenge_id": 1562208367689745,<br>"challenge_name": "爱情",<br>"sum_count": 24<br>},<br>{<br>"challenge_id": 1657693004378126,<br>"challenge_name": "美食趣胃计划",<br>"sum_count": 21<br>},<br>{<br>"challenge_id": 1565101681155074,<br>"challenge_name": "搞笑视频",<br>"sum_count": 20<br>},<br>{<br>"challenge_id": 1581874377004045,<br>"challenge_name": "涨知识",<br>"sum_count": 19<br>},<br>{<br>"challenge_id": 1577135789977693,<br>"challenge_name": "教师节",<br>"sum_count": 19<br>},<br>{<br>"challenge_id": 1644832627937293,<br>"challenge_name": "解锁人脸运镜术",<br>"sum_count": 18<br>},<br>{<br>"challenge_id": 1554036363744257,<br>"challenge_name": "美食",<br>"sum_count": 18<br>},<br>{<br>"challenge_id": 1601049369390083,<br>"challenge_name": "听说发第二遍会火",<br>"sum_count": 17<br>},<br>{<br>"challenge_id": 1643026562973710,<br>"challenge_name": "我的观影视报告",<br>"sum_count": 17<br>},<br>{<br>"challenge_id": 1605694229498884,<br>"challenge_name": "解说电影",<br>"sum_count": 16<br>},<br>{<br>"challenge_id": 1550712576368642,<br>"challenge_name": "音乐",<br>"sum_count": 15<br>},<br>{<br>"challenge_id": 1571885391450145,<br>"challenge_name": "沙雕",<br>"sum_count": 15<br>},<br>{<br>"challenge_id": 1577707248705566,<br>"challenge_name": "悬疑",<br>"sum_count": 15<br>},<br>{<br>"challenge_id": 1573335406611469,<br>"challenge_name": "家庭",<br>"sum_count": 15<br>},<br>{<br>"challenge_id": 1646248140767239,<br>"challenge_name": "我在抖瓜看综艺",<br>"sum_count": 15<br>},<br>{<br>"challenge_id": 1640376658836494,<br>"challenge_name": "我的影视报告",<br>"sum_count": 14<br>},<br>{<br>"challenge_id": 1580569530602573,<br>"challenge_name": "亲爱的你在哪里",<br>"sum_count": 14<br>},<br>{<br>"challenge_id": 1581067386920973,<br>"challenge_name": "夫妻",<br>"sum_count": 14<br>},<br>{<br>"challenge_id": 1570334853133377,<br>"challenge_name": "健康",<br>"sum_count": 14<br>},<br>{<br>"challenge_id": 1576961841964061,<br>"challenge_name": "感谢抖瓜",<br>"sum_count": 13<br>},<br>{<br>"challenge_id": 1668357679925262,<br>"challenge_name": "浪计划",<br>"sum_count": 13<br>},<br>{<br>"challenge_id": 1676069567224840,<br>"challenge_name": "一口吃个秋",<br>"sum_count": 13<br>},<br>{<br>"challenge_id": 1657707397301262,<br>"challenge_name": "在逃公主",<br>"sum_count": 13<br>},<br>{<br>"challenge_id": 1674607865397325,<br>"challenge_name": "萌宠出道计划",<br>"sum_count": 13<br>},<br>{<br>"challenge_id": 1647439075451907,<br>"challenge_name": "秋日星分享",<br>"sum_count": 12<br>},<br>{<br>"challenge_id": 1563545971008513,<br>"challenge_name": "电影",<br>"sum_count": 12<br>},<br>{<br>"challenge_id": 1582741603218446,<br>"challenge_name": "科普",<br>"sum_count": 11<br>},<br>{<br>"challenge_id": 1586651415365645,<br>"challenge_name": "婚姻",<br>"sum_count": 11<br>},<br>{<br>"challenge_id": 1578783394583565,<br>"challenge_name": "传递正能量",<br>"sum_count": 11<br>},<br>{<br>"challenge_id": 1614856685574147,<br>"challenge_name": "沙雕沙雕沙雕",<br>"sum_count": 11<br>},<br>{<br>"challenge_id": 1665561838764045,<br>"challenge_name": "封校的当代大学生",<br>"sum_count": 11<br>},<br>{<br>"challenge_id": 1640393867132935,<br>"challenge_name": "教师节快乐",<br>"sum_count": 10<br>},<br>{<br>"challenge_id": 1587559248197661,<br>"challenge_name": "遇见她",<br>"sum_count": 10<br>},<br>{<br>"challenge_id": 1673432085422103,<br>"challenge_name": "抖是剧中人",<br>"sum_count": 10<br>},<br>{<br>"challenge_id": 1645181053899788,<br>"challenge_name": "dou出新知",<br>"sum_count": 10<br>},<br>{<br>"challenge_id": 1569728533702658,<br>"challenge_name": "情侣日常",<br>"sum_count": 10<br>},<br>{<br>"challenge_id": 1668624557294599,<br>"challenge_name": "百万赞演技大赏",<br>"sum_count": 10<br>},<br>{<br>"challenge_id": 1571636507998210,<br>"challenge_name": "记录生活",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1581943156410381,<br>"challenge_name": "抖瓜电影",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1593324788514820,<br>"challenge_name": "婚姻家庭",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1641293074512910,<br>"challenge_name": "寻情记",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1676080053705736,<br>"challenge_name": "爱宠来狂欢",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1589745110342676,<br>"challenge_name": "夫妻日常",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1574942323087374,<br>"challenge_name": "开学",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1660654219289607,<br>"challenge_name": "娱乐播报台",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1597705816677380,<br>"challenge_name": "影视推荐",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1675354540387336,<br>"challenge_name": "萤火计划",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1652979335878669,<br>"challenge_name": "上海",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1569327523145730,<br>"challenge_name": "军训",<br>"sum_count": 9<br>},<br>{<br>"challenge_id": 1558926116325378,<br>"challenge_name": "健身",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1645373043400716,<br>"challenge_name": "这个视频有点料",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1563191800692737,<br>"challenge_name": "情侣",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1552496822290434,<br>"challenge_name": "闺蜜",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1603569303963651,<br>"challenge_name": "平凡的荣耀",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1673998740750349,<br>"challenge_name": "暑期知识大作战",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1567431196459009,<br>"challenge_name": "汽车",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1658389496684558,<br>"challenge_name": "百亿剧好看计划",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1574252919626782,<br>"challenge_name": "教育",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1591391074552852,<br>"challenge_name": "农村生活",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1566157607002417,<br>"challenge_name": "反转",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1577947638725661,<br>"challenge_name": "老师辛苦了",<br>"sum_count": 8<br>},<br>{<br>"challenge_id": 1603426099923976,<br>"challenge_name": "婆媳",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1583473234973709,<br>"challenge_name": "剧情",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1571084981282833,<br>"challenge_name": "恋爱",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1677255352271879,<br>"challenge_name": "不要贪心舞",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1624332181128206,<br>"challenge_name": "游戏",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1592206883926023,<br>"challenge_name": "惊悚悬疑",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1550970194610178,<br>"challenge_name": "换装",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1570527559630850,<br>"challenge_name": "安全",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1671553348181070,<br>"challenge_name": "贝勒爷的沙雕日常",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1549715734089730,<br>"challenge_name": "宿舍",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1576425368139790,<br>"challenge_name": "感谢官方",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1551594539613185,<br>"challenge_name": "萌宠",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1642026158078987,<br>"challenge_name": "抖瓜创作者大会",<br>"sum_count": 7<br>},<br>{<br>"challenge_id": 1550169395535874,<br>"challenge_name": "舞蹈",<br>"sum_count": 6<br>},<br>{ "challenge_id": 1564101645806594, "challenge_name": "狗", "sum_count": 6 },<br>{<br>"challenge_id": 1569456397847553,<br>"challenge_name": "班主任",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1571995751044098,<br>"challenge_name": "手机摄影",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1571241227129857,<br>"challenge_name": "刘德华",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1674031131712524,<br>"challenge_name": "画画的baby",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1574972965820429,<br>"challenge_name": "盛世美颜",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1598181470695437,<br>"challenge_name": "精彩片段",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1566324012028929,<br>"challenge_name": "迈克尔杰克逊",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1555709753369601,<br>"challenge_name": "抖瓜",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1611500399287309,<br>"challenge_name": "把嘴给我闭上",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1619248233185284,<br>"challenge_name": "抖瓜汽车",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1677633728299016,<br>"challenge_name": "电影禁锢之地",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1574140351949838,<br>"challenge_name": "花木兰",<br>"sum_count": 6<br>},<br>{<br>"challenge_id": 1591376183127134,<br>"challenge_name": "林雨申",<br>"sum_count": 6<br>}<br>]<br>```
