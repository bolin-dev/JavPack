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
// ==/UserScript==

Util.upStore();

const VOID = "javascript:void(0);";
const TARGET_CLASS = "x-match-item";
const MatchChannel = new BroadcastChannel("Match115");

function listenClick(onTabClose) {
  const ACS = {
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

    const action = ACS[e.type];
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

  const MID = PATHNAME.split("/").pop();
  const ORIGIN_TXT = "115资源";
  const LOAD_TXT = "资源匹配";

  function createDom() {
    const LABEL_ID = "x-match-label";
    const CONTAINER_ID = "x-match-res";

    GM_addStyle(`
    #${CONTAINER_ID} .${TARGET_CLASS} {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: unset;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    `);

    document.querySelector(".movie-panel-info .review-buttons+.panel-block").insertAdjacentHTML(
      "afterend",
      `<div class="panel-block">
        <strong><a href="${VOID}" id="${LABEL_ID}">${ORIGIN_TXT}</a>:</strong>&nbsp;<span class="value" id="${CONTAINER_ID}">匹配中...</span>
      </div>`,
    );

    return {
      label: document.getElementById(LABEL_ID),
      container: document.getElementById(CONTAINER_ID),
    };
  }

  const { label, container } = createDom();
  const { codes, regex } = Util.codeParse(code);

  const matchCode = () => {
    if (label.textContent === LOAD_TXT) return;
    label.textContent = LOAD_TXT;

    Req115.videosSearch(codes.join(" "))
      .then(({ state, data }) => {
        if (!state) {
          container.innerHTML = "查询失败，检查登录状态";
          return;
        }

        data = data.filter((item) => regex.test(item.n)).map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));
        GM_setValue(code, data);

        if (!data.length) {
          container.innerHTML = "暂无资源";
          return;
        }

        container.innerHTML = data.reduce((acc, { pc, cid, t, n }) => {
          return `${acc}<a href="${VOID}" class="${TARGET_CLASS}" data-pc="${pc}" data-cid="${cid}" title="[${t}] ${n}">${n}</a>`;
        }, "");
      })
      .finally(() => {
        label.textContent = ORIGIN_TXT;
      });
  };

  matchCode();
  listenClick(matchCode);
  unsafeWindow["reMatch"] = matchCode;
  label.addEventListener("click", matchCode);
  window.addEventListener("beforeunload", () => MatchChannel.postMessage(MID));
})();

(function () {
  const TARGET_SELECTOR = ".movie-list .item";
  const childList = document.querySelectorAll(TARGET_SELECTOR);
  if (!childList.length) return;

  GM_addStyle(`
  ${TARGET_SELECTOR} a:has(a.is-danger, a.is-warning, a.is-info, a.is-success) {
    &:active,
    &:hover,
    &:focus,
    &:focus-visible {
      box-shadow: none !important;
    }
    .video-title {
      font-weight: bold;
    }
  }
  .movie-list:has(.item) {
    --x-danger: #ee1742;
    --x-warning: #ffd257;
    --x-info: #2b74b1;
    --x-success: #34a873;
  }
  [data-theme="dark"] .movie-list:has(.item) {
    --x-danger: #f14668;
    --x-warning: #ffe08a;
    --x-info: #3e8ed0;
    --x-success: #48c78e;
  }
  ${TARGET_SELECTOR}:has(.video-title a.is-danger) {
    border: 0.375rem solid var(--x-danger);
  }
  ${TARGET_SELECTOR}:has(.video-title a.is-warning) {
    border: 0.375rem solid var(--x-warning);
  }
  ${TARGET_SELECTOR}:has(.video-title a.is-info) {
    border: 0.375rem solid var(--x-info);
  }
  ${TARGET_SELECTOR}:has(.video-title a.is-success) {
    border: 0.375rem solid var(--x-success);
  }
  `);

  class QueueMatch {
    static list = [];
    static lock = false;
    static insertHTML = `<a class="${TARGET_CLASS} tag" href="${VOID}">匹配中</a>&nbsp;`;

    static async add(items) {
      if (!items?.length) return;

      items = this.handleBefore(items);
      if (!items.length) return;

      this.list.push(...items);
      if (this.lock) return;

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
  const addObserver = createObserver();

  addObserver(childList);
  window.addEventListener("JavDB.scroll", ({ detail }) => addObserver(detail));
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
