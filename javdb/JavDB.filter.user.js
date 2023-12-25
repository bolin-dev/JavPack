// ==UserScript==
// @name            JavDB.filter
// @namespace       JavDB.filter@blc
// @version         0.0.1
// @author          blc
// @description     影片筛选
// @match           https://javdb.com/*
// @exclude         https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-end
// @grant           GM_addStyle
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const hiddenList = [];
  const highlightList = [];
  if (!hiddenList.length && !highlightList.length) return;

  const nodeList = document.querySelectorAll(".movie-list .item");
  if (!nodeList.length) return;

  GM_addStyle(
    ".is-highlight{position:relative}.is-highlight::after{content:'';position:absolute;inset:0;z-index:-1;margin:-.375rem;border-radius:inherit;background:linear-gradient(45deg, #ff0000, #ff69b4, #ffa500)}",
  );

  const parseNode = (node) => {
    const title = node.querySelector(".video-title");
    const code = title.querySelector("strong").textContent;
    const name = title.textContent.replace(code, "").trim();
    const score = node
      .querySelector(".score .value")
      .textContent.replace(/\u00A0/g, "")
      .trim();
    const date = node.querySelector(".meta").textContent.trim();
    const tags = [...node.querySelectorAll(".tags .tag")].map((tag) => tag.textContent);
    return `[${code}][${name}][${score}][${date}][${tags}]`;
  };

  const filter = (nodeList) => {
    for (const node of nodeList) {
      const res = parseNode(node);

      if (hiddenList.some((item) => item.test(res))) {
        node.classList.add("is-hidden");
        continue;
      }
      if (highlightList.some((item) => item.test(res))) node.classList.add("is-highlight");
    }
  };

  filter(nodeList);
  window.addEventListener("loadmore", ({ detail }) => filter(detail));
})();
