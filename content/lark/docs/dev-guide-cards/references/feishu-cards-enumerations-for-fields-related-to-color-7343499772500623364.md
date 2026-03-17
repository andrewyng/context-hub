# 颜色枚举值

Source URL: https://open.feishu.cn/document/feishu-cards/enumerations-for-fields-related-to-color
Updated: 2024-09-18

# 颜色枚举值

在卡片 JSON 代码中，你可以通过设置组件中与颜色相关的属性调整组件中如字体、图标等的颜色。飞书卡片提供了一系列颜色枚举值，你也可以使用 RGBA 语法自定义颜色。

## 支持颜色枚举和 RGBA 语法的属性

以下组件的属性同时支持本文档中列出的颜色枚举值和 RGBA 语法设置颜色：
**注意事项**：分栏中的列 `column` 的 `background_style` 属性支持的飞书客户端版本为 7.9 及以上。

- [富文本组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/rich-text)件中的 `font_color` 属性
- [普通文本组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/plain-text)中 `lark_md` 的文字颜色
- [普通文本组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/plain-text)的 `text_color` 属性
- `icon` 和 `ud_icon` 的 `color` 属性
- [分栏](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/containers/column-set) `column_set`和分栏中的列 `column` 的 `background_style` 属性
- [交互容器](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/containers/interactive-container) `interactive_container` 的 `background_style` 和 `border_color` 属性
- [表格组件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/table) `table` 的 表头文字颜色
- [折叠面板](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/containers/collapsible-panel)中的 `background_color` 和 `border.color` 属性

## 枚举值及颜色编码
### 客户端浅色主题模式颜色编码

### 客户端深色主题模式颜色编码

