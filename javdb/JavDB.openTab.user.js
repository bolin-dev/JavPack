// ==UserScript==
// @name            JavDB.openTab
// @namespace       JavDB.openTab@blc
// @version         0.0.1
// @author          blc
// @description     新标签页打开
// @match           https://javdb.com/*
// @exclude         https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Grant.lib.js
// @run-at          document-start
// @grant           GM_openInTab
// ==/UserScript==

(function () {
  const handleOpen = (e) => {
    const target = e.target.closest(":is(.actors, .movie-list, .section-container) a:not(.button)");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();
    Grant.openTab(target.href, e.type === "click");
  };

  document.addEventListener("click", handleOpen);
  document.addEventListener("contextmenu", handleOpen);
})();
