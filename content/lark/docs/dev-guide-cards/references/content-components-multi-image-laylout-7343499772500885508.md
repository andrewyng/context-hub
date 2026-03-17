# 多图混排

Source URL: https://open.feishu.cn/document/feishu-cards/card-components/content-components/multi-image-laylout
Updated: 2025-01-02

# 多图混排组件

飞书卡片支持多图混排组件。你可调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口或在新版飞书卡片搭建工具中上传图片，获取图片的 key 传入多图混排组件中，使卡片内容更丰富。

本文档介绍多图混排组件的 JSON 1.0 结构，要查看新版 JSON 2.0 结构，参考[多图混排](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/multi-image-laylout)。

## 使用场景

在内容推送场景，你可能需要在卡片内组织编排多张图片。此时你可以使用多图混排组件，选择图片混排方式，快速构建多图样式。

双图混排 | 三图混排 | 四宫格图
---|---|---
&nbsp; | &nbsp; | &nbsp;
六宫格图 | 九宫格图 | &nbsp;
&nbsp; | &nbsp;

## 注意事项

为保证图片在聊天窗口中呈现的清晰度，建议你在组件中上传的图片遵从以下规范：

- 图片尺寸在 1500 × 3000 px 的范围内。
- 图片大小不超过 10 M。
- 图片的 `高度:宽度` 不超过 `16:9`。

## JSON 结构

多图混排的完整 JSON 数据如下所示：
```json
{
  "tag": "img_combination",
  "combination_mode": "double", // 多图混排的方式。
  "corner_radius": "12px", // 多图混排图片的圆角半径，单位是像素（px）。
  "img_list": [
    // 图片资源数组，顺序与图片排列顺序一致。
    {
      "img_key": "img_v3_0239_8347760e-3173-4072-b1aa-e4e7c835741j"
    },
    {
      "img_key": "img_v3_0239_d9a9b734-57f8-4247-baf3-ae178b55f96j"
    }
  ]
}
```

## 字段说明

多图混排组件的字段说明如下表。

参数 | 是否必须 | 类型 | 默认值 | 描述
---|---|---|---|---
tag | 是 | String | / | 多图混排组件的标签，固定取值：`img_combination`。
combination_mode | 是 | String | 空 | 多图混排的方式，可取值：<br>- double：双图混排，最多可排布两张图。<br>- triple：三图混排，最多可排布三张图。<br>- bisect：等分双列图混排，每行两个等大的正方形图，最多可排布三行，即六张图。<br>- trisect：等分三列图混排，每行三个等大的正方形图，最多可排布三行，即九张图。<br>**注意**：<br>-   若上传的图片数量超过混排方式可容纳的上限，则系统将根据图片上传的顺序，优先展示排列顺序中靠前的图片。超出上限的图片将不再显示。<br>- 若上传的图片数量未达到混排方式可容纳的上限，则未排布的部分将保留空白。
corner_radius | 否 | String | / | 多图混排图片的圆角半径，单位是像素（px）。取值遵循以下格式：<br>- [0,∞]px<br>- [0,100]%
img_list | 是 | Object | 空 | 图片资源的 `img_key` 数组，顺序与图片排列顺序一致。
└ img_key | 是 | String | / | 图片资源的 Key。你可以调用[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口或在搭建工具中上传图片，获取图片的 key。

## 示例代码

### 双图混排效果示例

将以下示例代码中的 `img_key` 替换为实际的图片 Key，即可实现如下图示例的卡片效果：

```json
{
  "elements": [
    {
      "tag": "img_combination",
      "combination_mode": "double",
      "img_list": [
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        },
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        }
      ]
    }
  ]
}
```

### 三图混排效果示例

将以下示例代码中的 `img_key` 替换为实际的图片 Key，即可实现如下图示例的卡片效果：

```json
{
  "elements": [
    {
      "tag": "img_combination",
      "combination_mode": "triple",
      "img_list": [
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        },
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        },
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        }
      ]
    }
  ]
}
```

### **等分双列效果示例**

将以下示例代码中的 `img_key` 替换为实际的图片 Key，即可实现如下图示例的卡片效果：

```json
{
  "elements": [
    {
      "tag": "img_combination",
      "combination_mode": "bisect",
      "img_list": [
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        },
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        },
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        },
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        },
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        },
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        }
      ]
    }
  ]
}
```

### 等分三列效果示例

将以下示例代码中的 `img_key` 替换为实际的图片 Key，即可实现如下图示例的卡片效果：

```json
{
  "elements": [
    {
      "tag": "img_combination",
      "combination_mode": "trisect",
      "img_list": [
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        },
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        },
        {
          "img_key": "img_v2_4c772db0-9aff-4eba-bbf4-6e6121cabcef"
        }
      ]
    }
  ]
}
```
