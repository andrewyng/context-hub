# 标准对象

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/standard-object-input
Updated: 2023-02-10

# 标准对象

定义 API 的标准输入、输出内容。
绝大多数 API 为异步调用，调用的结果通过预先定义好的三个回调方法返回

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
success | function | 否 | &nbsp; | 接口调用成功的回调函数
fail | function | 否 | &nbsp; | 接口调用失败的回调函数
complete | function | 否 | &nbsp; | 接口调用完成的回调函数（成功或失败都会执行），该回调发生在 `success` 和 `fail` 之后

## 输出

`success`返回对象`res`的基础属性：

名称 | 数据类型 | 描述
---|---|---
errMsg | string | 错误信息，返回消息格式为`${API_NAME}:ok`<br>**示例值**：chooseContact:ok

<BR>

`fail`返回对象`res`的基础属性：

名称 | 数据类型 | 描述
---|---|---
errCode | number | 错误码<br>**示例值**：1716201<br>**注意事项**：目前仅部分API存在错误码，可参考API文档中的"错误码"说明，如[openBluetoothAdapter](https://open.feishu.cn/document/uYjL24iN/ugzNxYjL4cTM24CO3EjN)。错误码的覆盖范围正在逐步扩展中。
errno | number | 新规范统一错误码，详见[errno错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)
errMsg | string | 错误信息，返回消息格式为`${API_NAME}:fail`<br>**示例值**：chooseContact:fail
errString | string | 新规范统一错误信息，详见[errno错误码](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/errno)

<BR>

`complete`返回对象`res`的基础属性：

名称 | 数据类型 | 描述
---|---|---
errMsg | string | 错误信息，与 `success` 或 `fail` 返回对象的`errMsg`值相同

API 执行的返回结果会扩展`success`、`fail`、`complete`返回对象的属性，具体参见各 API 详细说明。如[chooseChat](https://open.feishu.cn/document/uYjL24iN/uMTN3QjLzUzN04yM1cDN)

## 示例代码
``` js
var someSwitch = 'on';
Page({
    oneFunc () {
        if (someSwitch === 'on') {
            someSwitch = 'off';

            tt.someAPI({
                someattr: somevalue,
                success (res) {
                    console.log(res.someattr);
                },
                fail (res) {
                    console.log(`run fail`);
                },
                complete (res) {
                    console.log(`run done`);
                    someSwitch = 'on';
                }
            });
        }
    }
});
```
