// ==UserScript==
// @name            JavDB.115
// @namespace       JavDB.115@blc
// @version         0.0.1
// @author          blc
// @description     115 网盘资源匹配和离线下载
// @match           https://javdb.com/*
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Util.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Req.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Req115.lib.js
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Util115.lib.js
// @resource        success https://s1.ax1x.com/2022/04/01/q5l2LD.png
// @resource        warn https://s1.ax1x.com/2022/04/01/q5lgsO.png
// @resource        error https://s1.ax1x.com/2022/04/01/q5lcQK.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @connect         aliyuncs.com
// @connect         jdbstatic.com
// @run-at          document-end
// @grant           GM_getResourceURL
// @grant           GM_xmlhttpRequest
// @grant           GM_notification
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_addElement
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_addStyle
// @grant           GM_info
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const defaultMagnetOptions = {
    filter: ({ size }) => parseFloat(size) > parseFloat(Util.transToByte("200MB")),
    max: 5,
  };

  const offlineConfig = [
    {
      name: "云下载",
      desc: "离线下载到 115 网盘",
    },
    {
      name: "番号",
      color: "is-link",
      dir: "番号/${prefix}",
    },
    {
      name: "系列",
      color: "is-success",
      dir: "系列/${series}",
    },
    {
      name: "片商",
      color: "is-danger",
      dir: ["片商", "${maker}"],
    },
  ];

  Util.upStore();

  const SELECTOR = "x-match-item";

  const VOID = "javascript:void(0);";

  const DriveChannel = new BroadcastChannel("DriveChannel");

  function clickListener(handler) {
    document.addEventListener("click", e => {
      const { target } = e;
      if (!target.classList.contains(SELECTOR)) return;

      e.preventDefault();
      e.stopPropagation();

      const { pc } = target.dataset;
      if (pc === "loading") return;
      if (!pc) return handler?.(target);
      Util.openTab(`https://v.anxia.com/?pickcode=${pc}`);
    });

    document.addEventListener("contextmenu", e => {
      if (!e.target.classList.contains(SELECTOR)) return;

      e.preventDefault();
      e.stopPropagation();

      const { cid } = e.target.dataset;
      if (cid) Util.openTab(`https://115.com/?cid=${cid}&offset=0&tab=&mode=wangpan`);
    });
  }

  function getDetails(dom = document) {
    const info = dom.querySelector(".movie-panel-info");
    const code = info.querySelector(".first-block .value").textContent;

    let title = dom.querySelector(".title.is-4");
    title = `${title.querySelector("strong").textContent}${
      (title.querySelector(".origin-title") ?? title.querySelector(".current-title")).textContent
    }`
      .replaceAll(code, "")
      .trim();

    const details = {};
    info.querySelectorAll(".movie-panel-info > .panel-block").forEach(item => {
      const label = item.querySelector("strong")?.textContent;
      const value = item.querySelector(".value")?.textContent;
      if (!label || !value) return;

      if (label === "日期:") details.date = value;
      if (label === "導演:") details.director = value;
      if (label === "片商:") details.maker = value;
      if (label === "發行:") details.publisher = value;
      if (label === "系列:") details.series = value;
      if (label === "類別:") details.genres = value.split(",").map(item => item.trim());
      if (label !== "演員:") return;
      details.actors = value
        .split("\n")
        .map(item => item.replace(/♀|♂/, "").trim())
        .filter(Boolean);
    });

    return { info, code, title, ...details, ...Util.codeParse(code) };
  }

  function getMagnets(dom = document) {
    const list = dom.querySelectorAll("#magnets-content > .item");
    if (!list.length) return;

    return [...list]
      .map(item => {
        const name = item.querySelector(".name")?.textContent ?? "";
        return {
          crack: Util.crackReg.test(name),
          url: item.querySelector(".magnet-name a").href.split("&")[0],
          zh: !!item.querySelector(".tag.is-warning") || Util.zhReg.test(name),
          size: Util.transToByte((item.querySelector(".meta")?.textContent ?? "").split(",")[0].trim()),
        };
      })
      .sort(Util.magnetSort);
  }

  function getActions(config, details, magnets) {
    return config
      .map(({ magnetOptions = {}, dir = "云下载", ...item }) => {
        let _magnets = magnets;
        if (defaultMagnetOptions) magnetOptions = { ...defaultMagnetOptions, ...magnetOptions };
        if (magnetOptions.filter) _magnets = _magnets.filter(magnetOptions.filter);
        if (magnetOptions.sort) _magnets = _magnets.sort(magnetOptions.sort);
        if (magnetOptions.max) _magnets = _magnets.slice(0, magnetOptions.max);

        let _dir = typeof dir === "string" ? dir.split("/") : dir;
        _dir = _dir.map(item => {
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
      const spaceSize = parseFloat(Util.transToByte(size));
      return magnets.filter(item => parseFloat(item.size) <= spaceSize);
    });
  }

  function replaceVar(txt, params) {
    return txt
      .replace(Util.varRep, (_, key) => {
        return params.hasOwnProperty(key) ? params[key].toString() : "";
      })
      .trim();
  }

  if (location.pathname.startsWith("/v/")) {
    const uid = location.pathname.split("/").pop();
    window.addEventListener("beforeunload", () => DriveChannel.postMessage(uid));

    clickListener();

    const { info, codes, regex, ...details } = getDetails();

    GM_addStyle(
      "#x-query a{display:-webkit-box;overflow:hidden;white-space:unset;text-overflow:ellipsis;-webkit-line-clamp:1;-webkit-box-orient:vertical;word-break:break-all}"
    );
    info.insertAdjacentHTML(
      "beforeend",
      "<div class='panel-block'><strong>资源:</strong>&nbsp;<span class='value' id='x-query'>查询中...</span></div>"
    );
    const query = info.querySelector("#x-query");

    const matchRes = () => {
      return Util115.videosSearch(codes.join(" ")).then(({ state, data }) => {
        if (!state) {
          query.textContent = "查询失败";
          return;
        }

        data = data.filter(item => regex.test(item.n)).map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));
        GM_setValue(details.code, data);

        if (!data.length) {
          query.textContent = "暂无资源";
          return;
        }

        query.innerHTML = data
          .map(
            ({ pc, cid, t, n }) =>
              `<a href="${VOID}" class="${SELECTOR}" data-pc="${pc}" data-cid="${cid}" title="[${t}] ${n}">${n}</a>`
          )
          .join("");
      });
    };
    matchRes();

    const magnets = getMagnets();
    if (!magnets?.length) return;

    const actions = getActions(offlineConfig, details, magnets);
    if (!actions?.length) return;

    info.insertAdjacentHTML(
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
      </div>`
    );
    const offline = info.querySelector("#x-offline");
    const offlineBtns = offline.querySelectorAll("button");

    const offlineOver = () => {
      offlineBtns.forEach(btn => {
        btn.classList.remove("is-loading");
        btn.disabled = false;
      });
    };

    offline.addEventListener("click", async ({ target }) => {
      if (!target.classList.contains("button")) return;

      target.classList.add("is-loading");
      offlineBtns.forEach(item => {
        item.disabled = true;
      });

      const { surplus } = await Util115.lixianGetQuotaPackageInfo();
      if (!surplus) {
        Util.notify({ text: "离线配额不足", icon: "error" });
        return offlineOver();
      }

      const idx = target.id.replace("x-offline-idx", "");
      let {
        cid,
        dir,
        magnets,
        rename = "${zh}${crack} ${code} ${title}",
        tags = ["genres", "actors"],
        clean = true,
        upload = true,
      } = actions[idx];

      magnets = await filterMagnets(magnets.slice(0, surplus));
      const { length } = magnets;
      if (!length) {
        Util.notify({ text: "网盘空间不足", icon: "error" });
        return offlineOver();
      }

      if (cid == undefined) {
        cid = await Util115.generateCid(dir);

        if (cid == undefined) {
          Util.notify({ text: "生成下载目录失败", icon: "error" });
          return offlineOver();
        }

        actions[idx].cid = cid;
      }

      for (let index = 0; index < length; index++) {
        const isLast = index === length - 1;
        const { url, zh, crack } = magnets[index];

        const { state, errcode, error_msg, info_hash } = await Util115.lixianAddTaskUrl(url, cid);
        if (!state) {
          if (errcode === 10008 && !isLast) continue;
          if (errcode === 911 && GM_getValue("VERIFY_STATUS") !== "PENDING") {
            GM_setValue("VERIFY_STATUS", "PENDING");
            Util.openTab(`https://captchaapi.115.com/?ac=security_code&type=web&cb=Close911_${new Date().getTime()}`);
          }
          Util.notify({ text: error_msg, icon: "warn" });
          break;
        }

        const { file_id, videos } = await Util115.verifyTask(info_hash, item => regex.test(item.n));
        if (!videos.length) {
          Util115.lixianTaskDel([info_hash]);
          if (isLast) Util.notify({ text: "离线失败", icon: "warn" });
          continue;
        } else {
          Util.notify({ text: "离线成功", icon: "success" });
        }

        if (rename) {
          rename = replaceVar(rename, {
            ...details,
            zh: zh ? "[中字]" : "",
            crack: crack ? "[破解]" : "",
          });
          if (!regex.test(rename)) rename = `${details.code} ${rename}`;

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
              .sort((a, b) => a.n.localeCompare(b.n))
              .forEach(({ fid }, idx) => {
                const no = `${idx + 1}`.padStart(2, "0");
                renameObj[fid] = `${rename}.${no}.${ico}`;
              });
          }

          Util115.filesBatchRename(renameObj);
        }

        if (tags?.length) {
          tags = tags
            .map(key => details[key])
            .flat()
            .filter(Boolean);

          Util115.matchLabels(tags).then(labels => {
            if (labels?.length) videos.forEach(({ fid }) => Util115.filesEdit(fid, labels.join(",")));
          });
        }

        const mv_fids = videos.filter(item => item.cid !== file_id).map(item => item.fid);
        if (mv_fids.length) await Util115.filesMove(mv_fids, file_id);

        if (clean) {
          await Util115.files(file_id).then(async ({ data }) => {
            const rm_fids = data
              .filter(item => !regex.test(item.n) || item.class !== "AVI")
              .map(item => item.fid ?? item.cid);
            if (rm_fids.length) await Util115.rbDelete(rm_fids, file_id);
          });
        }

        if (upload) {
          const cover = document.querySelector(".video-cover").src;
          Util115.handleUpload({ url: cover, filename: `${rename}.cover.jpg`, cid: file_id });
        }

        break;
      }

      await matchRes();
      return offlineOver();
    });
  } else {
    const container = document.querySelector(".movie-list");
    if (!container) return;

    const childList = container.querySelectorAll(".item:not(.is-hidden)");
    if (!childList.length) return;

    class QueueMatch {
      static list = [];
      static lock = false;
      static insertHTML = `<a class="${SELECTOR} tag" href="${VOID}">匹配中</a>&nbsp;`;

      static async add(times) {
        times = this.handleBefore(times);
        if (!times?.length) return;

        this.list.push(...times);
        if (this.lock || !this.list.length) return;

        this.lock = true;
        await this.handlerMatch();
        this.lock = false;
      }

      static handleBefore(items) {
        return [...items]
          .map(item => {
            const title = item.querySelector(".video-title");
            let tag = title.querySelector(`.${SELECTOR}`);
            if (!tag) {
              item.classList.add(`x-${item.querySelector("a").href.split("/").pop()}`);
              title.insertAdjacentHTML("afterbegin", this.insertHTML);
              tag = title.querySelector(`.${SELECTOR}`);
            }
            const code = title.querySelector("strong").textContent;
            return { tag, code, ...Util.codeParse(code) };
          })
          .filter(this.handleFilter);
      }

      static handleFilter = ({ tag, code, prefix, regex }) => {
        let res = GM_getValue(code);
        if (res) return this.setTag(tag, res);
        res = GM_getValue(prefix);
        if (!res) return true;
        this.setTag(
          tag,
          res.filter(item => regex.test(item.n))
        );
      };

      static async handlerMatch() {
        const prefixMap = this.list
          .splice(0)
          .filter(this.handleFilter)
          .reduce((acc, { prefix, ...item }) => {
            acc[prefix] ??= [];
            acc[prefix].push(item);
            return acc;
          }, {});

        await Promise.allSettled(
          Object.entries(prefixMap).map(([prefix, list]) => {
            return Util115.videosSearch(prefix).then(({ data }) => {
              data = data.map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));
              GM_setValue(prefix, data);

              list.forEach(({ tag, regex }) => {
                this.setTag(
                  tag,
                  data.filter(item => regex.test(item.n))
                );
              });
            });
          })
        );

        if (this.list.length) return this.handlerMatch();
      }

      static setTag(tag, res) {
        let textContent = "未匹配";
        let title = "";
        let pc = "";
        let cid = "";
        let className = "is-info";

        if (res.length) {
          const zhRes = res.filter(item => Util.zhReg.test(item.n));
          const item = zhRes?.[0] ?? res[0];

          textContent = "已匹配";
          title = `[${item.t}] ${item.n}`;
          pc = item.pc;
          cid = item.cid;
          className = zhRes.length ? "is-warning" : "is-success";
        }

        tag.textContent = textContent;
        tag.title = title;
        tag.dataset.pc = pc;
        tag.dataset.cid = cid;
        tag.setAttribute("class", `${SELECTOR} tag ${className}`);
      }
    }

    DriveChannel.onmessage = ({ data }) => {
      const nodeList = container.querySelectorAll(`.x-${data}:not(.is-hidden)`);
      if (nodeList.length) QueueMatch.add(nodeList);
    };

    clickListener();

    const intersectionCallback = (entries, observer) => {
      const intersected = [];
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        intersected.push(target);
      });
      if (intersected.length) QueueMatch.add(intersected);
    };
    const intersectionObserver = new IntersectionObserver(intersectionCallback, { threshold: 0.2 });
    childList.forEach(node => intersectionObserver.observe(node));

    if (!document.querySelector(".pagination .pagination-next")) return;

    const mutationCallback = (mutationsList, observer) => {
      for (const { type, addedNodes } of mutationsList) {
        if (type !== "childList" || !addedNodes.length) continue;
        if (addedNodes.length < 12) observer.disconnect();
        addedNodes.forEach(node => intersectionObserver.observe(node));
      }
    };
    const mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(container, { childList: true, attributes: false, characterData: false });
  }
})();
