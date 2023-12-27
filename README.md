![JavPack](./assets/icon.png)

# JavPack

> 一些（最小化）脚本

## 脚本

| 名称       | 描述           | 安装                                                                         |
| :--------- | :------------- | :--------------------------------------------------------------------------- |
| 115.delDir | 播放页删除目录 | [安装](https://github.com/bolin-dev/JavPack/raw/main/115/115.delDir.user.js) |

| 名称             | 描述         | 安装                                                                                 |
| :--------------- | :----------- | :----------------------------------------------------------------------------------- |
| JavDB.style      | 样式调整     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.style.user.js)      |
| JavDB.layout     | 布局调整     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.layout.user.js)     |
| JavDB.search     | 快捷搜索     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.search.user.js)     |
| JavDB.nav        | 快捷翻页     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.nav.user.js)        |
| JavDB.openTab    | 新标签页打开 | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.openTab.user.js)    |
| JavDB.quickLook  | 快速查看     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.quickLook.user.js)  |
| JavDB.scroll     | 滚动加载     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.scroll.user.js)     |
| JavDB.filter     | 影片筛选     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.filter.user.js)     |
| JavDB.trailer    | 预告片       | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.trailer.user.js)    |
| JavDB.match115   | 115 网盘匹配 | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.match115.user.js)   |
| JavDB.sprite     | 雪碧图       | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.sprite.user.js)     |
| JavDB.magnet     | 磁链扩展     | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.magnet.user.js)     |
| JavDB.offline115 | 115 网盘离线 | [安装](https://github.com/bolin-dev/JavPack/raw/main/javdb/JavDB.offline115.user.js) |

| 名称            | 描述         | 安装                                                                                 |
| :-------------- | :----------- | :----------------------------------------------------------------------------------- |
| JavLib.match115 | 115 网盘匹配 | [安装](https://github.com/bolin-dev/JavPack/raw/main/javlib/JavLib.match115.user.js) |

## 使用

### JavDB.search

- 快捷键 `/` 选取搜索框

- 快捷键 `Ctrl` + `/` 搜索粘贴板首项

### JavDB.nav

- 方向键左右翻页

- JavDB.openTab

- 鼠标左键前台新标签页打开，右键后台新标签页

### JavDB.quickLook

- 鼠标悬停后，空格键弹窗预览影片详情，再次键入空格 / `Esc` 以关闭弹窗

- 预览时键入 `Enter` 访问详情页

### JavDB.offline115

> [!NOTE]
>
> 应避免单目录下直接子项数量 ≥ 11500

- `config[].name : string` 按钮名称；支持 `动态参数`；必填

- `config[].color : string` 按钮样式；参考 [Bulma](https://bulma.io/documentation/elements/button/#colors)；默认 `is-info`

- `config[].desc : string` 按钮描述；默认 `离线路径`

- `config[].type : string` 按钮类型，`plain` `genres` `actors` 可选，默认 `plain`

- `config[].match : string[]` 类型匹配；仅 `genres` `actors` 类型下支持

- `config[].exclude : string[]` 类型排除；仅 `genres` `actors` 类型下支持

- `config[].magnetOptions.filter : filterCallbackFn` 磁链筛选；默认 200MB < `magnet.size` < 15GB

  `filterCallbackFn` 函数被调用时传入参数 `magnet`：

  - `magnet.url : string` 磁力链接
  - `magnet.name : string` 磁力名称
  - `magnet.meta : string` 磁力信息，如 `5.21GB, 4个文件`
  - `magnet.size : string` byte size
  - `magnet.zh : bool` 是否有字幕
  - `magnet.crack : bool` 是否为破解

- `config[].magnetOptions.sort : sortCompareFn` 磁链排序；默认 `magnet.zh` → `magnet.crack` → `magnet.size`

- `config[].magnetOptions.max : number` 磁链最大数；默认 10

- `config[].dir : string | string[]` 离线路径；支持 `动态参数`；默认 `云下载`

- `config[].verifyOptions.requireVdi : bool` 根据完整而又不严谨的观察，`vdi` 表示视频已转码 (可观看)；默认 `true`

- `config[].verifyOptions.clean : bool` 离线验证失败清理对应任务和文件夹；默认 `true`

- `config[].verifyOptions.max : number` 离线验证最大次数；默认 10

- `config[].rename : string` 离线重命名；支持 `动态参数`；默认 `${zh}${crack} ${code} ${title}`

- `config[].tags : string[]` 自动打标；`genres` `actors` 可选；默认 `["genres", "actors"]`

- `config[].clean : bool` 文件清理；默认 `true`

- `config[].upload : string[]` 图片上传；`cover` `sprite` 可选；默认 `["cover"]`

```
动态参数

code        番号
prefix      番号前缀
title       标题
date        影片日期
create      操作日期
director    导演
maker       片商
publisher   发行
series      系列
genres      类别
actors      演员

genre       类别，仅 type = genres 可用
actor       演员，仅 type = actors 可用

zh          字幕资源，仅 rename 可用
crack       破解资源，仅 rename 可用
```

## 许可

The GPL-3.0 License.
