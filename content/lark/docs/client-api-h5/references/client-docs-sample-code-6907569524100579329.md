# 示例代码

Source URL: https://open.feishu.cn/document/client-docs/sample-code
Updated: 2024-07-25

# 示例代码

为了帮助开发者方便的开发应用，我们准备了小程序和网页应用的示例代码，欢迎下载：
<br>

| 名称 |代码包下载 |飞书扫码在线预览 
| - | - | - |- |
| 小程序（API与组件）|[microapp-demo.zip](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/c87f497f58a7c8b44b39e8112311c567_MzCYmZjOxE.zip)| 
| 网页应用（API） | [webapp-demo.zip](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/93323479bf225067f9c709511af36651_rZ8ypRWcmS.zip)| 

## 小程序示例代码包 使用说明
1. 点击小程序-“代码包下载”，下载压缩包，并解压文件
2. 下载[飞书开发者工具](https://open.feishu.cn/document/uYjL24iN/ucDOzYjL3gzM24yN4MjN)并完成安装；
3. 打开飞书开发者工具，点击左下角“登录”功能，选择登录环境=“feishu”，并扫码完成用户登录
4. 左侧导航栏选择“小程序“，并点击右上角”导入项目“，选择已解压后的示例代码包

5. 导入成功后可看到IDE效果如下：

此时如果点击“预览”或“真机调试”会出现错误：

原因是我们并未将这个示例代码 与 我们的某个应用关联起来。因此我们需要创建一个飞书应用。

6. 创建飞书应用，参见 [快速开发小程序](https://open.feishu.cn/document/home/develop-a-gadget-in-5-minutes/create-a-custom-app) 中的“创建应用”步骤

7. 创建应用后，打开`project.config.json`文件，将其中的`app_id`替换为你创建应用的app_id，并保存文件

8. 重新“预览”或“真机调试”，可以看到运行成功。

9. 如需快速了解小程序示例代码包中文件的含义、结构，如何调用小程序的组件和API、如何调试与发布小程序，推荐查看入门教程 [快速开发小程序](https://open.feishu.cn/document/home/develop-a-gadget-in-5-minutes/create-a-custom-app)

## 网页应用示例代码包 使用说明
1. 点击网页应用-“代码包下载”，下载压缩包，并解压文件
2. 暂不支持在[飞书开发者工具](https://open.feishu.cn/document/uYjL24iN/ucDOzYjL3gzM24yN4MjN)中导入网页应用项目，因此需要将文件导入任一的编辑器内查看。
3. 使用[飞书开发者工具](https://open.feishu.cn/document/uYjL24iN/ucDOzYjL3gzM24yN4MjN)编写你的网页应用。如需快速了解如何开发网页应用，推荐查看入门教程 [快速集成网页应用](https://open.feishu.cn/document/home/integrating-web-apps-in-5-minutes/create-app-and-configuration)
