# 职级资源介绍

Source URL: https://open.feishu.cn/document/contact-v3/job_level/job-level-resources-introduction
Updated: 2024-07-05

# 职级资源介绍

职级是用户属性之一，你可以根据企业组织架构的需要，添加职级，例如 P1、P2、P3、P4。后续在创建用户或者更新用户时，可以为用户设置指定的职级属性。使用职级 API，你可以创建、更新、删除或查询职级。

## 字段说明

名称 | 类型 | 描述
---|---|---
name | string | 职级名称。
description | string | 职级描述。
order | int | 职级排序，可设置 100 ~ 100000 的自然数。数值越小，排序越靠前。创建职级时如果不传入该值，则默认职级排在列表最后位（即 order 取值为当前职级列表内的最大值）。
status | boolean | 是否启用职级。<br>**可能值有**：<br>- true：启用<br>- false：不启用
job_level_id | string | 职级 ID。
i18n_name | i18n_content[] | 多语言职级名称。
└ locale | string | 语言版本。例如：<br>- zh_cn：中文<br>- en_us：英语<br>- ja_jp：日语
└ value | string | 语言版本对应的职级名称。
i18n_description | i18n_content[] | 多语言职级描述。
└ locale | string | 语言版本。例如：<br>- zh_cn：中文<br>- en_us：英语<br>- ja_jp：日语
└ value | string | 语言版本对应的职级描述。

## 数据示例

```json
{
	"name": "高级专家",
	"description": "公司内部中高级职称，有一定专业技术能力的人员",
	"order": 200,
	"status": true,
	"job_level_id": "mga5oa8ayjlp9rb",
	"i18n_name": [{
		"locale": "zh_cn",
		"value": "中文名称"
	}],
	"i18n_description": [{
		"locale": "zh_cn",
		"value": "中文描述"
	}]
}
```
