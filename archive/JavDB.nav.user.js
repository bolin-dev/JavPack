// ==UserScript==
// @name            JavDB.nav
// @namespace       JavDB.nav@blc
// @version         0.0.1
// @author          blc
// @description     快捷翻页
// @match           https://javdb.com/*
// @exclude         https://javdb.com/v/*
// @icon            https://javdb.com/favicon.ico
// @run-at          document-start
// ==/UserScript==

(function () {
  const ACTION_MAP = {
    ArrowLeft: "previous",
    ArrowRight: "next",
  };

  document.addEventListener("keyup", (e) => {
    const action = ACTION_MAP[e.code];
    if (!action) return;

    const active = document.activeElement;
    if (["INPUT", "TEXTAREA"].includes(active.nodeName) || active.closest("video")) return;
    if (document.querySelector(".modal.is-active")) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    document.querySelector(`nav.pagination .pagination-${action}`)?.click();
  });
})();
