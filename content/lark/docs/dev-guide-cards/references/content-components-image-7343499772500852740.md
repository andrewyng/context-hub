# 图片

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/content-components/image
Updated: 2025-01-02

# 图片组件

飞书卡片支持图片组件。你可调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口或在搭建工具的图片组件中上传图片，获取图片的 key 传入图片组件中，使卡片内容更丰富。

本文档介绍图片组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[图片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/image)。

## 注意事项

为保证图片在聊天窗口中呈现的清晰度，建议你在组件中上传的图片遵从以下规范：

- 图片尺寸在 1500 × 3000 px 的范围内。
- 图片大小不超过 10 M。
- 图片的 `高度:宽度` 不超过 `16:9`。

## JSON 结构

图片的完整 JSON 数据如下所示：

```json
{
  "tag": "img",
  "img_key": "img_v3_0238_073f1823-df2b-4377-86c6-e293f18abcef", // 图片的 Key。可通过上传图片接口或在搭建工具中上传图片后获得。
  "alt": {
    // 光标悬浮（hover）在图片上时展示的说明。
    "tag": "plain_text",
    "content": ""
  },
  "title": {
    // 图片标题。
    "tag": "plain_text",
    "content": ""
  },
  "corner_radius": "5px", // 图片的圆角半径，单位是像素（px）。
  "scale_type": "crop_top", // 图片的裁剪模式，当 size 字段的比例和图片的比例不一致时会触发裁剪。
  "size": "100px 100px", // 图片尺寸。仅在 scale_type 字段为 crop_center 或 crop_top 时生效。
  "transparent": false, // 是否为透明底色。默认为 false，即图片为白色底色。
  "preview": false, // 点击后是否放大图片。默认值为 true。
  // 历史属性
  "mode": "large", // 图片尺寸模式。
  "custom_width": 500, // 自定义图片的最大展示宽度。
  "compact_width": false // 是否展示为紧凑型的图片。
}
```

## 字段说明

图片组件的字段说明如下表。

参数 | 是否必须 | 类型 | 默认值 | 描述
---|---|---|---|---
tag | 是 | String | 无 | 组件的标签，图片组件的固定取值为 img。
img_key | 是 | String | / | 图片资源的 Key。你可以调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口或在搭建工具中上传图片，获取图片的 key。
alt | 是 | Struct | / | 悬浮（hover）在图片上时展示的说明文案。示例值：<br>```json<br>"alt": {<br>"tag": "plain_text",<br>"content": "悬浮（hover）在图片上时展示的说明文案，不需要可以传空"<br>}<br>```
title | 否 | Struct | / | 图片标题。示例值：<br>```json<br>"title": {<br>"tag": "plain_text",<br>"content": "图片标题"<br>}<br>```
corner_radius | 否 | String | / | 图片的圆角半径，单位是像素（px）。取值遵循以下格式：<br>-   [0,∞]px<br>-   [0,100]%
scale_type | 否 | String | crop_center | 图片的裁剪模式，当 `size` 字段的比例和图片的比例不一致时会触发裁剪。 | 可取值：<br>- crop_center：居中裁剪<br>- crop_top：顶部裁剪<br>- fit_horizontal：完整展示不裁剪
size | 否 | String | / | 图片尺寸。仅在 `scale_type` 字段为 crop_center 或 crop_top 时生效。 | 可取值：<br>- large：大图，尺寸为 160 × 160，适用于多图混排。<br>- medium：中图，尺寸为 80 × 80，适用于图文混排的封面图。<br>- small：小图，尺寸为 40 × 40，适用于人员头像。<br>- tiny：超小图，尺寸为 16 × 16，适用于图标、备注。<br>- stretch：超大图，适用于高宽比小于 `16:9` 的图片。<br>- stretch_without_padding：通栏图，适用于高宽比小于 `16:9` 的图片，图片的宽度将撑满卡片宽度。<br>**注意**： [卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)不再支持 `stretch_without_padding` 属性。你可设置 margin 字段为负数实现通栏效果。如：`"margin": "4px -12px"`。详情参考[组件统一支持布局相关能力](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-breaking-changes-release-notes#a967672)。<br>- [1,1000]px [1,1000]px：自定义图片尺寸，单位为像素，中间用空格分隔。
transparent | 否 | Boolean | false | 是否为透明底色。默认为 false，即图片为白色底色。
preview | 否 | Boolean | true | 点击后是否放大图片。<br>- true：点击图片后，弹出图片查看器放大查看当前点击的图片。<br>- false：点击图片后，响应卡片本身的交互事件，不弹出图片查看器。        <br>**提示**：如果你为卡片配置了跳转链接`card_link`参数，可将该参数设置为 `false`，后续用户点击卡片上的图片也能响应 card_link 链接跳转。

### 历史字段说明

参数 | 是否必须 | 类型 | 默认值 | 描述
---|---|---|---|---
mode | 否 | String | / | 图片显示模式。取值：<br>-   **crop_center**：居中裁剪模式，对长图会限高，并居中裁剪后展示。<br>-   **fit_horizontal**：平铺模式，宽度撑满卡片完整展示上传的图片。<br>-   **stretch**：自适应。图片宽度撑满卡片宽度，当图片 `高:宽` 小于 `16:9` 时，完整展示原图。当图片 `高:宽` 大于 `16:9` 时，顶部对齐裁剪图片，并在图片底部展示 **长图** 脚标。<br>-   **large**：大图，尺寸为 160 × 160，适用于多图混排。<br>-   **medium**：中图，尺寸为 80 × 80，适用于图文混排的封面图。<br>-   **small**：小图，尺寸为 40 × 40，适用于人员头像。<br>-   **tiny**：超小图，尺寸为 16 × 16，适用于图标、备注。<br>**注意**：设置该参数后，会覆盖 `custom_width` 参数。更多信息参见[消息卡片设计规范](https://open.feishu.cn/document/ukTMukTMukTM/ugDOwYjL4gDM24CO4AjN)。
custom_width | 否 | int | / | 自定义图片的最大展示宽度，支持在 278px ~ 580px 范围内指定最大展示宽度。默认情况下图片宽度与图片组件所占区域的宽度一致。<br>**注意**：该参数在飞书 V4.0 以上版本生效。
compact_width | 否 | Boolean | false | 是否展示为紧凑型的图片。如果配置为 `true`，则展示最大宽度为 278px 的紧凑型图片。

## 示例代码

将以下示例代码中的 `img_key` 替换为实际的图片 Key，即可实现如下图示例的卡片效果：

```JSON
{
    "config": {},
    "card_link": {
        "url": "",
        "pc_url": "",
        "ios_url": "",
        "android_url": ""
    },
    "i18n_elements": {
        "zh_cn": [
            {
                "tag": "img",
                "img_key": "img_v2_ace8a4f2-ae13-420f-9eb3-b3530b4abcef",
                "preview": true,
                "scale_type": "crop_top",
                "size": "stretch"
            }
        ]
    },
    "i18n_header": {}
}
```
