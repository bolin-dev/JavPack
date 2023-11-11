// ==UserScript==
// @name            JavDB.filter
// @namespace       JavDB.filter@blc
// @version         0.0.1
// @author          blc
// @description     影片筛选
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/)/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const hiddenList = [];
  const highlightList = [];
  if (!hiddenList.length && !highlightList.length) return;

  document.addEventListener(
    "DOMContentLoaded",
    ({ target }) => {
      const nodeList = target.querySelectorAll(".movie-list .item");
      if (!nodeList.length) return;

      GM_addStyle(".is-highlight{box-shadow:0 0 0 4px red!important}") && filter(nodeList);
      if (document.querySelector("nav.pagination .pagination-next")) observer();
    },
    { once: true }
  );

  function filter(nodeList) {
    for (const node of nodeList) {
      const res = parseNode(node);

      if (hiddenList.some(item => item.test(res))) {
        node.classList.add("is-hidden");
        continue;
      }
      if (highlightList.some(item => item.test(res))) node.classList.add("is-highlight");
    }
  }

  function parseNode(node) {
    const title = node.querySelector(".video-title");
    const code = title.querySelector("strong").textContent;
    const name = title.textContent.replace(code, "").trim();
    const score = node
      .querySelector(".score .value")
      .textContent.replace(/\u00A0/g, "")
      .trim();
    const date = node.querySelector(".meta").textContent.trim();
    const tags = [...node.querySelectorAll(".tags .tag")].map(tag => tag.textContent);
    return `[${code}][${name}][${score}][${date}][${tags}]`;
  }

  function observer() {
    const mutationObserver = new MutationObserver((mutationsList, observer) => {
      for (const { type, addedNodes } of mutationsList) {
        if (type !== "childList" || !addedNodes?.length) continue;
        if (addedNodes.length < 40) observer.disconnect();
        filter(addedNodes);
      }
    });

    mutationObserver.observe(document.querySelector(".movie-list"), {
      childList: true,
      attributes: false,
      subtree: false,
    });
  }
})();
