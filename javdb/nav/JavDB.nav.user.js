// ==UserScript==
// @name            JavDB.nav
// @namespace       JavDB.nav@blc
// @version         0.0.1
// @author          blc
// @description     快捷导航
// @include         /^https:\/\/javdb\d*\.com\/.*$/
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @require         https://greasyfork.org/scripts/470274-javpack-listener/code/JavPacklistener.js?version=1216236
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @license         GPL-3.0-only
// @compatible      chrome
// @compatible      edge
// ==/UserScript==

(function () {
  const navigation = e => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.nodeName)) return;
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    document
      .querySelector(`.pagination .pagination-${e.key === "ArrowLeft" ? "previous" : "next"}`)
      ?.click();
  };

  autoListener([
    {
      path: "_global",
      events: {
        keyup: navigation,
      },
    },
  ]);
})();
