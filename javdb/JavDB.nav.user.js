// ==UserScript==
// @name            JavDB.nav
// @namespace       JavDB.nav@blc
// @version         0.0.1
// @description     快捷翻页
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @author          blc
// @include         /^https:\/\/javdb\.com\/(?!v\/)/
// @run-at          document-start
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  document.addEventListener("keyup", (e) => {
    const active = document.activeElement;
    if (["INPUT", "TEXTAREA"].includes(active.nodeName)) return;

    const target = active.closest("video") ?? active.closest("audio");
    if (target) return;

    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    document
      .querySelector(
        `nav.pagination .pagination-${
          e.key === "ArrowLeft" ? "previous" : "next"
        }`,
      )
      ?.click();
  });
})();
