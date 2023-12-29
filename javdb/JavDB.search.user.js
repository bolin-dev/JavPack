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
// @run-at          document-body
// @grant           GM_openInTab
// @license         GPL-3.0-only
// @compatible      chrome last 2 versions
// @compatible      edge last 2 versions
// ==/UserScript==

(function () {
  const { origin, pathname } = location;
  const exclude = ["INPUT", "TEXTAREA"];
  const input = document.querySelector("#video-search");

  document.addEventListener("keydown", async (e) => {
    if (e.ctrlKey && e.code === "Slash") {
      const txt = (await navigator.clipboard.readText())?.trim();
      if (!txt) return;

      const url = `${origin}/search?q=${txt}`;
      pathname === "/search" ? (location.href = url) : Util.openTab(url);
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code !== "Slash") return;
    if (exclude.includes(document.activeElement.nodeName)) return;

    input.focus();
    input.select();
  });
})();
