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
| JavDB.sprite                         | 雪碧图       | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.sprite.user.js)     |
| JavDB.magnet                         | 磁链扩展     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.magnet.user.js)     |
| JavDB.match115                       | 115 网盘匹配 | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.match115.user.js)   |
| [JavDB.offline115](#javdboffline115) | 115 网盘离线 | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.offline115.user.js) |

| 名称            | 描述         | 安装                                                                                 |
| :-------------- | :----------- | :----------------------------------------------------------------------------------- |
| JavLib.match115 | 115 网盘匹配 | [安装](https://github.com/bolin-dev/JavPack/raw/main/javlib/JavLib.match115.user.js) |

## 使用

### JavDB.search

- 按键 `/` 选取搜索框

- 按键 `Ctrl` + `/` 搜索粘贴板首项

### JavDB.nav

- 按键 `←` `→` 翻页

### JavDB.openTab

- 鼠标左键新标签页前台打开，右键后台打开

### JavDB.quickLook

- 鼠标悬停卡片后，键入 `Space` 弹窗预览影片详情，再次键入 `Space` / `Esc` 关闭弹窗；`Enter` / `F` 打开详情页

### JavDB.trailer

- 方向键及 `keyW` `keyA` `keyS` `keyD` 控制播放进度和音量

- `KeyM` 控制静音

### JavDB.offline115

> [!TIP]
>
> 避免单目录下直接子项或标签数量超过 `11500`

| `config[]` 选项        | 类型                              | 说明                                                                                                                                        | 默认                                         |
| :--------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------- |
| `name`                 | `string`                          | 按钮名称                                                                                                                                    | 必填                                         |
| `color`                | `string`                          | 按钮样式，参考 [bulma](https://bulma.io/documentation/elements/button/#colors)                                                              | `"is-info"`                                  |
| `desc`                 | `string`                          | 按钮描述                                                                                                                                    | `离线路径`                                   |
| `type`                 | `"plain" \| "genres" \| "actors"` | 按钮类型                                                                                                                                    | `"plain"`                                    |
| `match`                | `string[]`                        | 类型匹配，非 `"plain"` 类型时可用                                                                                                           | `[]`                                         |
| `exclude`              | `string[]`                        | 类型排除，非 `"plain"` 类型时可用                                                                                                           | `[]`                                         |
| `magnetOptions.filter` | `function`                        | 磁链筛选，参考 [filterCallbackFn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#callbackfn) | `magnet.size` > `300MB`                      |
| `magnetOptions.sort`   | `function`                        | 磁链排序，参考 [sortCompareFn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted#comparefn)   | `magnet.zh` → `magnet.crack` → `magnet.size` |
| `magnetOptions.max`    | `number`                          | 最大磁链数                                                                                                                                  | `10`                                         |
| `dir`                  | `string \| string[]`              | 离线路径，支持 `动态参数`                                                                                                                   | `"云下载"`                                   |
| `verifyOptions.clean`  | `boolean`                         | 验证失败清理任务及文件夹                                                                                                                    | `true`                                       |
| `verifyOptions.max`    | `number`                          | 最大验证次数（1s/次）                                                                                                                       | `10`                                         |
| `rename`               | `string`                          | 重命名，支持 `动态参数`                                                                                                                     | `"${zh}${crack} ${code} ${title}"`           |
| `noTxt`                | `string`                          | 多文件重命名分号格式                                                                                                                        | `".${no}"`                                   |
| `zhTxt`                | `string`                          | 重命名中字匹配格式                                                                                                                          | `"[中字]"`                                   |
| `crackTxt`             | `string`                          | 重命名破解匹配格式                                                                                                                          | `"[破解]"`                                   |
| `tags`                 | `["genres", "actors"]`            | 设置标签                                                                                                                                    | `["genres", "actors"]`                       |
| `clean`                | `boolean`                         | 清理垃圾                                                                                                                                    | `true`                                       |
| `cover`                | `boolean`                         | 上传封面                                                                                                                                    | `true`                                       |

<details><summary>动态参数</summary>

```JavaScript
// code        番号
// prefix      前缀
// title       标题
// date        日期
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
      clean: true,
      max: 10,
    },
    rename: "${zh}${crack} ${code} ${title}",
    noTxt: "-${no}",
    zhTxt: "[中字]", // 应匹配正则 /中文|中字|字幕|-u?c(?![a-z])|.+(?<![a-z])ch(?![a-z])|\dc(?![a-z])/i
    crackTxt: "[破解]", // 应匹配正则 /破解|-uc?(?![a-z])|uncensored/i
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
