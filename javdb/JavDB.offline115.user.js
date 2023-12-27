// ==UserScript==
// @name            JavDB.offline115
// @namespace       JavDB.offline115@blc
// @version         0.0.1
// @author          blc
// @description     115 网盘离线
// @match           https://javdb.com/v/*
// @match           https://captchaapi.115.com/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util115.lib.js
// @resource        success https://github.com/bolin-dev/JavPack/raw/main/assets/success.png
// @resource        error https://github.com/bolin-dev/JavPack/raw/main/assets/error.png
// @resource        warn https://github.com/bolin-dev/JavPack/raw/main/assets/warn.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         jdbstatic.com
// @connect         javstore.net
// @connect         aliyuncs.com
// @connect         pixhost.to
// @connect         115.com
// @run-at          document-end
// @grant           GM_removeValueChangeListener
// @grant           GM_addValueChangeListener
// @grant           GM_getResourceURL
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_addElement
// @grant           unsafeWindow
// @grant           GM_openInTab
// @grant           window.close
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_info
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  if (location.host === "captchaapi.115.com") {
    return document.querySelector("#js_ver_code_box button[rel=verify]").addEventListener("click", () => {
      setTimeout(() => {
        if (document.querySelector(".vcode-hint").getAttribute("style").indexOf("none") !== -1) {
          GM_setValue("VERIFY_STATUS", "verified");
          window.close();
        }
      }, 300);
    });
  }

  const config = [
    {
      name: "云下载",
      color: "is-primary",
    },
    {
      name: "番号",
      dir: "番号/${prefix}",
      color: "is-link",
    },
    {
      name: "片商",
      dir: "片商/${maker}",
    },
    {
      name: "系列",
      dir: "系列/${series}",
      color: "is-success",
    },
    {
      type: "genres",
      name: "${genre}",
      dir: "类别/${genre}",
      match: ["屁股", "連褲襪", "巨乳", "亂倫"],
      color: "is-warning",
    },
    {
      type: "actors",
      name: "${actor}",
      dir: "演员/${actor}",
      exclude: ["♂"],
      color: "is-danger",
    },
  ];
  if (!config.length) return;

  const zhTxt = "[中字]";
  const crackTxt = "[破解]";
  const transToByte = Util.useTransByte();
  const minMagnetSize = parseFloat(transToByte("200MB"));
  const maxMagnetSize = parseFloat(transToByte("15GB"));

  const defaultMagnetOptions = {
    filter: ({ size }) => {
      const magnetSize = parseFloat(size);
      return magnetSize > minMagnetSize && magnetSize < maxMagnetSize;
    },
    max: 10,
  };

  const defaultVerifyOptions = {
    requireVdi: true,
    clean: true,
    max: 10,
  };

  function getDetails(dom = document) {
    const infoNode = dom.querySelector(".movie-panel-info");
    const code = infoNode.querySelector(".first-block .value").textContent;

    let title = dom.querySelector(".title.is-4");
    title = `${title.querySelector("strong").textContent}${
      (title.querySelector(".origin-title") ?? title.querySelector(".current-title")).textContent
    }`;
    title = title.replaceAll(code, "").trim();

    const details = {};
    infoNode.querySelectorAll(".movie-panel-info > .panel-block").forEach((item) => {
      const label = item.querySelector("strong")?.textContent;
      const value = item.querySelector(".value")?.textContent;
      if (!label || !value) return;

      if (label === "日期:") details.date = value;
      if (label === "導演:") details.director = value;
      if (label === "片商:") details.maker = value;
      if (label === "發行:") details.publisher = value;
      if (label === "系列:") details.series = value;
      if (label === "類別:") details.genres = value.split(",").map((item) => item.trim());
      if (label !== "演員:" || value.includes("N/A")) return;
      details.actors = value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    });

    const { regex, prefix } = Util.codeParse(code);
    return { infoNode, regex, prefix, code, title, create: new Date().toISOString().slice(0, 10), ...details };
  }

  function getMagnets(dom = document) {
    return [...dom.querySelectorAll("#magnets-content > .item")]
      .map((item) => {
        const name = item.querySelector(".name")?.textContent ?? "";
        return {
          crack: Util.crackReg.test(name),
          url: item.querySelector(".magnet-name a").href.split("&")[0],
          zh: !!item.querySelector(".tag.is-warning") || Util.zhReg.test(name),
          size: transToByte((item.querySelector(".meta")?.textContent ?? "").split(",")[0].trim()),
        };
      })
      .toSorted(Util.magnetSort);
  }

  const parseVar = (txt, params) => {
    return txt.replace(Util.varRep, (_, key) => (params.hasOwnProperty(key) ? params[key].toString() : "")).trim();
  };

  const parseDir = (dir, params) => {
    dir = typeof dir === "string" ? dir.split("/") : dir;
    return dir.map((item) => {
      const vars = item.match(Util.varRep);
      if (!vars?.length) return item.trim();
      if (!vars.every((key) => params.hasOwnProperty(key.match(Util.varReg)[1]))) return null;
      return parseVar(item, params);
    });
  };

  const parseMagnets = (magnets, options) => {
    if (defaultMagnetOptions) options = { ...defaultMagnetOptions, ...options };
    if (options.filter) magnets = magnets.filter(options.filter);
    if (options.sort) magnets = magnets.toSorted(options.sort);
    if (options.max) magnets = magnets.slice(0, options.max);
    return magnets;
  };

  function getActions(config, details, magnets) {
    return config
      .map(({ magnetOptions = {}, type = "plain", match = [], exclude = [], ...item }, index) => {
        const { color = "is-info", name, dir = "云下载", rename = "${zh}${crack} ${code} ${title}" } = item;
        if (!name) return null;

        const _magnets = parseMagnets(magnets, magnetOptions);
        if (!_magnets.length) return null;

        if (type === "plain") {
          return {
            ...item,
            color,
            name: parseVar(name, details),
            magnets: _magnets,
            dir: parseDir(dir, details),
            rename,
            index,
            idx: 0,
          };
        }

        let classes = details[type];
        if (!classes?.length) return null;

        if (match.length) classes = classes.filter((item) => match.some((key) => item.includes(key)));
        if (exclude.length) classes = classes.filter((item) => !exclude.some((key) => item.includes(key)));
        if (!classes.length) return null;

        const typeItemKey = type.slice(0, -1);
        const typeItemTxt = "${" + typeItemKey + "}";

        return classes.map((cls, idx) => {
          cls = cls.replace(/♀|♂/, "").trim();
          const _details = { ...details, [typeItemKey]: cls };

          return {
            ...item,
            color,
            name: parseVar(name, _details),
            magnets: _magnets,
            dir: parseDir(dir, _details),
            rename: rename.replaceAll(typeItemTxt, cls),
            index,
            idx,
          };
        });
      })
      .flat()
      .filter((item) => Boolean(item) && item.dir.every(Boolean))
      .map(({ desc, ...item }) => {
        return { ...item, desc: desc ?? item.dir.join(" / ") };
      });
  }

  GM_addElement(document.head, "link", { rel: "prefetch", href: GM_info.script.icon });
  GM_addElement(document.head, "link", { rel: "prefetch", href: GM_getResourceURL("success") });
  GM_addElement(document.head, "link", { rel: "prefetch", href: GM_getResourceURL("error") });
  GM_addElement(document.head, "link", { rel: "prefetch", href: GM_getResourceURL("warn") });

  const { infoNode, regex, ...details } = getDetails();
  const { code } = details;
  const magnets = getMagnets();
  const actions = getActions(config, details, magnets);

  infoNode.insertAdjacentHTML(
    "beforeend",
    `<div class="panel-block">
      <div class="columns">
        <div class="column">
          <div id="x-offline" class="buttons are-small">
          ${actions
            .map(({ color, index, idx, desc, name }) => {
              return `
              <button class="button ${color}" data-index="${index}" data-idx="${idx}" title="${desc}">
                ${name}
              </button>`;
            })
            .join("")}
          </div>
        </div>
      </div>
    </div>`,
  );
  const offlineNode = infoNode.querySelector("#x-offline");

  unsafeWindow.updateMagnets = () => {
    const _magnets = getMagnets();
    if (_magnets.length === magnets.length) return;

    const _actions = getActions(config, details, _magnets);
    if (!_actions.length) return;

    const disabled = offlineNode.querySelector("button.is-loading") ? "disabled" : "";

    _actions.forEach((item) => {
      const { color, index, idx, desc, name } = item;
      const _index = actions.findIndex((ac) => ac.index === index && ac.idx === idx);

      if (_index !== -1) {
        actions[_index].magnets = item.magnets;
      } else {
        actions.push(item);

        offlineNode.insertAdjacentHTML(
          "beforeend",
          `<button
            class="button ${color}"
            data-index="${index}"
            data-idx="${idx}"
            title="${desc}"
            ${disabled}
          >
            ${name}
          </button>`,
        );
      }
    });
  };

  offlineNode.addEventListener("click", (e) => offlineStart(e.target));

  const offlineStart = async (target, currIdx = 0) => {
    if (!target.classList.contains("button")) return;

    target.classList.add("is-loading");
    offlineNode.querySelectorAll("button").forEach((item) => {
      item.disabled = true;
    });

    const { errcode, surplus } = await Util115.lixianGetQuotaPackageInfo();

    if (errcode === 99) {
      Util.notify({ text: "网盘未登录", icon: "error" });
      return offlineEnd();
    }

    if (surplus < 1) {
      Util.notify({ text: "离线配额不足", icon: "error" });
      return offlineEnd();
    }

    const { index, idx } = target.dataset;
    const _index = actions.findIndex((item) => item.index === Number(index) && item.idx === Number(idx));
    let { magnets, cid, dir, ...action } = actions[_index];

    magnets = await filterMagnets(magnets.slice(currIdx, surplus));
    if (!magnets.length) {
      Util.notify({ text: "网盘空间不足", icon: "error" });
      return offlineEnd();
    }

    // eslint-disable-next-line eqeqeq, no-eq-null
    if (cid == null) {
      cid = await Util115.generateCid(dir);

      // eslint-disable-next-line eqeqeq, no-eq-null
      if (cid == null) {
        Util.notify({ text: "生成下载目录 id 失败", icon: "error" });
        return offlineEnd();
      }

      actions[_index].cid = cid;
    }

    Util.setTabBar(`${code} 离线任务中...`);
    const res = await handleSmartOffline({ magnets, cid, action });

    if (res.code === 0) {
      Util.notify({ text: res.msg, icon: "success" });
      Util.setTabBar({ text: `${code} 离线成功`, icon: "success" });
      unsafeWindow.match115Resource?.();
      return offlineEnd();
    }

    if (res.code !== 911) {
      Util.notify({ text: res.msg, icon: "warn" });
      Util.setTabBar({ text: `${code} 离线失败`, icon: "warn" });
      return offlineEnd();
    }

    Util.setTabBar({ text: `${code} 离线验证中...`, icon: "warn" });

    if (GM_getValue("VERIFY_STATUS") !== "pending") {
      GM_setValue("VERIFY_STATUS", "pending");
      Util.notify({ text: "网盘待验证", icon: "warn" });
      Util.openTab(`https://captchaapi.115.com/?ac=security_code&type=web&cb=Close911_${new Date().getTime()}`);
    }

    // eslint-disable-next-line max-params
    const listener = GM_addValueChangeListener("VERIFY_STATUS", (name, old_value, new_value, remote) => {
      if (!remote || !["verified", "failed"].includes(new_value)) return;
      GM_removeValueChangeListener(listener);
      if (new_value !== "verified") return offlineEnd();
      offlineStart(target, res.currIdx);
    });
  };

  function filterMagnets(magnets) {
    return Util115.offlineSpace().then(({ size }) => {
      const spaceSize = parseFloat(transToByte(size));
      return magnets.filter((item) => parseFloat(item.size) <= spaceSize);
    });
  }

  async function handleSmartOffline({ magnets, cid, action }) {
    const res = { code: 0, msg: "" };

    let { verifyOptions = {}, rename, tags = ["genres", "actors"], clean = true, upload = ["cover"] } = action;
    if (defaultVerifyOptions) verifyOptions = { ...defaultVerifyOptions, ...verifyOptions };

    let verifyFile = (file) => regex.test(file.n);
    if (verifyOptions.requireVdi) verifyFile = (file) => regex.test(file.n) && file.hasOwnProperty("vdi");

    for (let index = 0, { length } = magnets; index < length; index++) {
      const isLast = index === length - 1;
      const { url, zh, crack } = magnets[index];

      const { state, errcode, error_msg, info_hash } = await Util115.lixianAddTaskUrl(url, cid);
      if (!state) {
        if (errcode === 10008 && !isLast) continue;
        res.code = errcode;
        res.msg = error_msg;
        res.currIdx = index;
        break;
      }

      const { file_id, videos } = await Util115.verifyTask(info_hash, verifyFile, verifyOptions.max);
      if (!videos.length) {
        if (verifyOptions.clean) {
          Util115.lixianTaskDel([info_hash]);
          if (file_id) Util115.rbDelete([file_id], cid);
        }
        res.code = 1;
        res.msg = "离线验证失败";
        continue;
      } else {
        res.code = 0;
        res.msg = "离线成功";
      }

      Util115.filesEditDesc(videos, info_hash);

      if (rename) handleRename({ rename, zh, crack, file_id, videos });

      if (tags?.length) handleTags({ tags, videos });

      await handleMove({ videos, file_id });

      if (clean) await handleClean({ videos, file_id });

      if (upload?.length) {
        res.msg += "，上传图片中...";
        handleUpload({ upload, file_id }).then(() => Util.notify({ text: "上传结束", icon: "success", tag: "upload" }));
      }

      break;
    }

    return res;
  }

  function handleRename({ rename, zh, crack, file_id, videos }) {
    rename = parseVar(rename, {
      ...details,
      zh: zh ? zhTxt : "",
      crack: crack ? crackTxt : "",
    });
    if (!regex.test(rename)) rename = `${code} ${rename}`.trim();

    const renameObj = { [file_id]: rename };

    const icoMap = videos.reduce((acc, { ico, ...item }) => {
      acc[ico] ??= [];
      acc[ico].push(item);
      return acc;
    }, {});

    for (const [ico, items] of Object.entries(icoMap)) {
      if (items.length === 1) {
        renameObj[items[0].fid] = `${rename}.${ico}`;
        continue;
      }

      items
        .toSorted((a, b) => a.n.localeCompare(b.n))
        .forEach(({ fid }, idx) => {
          const no = `${idx + 1}`.padStart(2, "0");
          renameObj[fid] = `${rename}.${no}.${ico}`;
        });
    }

    Util115.filesBatchRename(renameObj);
  }

  function handleTags({ tags, videos }) {
    tags = tags
      .map((key) => details[key])
      .flat()
      .filter(Boolean);

    Util115.filesBatchLabelName(videos, tags);
  }

  function handleMove({ videos, file_id }) {
    const mv_fids = videos.filter((item) => item.cid !== file_id).map((item) => item.fid);
    if (mv_fids.length) return Util115.filesMove(mv_fids, file_id);
  }

  async function handleClean({ videos, file_id }) {
    const { data } = await Util115.filesByOrder(file_id);

    const rm_fids = data
      .filter((item) => !videos.some(({ fid }) => fid === item.fid))
      .map((item) => item.fid ?? item.cid);

    if (rm_fids.length) return Util115.rbDelete(rm_fids, file_id);
  }

  function handleUpload({ upload, file_id: cid }) {
    const reqList = [];

    if (upload.includes("cover")) {
      let url = document.querySelector(".video-cover")?.src;
      if (!url) url = document.querySelector(".column-video-cover video")?.poster;
      reqList.push(() => Util115.handleUpload({ cid, url, filename: `${code}.cover.jpg` }));
    }

    if (upload.includes("sprite")) {
      const url = localStorage.getItem(`sprite_${location.pathname.split("/").pop()}`);
      if (url) reqList.push(() => Util115.handleUpload({ cid, url, filename: `${code}.sprite.jpg` }));
    }

    return Promise.allSettled(reqList.map((fn) => fn()));
  }

  const offlineEnd = () => {
    offlineNode.querySelectorAll("button").forEach((item) => {
      item.classList.remove("is-loading");
      item.disabled = false;
    });
  };
})();