| **颜色枚举值**        | **色相（色系）**   | **颜色编码（客户端浅色主题模式）** | **颜色编码（客户端深色主题模式）** |
| ------------- | ----------- | --------------- | --------------- |
| bg-white      | /           | N00/#ffffff     | N50/#1A1A1A     |
| white         | /           | /               | /               |
| blue          | 蓝           | #1456F0        | #75A4FF        |
| blue-50       | 蓝           | #F0F4FF        | #152340        |
| blue-100      | 蓝           | #E0E9FF        | #173166        |
| blue-200      | 蓝           | #C2D4FF        | #194294        |
| blue-300      | 蓝           | #94B4FF        | #2655B6        |
| blue-350      | 蓝           | #7AA2FF        | #275FCE        |
| blue-400      | 蓝           | #5083FB        | #3370EB        |
| blue-500      | 蓝           | #336DF4        | #4C88FF        |
| blue-600      | 蓝           | #1456F0        | #75A4FF        |
| blue-700      | 蓝           | #0442D2        | #8FB4FF        |
| blue-800      | 蓝           | #002F9E        | #BDD2FF        |
| blue-900      | 蓝           | #002270        | #E0E9FF        |
| carmine       | 粉           | #B82879        | #ED77BA        |
| carmine-50    | 粉           | #FEF0F8        | #3A182B        |
| carmine-100   | 粉           | #FEE2F2        | #591C3F        |
| carmine-200   | 粉           | #F8C4E1        | #782B57        |
| carmine-300   | 粉           | #F598CC        | #94386C        |
| carmine-350   | 粉           | #EB78B8        | #AB417D        |
| carmine-400   | 粉           | #DF58A5        | #C24A8E        |
| carmine-500   | 粉           | #CC398C        | #DB5EA4        |
| carmine-600   | 粉           | #B82879        | #ED77BA        |
| carmine-700   | 粉           | #9D1562        | #FC94CF        |
| carmine-800   | 粉           | #730744        | #FFC2E5        |
| carmine-900   | 粉           | #550C35        | #FFE0F2        |
| green         | 绿           | #1A7526        | #51BA43        |
| green-50      | 绿           | #E4FAE1        | #0E2B0A        |
| green-100     | 绿           | #D0F5CE        | #173B12        |
| green-200     | 绿           | #95E599        | #21511A        |
| green-300     | 绿           | #5CD168        | #296621        |
| green-350     | 绿           | #35BD4B        | #2F7526        |
| green-400     | 绿           | #32A645        | #35872A        |
| green-500     | 绿           | #258832        | #419E34        |
| green-600     | 绿           | #1A7526        | #51BA43        |
| green-700     | 绿           | #0B6017        | #69CC5C        |
| green-800     | 绿           | #04430C        | #99E490        |
| green-900     | 绿           | #022C07        | #CBF5C6        |
| indigo        | 靛蓝          | #4752E6        | #9499F7        |
| indigo-50     | 靛蓝          | #F2F3FD        | #1E204A        |
| indigo-100    | 靛蓝          | #E9EAFB        | #2A2D69        |
| indigo-200    | 靛蓝          | #CCCFF9        | #373D90        |
| indigo-300    | 靛蓝          | #ABB0F2        | #474FB8        |
| indigo-350    | 靛蓝          | #959BEE        | #515AD6        |
| indigo-400    | 靛蓝          | #757DF0        | #5E68E8        |
| indigo-500    | 靛蓝          | #5B65F5        | #7B83F7        |
| indigo-600    | 靛蓝          | #4752E6        | #9499F7        |
| indigo-700    | 靛蓝          | #333DCC        | #AAAFF8        |
| indigo-800    | 靛蓝          | #1E27A4        | #CDD0F9        |
| indigo-900    | 靛蓝          | #151B70        | #E7E9FE        |
| lime          | 柠檬绿         | #5C6D08        | #93AF04        |
| lime-50       | 柠檬绿         | #F2F8D3        | #212702        |
| lime-100      | 柠檬绿         | #E3F0A3        | #303804        |
| lime-200      | 柠檬绿         | #C8DD5F        | #404C06        |
| lime-300      | 柠檬绿         | #A2C10B        | #53610A        |
| lime-350      | 柠檬绿         | #91AD00        | #5F700A        |
| lime-400      | 柠檬绿         | #7B9207        | #6B7F05        |
| lime-500      | 柠檬绿         | #6B7F06        | #82990A        |
| lime-600      | 柠檬绿         | #5C6D08        | #93AF04        |
| lime-700      | 柠檬绿         | #4A5804        | #A6C313        |
| lime-800      | 柠檬绿         | #333D00        | #C2E12D        |
| lime-900      | 柠檬绿         | #262E00        | #E3F391        |
| grey          | 中性色-neutral | #646a73        | #a6a6a6        |
| grey-00       | 中性色-neutral | #ffffff        | #0A0A0A        |
| grey-50       | 中性色-neutral | #f5f6f7        | #1A1A1A        |
| grey-100      | 中性色-neutral | #f2f3f5        | #292929        |
| grey-200      | 中性色-neutral | #eff0f1        | #373737        |
| grey-300      | 中性色-neutral | #dee0e3        | #434343        |
| grey-350      | 中性色-neutral | #d0d3d6        | #505050        |
| grey-400      | 中性色-neutral | #bbbfc4        | #5f5f5f        |
| grey-500      | 中性色-neutral | #8f959e        | #757575        |
| grey-600      | 中性色-neutral | #646a73        | #a6a6a6        |
| grey-650      | 中性色-neutral | #51565d        | #cfcfcf        |
| grey-700      | 中性色-neutral | #373c43        | #e0e0e0        |
| grey-800      | 中性色-neutral | #2b2f36        | #e8e8e8        |
| grey-900      | 中性色-neutral | #1f2329        | #ebebeb        |
| grey-950      | 中性色-neutral | #0f1114        | #f8f8f8        |
| grey-1000     | 中性色-neutral | #000000        | #ffffff        |
| orange        | 橙           | #A44904        | #F3871B        |
| orange-50     | 橙           | #FFF3E5        | #33210B        |
| orange-100    | 橙           | #FEE7CD        | #4A2B10        |
| orange-200    | 橙           | #FEC48B        | #683A12        |
| orange-300    | 橙           | #FF9D4C        | #8A4A19        |
| orange-350    | 橙           | #FF811A        | #A15317        |
| orange-400    | 橙           | #ED6D0C        | #B85E1A        |
| orange-500    | 橙           | #C25705        | #DB7018        |
| orange-600    | 橙           | #A44904        | #F3871B        |
| orange-700    | 橙           | #853A05        | #F89E44        |
| orange-800    | 橙           | #642B02        | #FEC88B        |
| orange-900    | 橙           | #3B1A02        | #FEE7CD        |
| purple        | 紫           | #7A35F0        | #B88FFE        |
| purple-50     | 紫           | #F5F0FE        | #2B194A        |
| purple-100    | 紫           | #EFE6FE        | #3F2073        |
| purple-200    | 紫           | #DCC9FD        | #5529A3        |
| purple-300    | 紫           | #C8A9FC        | #6C39C6        |
| purple-350    | 紫           | #B791FA        | #7C4AD4        |
| purple-400    | 紫           | #9F6FF1        | #8C55EC        |
| purple-500    | 紫           | #8D55ED        | #A575FA        |
| purple-600    | 紫           | #7A35F0        | #B88FFE        |
| purple-700    | 紫           | #611FD6        | #C5A3FF        |
| purple-800    | 紫           | #4811A6        | #DBC8FD        |
| purple-900    | 紫           | #2F0080        | #EFE5FF        |
| red           | 红           | #C02A26        | #F6827E        |
| red-50        | 红           | #FEF0F0        | #3D1A19        |
| red-100       | 红           | #FEE3E2        | #591F1D        |
| red-200       | 红           | #FDC6C4        | #7B2524        |
| red-300       | 红           | #F89E9B        | #A03331        |
| red-350       | 红           | #FF7570        | #B33A37        |
| red-400       | 红           | #F54A45        | #D14642        |
| red-500       | 红           | #E22E28        | #F05B56        |
| red-600       | 红           | #C02A26        | #F6827E        |
| red-700       | 红           | #A11C17        | #F89E9B        |
| red-800       | 红           | #741915        | #FDC6C4        |
| red-900       | 红           | #590603        | #FEE3E2        |
| sunflower     | 向日葵黄        | #8F7C00        | #F5DF36        |
| sunflower-50  | 向日葵黄        | #FFFFDB        | #29250A        |
| sunflower-100 | 向日葵黄        | #FFFCA3        | #38320C        |
| sunflower-200 | 向日葵黄        | #FFF67A        | #574D01        |
| sunflower-300 | 向日葵黄        | #FFF258        | #7A6A01        |
| sunflower-350 | 向日葵黄        | #FFE928        | #9C8702        |
| sunflower-400 | 向日葵黄        | #E5CE00        | #C9B218        |
| sunflower-500 | 向日葵黄        | #C2A800        | #E5CD17        |
| sunflower-600 | 向日葵黄        | #8F7C00        | #F5DF36        |
| sunflower-700 | 向日葵黄        | #5C4F00        | #F7E663        |
| sunflower-800 | 向日葵黄        | #423700        | #FAED7A        |
| sunflower-900 | 向日葵黄        | #2C2502        | #FFF59E        |
| turquoise     | 青           | #067062        | #1AB7A1        |
| turquoise-50  | 青           | #E2F8F5        | #132926        |
| turquoise-100 | 青           | #C4F2EC        | #173B36        |
| turquoise-200 | 青           | #6FE8D8        | #1D4E47        |
| turquoise-300 | 青           | #33D6C0        | #25665E        |
| turquoise-350 | 青           | #2DBEAB        | #227369        |
| turquoise-400 | 青           | #10A893        | #198578        |
| turquoise-500 | 青           | #0F8575        | #1FA18F        |
| turquoise-600 | 青           | #067062        | #1AB7A1        |
| turquoise-700 | 青           | #045D51        | #17CFB5        |
| turquoise-800 | 青           | #03443B        | #65E7D5        |
| turquoise-900 | 青           | #02312A        | #B7F7EF        |
| violet        | 紫红          | #A630A6        | #E17FE1        |
| violet-50     | 紫红          | #FCEEFC        | #3B153B        |
| violet-100    | 紫红          | #F9E2F9        | #541854        |
| violet-200    | 紫红          | #F3C4F3        | #712871        |
| violet-300    | 紫红          | #E59CE5        | #8B378B        |
| violet-350    | 紫红          | #DE81DE        | #A43DA4        |
| violet-400    | 紫红          | #CF5ECF        | #B54AB5        |
| violet-500    | 紫红          | #BF3DBF        | #D661D6        |
| violet-600    | 紫红          | #A630A6        | #E17FE1        |
| violet-700    | 紫红          | #872787        | #E99BE9        |
| violet-800    | 紫红          | #6A116A        | #F4C3F4        |
| violet-900    | 紫红          | #520052        | #FCDFFC        |
| wathet        | 天蓝          | #076A94        | #25B2E5        |
| wathet-50     | 天蓝          | #E7F8FE        | #152830        |
| wathet-100    | 天蓝          | #CAEFFC        | #103647        |
| wathet-200    | 天蓝          | #97DCFC        | #164359        |
| wathet-300    | 天蓝          | #3EC3F7        | #135A78        |
| wathet-350    | 天蓝          | #25B0E7        | #146C91        |
| wathet-400    | 天蓝          | #1295CA        | #1A7FAB        |
| wathet-500    | 天蓝          | #047FB0        | #1099CC        |
| wathet-600    | 天蓝          | #076A94        | #25B2E5        |
| wathet-700    | 天蓝          | #0F587A        | #51C3F0        |
| wathet-800    | 天蓝          | #06415C        | #89DFFE        |
| wathet-900    | 天蓝          | #072B3D        | #C7F0FF        |
| yellow        | 黄           | #865B03        | #FBCB46        |
| yellow-50     | 黄           | #FBF4DF        | #30250A        |
| yellow-100    | 黄           | #FAEDC2        | #473409        |
| yellow-200    | 黄           | #FCDF7E        | #63470F        |
| yellow-300    | 黄           | #FAD355        | #8A6419        |
| yellow-350    | 黄           | #FFC60A        | #AD7D15        |
| yellow-400    | 黄           | #D99904        | #D49B0B        |
| yellow-500    | 黄           | #AD7A03        | #F0B622        |
| yellow-600    | 黄           | #865B03        | #FBCB46        |
| yellow-700    | 黄           | #6F4A01        | #FCD456        |
| yellow-800    | 黄           | #573601        | #FFDE75        |
| yellow-900    | 黄           | #382201        | #FFEAA3
## 使用 RGBA 语法自定义颜色

