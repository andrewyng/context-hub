# 工作城市资源介绍

Source URL: https://open.feishu.cn/document/contact-v3/work_city/work-city-resources-introduction
Updated: 2024-07-05

# 工作城市资源介绍

工作城市是用户属性之一，通过工作城市 API 仅支持查询工作城市信息。如需管理工作城市，则需要由企业管理员登录 [管理后台](https://feishu.cn/admin)，在 **组织架构** > **字段管理** > **字段设置** 中找到 **工作城市** 字段，在工作城市字段详情页中进行管理。

## 字段说明

名称 | 类型 | 描述
---|---|---
work_city_id | string | 工作城市 ID。
name | string | 工作城市名称。
i18n_name | i18n_content[] | 多语言工作城市名称。
└ locale | string | 语言版本。例如：<br>- zh_cn：中文<br>- en_us：英语<br>- ja_jp：日语
└ value | string | 多语言版本对应的值。
status | boolean | 是否启用工作城市。只有已启用的工作城市可以生效于用户的工作城市属性中。<br>**可选值有**：<br>- true：启用<br>- false：禁用

## 数据示例

```json
{
	"work_city_id": "0dd1ec95f021",
	"name": "北京",
	"i18n_name": [{
		"locale": "zh_cn",
		"value": "北京"
	}],
	"status": true
}
```
