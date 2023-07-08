// ==UserScript==
// @name            JavDB.click
// @namespace       JavDB.click@blc
// @version         0.0.1
// @author          blc
// @description     新标签页
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/).*$/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const openInTab = (e, active = false) => {
    const target = e.target.closest(":is(.movie-list, .actors, .section-container) a");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    GM_openInTab(target.href, { active, setParent: true });
  };

  document.addEventListener("click", e => openInTab(e, true));
  document.addEventListener("contextmenu", openInTab);
})();
