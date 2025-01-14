// ==UserScript==
// @name            JavDB.filter
// @namespace       JavDB.filter@blc
// @version         0.0.2
// @author          blc
// @description     影片过滤
// @match           https://javdb.com/*
// @exclude         https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @run-at          document-end
// ==/UserScript==

const config = [/男の娘/];

(function () {
  if (!config.length) return;

  const movieList = document.querySelectorAll(".movie-list .item");
  if (!movieList.length) return;

  const parse = (node) => {
    const titleNode = node.querySelector(".video-title");
    const code = titleNode?.querySelector("strong")?.textContent.trim() ?? "";
    const title = titleNode?.textContent.split(code).pop().trim() ?? "";
    const score = node.querySelector(".score .value")?.textContent.replace(/^\s+/, "") ?? "";
    const date = node.querySelector(".meta")?.textContent.trim() ?? "";
    const tags = [...node.querySelectorAll(".tags .tag")].map((tag) => tag?.textContent.trim() ?? "");
    return `[${code}][${title}][${score}][${date}][${tags}]`;
  };

  const filter = (list) => {
    list.forEach((item) => {
      const txt = parse(item);
      if (config.some((reg) => reg.test(txt))) item.classList.add("is-hidden");
    });
  };

  filter(movieList);
  window.addEventListener("JavDB.scroll", ({ detail }) => filter(detail));
})();
