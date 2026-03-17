# 主题简介

Source URL: https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/board-v1/theme-introduction
Updated: 2025-09-23

# 画板主题与颜色系统

画板提供了一套强大的主题系统，旨在帮助您轻松创建美观、风格统一的图形。主题是作用于整个画板的全局配置，切换主题会改变所有元素的配色，但不能为单个元素设置独立主题。
[主题演示](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/b7f1021e6c9e85e0459eaea1d06ab556_nV6dkSBR0C.gif)

## 基于 Code 的颜色映射
为了实现主题切换，画板的颜色系统不直接存储具体的颜色值（如 `#ffffff`），而是使用一个抽象的 **`颜色 Code`**（一个整数）来指定颜色。在不同主题下，为颜色 code 值配置了不同的颜色。

**工作原理**：code 值会根据主题风格配置不同的颜色。在切换主题时会根据配置颜色值呈现不同的颜色，达到颜色跟随主题切换目的。

##  主题类型
画板内置了多种预设主题，以适应不同场景：
*   经典主题
*   简约灰主题
*   复古主题
*   炫彩主题
*   简约蓝主题
*   默认主题

## 颜色 Code 详解
颜色 `Code` 分为四种类型：**填充色、描边色、文字颜色、文字背景色**。

大部分图形共用一套通用的颜色 Code 表。然而，为达到最佳视觉效果，部分特殊图形（如便签、分区）拥有自己专属的颜色 Code 表。

###  填充颜色
####  通用填充颜色
适用于除特殊图形外的所有图形。
*   **Code 取值范围**: `1` - `17`
*   **颜色表 (以“默认主题”为例)**:

code | 颜色预览 | 颜色描述 | rgb
---|---|---|---
1 | </span> | 白色 | #ffffff
2 | <span style="display:inline-block; width:20px; height:20px; background-color:#eae2fe; border:1px solid #eae2fe;"> | 浅紫色 | #eae2fe
3 | </span> | 浅蓝色 | #f0f4fc
4 | <span style="display:inline-block; width:20px; height:20px; background-color:#d6dcf3; border:1px solid #d6dcf3;"> | 浅靛青色 | #d6dcf3
5 | </span> | 浅黄色 | #fef1ce
6 | <span style="display:inline-block; width:20px; height:20px; background-color:#fee3e2; border:1px solid #fee3e2;"> | 浅红色 | #fee3e2
7 | </span> | 黑色 | #000000
8 | <span style="display:inline-block; width:20px; height:20px; background-color:#f5f5f5; border:1px solid #f5f5f5;"> | 浅灰色 | #f5f5f5
9 | </span> | 紫色 | #8569cb
10 | <span style="display:inline-block; width:20px; height:20px; background-color:#5178c6; border:1px solid #5178c6;"> | 蓝色 | #5178c6
11 | </span> | 靛青色 | #5263a5
12 | <span style="display:inline-block; width:20px; height:20px; background-color:#d4b45b; border:1px solid #d4b45b;"> | 黄色 | #d4b45b
13 | </span> | 红色 | #d25d5a
14 | <span style="display:inline-block; width:20px; height:20px; background-color:#646a73; border:1px solid #646a73;"> | 灰色 | #646a73
15 | </span> | 中灰色 | #bbbfc4
16 | <span style="display:inline-block; width:20px; height:20px; background-color:#dff5e5; border:1px solid #dff5e5;"> | 浅绿色 | #dff5e5
17 | </span> | 绿色 | #509863
</md-body>

#### **特殊图形填充色**
*   **分区 (Section)**
    *   **Code 取值范围**: `1` - `8`
    *   **颜色表 (以“默认主题”为例)**:

code | 颜色预览 | 颜色描述 | rgb
---|---|---|---
1 | <span style="display:inline-block; width:20px; height:20px; background-color:#ffffff; border:1px solid #ccc;"> | 白色 | #ffffff
2 | </span> | 灰色 | #f5f6f7
3 | <span style="display:inline-block; width:20px; height:20px; background-color:#f5f1fd; border:1px solid #f5f1fd;"> | 紫色 | #f5f1fd
4 | </span> | 蓝色 | #f3f5fc
5 | <span style="display:inline-block; width:20px; height:20px; background-color:#f1f9f2; border:1px solid #f1f9f2;"> | 绿色 | #f1f9f2
6 | </span> | 黄色 | #fffcf2
7 | <span style="display:inline-block; width:20px; height:20px; background-color:#fff6ee; border:1px solid #fff6ee;"> | 橙色 | #fff6ee
8 | </span> | 红色 | #fff3f0

*   **便签 (Sticky Note)**
    *   **Code 取值范围**: `0` - `8`
    *   **颜色表 (以“默认主题”为例)**:

