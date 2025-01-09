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
// @grant           GM_info
// @require         https://github.com/Tampermonkey/utils/raw/d8a4543a5f828dfa8eefb0a3360859b6fe9c3c34/requires/gh_2215_make_GM_xhr_more_parallel_again.js
// ==/UserScript==

Util.upStore();

const TARGET_CLASS = "x-match";
const VOID = "javascript:void(0);";
const CHANNEL = new BroadcastChannel(GM_info.script.name);

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
    tab.onclose = () => setTimeout(() => onclose?.(target), 1000);
  };

  document.addEventListener("click", onclick);
  document.addEventListener("contextmenu", onclick);
};

const formatBytes = (bytes, k = 1024) => {
  if (bytes < k) return "0KB";
  const units = ["KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)) - 1, units.length - 1);
  const size = (bytes / Math.pow(k, i + 1)).toFixed(2);
  return `${size}${units[i]}`;
};

const extractData = (data, keys = ["pc", "cid", "n", "s", "t"]) => {
  return data.map((obj) => Object.assign({}, ...keys.map((key) => ({ [key]: obj[key] }))));
};

(function () {
  const CONT = document.querySelector(".movie-panel-info");
  if (!CONT) return;

  const render = ({ pc, cid, n, s, t }) => {
    return `
    <a
      href="${VOID}"
      class="${TARGET_CLASS}"
      data-pc="${pc}"
      data-cid="${cid}"
      title="${n} - ${formatBytes(s)} / ${t}"
    >
      ${n}
    </a>`;
  };

  const matchCode = async ({ code, codes, regex }, { load, cont }) => {
    const loadTxt = load.dataset.loadTxt;
    const currTxt = load.textContent;
    if (currTxt === loadTxt) return;
    load.textContent = loadTxt;

    try {
      const { data = [] } = await Req115.filesSearchVideosAll(codes.join(" "));
      const sources = extractData(data.filter((it) => regex.test(it.n)));
      cont.innerHTML = sources.map(render).join("") || "暂无匹配";
      GM_setValue(code, sources);
    } catch (err) {
      cont.innerHTML = "匹配失败";
      Util.print(err?.message);
    }

    load.textContent = currTxt;
  };

  const addBlock = () => {
    const load = `${TARGET_CLASS}-load`;
    const cont = `${TARGET_CLASS}-cont`;

    CONT.querySelector(".review-buttons + .panel-block").insertAdjacentHTML(
      "afterend",
      `<div class="panel-block">
        <strong><a href="${VOID}" class="${load}" data-load-txt="加载中">115</a>:</strong>
        &nbsp;<span class="value ${cont}">匹配中...</span>
      </div>`,
    );

    return {
      load: CONT.querySelector(`.${load}`),
      cont: CONT.querySelector(`.${cont}`),
    };
  };

  const code = CONT.querySelector(".first-block .value").textContent.trim();
  const codeDetails = Util.codeParse(code);
  const block = addBlock();

  window.addEventListener("beforeunload", () => CHANNEL.postMessage(code));
  const matcher = () => matchCode(codeDetails, block);
  block.load.addEventListener("click", matcher);
  unsafeWindow["reMatch"] = matcher;
  listenClick(matcher);
  matcher();
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
  const TARGET_HTML = `<a href="${VOID}" class="tag is-normal ${TARGET_CLASS}">匹配中</a>`;

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
      .add(() => Req115.filesSearchVideosAll(prefix))
      .then(({ data = [] }) => {
        const sources = extractData(data);
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

    Req115.filesSearchVideosAll(prefix)
      .then(({ data = [] }) => {
        const sources = extractData(data);
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
