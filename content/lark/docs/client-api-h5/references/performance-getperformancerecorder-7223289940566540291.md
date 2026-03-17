# getPerformanceRecorder

Source URL: https://open.feishu.cn/document/client-docs/gadget/-web-app-api/performance/getperformancerecorder
Updated: 2025-04-15

# getPerformanceRecorder()
获取全局唯一的性能录制器对象 PerformanceRecorder，用于在 [性能分析模式](https://open.feishu.cn/document/uYjL24iN/uEzMzUjLxMzM14SMzMTN/gadget-debugging/performance-analysis) 下进行自定义埋点。
## 支持说明

应用能力 | Android | iOS | PC | 预览效果
---|---|---|---|---
小程序 | V6.1.0+ | V6.1.0+ | V6.1.0+ | /
网页应用 | **✕** | **✕** | **✕** | /

## 输入
无
## 输出
PerformanceRecorder。PerformanceRecorder 有以下方法：
| 方法 | 介绍 |
| -- | -- |
| [PerformanceRecorder.mark()](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/performance/PerformanceRecorder/mark) | 记录一个时间点 |
| [PerformanceRecorder.startParallel()](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/performance/PerformanceRecorder/startparallel) | 开始一段异步操作的记录 |
| [PerformanceRecorder.endParallel()](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/performance/PerformanceRecorder/endparallel) | 完成一段异步操作的记录 |
| [PerformanceRecorder.startStack()](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/performance/PerformanceRecorder/startstack) | 开始一段同步操作的记录 |
| [PerformanceRecorder.endStack()](https://open.feishu.cn/document/uYjL24iN/uAjMuAjMuAjM/performance/PerformanceRecorder/endstack) | 完成一段同步操作的记录 |

## 示例代码
```xml
<view style="marigin: 10px; padding: 10px; background: #eeeeee; display: flex;" tt:for="{{list}}">
  <view style="width: 40px; height: 40px; background: red; font-size: 20px; color: white; text-align: center; line-height: 40px; margin-right: 10px;">
    {{item.a}}
  </view>
  <view style="background: blue; color: white; padding-left: 5px; flex-grow: 1;">
    <view style="line-height: 20px; font-size: 16px;"> {{item.b}}</view>
    <view style="line-height: 10px; font-size: 10px;"> {{item.c}}</view>
    <view style="line-height: 10px; font-size: 10px;"> {{item.d}}</view>
  </view>
</view>
```

```javascript
Page({
  data: {
    list: []
  },
  onShow() {
    this.makePageJank(5);
  },
  onLoad() {
    this.makePageJank(5);
    const p = tt.getPerformanceRecorder && tt.getPerformanceRecorder();

    setInterval(() => {
      for (let i = 0; i < 10; i++) {
        tt.request({
          url: 'https://open.feishu.cn'
        });
      }

      // 调用 mark 接口，记录一个时间点
      p && p.mark({
        // 时间点的 name，可以自定义
        name: 'T',
        // 时间点的 type，可以自定义
        type: 'ijkl',
        // 时间点的扩展信息，可以自定义
        extra: {
          g: 7,
          h: 8,
          i: 9
        }
      })
      // stack 表示有堆栈的，开始一段同步操作的记录
      const stackID = p && p.startStack({
        // name type extra 均可自定义
        name: 'myIntervalRender',
        type: 'abcd',
        extra: {
          a: 1,
          b: 2,
          c: 3
        }
      });

      Promise.resolve().then(() => {
        // 用多次同步接口调用来模拟一些很耗时的 JS 逻辑
        this.makePageJank(10, 6);
      })

      // parallel 表示可并行的，开始一段可以和其他异步逻辑并行的异步操作的记录
      const parallelID = p && p.startParallel({
        name: 'myIntervalSetData',
        type: 'efgh',
        extra: {
          d: 4,
          e: 5,
          f: 6
        }
      })
      this.setData({
        list: new Array(40).fill(0).map((item) => {
          return {
            a: randomString(2),
            b: randomString(18),
            c: randomString(40),
            d: randomString(30)
          }
        })
      }, () => {
        // 完成一段异步操作的记录
        p && p.endParallel(parallelID)
      });

      Promise.reject(4).catch(() => {
        // 用多次同步接口调用来模拟一些很耗时的 JS 逻辑
        this.makePageJank(5);
      });
      // 完成一段同步操作的记录
      p && p.endStack(stackID);
    }, 2000);
  },
  makePageJank(n, r = 0) {
    for (let i = 0; i < n; i++) {
      tt.getSystemInfoSync();
    }
    r--;
    if (r > 0) {
      this.makePageJank(n, r)
    }
  },
})
```
