// ==UserScript==
// @name            JavDB.search
// @namespace       JavDB.search@blc
// @version         0.0.1
// @description     快捷搜索
// @icon            https://s1.ax1x.com/2022/04/01/q5lzYn.png
// @grant           GM_openInTab
// @author          blc
// @require         file:///Users/bolinc/Projects/JavPack/libs/JavPack.Util.lib.js
// @match           https://javdb.com/*
// @run-at          document-start
// @supportURL      https://t.me/+bAWrOoIqs3xmMjll
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
