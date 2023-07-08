// ==UserScript==
// @name            JavDB.click
// @namespace       JavDB.click@blc
// @version         0.0.1
// @author          blc
// @description     新标签页
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/).*$/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/listener/JavPack.listener.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-end
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const openWindow = (e, active = false) => {
    const target = e.target.closest("a");
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    GM_openInTab(target.href, { active, setParent: true });
  };

  autoListener([
    {
      path: "_global",
      container: ":is(.movie-list, .actors, .section-container)",
      events: {
        click: e => openWindow(e, true),
        contextmenu: openWindow,
      },
    },
  ]);
})();
