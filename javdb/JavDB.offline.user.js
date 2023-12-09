// ==UserScript==
// @name            JavDB.offline
// @namespace       JavDB.offline@blc
// @version         0.0.1
// @author          blc
// @description     离线下载
// @include         /^https:\/\/javdb\d*\.com\/v\/\w+/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/request/JavPack.request.lib.js
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/drive/JavPack.drive.lib.js
// @resource        success https://s1.ax1x.com/2022/04/01/q5l2LD.png
// @resource        info https://s1.ax1x.com/2022/04/01/q5lyz6.png
// @resource        warn https://s1.ax1x.com/2022/04/01/q5lgsO.png
// @resource        error https://s1.ax1x.com/2022/04/01/q5lcQK.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @run-at          document-end
// @grant           GM_removeValueChangeListener
// @grant           GM_addValueChangeListener
// @grant           GM_getResourceURL
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_info
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const magnetList = document.querySelectorAll("#magnets-content > .item");
  if (!magnetList.length) return;

  const info = {
    create: new Date().toISOString().slice(0, 10),
    code: document.querySelector(".first-block .value").textContent,
    title: (document.querySelector(".origin-title") ?? document.querySelector(".current-title"))?.textContent,
    date: "",
    director: "",
    maker: "",
    publisher: "",
    series: "",
    genre: [],
    actor: [],
  };

  const map = {
    date: "日期:",
    director: "導演:",
    maker: "片商:",
    publisher: "發行:",
    series: "系列:",
    genre: "類別:",
    actor: "演員:",
  };

  const keyofMap = Object.keys(map);
  const codeParser = codeParse(info.code);
  const infoNode = document.querySelector(".movie-panel-info");

  infoNode.querySelectorAll(".panel-block").forEach(item => {
    const label = item.querySelector("strong")?.textContent;
    const value = item.querySelector(".value")?.textContent;
    if (!label || !value) return;

    const key = keyofMap.find(key => map[key] === label);
    if (!key) return;

    if (typeof info[key] === "string") {
      info[key] = value.trim();
    } else {
      info[key] = value
        .split(value.includes(",") ? "," : "\n")
        .map(item => item.trim())
        .filter(Boolean);
    }
  });

  const config = [
    { name: "云下载" },
    { name: "导演", dir: "导演/${director}" },
    { name: "片商", dir: "片商/${maker}" },
    { name: "发行", dir: "发行/${publisher}" },
    { name: "系列", dir: "系列/${series}" },
  ];

  const regex = {
    match: /^\$\{(.*?)\}$/,
    cracked: /破解/,
    float: /\d+\.?\d*/g,
    // num: /^\d+$/,
    // sex: /♂|♀/,
  };

  const actions = [];

  for (const { dir = "云下载", ...item } of config) {
    const _dir = parseDir(dir);
    if (_dir.every(Boolean)) actions.push({ ...item, dir: _dir.join("/") });
  }

  function parseDir(dir) {
    return dir.split("/").map(item => {
      if (!regex.match.test(item)) return item.trim();

      let _item = item.match(regex.match)?.[1];
      if (!_item || !info.hasOwnProperty(_item)) return;

      _item = info[_item];
      if (typeof _item === "string") return _item;
    });
  }

  if (!actions.length) return;

  const magnets = [...magnetList].map(item => {
    const first = item.querySelector(".magnet-name a");
    const name = first.querySelector(".name")?.textContent.trim() ?? "";
    const meta = first.querySelector(".meta")?.textContent.trim() ?? "";

    return {
      name,
      meta,
      link: first.href.split("&")[0],
      size: transToBytes(meta.split(",")[0].trim()),
      zh: !!first.querySelector(".tag.is-warning.is-small.is-light"),
      cracked: regex.cracked.test(name),
      date: item.querySelector(".date .time")?.textContent ?? "",
    };
  });

  function transToBytes(sizeStr = "") {
    const sizeNum = sizeStr?.match(regex.float)?.[0] ?? 0;
    if (sizeNum <= 0) return 0;

    const matchList = [
      { unit: /byte/gi, transform: size => size },
      { unit: /kb/gi, transform: size => size * 1000 },
      { unit: /mb/gi, transform: size => size * 1000 ** 2 },
      { unit: /gb/gi, transform: size => size * 1000 ** 3 },
      { unit: /kib/gi, transform: size => size * 1024 },
      { unit: /mib/gi, transform: size => size * 1024 ** 2 },
      { unit: /gib/gi, transform: size => size * 1024 ** 3 },
    ];

    return (
      matchList
        .find(({ unit }) => unit.test(sizeStr))
        ?.transform(sizeNum)
        ?.toFixed(2) ?? 0
    );
  }

  const defaultFilter = ({ size }) => size > 200000000;
  const defaultSort = (a, b) => {
    if (a.zh === b.zh) {
      if (a.cracked === b.cracked) {
        const dateA = a.date.replaceAll("-", "");
        const dateB = b.date.replaceAll("-", "");

        return dateA === dateB ? b.size - a.size : dateB - dateA;
      } else {
        return a.cracked ? -1 : 1;
      }
    } else {
      return a.zh ? -1 : 1;
    }
  };
  const defaultMax = 5;

  infoNode.insertAdjacentHTML(
    "beforeend",
    `<div id="x-offline" class="panel-block buttons are-small">
    ${actions
      .map(({ name, desc = "", color = "is-info" }, index) => {
        return `<button id="x-offline-idx${index}" class="button ${color}" title="${desc}">${name}</button>`;
      })
      .join("")}
    </div>`
  );

  const offline = infoNode.querySelector("#x-offline");
  const buttons = offline.querySelectorAll("button");

  const handleOver = () => {
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove("is-loading");
    });
  };

  offline.addEventListener("click", async ({ target }) => {
    if (target.nodeName !== "BUTTON") return;

    const idx = target.id.replace("x-offline-idx", "");
    let { magnets: _magnets, list, dir, cid, ...action } = actions[idx];

    if (!list) {
      list = magnets
        .filter(_magnets?.filter ?? defaultFilter)
        .sort(_magnets?.sort ?? defaultSort)
        .slice(0, _magnets?.max ?? defaultMax);
      actions[idx].list = list;
    }
    if (!list?.length) return notify("未找到符合条件的磁力链接", "warn");

    target.classList.add("is-loading");
    buttons.forEach(btn => (btn.disabled = true));

    if (!cid) {
      cid = await findDir(dir);
      actions[idx].cid = cid;
    }
    if (!cid) {
      handleOver();
      return notify("未找到目标文件夹", "warn");
    }

    offlineDownload(list, cid, action);
  });

  async function findDir(dir) {
    let cid = 0;

    for (const item of dir.split("/")) {
      const _cid = (await files(cid, { type: "" }))?.data.find(it => it.n === item)?.cid;
      if (!_cid) {
        cid = (await filesAdd(item, cid))?.cid;
        if (!cid) break;
      } else {
        cid = _cid;
      }
    }

    return cid;
  }

  async function offlineDownload(list, cid, action) {
    const { rename = "${no}${zh}${cracked} ${code} ${title}", cleanup = true } = action;
    for (let index = 0, { length } = list; index < length; index++) {
      const sign = await space();
      if (!sign?.state) {
        handleOver();
        notify("请求错误，确认网盘已登陆", "error");
        break;
      }

      const { link, ...item } = list[index];

      const task = await addTaskUrl({ url: link, wp_path_id: cid, sign: sign.sign, time: sign.time });
      if (!task?.state) {
        const { errcode, error_msg } = task;
        if (errcode === 10007) {
          notify(error_msg, "warn");
          handleOver();
        }
        if (errcode === 10008) {
          if (index !== length - 1) continue;
          notify(error_msg, "warn");
          handleOver();
        }
        if (errcode === 911) {
          if (GM_GetValue("VERIFY_STATUS", "") !== "pending") {
            notify(error_msg, "warn");
            driveVerify();
          }
          const listener = GM_addValueChangeListener("VERIFY_STATUS", (name, old_value, new_value, remote) => {
            if (!remote || !["verified", "failed"].includes(new_value)) return;
            GM_removeValueChangeListener(listener);
            if (new_value !== "verified") return handleOver();
            offlineDownload(list.slice(index), cid, action);
          });
        }
        break;
      }

      const videos = await taskVerify(task.info_hash, codeParser.regex);
      if (!videos?.length) {
        if (index !== length - 1) continue;
        notify("未找到文件", "warn");
        handleOver();
      }
      notify("下载成功", "success");

      // rename = parserRename(rename, { ...info, ...item }).trim();
      // console.log(rename);
      location.reload();

      break;
    }
  }

  function notify(text, icon, details = {}) {
    GM_notification({
      text,
      title: GM_info.script.name,
      tag: GM_info.script.namespace,
      image: GM_getResourceURL(icon),
      highlight: false,
      silent: true,
      timeout: 3000,
      ...details,
    });
  }

  const delay = (s = 1) => new Promise(r => setTimeout(r, s * 1000));

  function driveVerify() {
    const h = 667;
    const w = 375;
    const t = (window.screen.availHeight - h) / 2;
    const l = (window.screen.availWidth - w) / 2;

    window.open(
      `https://captchaapi.115.com/?ac=security_code&type=web&cb=Close911_${new Date().getTime()}`,
      "验证账号",
      `height=${h},width=${w},top=${t},left=${l},toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no`
    );
  }

  async function taskVerify(info_hash, regex) {
    const sign = await space();
    if (!sign?.state) return;

    let task = 0;
    const getTask = async () => {
      const { tasks } = await taskLists({ sign: sign.sign, time: sign.time });
      task = tasks.find(item => item.info_hash === info_hash);
      if (!task?.file_id) {
        await delay();
        return getTask();
      }
    };
    await getTask();

    let list = [];
    for (let index = 0; index < 4; index++) {
      list = (await files(task.file_id)).data.filter(item => regex.test(item.n));
      if (list.length) break;
      await delay();
    }

    if (!list.length) {
      taskDel({ "hash[0]": info_hash, "sign": sign.sign, "time": sign.time });
      rbDelete([task.delete_file_id], task.wp_path_id);
    }

    return list;
  }

  function parserRename(rename, res) {
    return rename.replace(/\$\{(.*?)\}/g, (_, key) => {
      if (!res.hasOwnProperty(key)) return "";

      const value = res[key];
      if (key === "zh") return value ? "[中字]" : "";
      if (key === "cracked") return value ? "[破解]" : "";
      return typeof value === "string" ? value : "";
    });
  }
})();
