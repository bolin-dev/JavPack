// ==UserScript==
// @name            JavDB.match115
// @namespace       JavDB.match115@blc
// @version         0.0.1
// @author          blc
// @description     115网盘匹配
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
// @grant           GM_listValues
// @grant           unsafeWindow
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM_setValue
// ==/UserScript==

Util.upStore();

const TAG_CLASS = "x-match";
const VOID = "javascript:void(0);";
const CHANNEL = new BroadcastChannel("JavDB.match115");

const listenClick = (onclose) => {
  const actions = {
    click: { key: "pc", url: "https://v.anxia.com/?pickcode=%s" },
    contextmenu: { key: "cid", url: "https://115.com/?cid=%s&offset=0&tab=&mode=wangpan" },
  };

  const onclick = (e) => {
    const target = e.target.closest(`.${TAG_CLASS}`);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    const action = actions[e.type];
    if (!action) return;

    const val = target.dataset[action.key];
    if (!val) return;

    const tab = Grant.openTab(action.url.replaceAll("%s", val));
    tab.onclose = onclose;
  };

  document.addEventListener("click", onclick);
  document.addEventListener("contextmenu", onclick);
};

(function () {
  const infoNode = document.querySelector(".movie-panel-info");
  if (!infoNode) return;

  const render = ({ pc, cid, t, n }) => {
    return `<a href="${VOID}" class="${TAG_CLASS}" data-pc="${pc}" data-cid="${cid}" title="[${t}] ${n}">${n}</a>`;
  };

  const matchCode = async ({ code, codes, regex }, cont) => {
    try {
      const { data = [] } = await Req115.filesSearchAllVideos(codes.join(" "));
      const sources = data.filter((item) => regex.test(item.n));
      cont.innerHTML = sources.map(render).join("") || "暂未匹配";
      GM_setValue(code, sources);
    } catch (err) {
      cont.innerHTML = "匹配失败";
      console.warn(err?.message);
    }
  };

  const code = infoNode.querySelector(".first-block .value")?.textContent.trim();
  const codeDetails = Util.codeParse(code);

  const insertHTML = "<div class='panel-block'><strong>115:</strong>&nbsp;<span class='value'>匹配中...</span></div>";
  const positionNode = infoNode.querySelector(".review-buttons + .panel-block");
  positionNode.insertAdjacentHTML("afterend", insertHTML);
  const container = positionNode.nextElementSibling.querySelector(".value");

  matchCode(codeDetails, container);
  listenClick(() => matchCode(codeDetails, container));

  unsafeWindow["reMatch"] = matchCode;
  window.addEventListener("beforeunload", () => CHANNEL.postMessage(codeDetails));
})();

(function () {
  const currList = document.querySelectorAll(".movie-list .item");
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

  const requestQueue = new RequestQueue();
  const inProgressRequests = new Set();
  const waitingList = {};

  const setTarget = ({ regex, node }, result) => {
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

    const tagNode = node.querySelector(`.${TAG_CLASS}`);
    tagNode.title = title;
    tagNode.dataset.pc = pc;
    tagNode.dataset.cid = cid;
    tagNode.textContent = textContent;
    tagNode.className = `tag ${className} ${TAG_CLASS}`;
  };

  const onfinally = (prefix, data) => {
    waitingList[prefix].forEach((item) => setTarget(item, data));
    inProgressRequests.delete(prefix);
    delete waitingList[prefix];
  };

  const handleTarget = (node) => {
    if (node.classList.contains("is-hidden")) return;

    const titleNode = node.querySelector(".video-title");
    if (!titleNode) return;

    const code = titleNode.querySelector("strong")?.textContent.trim();
    if (!code) return;

    titleNode.insertAdjacentHTML("afterbegin", `<a href="${VOID}" class="tag ${TAG_CLASS}">匹配中</a>&nbsp;`);

    const codeDetails = Util.codeParse(code);
    const nodeDetails = { ...codeDetails, node };
    const { prefix } = codeDetails;

    const cachedResult = GM_getValue(code) ?? GM_getValue(prefix);
    if (cachedResult) return setTarget(nodeDetails, cachedResult);

    if (!waitingList[prefix]) waitingList[prefix] = [];
    waitingList[prefix].push(nodeDetails);

    if (inProgressRequests.has(prefix)) return;
    inProgressRequests.add(prefix);

    requestQueue
      .add(() => Req115.filesSearchAllVideos(prefix))
      .then(({ data = [] }) => {
        GM_setValue(prefix, data);
        onfinally(prefix, data);
      })
      .catch((err) => {
        console.warn(err?.message);
        onfinally(prefix, []);
      });
  };

  const callback = (entries, obs) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      obs.unobserve(target);
      handleTarget(target);
    });
  };

  const observer = new IntersectionObserver(callback, { threshold: 0.5 });
  const obList = (list) => list.forEach((node) => observer.observe(node));

  obList(currList);
  window.addEventListener("JavDB.scroll", ({ detail }) => obList(detail));
})();
