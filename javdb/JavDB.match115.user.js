// ==UserScript==
// @name            JavDB.match115
// @namespace       JavDB.match115@blc
// @version         0.0.1
// @author          blc
// @description     115 网盘匹配
// @match           https://javdb.com/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util115.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           unsafeWindow
// @grant           GM_openInTab
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  Util.upStore();

  const SELECTOR = "x-match-item";
  const VOID = "javascript:void(0);";
  const DriveChannel = new BroadcastChannel("DriveChannel");

  const listenClick = (tabClose) => {
    const eventCfg = {
      click: { key: "pc", url: "https://v.anxia.com/?pickcode=%s" },
      contextmenu: { key: "cid", url: "https://115.com/?cid=%s&offset=0&tab=&mode=wangpan" },
    };

    const handleClose = async (target) => {
      await Util115.sleep();
      tabClose(target);
    };

    const handleClick = (e) => {
      const { target } = e;
      if (!target.classList.contains(SELECTOR)) return;

      e.preventDefault();
      e.stopPropagation();

      const config = eventCfg[e.type];
      if (!config) return;

      const val = target.dataset[config.key];
      if (!val) return;

      const tab = Util.openTab(config.url.replace("%s", val));
      tab.onclose = () => handleClose(target);
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("contextmenu", handleClick);
  };

  const { pathname } = location;
  if (pathname.startsWith("/v/")) {
    window.addEventListener("beforeunload", () => DriveChannel.postMessage(pathname.split("/").pop()));

    GM_addStyle(
      "#x-match-res a{display:-webkit-box;overflow:hidden;white-space:unset;text-overflow:ellipsis;-webkit-line-clamp:1;-webkit-box-orient:vertical;word-break:break-all}",
    );

    const infoNode = document.querySelector(".movie-panel-info");
    infoNode.insertAdjacentHTML(
      "beforeend",
      '<div class="panel-block"><strong>115 资源:</strong>&nbsp;<span class="value" id="x-match-res">查询中...</span></div>',
    );

    const matchResNode = infoNode.querySelector("#x-match-res");
    const code = infoNode.querySelector(".first-block .value").textContent;
    const { codes, regex } = Util.codeParse(code);

    const matchResource = () => {
      return Util115.videosSearch(codes.join(" ")).then(({ state, data }) => {
        if (!state) {
          matchResNode.textContent = "查询失败，请检查登录状态";
          return;
        }

        data = data.filter((item) => regex.test(item.n)).map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));
        GM_setValue(code, data);

        if (!data.length) {
          matchResNode.textContent = "暂无资源";
          return;
        }

        matchResNode.innerHTML = data
          .map(
            ({ pc, cid, t, n }) =>
              `<a href="${VOID}" class="${SELECTOR}" data-pc="${pc}" data-cid="${cid}" title="[${t}] ${n}">${n}</a>`,
          )
          .join("");
      });
    };

    unsafeWindow.match115Resource = matchResource;
    listenClick(matchResource);
    return matchResource();
  }

  const childList = document.querySelectorAll(".movie-list .item");
  if (!childList.length) return;

  class QueueMatch {
    static list = [];
    static lock = false;
    static insertHTML = `<a class="${SELECTOR} tag is-normal" href="${VOID}">匹配中</a>&nbsp;`;

    static async add(items) {
      items = this.handleBefore(items);
      if (!items.length) return;

      this.list.push(...items);
      if (this.lock || !this.list.length) return;

      this.lock = true;
      await this.handleMatch();
      this.lock = false;
    }

    static handleBefore(items) {
      return [...items]
        .map((item) => {
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
      const res = GM_getValue(code) ?? GM_getValue(prefix);
      if (!res) return true;

      this.setTag(
        tag,
        res.filter((item) => regex.test(item.n)),
      );
    };

    static async handleMatch() {
      const prefixMap = this.list
        .splice(0)
        .filter(this.handleFilter)
        .reduce((acc, { prefix, ...item }) => {
          acc[prefix] ??= [];
          acc[prefix].push(item);
          return acc;
        }, {});

      await Promise.allSettled(Object.entries(prefixMap).map(this.handleMatchPrefix));
      if (this.list.length) return this.handleMatch();
    }

    static handleMatchPrefix = ([prefix, list]) => {
      return Util115.videosSearch(prefix).then(({ data }) => {
        data = data.map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));
        GM_setValue(prefix, data);

        list.forEach(({ tag, regex }) => {
          this.setTag(
            tag,
            data.filter((item) => regex.test(item.n)),
          );
        });
      });
    };

    static setTag(tag, res) {
      let textContent = "未匹配";
      let title = "";
      let pc = "";
      let cid = "";
      let className = "";

      if (res.length) {
        const zhRes = res.find((item) => Util.zhReg.test(item.n));
        const item = zhRes ?? res[0];

        textContent = "已匹配";
        title = `[${item.t}] ${item.n}`;
        pc = item.pc;
        cid = item.cid;
        className = zhRes ? "is-warning" : "is-success";
      }

      tag.textContent = textContent;
      tag.title = title;
      tag.dataset.pc = pc;
      tag.dataset.cid = cid;
      tag.setAttribute("class", `${SELECTOR} tag is-normal ${className}`);
    }
  }

  const tabClose = (target) => {
    const item = target.closest(".item");

    const cls = item.className.split(" ").find((cls) => cls.startsWith("x-"));
    const code = item.querySelector(".video-title strong").textContent;
    const { prefix } = Util.codeParse(code);

    GM_deleteValue(code);
    GM_deleteValue(prefix);
    QueueMatch.add(document.querySelectorAll(`.movie-list .${cls}`));
  };
  listenClick(tabClose);

  DriveChannel.onmessage = ({ data }) => QueueMatch.add(document.querySelectorAll(`.movie-list .x-${data}`));

  const intersectionCallback = (entries, observer) => {
    const intersected = [];
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      intersected.push(target);
    });
    QueueMatch.add(intersected);
  };
  const intersectionObserver = new IntersectionObserver(intersectionCallback, { threshold: 0.2 });

  childList.forEach((node) => intersectionObserver.observe(node));
  window.addEventListener("loadmore", ({ detail }) => detail.forEach((node) => intersectionObserver.observe(node)));
})();
