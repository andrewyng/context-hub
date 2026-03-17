# onBluetoothDeviceFound

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/device/bluetooth/onbluetoothdevicefound
Updated: 2025-04-15

# onBluetoothDeviceFound(function callback)

监听寻找到新设备的事件
**注意事项**：注意事项：
- 若在 tt.onBluetoothDeviceFound 回调了某个设备，则此设备会添加到 tt.getBluetoothDevices 接口获取到的数组中。
- 安卓下部分机型需要有位置权限才能搜索到设备，需留意是否开启了位置权限

## 支持说明

应用能力 | Android | iOS | PC | Harmony | 预览效果
---|---|---|---|---|---
小程序 | V3.25.0+ | V3.25.0+ | **X** | V7.35.0+ | 预览
网页应用 | V5.16.0+ | V5.16.0+ | **X** | V7.35.0+ | /

## 输入

名称 | 数据类型 | 必填 | 默认值 | 描述
---|---|---|---|---
callback | function | 是 | &nbsp; | 该事件的回调函数

## 输出
回调函数返回对象的属性：

名称 | 数据类型 | 描述
---|---|---
devices | object[] | 新搜索到的设备列表
&emsp;<br>∟<br>&nbsp;<br>name | string | 蓝牙设备名称，某些设备可能没有
&emsp;<br>∟<br>&nbsp;<br>deviceId | string | 用于区分设备的 id<br><md-alert type="tip" icon="none">**注意**：<br>- Harmony 字段返回为虚拟值。<br><md-alert>
&emsp;<br>∟<br>&nbsp;<br>RSSI | number | 当前蓝牙设备的信号强度
&emsp;<br>∟<br>&nbsp;<br>advertisData | ArrayBuffer | 当前蓝牙设备的广播数据段中的 ManufacturerData 数据段。
&emsp;<br>∟<br>&nbsp;<br>advertisServiceUUIDs | string[] | 当前蓝牙设备的广播数据段中的 ServiceUUIDs 数据段
&emsp;<br>∟<br>&nbsp;<br>localName | string | 当前蓝牙设备的广播数据段中的 LocalName 数据段
&emsp;<br>∟<br>&nbsp;<br>serviceData | object | 当前蓝牙设备的广播数据段中的 ServiceData 数据段

## 示例代码

```js
// ArrayBuffer转16进制字符串示例
function ab2hex(buffer) {
	var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

tt.onBluetoothDeviceFound(function(res) {
  var devices = res.devices;
  console.log('new device list has founded')
  console.dir(devices)
  console.log(ab2hex(devices[0].advertisData))
})
```

回调函数返回对象示例：

```json
{
  "devices": [
    {
      "RSSI": -88,
      "advertisServiceUUIDs": [
        "0000181a-0000-1000-8000-00805f9b34fb"
      ],
      "deviceId": "E5:66:9F:82:46:61",
      "localName": "LYWSD02",
      "name": "LYWSD02",
      "serviceData": {
        "0000fe95-0000-1000-8000-00805f9b34fb": {}
      }
    }
  ]
}
``` 

## 错误码

`fail`返回对象中会包含[errorCode属性](https://open.feishu.cn/document/uYjL24iN/ukzNy4SO3IjL5cjM#a825f4c8)，代表错误码。

通用错误码可参见 [蓝牙 API 错误码](https://open.feishu.cn/document/uYjL24iN/uYzNxYjL2cTM24iN3EjN)
