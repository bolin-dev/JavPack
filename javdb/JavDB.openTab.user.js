// ==UserScript==
// @name            JavDB.openTab
// @namespace       JavDB.openTab@blc
// @version         0.0.1
// @description     新标签页打开
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @grant           GM_openInTab
// @author          blc
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Util.lib.js
// @include         /^https:\/\/javdb\.com\/(?!v\/)/
// @run-at          document-start
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const selector = ":is(.movie-list, .actors, .section-container) a";

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
