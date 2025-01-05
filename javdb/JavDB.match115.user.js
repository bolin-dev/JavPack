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
// @grant           GM_deleteValues
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           unsafeWindow
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_setValue
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

Util.upStore();

const VOID = "javascript:void(0);";
const CHANNEL = new BroadcastChannel("JavDB.match115");
const TARGET_CLASS = "x-match";

const listenClick = (onclose) => {
  const actions = {
    click: { key: "pc", url: "https://v.anxia.com/?pickcode=%s" },
    contextmenu: { key: "cid", url: "https://115.com/?cid=%s&offset=0&tab=&mode=wangpan" },
  };

  const onclick = (e) => {
    if (!e.target.classList.contains(TARGET_CLASS)) return;
    e.preventDefault();
    e.stopPropagation();

    const { type, target } = e;
    const action = actions[type];
    if (!action) return;

    const val = target.dataset[action.key];
    if (!val) return;

    const tab = Grant.openTab(action.url.replaceAll("%s", val));
    tab.onclose = () => onclose?.(target);
  };

  document.addEventListener("click", onclick);
  document.addEventListener("contextmenu", onclick);
};

const extractSearchResult = (sources) => sources.map(({ pc, cid, t, n }) => ({ pc, cid, t, n }));

(function () {
  const infoNode = document.querySelector(".movie-panel-info");
  if (!infoNode) return;

  const render = ({ pc, cid, t, n }) => {
    return `<a href="${VOID}" class="${TARGET_CLASS}" data-pc="${pc}" data-cid="${cid}" title="[${t}] ${n}">${n}</a>`;
  };

  const matchCode = async ({ code, codes, regex }, cont) => {
    try {
      const { data = [] } = await Req115.filesSearchAllVideos(codes.join(" "));
      const sources = extractSearchResult(data.filter(({ n }) => regex.test(n)));
      GM_setValue(code, sources);
      cont.innerHTML = sources.map(render).join("") || "暂未匹配";
    } catch (err) {
      cont.innerHTML = "匹配失败";
      console.warn(err?.message);
    }
  };

  const code = infoNode.querySelector(".first-block .value").textContent.trim();
  const codeDetails = Util.codeParse(code);

  const insertHTML = "<div class='panel-block'><strong>115:</strong>&nbsp;<span class='value'>匹配中...</span></div>";
  const positionNode = infoNode.querySelector(".review-buttons + .panel-block");
  positionNode.insertAdjacentHTML("afterend", insertHTML);
  const container = positionNode.nextElementSibling.querySelector(".value");

  matchCode(codeDetails, container);
  listenClick(() => matchCode(codeDetails, container));

  unsafeWindow["reMatch"] = () => matchCode(codeDetails, container);
  window.addEventListener("beforeunload", () => CHANNEL.postMessage(code));
})();

