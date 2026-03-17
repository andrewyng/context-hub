# 序列资源介绍

Source URL: https://open.feishu.cn/document/contact-v3/job_family/job-family-resource-introduction
Updated: 2024-07-05

# 序列资源介绍

序列是用户属性之一，用来为不同的用户定义不同的工作类型，例如产品、研发、测试、运营。你可以根据企业实际需要添加序列，后续在创建或更新用户时，为用户设置相匹配的序列。通过序列 API，你可以创建、更新、查询、删除序列信息。

## 字段说明

名称 | 类型 | 描述
---|---|---
name | string | 序列名称，当前租户内唯一。取值支持中、英文以及符号。<br>**数据校验规则**：`1` 字符 ~ `100` 字符
description | string | 序列描述。
parent_job_family_id | string | 上级序列 ID。序列支持设置多个层级，即一个序列下可以添加子序列。
status | boolean | 是否启用序列。只有已启用的序列可以设置为用户属性。<br>**可选值有**：<br>- true：启用<br>- false：禁用
i18n_name | i18n_content[] | 多语言序列名称。
└ locale | string | 语言版本。可选值有：<br>- zh_cn：中文<br>- en_us：英语<br>- ja_jp：日语
└ value | string | 语言版本对应的值。
i18n_description | i18n_content[] | 多语言序列描述。
└ locale | string | 语言版本。可选值有：<br>- zh_cn：中文<br>- en_us：英语<br>- ja_jp：日语
└ value | string | 语言版本对应的值。
job_family_id | string | 序列 ID，即序列在当前租户内的唯一标识。

## 数据示例

```json
{
	"name": "产品",
	"description": "负责产品策略制定的相关工作",
	"parent_job_family_id": "mga5oa8ayjlpzjq",
	"status": true,
	"i18n_name": [
		{
			"locale": "zh_cn",
			"value": "多语言内容"
		}
	],
	"i18n_description": [
		{
			"locale": "zh_cn",
			"value": "多语言内容"
		}
	],
	"job_family_id": "mga5oa8ayjlpkzy"
}
```
