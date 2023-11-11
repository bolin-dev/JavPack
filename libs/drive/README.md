![JavPack](https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png)

# JavPack.drive

115 网盘查询

## 内容

| 函数        | 参数                           | 注释     |
| :---------- | :----------------------------- | :------- |
| codeParse   | `code: string`                 | 番号解析 |
| files       | `cid: string`                  | 文件列表 |
| filesSearch | `search_value: string`         | 文件搜索 |
| filesVideo  | `pickcode: string`             | 文件详情 |
| rbDelete    | `fids: string[]` `pid: string` | 文件删除 |

## 使用

在脚本元属性加入：

- `// @require [request url]`
- `// @require [url]`
- `// @grant GM_xmlhttpRequest`
- `// @connect anxia.com`
- `// @connect 115.com`
