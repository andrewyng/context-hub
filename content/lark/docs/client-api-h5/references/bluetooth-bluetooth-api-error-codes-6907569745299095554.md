# 蓝牙 API 错误码

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/bluetooth/bluetooth-api-error-codes
Updated: 2022-03-08

# 蓝牙 API 错误码
|错误码               |错误信息    |说明   |
|------------------|--------|-----|
|0                 |ok      |正常   |
|10000             |not init|未初始化蓝牙适配器|
|10001             |device not available|当前蓝牙适配器不可用|
|10002             |device not found|没有找到指定设备|
|10003             |connection failed|连接失败 |
|10004             |service not found|没有找到指定服务|
|10005             |characteristicId not found|没有找到指定特征值|
|10006             |no connection|当前连接已断开|
|10007             |operation not available on this characteristic|当前特征值不支持此操作|
|10008             |system error|其余所有系统上报的异常|
|10009             |BLE not available on this device|Android 系统特有，系统版本低于 4.3 不支持 BLE|
|10010             |descriptor not found|没有找到指定描述符|
|10011             |invalid deviceId|设备 ID 不可用，或为空|
|10012             |invalid serviceId|服务 ID 不可用，或为空|
|10013             |invalid characteristicId|特征 ID 不可用，或为空|
|10014             |invalid data|发送的数据为空或格式错误|
|10015             |operation time out|操作超时 |
|10016             |parameters needed|缺少参数 |
|10017             |failed to write characteristic |写入特征值失败|
|10018             |failed to read characteristic |读取特征值失败|
