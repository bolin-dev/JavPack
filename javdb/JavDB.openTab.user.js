// ==UserScript==
// @name            JavDB.openTab
// @namespace       JavDB.openTab@blc
// @version         0.0.1
// @author          blc
// @description     新标签页打开
// @match           https://javdb.com/*
// @exclude         https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/JavPack.Util.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const selector = ":is(.actors, .movie-list, .section-container) a";

  const handleOpen = (e) => {
    const target = e.target.closest(selector);
    if (!target || e.target.matches(".button.is-danger")) return;

    e.preventDefault();
    e.stopPropagation();
    Util.openTab(target.href, e.type === "click");
  };

  document.addEventListener("click", handleOpen);
  document.addEventListener("contextmenu", handleOpen);
})();
