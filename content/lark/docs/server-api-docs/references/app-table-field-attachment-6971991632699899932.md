# 附件字段说明

Source URL: https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-field/attachment
Updated: 2024-06-06

# 附件字段说明

**注意事项**：使用前请仔细阅读[素材概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction)。

## 数据结构
| 字段名 | 字段描述|
|:---|:---|
 |file_token |文件 token|
 | name |文件名称|
 |size |文件大小|
 |tmp_url|文件临时下载链接|
 |type|文件类型|
 |url|文件的下载 URL|

**返回 body**

```json 
{
  "任务附件": [
    {
      "file_token": "boxcnzm3dPEcutYDPplx5iDak4b",
      "name": "Hawaii_1_15Retina_R.jpg",
      "size": 5069121,
      "tmp_url": "https://open.feishu.cn/open-apis/drive/v1/medias/batch_get_tmp_download_url?file_tokens=boxcnzm3dPEcutYDPplx5iDak4b",
      "type": "image/jpeg",
      "url": "https://open.feishu.cn/open-apis/drive/v1/medias/boxcnzm3dPEcutYDPplx5iDak4b/download"
    }
]
}
``` 

## 上传附件
在多维表格中上传附件分 2 步

1.调用[上传素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all)或[分片上传素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_prepare)接口上传文件，上传成功之后获取到文件的 file_token；

2.调用[新增记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/create)或者[更新记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/update)将文件更新到记录中去；

**请求 body 说明：**
```json 
 {
    "records": [
        {
            "fields": {
            "附件": [
                {"file_token": "boxbcCFb2dBwMK9S8kDILk1tayh"},
                {"file_token": "boxbcCFb2dBwMK9S8kDILk1tayh"}
                ]
             }
        },
        {
            "fields": {
            "附件": [
                {"file_token": "boxbcCFb2dBwMK9S8kDILk1tayh"},
                {"file_token": "boxbcCFb2dBwMK9S8kDILk1tayh"}
                ]
             }
        }

     ]

}
``` 
**返回 body：**
```json 
{
    "code": 0,
    "data": {
        "records": [
            {
                "fields": {
                    "附件": [
                        {
                            "file_token": "boxbcCFb2dBwMK9S8kDILk1tayh"
                        },
                        {
                            "file_token": "boxbcCFb2dBwMK9S8kDILk1tayh"
                        }
                    ]
                },
                "id": "recxgOKlB0"
            },

            {
                "fields": {
                    "附件": [
                        {
                            "file_token": "boxbcCFb2dBwMK9S8kDILk1tayh"
                        },
                        {
                            "file_token": "boxbcCFb2dBwMK9S8kDILk1tayh"
                        }
                    ]
                },
                "id": "reciGVHpI8"
            }
        ]
    },
    "msg": "Success"
}

``` 

## 下载附件
1.调用[列出记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/list)查询出多维表格中附件的 file_token；

**返回body**

```json 
{
    "code": 0,
    "data": {
        "record": {
            "fields": {
                "人力评估": "8",
                "任务执行人": [
                    {
                        "annotation_union_type": "person",
                        "email": "",
                        "en_name": "周北北",
                        "id": "ou_be7f7ff11f5107962c0493f59409508b",
                        "name": "周北北"
                    }
                ],
                "任务描述": "功能开发",
                "任务附件": [
                    {
                        "file_token": "boxcn8Ebe2Z68hXTsW8t1TuZCSd",
                        "name": "2.gif",
                        "size": 10250625,
                        "tmp_url": "https://open.feishu.cn/open-apis/drive/v1/medias/batch_get_tmp_download_url?file_tokens=boxcn8Ebe2Z68hXTsW8t1TuZCSd",
                        "type": "image/gif",
                        "url": "https://open.feishu.cn/open-apis/drive/v1/medias/boxcn8Ebe2Z68hXTsW8t1TuZCSd/download"
                    }
                ],
                "对应 OKR": [
                    {
                        "text": "KR 2.2 推进新功能研发,KR 2.3 修补已知功能漏洞",
                        "type": "text"
                    }
                ],
                "截止日期": 1612108800000,
                "未命名 1": null,
                "状态": "开发中",
                "相关部门": [
                    "研发"
                ]
            },
            "id": "reczXt4wo5"
        }
    },
    "msg": "Success"
}
``` 

2.调用[下载素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/download) 下载或者[获取素材临时下载链接](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/batch_get_tmp_download_url)，这2个接口已经支持多维表格。
