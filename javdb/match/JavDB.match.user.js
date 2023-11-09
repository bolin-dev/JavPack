// ==UserScript==
// @name            JavDB.match
// @namespace       JavDB.match@blc
// @version         0.0.1
// @author          blc
// @description     列表匹配
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/)/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/request/JavPack.request.lib.js
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/drive/JavPack.drive.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @connect         115.com
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_getValue
// @grant           GM_setValue
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const date = new Date().getDate();
  if (GM_getValue("CD", "") !== date) {
    for (const key of GM_listValues()) GM_deleteValue(key);
    GM_setValue("CD", date);
  }

  const container = document.querySelector(".movie-list");
  if (!container) return;

  const childList = container.querySelectorAll(".item");
  if (!childList.length) return;

  const insertHTML = '<a class="tag is-info" href="javascript:void(0);" target="_blank">查询中</a>&nbsp;';
  const parseList = [];
  let loading = false;

  matchTask(childList);

  async function matchTask(nodeList) {
    for (const node of nodeList) {
      node.classList.add(`x-${node.querySelector("a").href.split("/").pop()}`);
      const titleNode = node.querySelector(".video-title");
      const code = titleNode.querySelector("strong")?.textContent;

      titleNode.insertAdjacentHTML("afterbegin", insertHTML);
      parseList.push({ ...codeParse(code), node });
    }

    if (loading) return;
    loading = true;

    while (parseList.length) {
      const item = parseList.shift();
      await matchItem(item);
    }

    loading = false;
  }

  async function matchItem({ prefix, regex, node }) {
    let res = GM_getValue(prefix);

    if (!res) {
      res = (await filesSearch(prefix))?.data;
      if (Array.isArray(res)) GM_setValue(prefix, res);
    }
    res = res?.find(item => regex.test(item.n));

    const tag = node.querySelector(".video-title .tag");
    if (!res) {
      tag.textContent = "未匹配";
      return tag.classList.remove("is-info");
    }

    tag.textContent = "已离线";
    tag.classList.replace("is-info", "is-success");
    tag.href = `https://v.anxia.com/?pickcode=${res.pc}`;
  }

  if (!document.querySelector("nav.pagination .pagination-next")) return;

  const callback = (mutationsList, observer) => {
    for (const { type, addedNodes } of mutationsList) {
      if (type !== "childList" || !addedNodes?.length) continue;
      if (addedNodes.length < 12) observer.disconnect();
      matchTask(addedNodes);
    }
  };
  const mutationObserver = new MutationObserver(callback);
  mutationObserver.observe(container, { childList: true, attributes: false });
})();
