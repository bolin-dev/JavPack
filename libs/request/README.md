![JavPack](https://s1.ax1x.com/2022/04/01/q5lzYn.png "logo")

# JavPack.request

一些数据请求函数

## 内容

| 函数             | 参数                                     | 注释         |
| :--------------- | :--------------------------------------- | :----------- |
| request          | `details: object`                        | 网络请求     |
| buildQueryString | `url: string` `data: object `            | url 拼接     |
| taskQueue        | `details: string/object` `steps: func[]` | 简易任务队列 |

## 使用

在脚本元属性加入：

- `// @require [url]`
- `// @grant GM_xmlhttpRequest`