code | 颜色预览 | 颜色描述 | rgb
---|---|---|---
0 | <span style="display:inline-block; width:20px; height:20px; background-color:#fef1ce; border:1px solid #fef1ce;"> | 黄色 | #fef1ce
1 | </span> | 橙色 | #f5d1a7
2 | <span style="display:inline-block; width:20px; height:20px; background-color:#dff5e5; border:1px solid #dff5e5;"> | 酸橙色 | #dff5e5
3 | </span> | 绿色 | #cdf7cc
4 | <span style="display:inline-block; width:20px; height:20px; background-color:#c9e8ef; border:1px solid #c9e8ef;"> | 蓝色 | #c9e8ef
5 | </span> | 靛青色 | #d6dcf3
6 | <span style="display:inline-block; width:20px; height:20px; background-color:#d3ccee; border:1px solid #d3ccee;"> | 紫色 | #d3ccee
7 | </span> | 玫红色 | #f1c5e7
8 | <span style="display:inline-block; width:20px; height:20px; background-color:#f6c8c8; border:1px solid #f6c8c8;"> | 红色 | #f6c8c8

###  边框颜色
#### **通用边框颜色**
适用于除特殊图形外的所有图形。
*   **Code 取值范围**: `1` - `12`
*   **颜色表 (以“默认主题”为例)**:

code | 颜色预览 | 颜色描述 | rgb
---|---|---|---
1 | </span> | 黑色 | #000000
2 | <span style="display:inline-block; width:20px; height:20px; background-color:#bbbfc4; border:1px solid #bbbfc4;"> | 灰色 | #bbbfc4
3 | </span> | 极浅灰色 | #eff0f1
4 | <span style="display:inline-block; width:20px; height:20px; background-color:#ffffff; border:1px solid #ccc;"> | 白色 | #ffffff
5 | </span> | 紫色 | #8569cb
6 | <span style="display:inline-block; width:20px; height:20px; background-color:#5178c6; border:1px solid #5178c6;"> | 蓝色 | #5178c6
7 | </span> | 靛青色 | #5263a5
8 | <span style="display:inline-block; width:20px; height:20px; background-color:#d4b45b; border:1px solid #d4b45b;"> | 黄色 | #d4b45b
9 | </span> | 红色 | #d25d5a
10 | <span style="display:inline-block; width:20px; height:20px; background-color:#646a73; border:1px solid #646a73;"> | 深灰色 | #646a73
11 | </span> | 绿色 | #509863
12 | <span style="display:inline-block; width:20px; height:20px; background-color:#dee0e3; border:1px solid #dee0e3;"> | 浅灰色 | #dee0e3
</md-body>

#### **特殊图形边框颜色**
*   **连线 (Connector)**
    *   **Code 取值范围**: `0` - `15`
    *   **颜色表 (以“默认主题”为例)**:

code | 颜色预览 | 颜色描述 | rgb
---|---|---|---
0 | </span> | 白色 | #ffffff
1 | <span style="display:inline-block; width:20px; height:20px; background-color:#eff0f1; border:1px solid #eff0f1;"> | 浅灰色 | #eff0f1
2 | </span> | 浅紫色 | #eae2fe
3 | <span style="display:inline-block; width:20px; height:20px; background-color:#f0f4fc; border:1px solid #f0f4fc;"> | 浅蓝色 | #f0f4fc
4 | </span> | 浅靛青色 | #d6dcf3
5 | <span style="display:inline-block; width:20px; height:20px; background-color:#fef1ce; border:1px solid #fef1ce;"> | 浅黄色 | #fef1ce
6 | </span> | 浅红色 | #fee3e2
7 | <span style="display:inline-block; width:20px; height:20px; background-color:#000000; border:1px solid #000000;"> | 黑色 | #000000
8 | </span> | 灰色 | #bbbfc4
9 | <span style="display:inline-block; width:20px; height:20px; background-color:#8569cb; border:1px solid #8569cb;"> | 紫色 | #8569cb
10 | </span> | 蓝色 | #5178c6
11 | <span style="display:inline-block; width:20px; height:20px; background-color:#5263a5; border:1px solid #5263a5;"> | 靛青色 | #5263a5
12 | </span> | 黄色 | #d4b45b
13 | <span style="display:inline-block; width:20px; height:20px; background-color:#d25d5a; border:1px solid #d25d5a;"> | 红色 | #d25d5a
14 | </span> | 浅绿色 | #dff5e5
15 | <span style="display:inline-block; width:20px; height:20px; background-color:#509863; border:1px solid #509863;"> | 绿色 | #509863

*   **SVG 图形 (SVG)**
    *   **Code 取值范围**: `0` - `11`
    *   **颜色表 (以“默认主题”为例)**:

code | 颜色预览 | 颜色描述 | rgb
---|---|---|---
0 | </span> | 黑色 | #000000
1 | <span style="display:inline-block; width:20px; height:20px; background-color:#ffffff; border:1px solid #ccc;"> | 白色 | #ffffff
2 | </span> | 紫色 | #8569cb
3 | <span style="display:inline-block; width:20px; height:20px; background-color:#5178c6; border:1px solid #5178c6;"> | 蓝色 | #5178c6
4 | </span> | 靛青色 | #5263a5
5 | <span style="display:inline-block; width:20px; height:20px; background-color:#d4b45b; border:1px solid #d4b45b;"> | 黄色 | #d4b45b
6 | </span> | 红色 | #d25d5a
7 | <span style="display:inline-block; width:20px; height:20px; background-color:#bbbfc4; border:1px solid #bbbfc4;"> | 浅灰色 | #bbbfc4
8 | </span> | 绿色 | #509863
9 | <span style="display:inline-block; width:20px; height:20px; background-color:#646a73; border:1px solid #646a73;"> | 深灰色 | #646a73
10 | </span> | 中灰色 | #dee0e3
11 | <span style="display:inline-block; width:20px; height:20px; background-color:#eff0f1; border:1px solid #eff0f1;"> | 浅灰色 | #eff0f1

