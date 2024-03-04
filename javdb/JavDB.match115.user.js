// ==UserScript==
// @name            JavDB.match115
// @namespace       JavDB.match115@blc
// @version         0.0.1
// @author          blc
// @description     115 网盘匹配
// @match           https://javdb.com/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Grant.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Magnet.lib.js
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
// @grant           GM_info
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

Util.upStore();

const SELECTOR = "x-match-item";
const VOID = "javascript:void(0);";
const DriveChannel = new BroadcastChannel("match115.refresh");

function listenClick(tabClose) {
  const eventCfg = {
    click: { key: "pc", url: "https://v.anxia.com/?pickcode=%s" },
    contextmenu: { key: "cid", url: "https://115.com/?cid=%s&offset=0&tab=&mode=wangpan" },
  };

  const handleClose = async (target) => {
    await Req115.sleep(0.5);
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

    const tab = Grant.openTab(config.url.replaceAll("%s", val));
    tab.onclose = () => handleClose(target);
  };

  document.addEventListener("click", handleClick);
  document.addEventListener("contextmenu", handleClick);
}

(function () {
  const { pathname } = location;
  if (!pathname.startsWith("/v/")) return;

  function createDom() {
    const domId = "x-match-res";

    const domStr = `
    <div class="panel-block">
      <strong>115资源:</strong>&nbsp;<span class="value" id="${domId}">查询中...</span>
    </div>
    `;

    GM_addStyle(`
    #${domId} a {
      display: -webkit-box;
      overflow: hidden;
      white-space: unset;
      text-overflow: ellipsis;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      word-break: break-all;
    }
    `);

    document.querySelector(".movie-panel-info .review-buttons").insertAdjacentHTML("afterend", domStr);
    return document.querySelector(`#${domId}`);
  }

  const matchResNode = createDom();
  const code = document.querySelector(".first-block .value").textContent;
  const { codes, regex } = Util.codeParse(code);

  const matchCode = () => {
    Req115.videosSearch(codes.join(" ")).then(({ state, data }) => {
      if (!state) {
        matchResNode.innerHTML = "查询失败，检查登录状态";
        return;
      }

      data = data.filter((item) => regex.test(item.n)).map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));
      GM_setValue(code, data);

      if (!data.length) {
        matchResNode.innerHTML = "暂无资源";
        return;
      }

      matchResNode.innerHTML = data.reduce(
        (acc, { pc, cid, t, n }) =>
          `${acc}<a href="${VOID}" class="${SELECTOR}" data-pc="${pc}" data-cid="${cid}" title="[${t}] ${n}">${n}</a>`,
        "",
      );
    });
  };

  matchCode();
  listenClick(matchCode);
  unsafeWindow["match115.matchCode"] = matchCode;
  window.addEventListener("beforeunload", () => DriveChannel.postMessage(pathname.split("/").pop()));
})();

(function () {
  const selector = ".movie-list .item";
  const childList = document.querySelectorAll(selector);
  if (!childList.length) return;

  GM_addStyle(`
  ${selector}:has(.video-title .is-success) {
    border: .375rem solid #34a873;
  }
  ${selector}:has(.video-title .is-warning) {
    border: .375rem solid #ffd257;
  }
  [data-theme="dark"] ${selector}:has(.video-title .is-success) {
    border-color: #48c78e;
  }
  [data-theme="dark"] ${selector}:has(.video-title .is-warning) {
    border-color: #ffe08a;
  }
  `);

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
      await this.handleQueue();
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

    static async handleQueue() {
      const prefixMap = this.list
        .splice(0)
        .filter(this.handleFilter)
        .reduce((acc, { prefix, ...item }) => {
          acc[prefix] ??= [];
          acc[prefix].push(item);
          return acc;
        }, {});

      await Promise.allSettled(Object.entries(prefixMap).map(this.handleMatch));
      if (this.list.length) return this.handleQueue();
    }

    static handleMatch = ([prefix, list]) => {
      return Req115.videosSearch(prefix).then(({ data }) => {
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
        const zhRes = res.find((item) => Magnet.zhReg.test(item.n));
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

  function createObserver() {
    const callback = (entries, observer) => {
      const intersected = [];
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        intersected.push(target);
      });
      QueueMatch.add(intersected);
    };

    const observer = new IntersectionObserver(callback, { threshold: 0.2 });
    return (nodeList) => nodeList.forEach((node) => observer.observe(node));
  }
  const insertQueue = createObserver();

  insertQueue(childList);
  window.addEventListener("scroll.loadmore", ({ detail }) => insertQueue(detail));
  DriveChannel.onmessage = ({ data }) => QueueMatch.add(document.querySelectorAll(`.movie-list .x-${data}`));

  const refresh = (target) => {
    const item = target.closest(".item");

    const cls = item.className.split(" ").find((cls) => cls.startsWith("x-"));
    const code = item.querySelector(".video-title strong").textContent;
    const { prefix } = Util.codeParse(code);

    GM_deleteValue(code);
    GM_deleteValue(prefix);
    QueueMatch.add(document.querySelectorAll(`.movie-list .${cls}`));
  };
  listenClick(refresh);
})();
