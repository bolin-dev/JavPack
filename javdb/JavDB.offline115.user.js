// ==UserScript==
// @name            JavDB.offline115
// @namespace       JavDB.offline115@blc
// @version         0.0.1
// @author          blc
// @description     115 网盘离线
// @match           https://javdb.com/v/*
// @match           https://captchaapi.115.com/*
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Util.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Req.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Req115.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Util115.lib.js
// @resource        success https://s1.ax1x.com/2022/04/01/q5l2LD.png
// @resource        error https://s1.ax1x.com/2022/04/01/q5lcQK.png
// @resource        warn https://s1.ax1x.com/2022/04/01/q5lgsO.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @connect         aliyuncs.com
// @connect         jdbstatic.com
// @run-at          document-end
// @grant           GM_removeValueChangeListener
// @grant           GM_addValueChangeListener
// @grant           GM_getResourceURL
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_addElement
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
  const config = [
    { name: "云下载", desc: "下载到云下载" },
    { name: "番号", dir: "番号/${prefix}" },
    { name: "系列", dir: "系列/${series}" },
    { name: "片商", dir: "片商/${maker}" },
  ];

  if (!config.length) return;

  if (location.host === "captchaapi.115.com") {
    const verified = () => {
      GM_setValue("VERIFY_STATUS", "verified");
      window.close();
    };

    window.addEventListener("beforeunload", verified);
    window.addEventListener("popstate", verified);
    return;
  }

  const transToByte = Util.useTransByte();

  const defaultMagnetOptions = {
    filter: ({ size }) => {
      const magnetSize = parseFloat(size);
      return magnetSize > parseFloat(transToByte("200MB")) && magnetSize < parseFloat(transToByte("10GB"));
    },
    max: 5,
  };

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
      if (label !== "演員:") return;
      details.actors = value
        .split("\n")
        .map((item) => item.replace(/♀|♂/, "").trim())
        .filter(Boolean);
    });

    const { regex, prefix } = Util.codeParse(code);
    return { infoNode, regex, prefix, code, title, ...details };
  }

  function getActions(config, details, magnets) {
    return config
      .map(({ magnetOptions = {}, dir = "云下载", ...item }) => {
        let _magnets = magnets;
        if (defaultMagnetOptions) magnetOptions = { ...defaultMagnetOptions, ...magnetOptions };
        if (magnetOptions.filter) _magnets = _magnets.filter(magnetOptions.filter);
        if (magnetOptions.sort) _magnets = _magnets.toSorted(magnetOptions.sort);
        if (magnetOptions.max) _magnets = _magnets.slice(0, magnetOptions.max);

        let _dir = typeof dir === "string" ? dir.split("/") : dir;
        _dir = _dir.map((item) => {
          const key = item.match(Util.varReg)?.[1];
          if (!key) return item;
          return details.hasOwnProperty(key) ? details[key].toString() : null;
        });

        return { magnets: _magnets, dir: _dir, ...item };
      })
      .filter(({ magnets, dir }) => magnets.length && dir.every(Boolean));
  }

  function filterMagnets(magnets) {
    return Util115.offlineSpace().then(({ size }) => {
      const spaceSize = parseFloat(transToByte(size));
      return magnets.filter((item) => parseFloat(item.size) <= spaceSize);
    });
  }

  function replaceVar(txt, params) {
    return txt
      .replace(Util.varRep, (_, key) => {
        return params.hasOwnProperty(key) ? params[key].toString() : "";
      })
      .trim();
  }

  const magnets = getMagnets();
  if (!magnets.length) return;

  const { infoNode, regex, ...details } = getDetails();
  const { code } = details;

  const actions = getActions(config, details, magnets);
  if (!actions.length) return;

  infoNode.insertAdjacentHTML(
    "beforeend",
    `<div class="panel-block">
      <div class="columns">
        <div class="column">
          <div id="x-offline" class="buttons are-small">
          ${actions
            .map(({ name, desc, color = "is-info", dir }, idx) => {
              desc ??= dir.join(" / ");
              return `<button id="x-offline-idx${idx}" class="button ${color}" title="${desc}">${name}</button>`;
            })
            .join("")}
          </div>
        </div>
      </div>
    </div>`,
  );
  const offlineNode = infoNode.querySelector("#x-offline");
  const offlineBtns = offlineNode.querySelectorAll("button");

  const offlineEnd = () => {
    offlineBtns.forEach((btn) => {
      btn.classList.remove("is-loading");
      btn.disabled = false;
    });
  };

  const offlineStart = async (target, currIdx = 0) => {
    if (!target.classList.contains("button")) return;

    target.classList.add("is-loading");
    offlineBtns.forEach((item) => {
      item.disabled = true;
    });

    const { surplus } = await Util115.lixianGetQuotaPackageInfo();
    if (surplus < 1) {
      Util.notify({ text: "离线配额不足", icon: "error" });
      return offlineEnd();
    }

    const idx = target.id.replace("x-offline-idx", "");
    let { magnets, cid, dir, ...action } = actions[idx];

    magnets = await filterMagnets(magnets.slice(currIdx, surplus));
    if (!magnets.length) {
      Util.notify({ text: "网盘空间不足", icon: "error" });
      return offlineEnd();
    }

    if (!cid && cid !== 0) {
      cid = await Util115.generateCid(dir);

      if (!cid && cid !== 0) {
        Util.notify({ text: "生成下载目录失败", icon: "error" });
        return offlineEnd();
      }

      actions[idx].cid = cid;
    }

    Util.setTabBar(`${code} 离线任务中...`);
    const res = await handleSmartOffline({ magnets, cid, action });

    if (res.code === 0) {
      Util.notify({ text: res.msg, icon: "success" });
      Util.setTabBar({ text: `${code} 离线成功`, icon: "success" });
      location.reload();
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
      Util.notify({ text: "离线验证中，请稍后", icon: "warn" });
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

  offlineNode.addEventListener("click", (e) => offlineStart(e.target));

  async function handleSmartOffline({ magnets, cid, action }) {
    const res = { code: 0, msg: "" };

    const {
      rename = "${zh}${crack} ${code} ${title}",
      tags = ["genres", "actors"],
      clean = true,
      upload = true,
    } = action;

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

      const { file_id, videos } = await Util115.verifyTask(info_hash, (item) => regex.test(item.n));
      if (!videos.length) {
        Util115.lixianTaskDel([info_hash]);
        res.code = 1;
        res.msg = "离线验证失败";
        continue;
      } else {
        res.code = 0;
        res.msg = "离线成功";
      }

      if (rename) handleRename({ rename, zh, crack, file_id, videos });

      if (tags?.length) handleTags({ tags, videos });

      await handleMove({ videos, file_id });

      if (clean) await handleClean(file_id);

      if (upload) await handleUpload(file_id);

      break;
    }

    return res;
  }

  function handleRename({ rename, zh, crack, file_id, videos }) {
    rename = replaceVar(rename, {
      ...details,
      zh: zh ? "[中字]" : "",
      crack: crack ? "[破解]" : "",
    });
    if (!regex.test(rename)) rename = `${code} ${rename}`;

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

    Util115.matchLabels(tags).then((labels) => {
      if (labels?.length) videos.forEach(({ fid }) => Util115.filesEdit(fid, labels.join(",")));
    });
  }

  function handleMove({ videos, file_id }) {
    const mv_fids = videos.filter((item) => item.cid !== file_id).map((item) => item.fid);
    if (mv_fids.length) return Util115.filesMove(mv_fids, file_id);
  }

  async function handleClean(file_id) {
    const { data } = await Util115.files(file_id);

    const rm_fids = data
      .filter((item) => !regex.test(item.n) || item.class !== "AVI")
      .map((item) => item.fid ?? item.cid);

    if (rm_fids.length) await Util115.rbDelete(rm_fids, file_id);
  }

  function handleUpload(cid) {
    return Util115.handleUpload({
      url: document.querySelector(".video-cover").src,
      filename: `${code}.cover.jpg`,
      cid,
    });
  }
})();