*   **画笔图形 (Paint)**
    *   **Code 取值范围**: `0` - `8`
    *   **颜色表 (以“默认主题”为例)**:

code | 颜色预览 | 颜色描述 | rgb
---|---|---|---
0 | </span> | 黑色 | #2b2f36
1 | <span style="display:inline-block; width:20px; height:20px; background-color:#646a73; border:1px solid #646a73;"> | 灰色 | #646a73
2 | </span> | 浅灰色 | #bbbfc4
3 | <span style="display:inline-block; width:20px; height:20px; background-color:#9f6ff1; border:1px solid #9f6ff1;"> | 紫色 | #9f6ff1
4 | </span> | 蓝色 | #5083fb
5 | <span style="display:inline-block; width:20px; height:20px; background-color:#32a645; border:1px solid #32a645;"> | 绿色 | #32a645
6 | </span> | 黄色 | #ffe928
7 | <span style="display:inline-block; width:20px; height:20px; background-color:#ed6d0c; border:1px solid #ed6d0c;"> | 橙色 | #ed6d0c
8 | </span> | 红色 | #f54a45

###  文字颜色
*   **文字颜色**
    *   **Code 取值范围**: `0` - `8`
    *   **颜色表 (以“默认主题”为例)**:

code | 颜色预览 | 颜色描述 | rgb
---|---|---|---
0 | <span style="display:inline-block; width:20px; height:20px; background-color:#1f2329; border:1px solid #1f2329;"> | 黑色 | #1f2329
1 | </span> | 白色 | #ffffff
2 | <span style="display:inline-block; width:20px; height:20px; background-color:#8569cb; border:1px solid #8569cb;"> | 紫色 | #8569cb
3 | </span> | 蓝色 | #5178c6
4 | <span style="display:inline-block; width:20px; height:20px; background-color:#509863; border:1px solid #509863;"> | 绿色 | #509863
5 | </span> | 黄色 | #d4b45b
6 | <span style="display:inline-block; width:20px; height:20px; background-color:#d25d5a; border:1px solid #d25d5a;"> | 红色 | #d25d5a
7 | </span> | 灰色 | #8f959e
8 | <span style="display:inline-block; width:20px; height:20px; background-color:#d48e5b; border:1px solid #d48e5b;"> | 橙色 | #d48e5b
</md-body>

###  文字背景颜色
*   **文字背景颜色**
    *   **Code 取值范围**: `0` - `17`
    *   **颜色表 (以“默认主题”为例)**:

code | 颜色预览 | 颜色描述 | rgb
---|---|---|---
0 | -- | 无填充色 | --
1 | </span> | 白色 | #ffffff
2 | <span style="display:inline-block; width:20px; height:20px; background-color:#e0d9f2; border:1px solid #e0d9f2;"> | 浅紫色 | #e0d9f2
3 | </span> | 浅蓝色 | #c5d2ec
4 | <span style="display:inline-block; width:20px; height:20px; background-color:#abd3b6; border:1px solid #abd3b6;"> | 浅绿色 | #abd3b6
5 | </span> | 浅黄色 | #f3ebd3
6 | <span style="display:inline-block; width:20px; height:20px; background-color:#f4d8d7; border:1px solid #f4d8d7;"> | 浅红色 | #f4d8d7
7 | </span> | 黑色 | #000000
8 | <span style="display:inline-block; width:20px; height:20px; background-color:#dee0e3; border:1px solid #dee0e3;"> | 中灰色 | #dee0e3
9 | </span> | 紫色 | #6541be
10 | <span style="display:inline-block; width:20px; height:20px; background-color:#395fad; border:1px solid #395fad;"> | 蓝色 | #395fad
11 | </span> | 绿色 | #3e754c
12 | <span style="display:inline-block; width:20px; height:20px; background-color:#f0da0f; border:1px solid #f0da0f;"> | 黄色 | #f0da0f
13 | </span> | 红色 | #c43936
14 | <span style="display:inline-block; width:20px; height:20px; background-color:#f2f3f5; border:1px solid #f2f3f5;"> | 浅灰色 | #f2f3f5
15 | </span> | 灰色 | #bbbfc4
16 | <span style="display:inline-block; width:20px; height:20px; background-color:#f3e2d3; border:1px solid #f3e2d3;"> | 浅橙色 | #f3e2d3
17 | <span style="display:inline-block; width:20px; height:20px; background-color:#c67134; border:1px solid #c67134;"></span> | 橙色 | #c67134
</md-body>

####
