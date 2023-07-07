// ==UserScript==
// @name            JavDB.click
// @namespace       JavDB.click@blc
// @version         0.0.1
// @author          blc
// @description     新标签页
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/).*$/
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @require         https://greasyfork.org/scripts/470274-javpack-listener/code/JavPacklistener.js?version=1216236
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-body
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
