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

  GM_addStyle(`
  .is-highlight {
    position: relative;

    &::after {
      position: absolute;
      inset: 0;
      z-index: -1;
      margin: -0.375rem;
      content: "";
      background: linear-gradient(45deg, #f00, #ff69b4, #ffa500);
      border-radius: inherit;
    }
  }
  `);

  const parseNode = (node) => {
    const titleNode = node.querySelector(".video-title");
    const code = titleNode.querySelector("strong").textContent;
    const title = titleNode.textContent.split(code).pop().trim();
    const score = node
      .querySelector(".score .value")
      .textContent.replace(/\u00A0/g, "")
      .trim();
    const date = node.querySelector(".meta").textContent.trim();
    const tags = [...node.querySelectorAll(".tags .tag")].map((tag) => tag.textContent);
    return `[${code}][${title}][${score}][${date}][${tags}]`;
  };

  const filter = (nodeList) => {
    for (const node of nodeList) {
      const parseStr = parseNode(node);

      if (hiddenList.some((item) => item.test(parseStr))) {
        node.classList.add("is-hidden");
        continue;
      }
      if (highlightList.some((item) => item.test(parseStr))) node.classList.add("is-highlight");
    }
  };

  filter(nodeList);
  window.addEventListener("scroll.loadmore", ({ detail }) => filter(detail));
})();
