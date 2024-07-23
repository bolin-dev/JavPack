// ==UserScript==
// @name            JavDB.filter
// @namespace       JavDB.filter@blc
// @version         0.0.1
// @author          blc
// @description     影片筛选
// @match           https://javdb.com/*
// @exclude         https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @run-at          document-end
// ==/UserScript==

const config = [];

(function () {
  if (!config.length) return;

  const nodeList = document.querySelectorAll(".movie-list .item");
  if (!nodeList.length) return;

  const parse = (node) => {
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

  const filter = (list) => {
    list.forEach((item) => {
      const txt = parse(item);
      if (config.some((reg) => reg.test(txt))) item.classList.add("is-hidden");
    });
  };

  filter(nodeList);
  window.addEventListener("JavDB.scroll", ({ detail }) => filter(detail));
})();
