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

const TARGET_CLASS = "x-match";
const VOID = "javascript:void(0);";
const CHANNEL = new BroadcastChannel("JavDB.match115");

const { pathname: PATHNAME } = location;
const IS_DETAIL = PATHNAME.startsWith("/v/");

const listenClick = (onclose) => {
  const actions = {
    click: {
      key: "pc",
      url: "https://v.anxia.com/?pickcode=%s",
    },
    contextmenu: {
      key: "cid",
      url: "https://115.com/?cid=%s&offset=0&tab=&mode=wangpan",
    },
  };

  const onclick = (e) => {
    const target = e.target.closest(`.${TARGET_CLASS}`);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    const action = actions[e.type];
    if (!action) return;

    const val = target.dataset[action.key];
    if (!val) return;

    const tab = Grant.openTab(action.url.replaceAll("%s", val));
    tab.onclose = () => Req115.sleep(0.5).then(() => onclose(target));
  };

  document.addEventListener("click", onclick);
  document.addEventListener("contextmenu", onclick);
};

(function () {
  if (!IS_DETAIL) return;
  const MID = PATHNAME.split("/").pop();

  const code = document.querySelector(".first-block .value").textContent;
  if (!code) return;

  const { codes, regex } = Util.codeParse(code);
  const ORIGIN_TXT = "115资源";
  const LOAD_TXT = "资源匹配";

  const insertMatch = () => {
    GM_addStyle(`
    .${TARGET_CLASS} {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: unset;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    `);

    const matchTxt = `
    <div class="panel-block">
      <strong><a href="${VOID}">${ORIGIN_TXT}</a>:</strong>&nbsp;
      <span class="value">匹配中...</span>
    </div>
    `;

    const positionNode = document.querySelector(".movie-panel-info > .review-buttons + .panel-block");
    positionNode.insertAdjacentHTML("afterend", matchTxt);
    const matchNode = positionNode.nextElementSibling;

    return {
      labelNode: matchNode.querySelector("a"),
      contentNode: matchNode.querySelector(".value"),
    };
  };

  const { labelNode, contentNode } = insertMatch();

  const create = ({ pc, cid, t, n }) => {
    return `<a href="${VOID}" class="${TARGET_CLASS}" data-pc="${pc}" data-cid="${cid}" title="[${t}] ${n}">${n}</a>`;
  };

  const onload = ({ state, data }) => {
    if (!state) {
      contentNode.innerHTML = "查询失败，检查登录状态";
      return;
    }

    data = data.filter((item) => regex.test(item.n)).map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));
    GM_setValue(code, data);

    if (!data.length) {
      contentNode.innerHTML = "暂无资源";
      return;
    }

    contentNode.innerHTML = data.map(create).join("");
  };

  const onfinally = () => {
    labelNode.textContent = ORIGIN_TXT;
  };

  const matchCode = () => {
    if (labelNode.textContent === LOAD_TXT) return;
    labelNode.textContent = LOAD_TXT;

    Req115.videosSearch(codes.join(" ")).then(onload).finally(onfinally);
  };

  matchCode();
  listenClick(matchCode);
  unsafeWindow["reMatch"] = matchCode;
  labelNode.addEventListener("click", matchCode);
  window.addEventListener("beforeunload", () => CHANNEL.postMessage(MID));
})();

(function () {
  if (IS_DETAIL) return;

  const MOVIE_SELECTOR = ".movie-list .item";
  const movieNodeList = document.querySelectorAll(MOVIE_SELECTOR);
  if (!movieNodeList.length) return;

  const insertMatch = (nodeList) => {
    const matchTxt = `<a href="${VOID}" class="${TARGET_CLASS} tag">匹配中</a>&nbsp;`;
    const insert = (node) => node.querySelector(".video-title").insertAdjacentHTML("afterbegin", matchTxt);
    nodeList.forEach(insert);
  };

  const useQueryMatch = () => {
    let lock = false;
    let queue = [];

    const getList = (nodeList) => {
      return [...nodeList].map((node) => {
        const mid = node.querySelector("a").href.split("/").pop();
        const titleNode = node.querySelector(".video-title");
        const tagNode = titleNode.querySelector(`.${TARGET_CLASS}`);
        const code = titleNode.querySelector("strong").textContent;
        const { prefix, regex } = Util.codeParse(code);
        return { code, prefix, node, mid, regex, tagNode };
      });
    };

    const setMatch = ({ node, mid, regex, tagNode }, res) => {
      node.classList.add(`x-${mid}`);
      res = res.filter((item) => regex.test(item.n));

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

      tagNode.title = title;
      tagNode.dataset.pc = pc;
      tagNode.dataset.cid = cid;
      tagNode.textContent = textContent;
      tagNode.className = `${TARGET_CLASS} tag ${className}`;
    };

    const localMatch = (list) => {
      return list.filter(({ code, prefix, ...item }) => {
        const res = GM_getValue(code) ?? GM_getValue(prefix);
        return res ? setMatch(item, res) : true;
      });
    };

    const queryMatch = ([prefix, list]) => {
      return Req115.videosSearch(prefix).then(({ data }) => {
        data = data.map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));
        GM_setValue(prefix, data);
        list.forEach((item) => setMatch(item, data));
      });
    };

    const takeQueue = async () => {
      const tasks = localMatch(queue.splice(0, 3));
      const prefixMap = tasks.reduce((acc, { prefix, ...item }) => {
        acc[prefix] ??= [];
        acc[prefix].push(item);
        return acc;
      }, {});

      await Promise.allSettled(Object.entries(prefixMap).map(queryMatch));
      if (queue.length) return takeQueue();
    };

    return async (nodeList) => {
      if (!nodeList?.length) return;

      if (typeof nodeList === "string") nodeList = document.querySelectorAll(`.movie-list .x-${nodeList}`);
      if (!nodeList.length) return;

      const list = getList(nodeList);
      const tasks = localMatch(list);
      if (!tasks.length) return;

      queue.push(...tasks);
      if (lock) return;

      lock = true;
      await takeQueue();
      lock = false;
    };
  };

  const addQueue = useQueryMatch();

  const observer = (onIntersected) => {
    const callback = (entries, observer) => {
      const intersected = [];

      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        intersected.push(target);
      });

      onIntersected(intersected);
    };

    const observer = new IntersectionObserver(callback, { threshold: 0.2 });
    const observe = (nodeList) => nodeList.forEach((node) => observer.observe(node));

    observe(movieNodeList);
    window.addEventListener("JavDB.scroll", ({ detail }) => observe(detail));
  };

  observer((nodeList) => {
    insertMatch(nodeList);
    addQueue(nodeList);
  });

  CHANNEL.onmessage = ({ data }) => addQueue(data);

  const matchPrefix = (target) => {
    const node = target.closest(MOVIE_SELECTOR);
    const mid = node.querySelector("a").href.split("/").pop();
    const code = node.querySelector(".video-title strong").textContent;
    const { prefix } = Util.codeParse(code);
    GM_deleteValue(code);

    Req115.videosSearch(prefix).then(({ data }) => {
      data = data.map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));
      GM_setValue(prefix, data);

      addQueue(mid);
      CHANNEL.postMessage(mid);
    });
  };

  listenClick(matchPrefix);
  unsafeWindow["reMatch"] = matchPrefix;
})();
