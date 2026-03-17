# 职务资源介绍

Source URL: https://open.feishu.cn/document/contact-v3/job_title/job-title-resources-introduction
Updated: 2024-07-05

# 职务资源介绍

职务是用户属性之一，通过职务 API 仅支持查询职务信息。如需管理职务，则需要由企业管理员登录 [管理后台](https://feishu.cn/admin)，在 **组织架构** > **字段管理** > **字段设置** 中找到 **职务** 字段，在职务字段详情页中进行管理。

## 字段说明

名称 | 类型 | 描述
---|---|---
job_title_id | string | 职务 ID。
name | string | 职务名称。
i18n_name | i18n_content[] | 多语言职务名称。
└ locale | string | 语言版本。例如：<br>- zh_cn：中文<br>- en_us：英语<br>- ja_jp：日语
└ value | string | 多语言版本对应的值。
status | boolean | 是否启用职务。只有已启用的职务可以生效于用户的职务属性中。<br>**可选值有**：<br>- true：启用<br>- false：禁用

## 数据示例

```json
{
	"job_title_id": "b5565c46b749",
	"name": "高级工程师",
	"i18n_name": [{
		"locale": "zh_cn",
		"value": "专家"
	}],
	"status": true
}
```