要使用 RGBA 语法自定义颜色，需在卡片 JSON 代码的全局行为设置中的 `config` 字段配置 `style` 字段，并添加所需的自定义颜色。随后，在支持 RGBA 语法的组件属性中，即可应用该颜色。具体步骤如下所示：
1. 在`config` 字段中，配置 `style` 字段，添加自定义颜色：
    ```json
    {
      "config": {
        "style": { // 在此添加并配置 style 字段。
          "color": {
            "cus-0": { // 分别为飞书客户端浅色主题和深色主题添加 RGBA 语法，支持添加多个自定义颜色对象。
              "light_mode": "rgba(5,157,178,0.52)", // 浅色主题下的自定义颜色语法。
              "dark_mode": "rgba(78,23,108,0.49)"  // 深色主题下的自定义颜色语法。
            },
            "cus-1": {
              "light_mode": "rgba(164,216,178,0.94)",
              "dark_mode": "rgba(8,203,84,0.18)"
            }
          }
        }
      }
    }
    ```
1. 在组件中应用已定义的 RGBA 语法，应用示例如下：
    ```json
    {
      "elements": [
        {
          "tag": "markdown",
          "content": "示例文本"  // 在富文本组件中应用自定义颜色。
        },
        {
          "tag": "div",
          "text": {
            "content": "示例文本",
            "text_color": "cus-0",  // 在普通文本组件中应用自定义颜色。
            "tag": "plain_text"
          }
        },
        {
          "tag": "column_set",
          "columns": [
            {
              "tag": "column",
              "width": "weighted",
              "background_style": "cus-0",  // 在分栏组件中应用自定义颜色。
              "weight": 1,
              "vertical_align": "top",
              "elements": [
                {
                  "tag": "markdown",
                  "content": "示例文本"
                }
              ]
            }
          ]
        },
        {
          "tag": "action",
          "actions": [
            {
              "tag": "button",
              "text": {
                "tag": "plain_text",
                "content": "自定义颜色 - light_mode: rgba(103,99,110,0.19) dark_mode: rgba(126,164,58,0.89)"
              },
              "type": "default",
              "icon": {
                "tag": "standard_icon",
                "token": "chat-forbidden_outlined",
                "color": "cus-0" // 在按钮组件的 icon 属性中应用自定义颜色。
              }
            }
          ]
        },
        {
          "tag": "interactive_container",
          "background_style": "cus-0", // 在交互容器中自定义背景色和边框色。
          "has_border": true,
          "border_color": "cus-1",
          "corner_radius": "10px",
          "elements": [
            {
              "tag": "markdown",
              "content": "示例文本"
            }
          ]
        }
      ]
    }
	```
