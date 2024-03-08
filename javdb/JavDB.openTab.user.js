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
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const MATCH_SELECTOR = ":is(.actors, .common-list, .movie-list, .section-container) a";
  const EXCLUDE_SELECTOR = ".button";

  const handleOpen = (e) => {
    const target = e.target.closest(MATCH_SELECTOR);
    if (!target || e.target.matches(EXCLUDE_SELECTOR)) return;

    e.preventDefault();
    e.stopPropagation();
    Grant.openTab(target.href, e.type === "click");
  };

  document.addEventListener("click", handleOpen);
  document.addEventListener("contextmenu", handleOpen);
})();