(function () {
  const SELECTOR = ".movie-list .item";
  const currList = document.querySelectorAll(SELECTOR);
  if (!currList.length) return;

  class RequestQueue {
    constructor() {
      this.queue = [];
      this.isProcessing = false;
    }

    add(requestFn) {
      return new Promise((resolve, reject) => {
        this.queue.push({ requestFn, resolve, reject });
        this.processQueue();
      });
    }

    processQueue() {
      if (this.isProcessing || this.queue.length === 0) return;
      const nextRequest = this.queue.shift();
      this.isProcessing = true;

      nextRequest
        .requestFn()
        .then(nextRequest.resolve)
        .catch(nextRequest.reject)
        .finally(() => {
          this.isProcessing = false;
          this.processQueue();
        });
    }
  }

  const inProgressRequests = new Set();
  const requestQueue = new RequestQueue();
  const waitingList = {};
  const TARGET_HTML = `<a href="${VOID}" class="tag is-normal ${TARGET_CLASS}">匹配中</a>&nbsp;`;

  const parseCodeClass = (code) => ["x", ...code.split(/\s|\./)].filter(Boolean).join("-");

  const setTarget = ({ code, regex, node }, result) => {
    const sources = result.filter((item) => regex.test(item.n));

    let pc = "";
    let cid = "";
    let title = "";
    let textContent = "未匹配";
    let className = "is-normal";

    if (sources.length) {
      const bothItem = sources.find(({ n }) => Magnet.zhReg.test(n) && Magnet.crackReg.test(n));
      const zhItem = sources.find(({ n }) => Magnet.zhReg.test(n));
      const crackItem = sources.find(({ n }) => Magnet.crackReg.test(n));
      const currItem = bothItem ?? zhItem ?? crackItem ?? sources[0];

      pc = currItem.pc;
      cid = currItem.cid;
      textContent = "已匹配";
      title = `[${currItem.t}] ${currItem.n}`;
      className = bothItem ? "is-danger" : zhItem ? "is-warning" : crackItem ? "is-info" : "is-success";
    }

    node.classList.add(parseCodeClass(code));
    const tagNode = node.querySelector(`.${TARGET_CLASS}`);
    tagNode.title = title;
    tagNode.dataset.pc = pc;
    tagNode.dataset.cid = cid;
    tagNode.textContent = textContent;
    tagNode.className = `tag ${className} ${TARGET_CLASS}`;
  };

  const onfinally = (prefix, data) => {
    waitingList[prefix].forEach((details) => setTarget(details, data));
    inProgressRequests.delete(prefix);
    delete waitingList[prefix];
  };

  const handleTarget = (node) => {
    if (node.classList.contains("is-hidden")) return;

    const titleNode = node.querySelector(".video-title");
    if (!titleNode) return;

    const code = titleNode.querySelector("strong")?.textContent.trim();
    if (!code) return;

    if (!titleNode.querySelector(`.${TARGET_CLASS}`)) titleNode.insertAdjacentHTML("afterbegin", TARGET_HTML);

    const { prefix, ...codeDetails } = Util.codeParse(code);
    const nodeDetails = { ...codeDetails, node };

    const cachedResult = GM_getValue(code) ?? GM_getValue(prefix);
    if (cachedResult) return setTarget(nodeDetails, cachedResult);

    if (!waitingList[prefix]) waitingList[prefix] = [];
    waitingList[prefix].push(nodeDetails);

    if (inProgressRequests.has(prefix)) return;
    inProgressRequests.add(prefix);

    requestQueue
      .add(() => Req115.filesSearchAllVideos(prefix))
      .then(({ data = [] }) => {
        const sources = extractSearchResult(data);
        GM_setValue(prefix, sources);
        onfinally(prefix, sources);
      })
      .catch((err) => {
        console.warn(err?.message);
        onfinally(prefix, []);
      });
  };

  const intersectionCallback = (entries, obs) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      obs.unobserve(target);
      handleTarget(target);
    });
  };

  const intersectionOptions = { threshold: 0.5 };
  const intersectionObserver = new IntersectionObserver(intersectionCallback, intersectionOptions);
  const observeNodeList = (nodeList) => nodeList.forEach((node) => intersectionObserver.observe(node));

  observeNodeList(currList);
  window.addEventListener("JavDB.scroll", ({ detail }) => observeNodeList(detail));
  CHANNEL.onmessage = ({ data: code }) => observeNodeList(document.querySelectorAll(`.${parseCodeClass(code)}`));

  const matchPrefix = (target) => {
    const code = target.closest(SELECTOR)?.querySelector(".video-title strong")?.textContent.trim();
    if (!code) return;

    const { prefix } = Util.codeParse(code);

    Req115.filesSearchAllVideos(prefix)
      .then(({ data = [] }) => {
        const sources = extractSearchResult(data);
        GM_setValue(prefix, sources);
        GM_deleteValue(code);

        observeNodeList(document.querySelectorAll(`.${parseCodeClass(code)}`));
        CHANNEL.postMessage(code);
      })
      .catch((err) => console.warn(err?.message));
  };

  listenClick(matchPrefix);
  unsafeWindow["reMatch"] = matchPrefix;
})();
