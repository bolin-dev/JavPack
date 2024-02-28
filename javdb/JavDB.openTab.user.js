// ==UserScript==
// @name            JavDB.openTab
// @namespace       JavDB.openTab@blc
// @version         0.0.1
// @author          blc
// @description     新标签页打开
// @match           https://javdb.com/*
// @exclude         https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const matchSelector = ":is(.actors, .movie-list, .section-container) a";
  const excludeSelector = ".button.is-danger";

  const handleOpen = (e) => {
    const target = e.target.closest(matchSelector);
    if (!target || e.target.matches(excludeSelector)) return;

    e.preventDefault();
    e.stopPropagation();
    GM_openInTab(target.href, { active: e.type === "click", setParent: true });
  };

  document.addEventListener("click", handleOpen);
  document.addEventListener("contextmenu", handleOpen);
})();
