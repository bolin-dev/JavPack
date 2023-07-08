// ==UserScript==
// @name            JavDB.nav
// @namespace       JavDB.nav@blc
// @version         0.0.1
// @author          blc
// @description     快捷导航
// @include         /^https:\/\/javdb\d*\.com\/(?!v\/).*$/
// @icon            https://raw.githubusercontent.com/bolin-dev/JavPack/main/static/logo.png
// @require         https://raw.githubusercontent.com/bolin-dev/JavPack/main/libs/listener/JavPack.listener.lib.js
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
