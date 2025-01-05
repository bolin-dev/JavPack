![JavPack](./assets/icon.png)

# JavPack

> 一点微小的工作

## 脚本

### 115

| 名称         | 描述           | 安装                               |
| :----------- | :------------- | :--------------------------------- |
| 115.playlist | 播放列表       | [安装](./115/115.playlist.user.js) |
| 115.delDir   | 播放页删除目录 | [安装](./115/115.delDir.user.js)   |

### JavDB

脚本依赖: `JavDB.style`

| 名称                            | 描述        | 安装                                     |
| :------------------------------ | :---------- | :--------------------------------------- |
| JavDB.style                     | 样式调整    | [安装](./javdb/JavDB.style.user.js)      |
| [JavDB.search](#search)         | 快捷搜索    | [安装](./javdb/JavDB.search.user.js)     |
| [JavDB.openTab](#opentab)       | 标签页打开  | [安装](./javdb/JavDB.openTab.user.js)    |
| JavDB.scroll                    | 滚动加载    | [安装](./javdb/JavDB.scroll.user.js)     |
| [JavDB.trailer](#trailer)       | 预告片      | [安装](./javdb/JavDB.trailer.user.js)    |
| JavDB.sprite                    | 雪碧图      | [安装](./javdb/JavDB.sprite.user.js)     |
| JavDB.magnet                    | 磁链扩展    | [安装](./javdb/JavDB.magnet.user.js)     |
| JavDB.lists                     | 相关清单    | [安装](./javdb/JavDB.lists.user.js)      |
| JavDB.match115                  | 115网盘匹配 | [安装](./javdb/JavDB.match115.user.js)   |
| [JavDB.offline115](#offline115) | 115网盘离线 | [安装](./javdb/JavDB.offline115.user.js) |

## 使用

### search

- 按键 `/` 聚焦选取搜索框

- 按键 `Ctrl` + `/` 快速搜索粘贴板首项

### openTab

- 鼠标左键新标签页前台打开，右键后台打开

### trailer

- 方向键或 `W` `A` `S` `D` 控制播放进度及音量

- 按键 `M` 切换静音

### offline115

> [!TIP]
>
> 避免标签数量超过 `11500`

| `config[]` 选项        | 类型                              | 说明                                                                                                                                        | 默认                                         |
| :--------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------- |
| `name`                 | `string`                          | 按钮名称                                                                                                                                    | 必填                                         |
| `inMagnets`            | `boolean`                         | 磁力列表显示                                                                                                                                | `false`                                      |
| `color`                | `string`                          | 按钮样式，参考 [bulma](https://bulma.io/documentation/elements/button/#colors)                                                              | `"is-info"`                                  |
| `desc`                 | `string`                          | 按钮描述                                                                                                                                    | `离线路径`                                   |
| `type`                 | `"plain" \| "genres" \| "actors"` | 按钮类型                                                                                                                                    | `"plain"`                                    |
| `match`                | `string[]`                        | 类型匹配，非 `"plain"` 类型时可用                                                                                                           | `[]`                                         |
| `exclude`              | `string[]`                        | 类型排除，非 `"plain"` 类型时可用                                                                                                           | `[]`                                         |
| `dir`                  | `string \| string[]`              | 离线路径，支持 `动态参数`                                                                                                                   | `"云下载"`                                   |
| `magnetOptions.filter` | `function`                        | 磁链筛选，参考 [filterCallbackFn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#callbackfn) | `magnet.size` > `300MB`                      |
| `magnetOptions.sort`   | `function`                        | 磁链排序，参考 [sortCompareFn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted#comparefn)   | `magnet.zh` → `magnet.crack` → `magnet.size` |
| `magnetOptions.max`    | `number`                          | 最大磁链数                                                                                                                                  | `10`                                         |
| `verifyOptions.filter` | `function`                        | 视频筛选，参考 [filterCallbackFn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#callbackfn) | `video.s` > `300MB`                          |
| `verifyOptions.clean`  | `boolean`                         | 验证失败清理                                                                                                                                | `true`                                       |
| `verifyOptions.max`    | `number`                          | 验证次数（1s / 次）                                                                                                                         | `10`                                         |
| `rename`               | `string`                          | 重命名，支持 `动态参数`                                                                                                                     | `"${zh}${crack} ${code} ${title}"`           |
| `renameTxt.no`         | `string`                          | 重命名多文件分号格式                                                                                                                        | `".${no}"`                                   |
| `renameTxt.zh`         | `string`                          | 重命名中字匹配格式                                                                                                                          | `"[中字]"`                                   |
| `renameTxt.crack`      | `string`                          | 重命名破解匹配格式                                                                                                                          | `"[破解]"`                                   |
| `tags`                 | `["genres", "actors"]`            | 设置标签                                                                                                                                    | `["genres", "actors"]`                       |
| `clean`                | `boolean`                         | 清理不相关文件                                                                                                                              | `true`                                       |
| `cleanPwd`             | `string`                          | 清空回收站                                                                                                                                  |                                              |
| `cover`                | `boolean`                         | 上传封面                                                                                                                                    | `true`                                       |

<details><summary>动态参数及示例</summary>

```JavaScript
// code        番号
// prefix      前缀
// title       标题
// date        日期
// year        年
// month       月
// day         日
// director    导演
// maker       片商
// publisher   发行
// series      系列
// genres      类别
// actors      演员
// list        清单

// genre       genres[]，仅 type = "genres" 时可用
// actor       actors[]，仅 type = "actors" 时可用

// zh          字幕资源，仅 rename 内可用
// crack       破解资源，仅 rename 内可用

// config 示例如下
const config = [
  {
    name: "云下载",
  },
  {
    name: "${genre}", // 仅 type = "genres" / "actors" 时支持 genre / actors 参数
    color: "is-warning is-medium",
    desc: "可自定义描述",
    type: "genres",
    match: [],
    exclude: ["褲襪"], // "褲襪" 会同时命中 "xx褲襪xx"，如 "連褲襪"
    magnetOptions: {
      filter: ({ size }) => {
        const magnetSize = parseFloat(size);
        return magnetSize > 300000000 || magnetSize < 1;
      },
      sort: (a, b) => {
        if (a.zh !== b.zh) return a.zh ? -1 : 1;
        if (a.crack !== b.crack) return a.crack ? -1 : 1;
        return parseFloat(b.size) - parseFloat(a.size);
      },
      max: 10,
    },
    dir: ["类别", "${genre}", "${maker}${prefix}"], // 等价 "类别/${genre}/${maker}${prefix}"
    verifyOptions: {
      filter: ({ s }) => s > 314572800,
      clean: true,
      max: 10,
    },
    rename: "${zh}${crack} ${code} ${title}",
    renameTxt: {
      no: "-${no}",
      zh: "[中字]", // 应匹配正则: /中文|中字|字幕|\[[a-z]?hdc[a-z]?\]|[-_\s]+(uc|c|ch|cu|zh)(?![a-z])/i
      crack: "[破解]", // 应匹配正则: /无码|無碼|流出|破解|解密版|uncensored|破[一-鿆]版|[-_\s]+(cu|u|uc)(?![a-z])/i
    },
    tags: ["actors"],
    clean: true,
    cover: false,
  },
];

// magnetOptions.filter, magnetOptions.sort 传入参数如下
{
  zh: true,
  url: "magnet:?xt=urn:btih:9e84de75a5e7db566aa10ab6014d076041ff2f95",
  meta: "4.54GB, 1個文件",
  name: "EBWH-021-C.torrent",
  size: "4540000000",
  crack: false,
}
```

</details>

## 许可

[The GPL-3.0 License](./LICENSE)
