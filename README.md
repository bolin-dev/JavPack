![JavPack](./assets/icon.png)

# JavPack

> 一些（最小化）脚本

## 脚本

| 名称       | 描述           | 安装                                                                         |
| :--------- | :------------- | :--------------------------------------------------------------------------- |
| 115.delDir | 播放页删除目录 | [安装](https://github.com/bolin-dev/JavPack/raw/main/115/115.delDir.user.js) |

| 名称                                 | 描述         | 安装                                                                                 |
| :----------------------------------- | :----------- | :----------------------------------------------------------------------------------- |
| JavDB.style                          | 样式调整     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.style.user.js)      |
| JavDB.layout                         | 布局调整     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.layout.user.js)     |
| [JavDB.search](#javdbsearch)         | 快捷搜索     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.search.user.js)     |
| [JavDB.nav](#javdbnav)               | 快捷翻页     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.nav.user.js)        |
| [JavDB.openTab](#javdbopentab)       | 新标签页打开 | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.openTab.user.js)    |
| [JavDB.quickLook](#javdbquicklook)   | 快速查看     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.quickLook.user.js)  |
| JavDB.scroll                         | 滚动加载     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.scroll.user.js)     |
| JavDB.filter                         | 影片筛选     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.filter.user.js)     |
| [JavDB.trailer](#javdbtrailer)       | 预告片       | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.trailer.user.js)    |
| JavDB.match115                       | 115 网盘匹配 | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.match115.user.js)   |
| JavDB.sprite                         | 雪碧图       | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.sprite.user.js)     |
| JavDB.magnet                         | 磁链扩展     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.magnet.user.js)     |
| [JavDB.offline115](#javdboffline115) | 115 网盘离线 | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.offline115.user.js) |

| 名称            | 描述         | 安装                                                                                 |
| :-------------- | :----------- | :----------------------------------------------------------------------------------- |
| JavLib.match115 | 115 网盘匹配 | [安装](https://github.com/bolin-dev/JavPack/raw/main/javlib/JavLib.match115.user.js) |

## 使用

### JavDB.search

- 快捷键 `/` 选取搜索框

- 快捷键 `Ctrl` + `/` 搜索粘贴板首项

### JavDB.nav

- 左右方向键翻页

### JavDB.openTab

- 鼠标左键前台新标签页打开，右键后台新标签页

### JavDB.quickLook

- 鼠标悬停卡片后，键入 `Space` 弹窗预览影片详情，再次键入 `Space` / `Esc` 以关闭弹窗

- 预览时键入 `Enter` 访问详情页

### JavDB.trailer

- 左右方向键或 `keyA` `keyD` 控制播放进度

### JavDB.offline115

> [!WARNING]
>
> 避免单目录下直接子项数量超过 `11500`

| `config[]` 选项            | 类型                              | 说明                                                                                                                                        | 默认                                         |
| :------------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------- |
| `name`                     | `string`                          | 按钮名称，支持 `动态参数`                                                                                                                   | 必填                                         |
| `color`                    | `string`                          | 按钮样式，参考 [bulma](https://bulma.io/documentation/elements/button/#colors)                                                              | `"is-info"`                                  |
| `desc`                     | `string`                          | 按钮描述                                                                                                                                    | `离线路径`                                   |
| `type`                     | `"plain" \| "genres" \| "actors"` | 按钮类型                                                                                                                                    | `"plain"`                                    |
| `match`                    | `string[]`                        | 类型匹配，非 `"plain"` 类型下可用                                                                                                           | `[]`                                         |
| `exclude`                  | `string[]`                        | 同 `match`                                                                                                                                  | `[]`                                         |
| `magnetOptions.filter`     | `function`                        | 磁链筛选，参考 [filterCallbackFn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#callbackfn) | `200MB` < `magnet.size` < `15GB`             |
| `magnetOptions.sort`       | `function`                        | 磁链排序，参考 [sortCompareFn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted#comparefn)   | `magnet.zh` → `magnet.crack` → `magnet.size` |
| `magnetOptions.max`        | `number`                          | 磁链最大数                                                                                                                                  | `10`                                         |
| `dir`                      | `string \| string[]`              | 离线路径，支持 `动态参数`                                                                                                                   | `"云下载"`                                   |
| `verifyOptions.requireVdi` | `boolean`                         | 验证视频已转码                                                                                                                              | `true`                                       |
| `verifyOptions.clean`      | `boolean`                         | 验证失败清理任务                                                                                                                            | `true`                                       |
| `verifyOptions.max`        | `number`                          | 验证最大次数                                                                                                                                | `10`                                         |
| `rename`                   | `string`                          | 重命名，支持 `动态参数`                                                                                                                     | `"${zh}${crack} ${code} ${title}"`           |
| `tags`                     | `["genres", "actors"]`            | 设置标签                                                                                                                                    | `["genres", "actors"]`                       |
| `clean`                    | `boolean`                         | 清理垃圾                                                                                                                                    | `true`                                       |
| `upload`                   | `["cover", "sprite"]`             | 上传图片                                                                                                                                    | `["cover"]`                                  |

<details><summary>动态参数</summary>

```JavaScript
// code        番号
// prefix      番号前缀
// title       标题
// date        影片日期
// create      操作日期
// director    导演
// maker       片商
// publisher   发行
// series      系列
// genres      类别
// actors      演员

// genre       genres[]，仅 type = "genres" 可用
// actor       actors[]，仅 type = "actors" 可用

// zh          字幕资源，仅 rename 可用
// crack       破解资源，仅 rename 可用
```

</details>

## 许可

[The GPL-3.0 License](./LICENSE)
