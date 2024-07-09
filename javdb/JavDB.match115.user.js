// ==UserScript==
// @name            JavDB.match115
// @namespace       JavDB.match115@blc
// @version         0.0.1
// @author          blc
// @description     115 网盘匹配
// @match           https://javdb.com/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Grant.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Magnet.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Req115.lib.js
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           unsafeWindow
// @grant           GM_openInTab
// @grant           GM_addStyle
// @grant           GM_getValue
// @grant           GM_setValue
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

Util.upStore();

const VOID = "javascript:void(0);";
const TARGET_CLASS = "x-match-item";
const MatchChannel = new BroadcastChannel("Match115");

function listenClick(onTabClose) {
  const ACTION_MAP = {
    click: {
      key: "pc",
      url: "https://v.anxia.com/?pickcode=%s",
    },
    contextmenu: {
      key: "cid",
      url: "https://115.com/?cid=%s&offset=0&tab=&mode=wangpan",
    },
  };

  const handleClick = (e) => {
    const { target } = e;
    if (!target.classList.contains(TARGET_CLASS)) return;

    e.preventDefault();
    e.stopPropagation();

    const action = ACTION_MAP[e.type];
    if (!action) return;

    const val = target.dataset[action.key];
    if (!val) return;

    const tab = Grant.openTab(action.url.replaceAll("%s", val));
    tab.onclose = () => Req115.sleep(0.5).then(() => onTabClose(target));
  };

  document.addEventListener("click", handleClick);
  document.addEventListener("contextmenu", handleClick);
}

(function () {
  const { pathname: PATHNAME } = location;
  if (!PATHNAME.startsWith("/v/")) return;

  const code = document.querySelector(".first-block .value").textContent;
  if (!code) return;

  function createDom() {
    const DOM_ID = "x-match-res";

    const domStr = `
    <div class="panel-block">
      <strong><a href="${VOID}">115资源</a>:</strong>&nbsp;<span class="value" id="${DOM_ID}">查询中...</span>
    </div>
    `;

    GM_addStyle(`
    #${DOM_ID} a {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: unset;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    `);

    document.querySelector(".movie-panel-info .review-buttons+.panel-block").insertAdjacentHTML("afterend", domStr);
    return document.getElementById(DOM_ID);
  }

  const matchResNode = createDom();
  const { codes, regex } = Util.codeParse(code);
  const matchResTarget = matchResNode.parentNode.querySelector("a");

  const TXT = "资源匹配";
  const MID = PATHNAME.split("/").pop();

  const matchCode = () => {
    if (matchResTarget.textContent === TXT) return;
    matchResTarget.textContent = TXT;

    Req115.videosSearch(codes.join(" "))
      .then(({ state, data }) => {
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

        matchResNode.innerHTML = data.reduce((acc, { pc, cid, t, n }) => {
          return `${acc}<a href="${VOID}" class="${TARGET_CLASS}" data-pc="${pc}" data-cid="${cid}" title="[${t}] ${n}">${n}</a>`;
        }, "");
      })
      .finally(() => {
        matchResTarget.textContent = "115资源";
      });
  };

  matchCode();
  listenClick(matchCode);
  unsafeWindow["reMatch"] = matchCode;
  matchResTarget.addEventListener("click", matchCode);
  window.addEventListener("beforeunload", () => MatchChannel.postMessage(MID));
})();

(function () {
  const TARGET_SELECTOR = ".movie-list .item";
  const childList = document.querySelectorAll(TARGET_SELECTOR);
  if (!childList.length) return;

  GM_addStyle(`
  ${TARGET_SELECTOR} .video-title:has(.is-danger, .is-warning, .is-info, .is-success) {
    font-weight: bold;
  }
  ${TARGET_SELECTOR}:has(.video-title .is-danger) {
    border: 0.375rem solid #ee1742;
  }
  ${TARGET_SELECTOR}:has(.video-title .is-warning) {
    border: 0.375rem solid #ffd257;
  }
  ${TARGET_SELECTOR}:has(.video-title .is-info) {
    border: 0.375rem solid #2b74b1;
  }
  ${TARGET_SELECTOR}:has(.video-title .is-success) {
    border: 0.375rem solid #34a873;
  }
  [data-theme="dark"] ${TARGET_SELECTOR}:has(.video-title .is-danger) {
    border-color: #f14668;
  }
  [data-theme="dark"] ${TARGET_SELECTOR}:has(.video-title .is-warning) {
    border-color: #ffe08a;
  }
  [data-theme="dark"] ${TARGET_SELECTOR}:has(.video-title .is-info) {
    border-color: #3e8ed0;
  }
  [data-theme="dark"] ${TARGET_SELECTOR}:has(.video-title .is-success) {
    border-color: #48c78e;
  }
  `);

  class QueueMatch {
    static list = [];
    static lock = false;
    static insertHTML = `<a class="${TARGET_CLASS} tag" href="${VOID}">匹配中</a>&nbsp;`;

    static async add(items) {
      if (!items.length) return;

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
          const titleNode = item.querySelector(".video-title");
          const code = titleNode.querySelector("strong").textContent;
          let tag = titleNode.querySelector(`.${TARGET_CLASS}`);

          if (!tag) {
            item.classList.add(`x-${item.querySelector("a").href.split("/").pop()}`);
            titleNode.insertAdjacentHTML("afterbegin", this.insertHTML);
            tag = titleNode.querySelector(`.${TARGET_CLASS}`);
          }

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
            data.filter(({ n }) => regex.test(n)),
          );
        });
      });
    };

    static setTag(tag, res) {
      let pc = "";
      let cid = "";
      let title = "";
      let textContent = "未匹配";
      let className = "is-normal";

      if (res.length) {
        const zhItem = res.find(({ n }) => Magnet.zhReg.test(n));
        const crackItem = res.find(({ n }) => Magnet.crackReg.test(n));
        const bothItem = res.find(({ n }) => Magnet.zhReg.test(n) && Magnet.crackReg.test(n));
        const currItem = bothItem ?? zhItem ?? crackItem ?? res[0];

        pc = currItem.pc;
        cid = currItem.cid;
        textContent = "已匹配";
        title = `[${currItem.t}] ${currItem.n}`;
        className = bothItem ? "is-danger" : zhItem ? "is-warning" : crackItem ? "is-info" : "is-success";
      }

      tag.title = title;
      tag.dataset.pc = pc;
      tag.dataset.cid = cid;
      tag.textContent = textContent;
      tag.className = `${TARGET_CLASS} tag ${className}`;
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
  MatchChannel.onmessage = ({ data }) => QueueMatch.add(document.querySelectorAll(`.movie-list .x-${data}`));

  const matchPrefix = (target) => {
    const item = target.closest(TARGET_SELECTOR);
    const mid = item.querySelector("a").href.split("/").pop();
    const code = item.querySelector(".video-title strong").textContent;
    const { prefix } = Util.codeParse(code);
    GM_deleteValue(code);

    Req115.videosSearch(prefix).then(({ data }) => {
      data = data.map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));
      GM_setValue(prefix, data);
      QueueMatch.add(document.querySelectorAll(`.movie-list .x-${mid}`));
      MatchChannel.postMessage(mid);
    });
  };

  listenClick(matchPrefix);
  unsafeWindow["reMatch"] = matchPrefix;
})();
