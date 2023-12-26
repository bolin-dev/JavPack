// ==UserScript==
// @name            JavDB.search
// @namespace       JavDB.search@blc
// @version         0.0.1
// @author          blc
// @description     快捷搜索
// @match           https://javdb.com/*
// @icon            https://javdb.com/favicon.ico
// @require         https://github.com/bolin-dev/JavPack/raw/main/libs/JavPack.Util.lib.js
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
// @run-at          document-start
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  document.addEventListener("keydown", async (e) => {
    if (e.ctrlKey && e.key === "/") {
      const text = (await navigator.clipboard.readText())?.trim();
      if (!text) return;

      const { origin, pathname } = location;
      const url = `${origin}/search?q=${text}`;
      pathname === "/search" ? (location.href = url) : Util.openTab(url);
    }
  });

  document.addEventListener("keyup", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.nodeName)) return;
    if (e.key !== "/") return;

    const input = document.querySelector("#video-search");
    input.focus();
    input.select();
  });
})();
